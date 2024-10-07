import {useContext, useEffect, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import {websocketSend} from "./Websocket";
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    authUserState,
    cameraOpenState,
    cameraStreamState, CamQualityState,
    connectionStatusState,
    participantCameraListState
} from "~/recoil/atom";
import {IParticipantCamera} from "~/types";
import requestCameraAccess from "~/lib/camera/requestCameraAccess";


let ws: WebSocket | null = null;
let webRtcPeer:kurentoUtils.WebRtcPeer| null = null;

export async function kurentoVideoSwitchCamera(stream:MediaStream) {
    console.log('kurentoVideo switch camera');

    const newTracks = stream.getVideoTracks();
    const localStream = webRtcPeer?.getLocalStream();
    const oldTracks = localStream ? localStream.getVideoTracks() : [];


    webRtcPeer?.peerConnection.getSenders().forEach((sender, index) => {
        if (sender.track && sender.track.kind === 'video') {
            const newTrack = newTracks[index];
            if (newTrack == null) return;

            // Cleanup old tracks in the local MediaStream
            const oldTrack = oldTracks[index];
            sender.replaceTrack(newTrack);
            if (oldTrack) {
                oldTrack.stop();
                localStream?.removeTrack(oldTrack);
            }
            localStream?.addTrack(newTrack);
        }
    });
}


const KurentoVideo = () => {
    const user = useRecoilValue(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);
    const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);
    const [videoState, setVideoState] = useRecoilState(cameraOpenState);
    const participantCameraList = useRecoilValue(participantCameraListState);
    const [videoStateWS, setVideoStateWS] = useState(false);
    const [selectedVideoQuality, setSelectedVideoQuality] = useRecoilState(CamQualityState);



    const handleDisconnect = () => {
        if (ws) {
            ws.close();
            ws = null;
        }
        if (webRtcPeer) {
            webRtcPeer.dispose();
            webRtcPeer = null;
        }
    };

    useEffect(() => {

        let userCamera=participantCameraList.filter((cItem:IParticipantCamera) => cItem?.intId == user?.meetingDetails?.internalUserID)[0];

        console.log("KurentoVideo userCamera",userCamera)

        console.log("effect changes in KurentoVideo")

        const kurentoConnect = () => {
            console.log('KurentoVideo Connect');
            ws = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${user?.sessiontoken}`);
        };

        const startProcess = () => {
            console.log('Creating WebRtcPeer and generating local sdp offer ...');

            const constraints = {
                audio: false,
                video: {
                    width: 640,
                    framerate: 15,
                },
            };

            const options = {
                localVideo: null,
                remoteVideo: null,
                videoStream: cameraStream,
                onicecandidate: onIceCandidate,
                mediaConstraints: constraints,
                configuration:{
                    iceServers: connectionStatus.iceServers
                }
            };

            if (ws?.readyState === WebSocket.OPEN) {
                webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(this: any, error) {
                    if (error) return this.onError(error);
                    this.generateOffer(onOffer);
                });
            } else {
                console.log("WebSocket is not open yet. Current state: ", ws?.readyState);
                setTimeout(()=>{
                    startProcess();
                }, 40);
            }

        };


        const onOffer = (error:any, offerSdp:any) => {
            if (error) return onError(error);

            console.info('Invoking SDP offer callback function ' + offerSdp);
            const message = {
                id: 'start',
                type: 'video',
                cameraId: buildStreamName(userCamera.deviceID),
                role: 'share',
                sdpOffer: offerSdp,
                bitrate: selectedVideoQuality.bitrate,
                record: true,
            };
            kurentoSend(message);
        };

        const onIceCandidate = (candidate:any) => {
            console.log('Local candidate' + JSON.stringify(candidate));

            const message = {
                type: 'video',
                role: 'share',
                id: 'onIceCandidate',
                candidate: candidate,
                cameraId: buildStreamName(userCamera.deviceID),
            };

            kurentoSend(message);
        };

        const onError = (error:any) => {
            console.error('kurento error:', error);
        };

        const startResponse = (message:any) => {
            console.log('SDP answer received from server. Processing ...');
            webRtcPeer?.processAnswer(message?.sdpAnswer);
        };

        const buildStreamName = (deviceId:string) => {
            return `${user?.meetingDetails?.internalUserID}${user?.meetingDetails?.authToken}${deviceId}`;
        };

        const kurentoSend = (data:any) => {
            ws?.send(JSON.stringify(data));
            console.log('Sending this data via kurento websocket');
        };


        if (videoState && user?.sessiontoken !=null) {
            // if(videoStateWS){
            //     console.log('KurentoVideo Socket existing connection established used');
            //     startProcess();
            // }else{
                setVideoStateWS(true)
                kurentoConnect();
            // }

        }

        if (ws != null) {
            ws.onopen = () => {
                console.log('KurentoVideo Socket connection established');
                startProcess();
            };

            ws.onmessage = (message) => {
                const parsedMessage = JSON.parse(message.data);
                console.info('KurentoVideo Received message: ' + message.data);

                console.log('KurentoVideo Websocket');
                console.log(parsedMessage.id);
                switch (parsedMessage.id) {
                    case 'playStart':
                        websocketSend([`{\"msg\":\"method\",\"id\":\"100\",\"method\":\"userShareWebcam\",\"params\":[\"${buildStreamName(userCamera.deviceID)}\"]}`]);
                        break;
                    case 'startResponse':
                        startResponse(parsedMessage);
                        break;
                    case 'error':
                        onError('Error message from server: ' + parsedMessage.message);
                        break;
                    case 'iceCandidate':
                        console.log('iceCandidate');
                        webRtcPeer?.addIceCandidate(parsedMessage.candidate);
                        break;
                    default:
                        onError(`Unrecognized message ${parsedMessage}`);
                }
            };

            ws.onclose = () => {
                console.log('KurentoVideo Socket connection closed');
                setVideoState(false);
                setVideoStateWS(false);
            };
        }

        // return () => {
        //     // Cleanup: Close WebSocket and release WebRTC resources
        //     if (ws && ws.readyState === WebSocket.OPEN) {
        //         ws.close();
        //     }
        //     if (webRtcPeer) {
        //         webRtcPeer.dispose();
        //     }
        // };
    }, [videoState]);

    return <div>
        {/*{camera.localVideoStream ? 'Local stream on' : 'Local stream false'}*/}
    </div>;
};

export default KurentoVideo


// Switching the Active Camera
// Naturally, we assume you'll be using the front camera by default when starting a call.
// So we set isFrontCam as true and let the value flip on execution.
//
//     let isFrontCam = true;
//
// try {
//     // Taken from above, we don't want to flip if we don't have another camera.
//     if ( cameraCount < 2 ) { return; };
//
//     const videoTrack = localMediaStream.getVideoTracks()[0];
//     const constraints = { facingMode: isFrontCam ? 'user' : 'environment' };
//
//     videoTrack.applyConstraints(constraints);
//
//     // _switchCamera is deprecated as of 124.0.5
//     // videoTrack._switchCamera();
//
//     isFrontCam = !isFrontCam;
// } catch( err ) {
//     // Handle Error
// };