import {useContext, useEffect, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    authUserState, connectionStatusState,
    LayoutSettingsState,
    screenSharingState,
    screenSharingStreamState,
    viewerScreenSharingState
} from "~/recoil/atom";

const KurentoScreenShareViewer = () => {
    const user = useRecoilValue(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);
    const [viewerscreenShareState, setViewerScreenShareState] = useRecoilState(viewerScreenSharingState);
    const [screenSharingStream, setScreenSharingStream] = useRecoilState(screenSharingStreamState);
    const [layoutSettings, setlayoutSettings] = useRecoilState(LayoutSettingsState);
    const [wsStarted, setWsStarted] = useState(false);

    let ws: WebSocket | null = null;
    let webRtcPeer:kurentoUtils.WebRtcPeer| null = null;

    useEffect(() => {

        console.log("effect changes in KurentoScreenShareViewer")

        const KurentoScreenShareViewerConnect = () => {
            console.log('KurentoScreenShareViewer Connect');
            ws = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${user?.sessiontoken}`);
        };

        const KurentoScreenShareViewerSend = (data:any) => {
            ws?.send(JSON.stringify(data));
            console.log('Sending this data via KurentoScreenShareViewer websocket');
        };

        const onIceCandidate = (candidate:any) => {
            console.log('Local candidate' + JSON.stringify(candidate));

            const message = {
                type: 'video',
                role: 'share',
                id: 'onIceCandidate',
                candidate: candidate,
            };

            KurentoScreenShareViewerSend(message);
        };

        const onError = (error:string) => {
            console.error('KurentoScreenShareViewer error:', error);
        };

        const startProcess = () => {
            console.log('Creating WebRtcPeer and generating local sdp offer ...');
            const constraints = {
                audio: false,
                video: true,
            };

            const options = {
                localVideo: null,
                remoteVideo: null,
                onicecandidate: onIceCandidate,
                mediaConstraints: constraints,
                configuration:{
                    iceServers: connectionStatus.iceServers
                }
            };

            webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(this: any, error) {
                if (error) return this.onError(error);
                const message = {
                    "id": "start",
                    "type": "screenshare",
                    "role": "recv",
                    "internalMeetingId": user?.meetingDetails?.meetingID,
                    "voiceBridge": user?.meetingDetails?.voicebridge,
                    "userName": user?.meetingDetails?.fullname,
                    "callerName": user?.meetingDetails?.internalUserID,
                    "hasAudio": true,
                    "contentType": "camera"
                };
                KurentoScreenShareViewerSend(message);
            });
        };

        const startResponse = (message:any) => {
            console.log('SDP answer received from server. Processing ...');

            // Handle the SDP offer by setting it on the WebRTC endpoint
            webRtcPeer?.processOffer(message.sdpAnswer, (error, sdpAnswer) => {
                if (error) {
                    // Handle error
                    console.error(error);
                    return;
                }

                console.log("setOfferAndGetAnswer: ",sdpAnswer);
                var dt={
                    "id": "subscriberAnswer",
                    "type": "screenshare",
                    "role": "recv",
                    "voiceBridge": user?.meetingDetails?.voicebridge,
                    "callerName": user?.meetingDetails?.internalUserID,
                    "answer": sdpAnswer
                };

                KurentoScreenShareViewerSend(dt);

                // Send the SDP answer back to the remote peer for negotiation
                // sdpAnswer contains the generated SDP answer
            });

        };

        if (!wsStarted && viewerscreenShareState) {
            setWsStarted(true)
            KurentoScreenShareViewerConnect();
        }else{
            if(viewerscreenShareState) {
                console.log('KurentoScreenShareViewer continued on existing protocol ');
                setTimeout(()=>{
                    startProcess();
                }, 20);
            }else{
                // Cleanup: Close WebSocket and release WebRTC resources
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
                if (webRtcPeer) {
                    webRtcPeer.dispose();
                }
            }
        }


        const parseStream = () => {
            console.log('starting Remote screenshare Stream. Processing ...');

            var gstream = webRtcPeer?.getRemoteStream()
            console.log('Remote screenshare gstream:', gstream)

            // Check the length of the remote stream's tracks
            const streamTracksCount = gstream?.getTracks().length;

            console.log('Number of tracks in the remote stream:', streamTracksCount);

            setScreenSharingStream(gstream!);
            setViewerScreenShareState(true);
            setlayoutSettings({
                ...layoutSettings,
                layout: "4",
                layoutName: "Focus on presenter",
            });
        };


        if (ws != null) {
            ws.onopen = () => {
                console.log('KurentoScreenShareViewer Socket connection established');
                setTimeout(()=>{
                    startProcess();
                }, 2000);
            };

            ws.onmessage = (message) => {
                const parsedMessage = JSON.parse(message.data);
                console.info('KurentoScreenShareViewer Received message: ' + message.data);

                console.log('KurentoScreenShareViewer Websocket');
                console.log(parsedMessage.id);
                switch (parsedMessage.id) {
                    case 'playStart':
                        parseStream();
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
                console.log('KurentoScreenShareViewer Socket connection closed');
                setWsStarted(false);
                webRtcPeer?.dispose();
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
    }, [viewerscreenShareState]);

    return <div>
        {/*{screenshare.remoteVideoStream ? 'remoteVideoStream stream on' : 'remoteVideoStream stream false'}*/}
    </div>;
};

export default KurentoScreenShareViewer
