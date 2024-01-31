import {useContext, useEffect, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import {websocketSend} from "./Websocket";
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    authUserState,
    cameraOpenState,
    cameraStreamState,
    connectionStatusState,
    participantCameraListState
} from "~/recoil/atom";


const KurentoVideo = () => {
    const user = useRecoilValue(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);
    const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);
    const [videoState, setVideoState] = useRecoilState(cameraOpenState);
    const participantCameraList = useRecoilValue(participantCameraListState);
    const [videoStateWS, setVideoStateWS] = useState(false);

    let userCamera=participantCameraList.filter((cItem:any) => cItem?.intId == user?.meetingDetails?.internalUserID);

    let ws: WebSocket | null = null;
    let webRtcPeer:kurentoUtils.WebRtcPeer| null = null;


    useEffect(() => {

        console.log("effect changes in KurentoVideo")

        const kurentoConnect = () => {
            console.log('KurentoVideo Connect');
            ws = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${user?.sessiontoken}`);
        };

        if (!videoStateWS && videoState && user?.sessiontoken !=null) {
            setVideoStateWS(true)
            kurentoConnect();
        }else{
            ws?.close();
        }

        const startProcess = () => {
            console.log('Creating WebRtcPeer and generating local sdp offer ...');
            const videoElement = document.getElementById('videoElement');
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
            };

            webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(this: any, error) {
                if (error) return this.onError(error);
                this.generateOffer(onOffer);
            });
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
                bitrate: 200,
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
