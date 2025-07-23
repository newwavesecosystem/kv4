import {useContext, useEffect, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, connectionStatusState, participantCameraListState} from "~/recoil/atom";
import {IParticipantCamera} from "~/types";

const KurentoVideoViewer = (props:any) => {
    const user = useRecoilValue(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);
    const [wsStarted, setWsStarted] = useState(false);
    const [streamID, setStreamID] = useState(props?.streamID);
    const [participantCameraList, setParticipantCameraList] = useRecoilState(participantCameraListState);

    console.log("i am inside kviewer, steamID: ", streamID);

    let ws: WebSocket | null = null;
    let webRtcPeer:kurentoUtils.WebRtcPeer| null = null;


    useEffect(() => {

        console.log("effect changes in KurentoVideoViewer")

        const KurentoVideoViewerConnect = () => {
            console.log('KurentoVideoViewer Connect');
            ws = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${user?.sessiontoken}`);
        };

        const KurentoVideoViewerSend = (data:any) => {
            ws?.send(JSON.stringify(data));
            console.log('Sending this data via KurentoVideoViewer websocket');
        };

        const onOffer = (error:any, offerSdp:any) => {
            if (error) return onError(error);

            console.info('Invoking SDP offer callback function ' + offerSdp);
            const message = {
                id: 'start',
                type: 'video',
                cameraId: streamID,
                role: 'viewer',
                bitrate: 200,
                record: true,
            };
            KurentoVideoViewerSend(message);
        };

        const onIceCandidate = (candidate:any) => {
            console.log('Local candidate' + JSON.stringify(candidate));

            const message = {
                type: 'video',
                role: 'share',
                id: 'onIceCandidate',
                candidate: candidate,
                cameraId: streamID,
            };

            KurentoVideoViewerSend(message);
        };

        const onError = (error:any) => {
            console.error('KurentoVideoViewer error:', error);
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
                onicecandidate: onIceCandidate,
                mediaConstraints: constraints,
                configuration:{
                    iceServers: connectionStatus.iceServers
                }
            };


            if (ws?.readyState === WebSocket.OPEN) {
                webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(this: any, error) {
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

        const startResponse = (message:any) => {
            console.log('SDP answer received from server. Processing ...');

            // Handle the SDP offer by setting it on the WebRTC endpoint
            webRtcPeer?.processOffer(message.sdpAnswer, (error, sdpAnswer) => {
                if (error) {
                    // Handle error
                    console.error('Failed to process SDP answer:', error);
                    return;
                }

                console.log('SDP answer received and processed successfully');

                console.log("setOfferAndGetAnswer: ",sdpAnswer);
                var dt={
                    "id": "subscriberAnswer",
                    "type": "video",
                    "role": "viewer",
                    "cameraId": streamID,
                    "answer": sdpAnswer
                };

                KurentoVideoViewerSend(dt);

                // Send the SDP answer back to the remote peer for negotiation
                // sdpAnswer contains the generated SDP answer
            });

        };

        const parseStream = () => {
            console.log('starting Remote Stream. Processing ...');

            let gstream = webRtcPeer?.getRemoteStream()
            console.log('Remote gstream:', gstream)

            // Check the length of the remote stream's tracks
            const streamTracksCount = gstream?.getTracks().length;

            console.log('Number of tracks in the remote stream:', streamTracksCount);

            remoteStreams(streamID,gstream);
        };


        const remoteStreams= (streamID: unknown, stream: MediaStream | undefined) => {
            console.log("remoteVideoStream",participantCameraList)
            console.log("remoteVideoStream streamID",streamID)

            const updatedArray = participantCameraList.map((item:IParticipantCamera) => {
                if (item.streamID === streamID) {
                    return {...item, stream: stream};
                }
                return item;
            });

            setParticipantCameraList(updatedArray);

        };

        if (!wsStarted) {
            setWsStarted(true)
            KurentoVideoViewerConnect();
        }

        if (ws != null) {
            ws.onopen = () => {
                console.log('KurentoVideoViewer Socket connection established');
                setTimeout(()=>{
                    startProcess();
                }, 2000);
            };

            ws.onmessage = (message) => {
                const parsedMessage = JSON.parse(message.data);
                console.info('KurentoVideoViewer Received message: ' + message.data);

                console.log('KurentoVideoViewer Websocket');
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
                        console.log('Received ICE candidate:', parsedMessage.candidate);
                        webRtcPeer?.addIceCandidate(parsedMessage.candidate);
                        break;
                    default:
                        onError(`Unrecognized message ${parsedMessage}`);
                }
            };

            ws.onclose = () => {
                console.log('KurentoVideoViewer Socket connection closed');
                setWsStarted(false);
                webRtcPeer?.dispose();
            };
        }

        return () => {
            // Cleanup: Close WebSocket and release WebRTC resources
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            if (webRtcPeer) {
                webRtcPeer.dispose();
            }
        };
    }, [wsStarted]);

    return <div>
        {/*{camera.remoteVideoStream ? 'remoteVideoStream stream on' : 'remoteVideoStream stream false'}*/}
    </div>;
};

export default KurentoVideoViewer
