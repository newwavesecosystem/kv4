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
    participantCameraListState, postLeaveMeetingState
} from "~/recoil/atom";
import {IParticipantCamera} from "~/types";
import requestCameraAccess from "~/lib/camera/requestCameraAccess";


let ws: WebSocket | null = null;
let webRtcPeer:kurentoUtils.WebRtcPeer| null = null;

const RECONNECT_DELAY = 3000; // 3 seconds between attempts
const MAX_RECONNECT_ATTEMPTS = 5;


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

export function kurentoVideoEndStream() {
    console.log('Ending Video on KurentoVideo websocket');

    //to stop webRtcPeer
    if (webRtcPeer) {
        webRtcPeer.dispose();
        webRtcPeer = null;
    }

    //to stop websocket
    if(ws != null){
        console.log("ws is not null");
        ws.close();
        ws=null;
    }
}


const KurentoVideo = () => {
    const user = useRecoilValue(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);
    const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);
    const [videoState, setVideoState] = useRecoilState(cameraOpenState);
    const participantCameraList = useRecoilValue(participantCameraListState);
    const [videoStateWS, setVideoStateWS] = useState(false);
    const [selectedVideoQuality, setSelectedVideoQuality] = useRecoilState(CamQualityState);
    const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(
        postLeaveMeetingState,
    );
    let reconnectAttempts = 0;



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

    const shouldStopReconnecting = () => {
        return postLeaveMeeting.isLeave || postLeaveMeeting.isLeaveRoomCall ||
            postLeaveMeeting.isEndCall || postLeaveMeeting.isOthers ||
            postLeaveMeeting.isSessionExpired || postLeaveMeeting.isKicked;
    };

    const initializeWebSocket = () => {
        if (shouldStopReconnecting()) {
            console.log('Stopping KurentoVideo reconnection due to meeting exit condition');
            return;
        }

        ws = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${user?.sessiontoken}`);

        let userCamera=participantCameraList.filter((cItem:IParticipantCamera) => cItem?.intId == user?.meetingDetails?.internalUserID)[0];

        ws.onopen = () => {
            console.log('KurentoVideo connected');
            reconnectAttempts = 0; // Reset attempts after a successful connection
            startProcess();
        };

        ws.onmessage = (message) => {
            const parsedMessage = JSON.parse(message.data);
            console.info('KurentoVideo Received message: ' + message.data);

            switch (parsedMessage.id) {
                case 'playStart':
                    websocketSend([`{\"msg\":\"method\",\"id\":\"100\",\"method\":\"userShareWebcam\",\"params\":[\"${buildStreamName(userCamera.deviceID)}\"]}`]);
                    startPing();
                    break;
                case 'startResponse':
                    startResponse(parsedMessage);
                    break;
                case 'error':
                    console.error('Kurento Error:', parsedMessage.message);
                    break;
                case 'iceCandidate':
                    webRtcPeer?.addIceCandidate(parsedMessage.candidate);
                    break;
                default:
                    console.error(`Unrecognized message ${parsedMessage}`);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            if (videoState && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                setTimeout(initializeWebSocket, RECONNECT_DELAY); // Reconnect after delay
            } else {
                setVideoState(false);
                setVideoStateWS(false);
            }
        };
    };

    const startProcess = () => {
        const constraints = { audio: false, video: { width: 640, framerate: 15 } };
        const options = {
            localVideo: null,
            remoteVideo: null,
            videoStream: cameraStream,
            onicecandidate: onIceCandidate,
            mediaConstraints: constraints,
            configuration: { iceServers: connectionStatus.iceServers }
        };

        if (ws?.readyState === WebSocket.OPEN) {
            webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function (this: any, error) {
                if (error) return console.error('Error creating WebRTC Peer:', error);
                this.generateOffer(onOffer);
            });
        } else {
            console.log("WebSocket is not open yet. Retrying in 1 second.");
            setTimeout(startProcess, 1000);
        }
    };

    const onOffer = (error: any, offerSdp: any) => {
        if (error) return console.error('Offer Error:', error);
        let userCamera=participantCameraList.filter((cItem:IParticipantCamera) => cItem?.intId == user?.meetingDetails?.internalUserID)[0];
        const message = {
            id: 'start',
            type: 'video',
            cameraId: buildStreamName(userCamera.deviceID),
            role: 'share',
            sdpOffer: offerSdp,
            bitrate: selectedVideoQuality.bitrate,
            record: true,
        };
        ws?.send(JSON.stringify(message));
    };

    const onIceCandidate = (candidate: any) => {
        let userCamera=participantCameraList.filter((cItem:IParticipantCamera) => cItem?.intId == user?.meetingDetails?.internalUserID)[0];
        const message = {
            id: 'onIceCandidate',
            candidate,
            type: 'video',
            role: 'share',
            cameraId: buildStreamName(userCamera.deviceID),
        };
        ws?.send(JSON.stringify(message));
    };

    const startResponse = (message: any) => {
        webRtcPeer?.processAnswer(message.sdpAnswer);
    };

    const buildStreamName = (deviceId: string) => {
        return `${user?.meetingDetails?.internalUserID}${user?.meetingDetails?.authToken}${deviceId}`;
    };


    const startPing = () => {
        const interval = setInterval(() => {
            if (!videoState || ws?.readyState !== WebSocket.OPEN) {
                clearInterval(interval);
            }
            websocketSend({ id: "ping" });
        }, 15000);
    };

    useEffect(() => {
        if (videoState && user?.sessiontoken && connectionStatus.websocket_connection) {
            initializeWebSocket();
        }

    }, [videoState,connectionStatus.websocket_connection]);

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