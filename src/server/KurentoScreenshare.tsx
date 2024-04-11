import {useContext, useEffect, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import {websocketSend} from "./Websocket"
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, screenSharingState, screenSharingStreamState} from "~/recoil/atom";

const KurentoScreenShare = () => {

    const user = useRecoilValue(authUserState);
    const [screenShareState, setScreenShareState] = useRecoilState(screenSharingState);
    const [screenSharingStream, setScreenSharingStream] = useRecoilState(screenSharingStreamState);

    const [wsStarted, setWsStarted] = useState(false);

    let ws: WebSocket | null = null;
    let webRtcPeer:kurentoUtils.WebRtcPeer| null = null;


    useEffect(() => {

        console.log("effect changes in KurentoScreenShare")

        const KurentoScreenShareConnect = () => {
            console.log('KurentoScreenShare Connect');
            ws = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${user?.sessiontoken}`);
        };

        const KurentoScreenShareSend = (data:any) => {
            ws?.send(JSON.stringify(data));
            console.log('Sending this data via KurentoScreenShare websocket');
        };

        const onOffer = (error:any, offerSdp:any) => {
            if (error) return onError(error);

            console.info('Invoking SDP offer callback function ' + offerSdp);
            const message ={
                "id": "start",
                "type": "screenshare",
                "role": "send",
                "internalMeetingId": user?.meetingDetails?.meetingID,
                "voiceBridge": user?.meetingDetails?.voicebridge,
                "userName": user?.meetingDetails?.fullname,
                "callerName": user?.meetingDetails?.internalUserID,
                "sdpOffer": offerSdp,
                "hasAudio": false,
                "contentType": "screenshare",
                "bitrate": 1500
            };
            KurentoScreenShareSend(message);
        };

        const onIceCandidate = (candidate:any) => {
            console.log('Local candidate' + JSON.stringify(candidate));

        };

        const onError = (error:any) => {
            console.error('KurentoScreenShare error:', error);
        };

        const startProcess = () => {
            console.log('Creating WebRtcPeer and generating local sdp offer ...');
            const videoElement = document.getElementById('rVideoElement');
            const constraints = {
                audio: false,
                video: {
                    mediaSource: 'screen', // 'screen' for screen capture
                    width: { ideal: 1920 }, // Desired width
                    height: { ideal: 1080 }, // Desired height
                    frameRate: { ideal: 30 }, // Desired frame rate
                    cursor: 'always', // Include the mouse cursor in the capture
                }
            };

            const onStreamEnded = () => {
                console.log('Screenshare Ended');
            };


            const options = {
                localVideo: videoElement,
                remoteVideo: null,
                videoStream:screenSharingStream,
                onicecandidate: onIceCandidate,
                mediaConstraints: constraints,
                onstreamended:onStreamEnded
            };

            webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(this: any, error) {
                if (error) return this.onError(error);
                this.generateOffer(onOffer);
            });
        };

        const startResponse = (message:any) => {
            console.log('SDP answer received from server. Processing ...');
            webRtcPeer?.processAnswer(message?.sdpAnswer);
        };

        if (!wsStarted && screenShareState) {
            console.log("ws is starting");
            setWsStarted(true)
            KurentoScreenShareConnect();
        }else{
            if(screenShareState) {
                console.log('KurentoScreenShare continued on existing protocol ');

                startProcess();
            }else{
                console.log('KurentoScreenShare time to close');
            // Cleanup: Close WebSocket and release WebRTC resources
            if (ws && ws.readyState === WebSocket.OPEN) {
                console.log('KurentoScreenShare trying to close');
                ws.close();
            }
            if (webRtcPeer) {
                webRtcPeer.dispose();
            }
        }


        }

        if (ws != null) {
            ws.onopen = () => {
                console.log('KurentoScreenShare Socket connection established');

                // const timerId = setInterval(() => {
                //     if (screenshare?.localScreenshareStream != null) {
                //         clearInterval(timerId); // Disable the timer
                startProcess();
                //     }else {
                //         console.log("localScreenshareStream is null");
                //     }
                // }, 1000); // Check every second

            };

            ws.onmessage = (message:any) => {
                const parsedMessage = JSON.parse(message.data);
                console.info('KurentoScreenShare Received message: ' + message.data);

                console.log('KurentoScreenShare Websocket');
                console.log(parsedMessage.id);
                switch (parsedMessage.id) {
                    case 'playStart':
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
                console.log('KurentoScreenShare Socket connection closed');
                setWsStarted(false);
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
    }, [screenShareState]);

    return <div>
        {/*{screenshare?.localScreenshareStreamState ? 'localScreenshareStreamState stream on' : 'localScreenshareStreamState stream false'}*/}
    </div>;
};

export default KurentoScreenShare
