import {useContext, useEffect, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import {websocketSend} from "./Websocket"
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    authUserState,
    connectionStatusState,
    LayoutSettingsState,
    screenSharingState,
    screenSharingStreamState
} from "~/recoil/atom";
import stopScreenSharingStream from "~/lib/screenSharing/stopScreenSharingStream";


let ws: WebSocket | null = null;
let webRtcPeer:kurentoUtils.WebRtcPeer| null = null;


export function websocketKurentoScreenshareEndScreenshare(screenSharingStream: MediaStream) {
    console.log('Ending screenshare on KurentoScreenShare websocket');

    stopScreenSharingStream(screenSharingStream);

    //to stop webRtcPeer
    if (webRtcPeer) {
        webRtcPeer.dispose();
        webRtcPeer = null;
    }

    //to stop websocket
    if(ws != null){
        console.log("ws is not null");
        ws.close();
    }
}


const KurentoScreenShare = () => {

    const user = useRecoilValue(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);
    const [screenShareState, setScreenShareState] = useRecoilState(screenSharingState);
    const [screenSharingStream, setScreenSharingStream] = useRecoilState(screenSharingStreamState);
    const [layoutSettings, setlayoutSettings] = useRecoilState(LayoutSettingsState);

    const [wsStarted, setWsStarted] = useState(false);

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
                "hasAudio": screenSharingStream!.getAudioTracks().length > 0,
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
            setlayoutSettings({
                ...layoutSettings,
                layout: "1",
                layoutName: "Smart layout",
            });
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


            const options = {
                localVideo: videoElement,
                remoteVideo: null,
                videoStream:screenSharingStream,
                onicecandidate: onIceCandidate,
                mediaConstraints: constraints,
                configuration:{
                    iceServers: connectionStatus.iceServers
                }
            };

            webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(this: any, error) {
                if (error) return this.onError(error);
                this.generateOffer(onOffer);

                // Access the stream
                const localStream = this.getLocalStream();

                /**
                 * Get stats about all active screenshare peers.
                 *
                 * For more information see:
                 *  - https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
                 *  - https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport

                 * @param {Array[String]} statsType - An array containing valid RTCStatsType
                 *                                    values to include in the return object
                 *
                 * @returns {Object} The information about each active screen sharing peer.
                 *          The returned format follows the format returned by video's service
                 *          getStats, which considers more than one peer connection to be returned.
                 *          The format is given by:
                 *          {
                 *            peerIdString: RTCStatsReport
                 *          }
                 */
                setInterval(() => {
                    this.RTCPeerConnection?.getStats(localStream).then((stats:RTCStatsReport) => {
                        let statsOutput = "";

                        stats.forEach((report) => {
                            statsOutput +=
                                `<h2>Report: ${report.type}</h2>\n<strong>ID:</strong> ${report.id}<br>\n` +
                                `<strong>Timestamp:</strong> ${report.timestamp}<br>\n`;

                            // Now the statistics for this report; we intentionally drop the ones we
                            // sorted to the top above

                            Object.keys(report).forEach((statName) => {
                                if (
                                    statName !== "id" &&
                                    statName !== "timestamp" &&
                                    statName !== "type"
                                ) {
                                    statsOutput += `<strong>${statName}:</strong> ${report[statName]}<br>\n`;
                                }
                            });
                        });

                        console.info(statsOutput);
                    });
                }, 1000);

                // Listen for the stream ending
                if (localStream) {
                    const videoTracks = localStream.getVideoTracks();
                    if (videoTracks.length > 0) {
                        videoTracks[0].onended = () => {
                            console.log('The stream has ended');
                            // Add any other logic you want when the stream ends
                            setScreenSharingStream(null);
                            setScreenShareState(false);

                            // Manually emit the event as a safeguard; Firefox doesn't fire it when it
                            // should with live MediaStreamTracks...
                            // var track=videoTracks[0];
                            // const trackStoppedEvt = new MediaStreamTrackEvent('ended', { track });
                            // track.dispatchEvent(trackStoppedEvt);

                            websocketKurentoScreenshareEndScreenshare(screenSharingStream!);
                        };
                    }
                }

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
    }, [screenShareState]);

    return <div>
        {/*{screenshare?.localScreenshareStreamState ? 'localScreenshareStreamState stream on' : 'localScreenshareStreamState stream false'}*/}
    </div>;
};

export default KurentoScreenShare
