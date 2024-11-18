import { useEffect, useRef, useState } from 'react';
import * as kurentoUtils from 'kurento-utils';
import { useRecoilState, useRecoilValue } from 'recoil';
import { authUserState, connectionStatusState, participantCameraListState } from '~/recoil/atom';
import * as ServerInfo from "~/server/ServerInfo";
import {IParticipantCamera} from "~/types/index";
import {websocketSend} from "~/server/Websocket";
import {WebRtcPeer} from "kurento-utils";

const KurentoVideoSingleStick = () => {
    const user = useRecoilValue(authUserState);
    const [connectionStatus] = useRecoilState(connectionStatusState);
    const [participantCameraList, setParticipantCameraList] = useRecoilState(participantCameraListState);
    const [activeStreams, setActiveStreams] = useState<Set<string>>(new Set());

    const wsRef = useRef<WebSocket | null>(null);
    const webRtcPeers = useRef<{ [key: string]: kurentoUtils.WebRtcPeer }>({}).current;
    const cameraListRef = useRef(participantCameraList); // Ref to always hold the latest participant list

    const reconnectAttemptRef = useRef(0); // Track reconnection attempts

    const isPublisher=false;

    function pinger(){

        let myVar = setInterval(ping, 5000);
        function ping() {
            if(wsRef.current?.CLOSED){
                clearInterval(myVar);
            }
            websocketSend({"id": "ping"})
        }
    }

    const sendMessage = (data: any) => {
        if (wsRef.current != null) {
            wsRef.current.send(JSON.stringify(data));
            console.log('Sent data via WebSocket:', data);
        } else {
            console.error('WebSocket is not open. Cannot send data.');
        }
    };

    const initializeWebSocket = () => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            console.log('WebSocket connection is already open or connecting');
            return;
        }

        wsRef.current = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${user?.sessiontoken}`);

        wsRef.current.onopen = () => {
            console.log('WebSocket connection established');
            pinger();
            // startProcessForNewParticipants();
        };

        wsRef.current.onmessage = (message) => {
            const parsedMessage = JSON.parse(message.data);
            console.info('Received message from SFU:', parsedMessage);

            switch (parsedMessage.id) {
                case 'playStart':
                    handlePlayStart(parsedMessage.cameraId);
                    break;
                case 'startResponse':
                    handleStartResponse(parsedMessage.cameraId, parsedMessage);
                    break;
                case 'error':
                    console.error('Error message from server:', parsedMessage.message);
                    break;
                case 'iceCandidate':
                    console.log('ICE candidate received:', parsedMessage.candidate);
                    webRtcPeers[parsedMessage.cameraId]?.addIceCandidate(parsedMessage.candidate);
                    break;
                default:
                    console.error('Unrecognized message:', parsedMessage);
            }
        };

        wsRef.current.onclose = () => {
            console.log('WebSocket connection closed');
            cleanUpWebRtcPeers();
            attemptReconnect(); // Attempt reconnection
        };
    };

    const attemptReconnect = () => {
        const maxReconnectAttempts = 5; // Limit reconnection attempts
        if (reconnectAttemptRef.current < maxReconnectAttempts) {
            setTimeout(() => {
                reconnectAttemptRef.current += 1;
                console.log(`Reconnection attempt ${reconnectAttemptRef.current}`);
                initializeWebSocket();
            }, 2000 * reconnectAttemptRef.current); // Exponential backoff
        } else {
            console.error('Max reconnection attempts reached. Could not reconnect.');
        }
    };


    const handleStartResponse = (cameraId: string, message: any) => {
        const webRtcPeer = webRtcPeers[cameraId];
        if (webRtcPeer) {
            // const offer = new RTCSessionDescription({
            //     type: 'offer',
            //     sdp:message.sdpAnswer,
            // });
            //
            // webRtcPeer.peerConnection.setRemoteDescription(offer).then(async () => {
            //
            //     const sdpAnswer=await webRtcPeer.peerConnection.createAnswer({offerToReceiveAudio: false, offerToReceiveVideo: true});
            //     await webRtcPeer.peerConnection.setLocalDescription(sdpAnswer);
            //
            //     console.log("setOfferAndGetAnswer: ",sdpAnswer);
            //     var dt={
            //         "id": "subscriberAnswer",
            //         "type": "video",
            //         "role": "viewer",
            //         "cameraId": cameraId,
            //         "answer": sdpAnswer.sdp
            //     };
            //
            //     sendMessage(dt);
            //
            // });

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
                    "cameraId": cameraId,
                    "answer": sdpAnswer
                };

                sendMessage(dt);

                // Send the SDP answer back to the remote peer for negotiation
                // sdpAnswer contains the generated SDP answer
            });
        }
    };

    const handlePlayStart = (cameraId: string) => {
        const webRtcPeer = webRtcPeers[cameraId];
        const remoteStream = webRtcPeer?.getRemoteStream();

        // attachVideoStream(cameraId);

        // Immediately update participant list using the ref
        const updatedArray = cameraListRef.current.map((item:IParticipantCamera) => {
            if (item.streamID === cameraId) {
                return { ...item, stream: remoteStream };
            }
            return item;
        });

        setParticipantCameraList(updatedArray); // Trigger the state update

        console.log('Remote stream started for cameraId:', cameraId);
    };

    // peerConnection.ontrack = (event) => {
    //     const [remoteStream] = event.streams;
    //     // Attach this remoteStream to the video element
    //     const videoElement = document.getElementById("remoteVideo");
    //     videoElement.srcObject = remoteStream;
    // };

    const getReceiverRemoteStream = (peerConnection:RTCPeerConnection):MediaStream|null => {
        if (peerConnection) {
            const newRemoteStream = new MediaStream();
            peerConnection.getReceivers().forEach(({ track }) => {
                if (track) {
                    newRemoteStream.addTrack(track);
                }
            });
            return newRemoteStream;
        }

        return null;
    };


// Function to decide if we should attach the stream
    const shouldAttachVideoStream = (peer:WebRtcPeer, videoElement:any) => {
        if (!peer || !videoElement) return false;

        console.log("Skipped pass !peer || !videoElement")

        const stream = isPublisher ? peer.getLocalStream() : getReceiverRemoteStream(peer.peerConnection);
        console.log("shouldAttachVideoStream:",stream)
        const diff = stream && (stream.id !== videoElement.srcObject?.id || !videoElement.paused);

        if (diff) return true;

        return isPublisher
            && peer.getLocalStream()
            && peer.getLocalStream().getVideoTracks().length > 0
            && diff;
    };


    // Attach stream to video element
    const attach = (peer:WebRtcPeer, videoElement:any) => {
        console.log("Trying to attach to element");
        if (peer && videoElement) {
            const stream = isPublisher ? peer.getLocalStream() : getReceiverRemoteStream(peer.peerConnection);
            videoElement.pause();
            videoElement.srcObject = stream;
            videoElement.load();
            videoElement.play();
        }
    };

    // Retrieve video element by stream ID
    const getVideoElement = (streamId:string) :HTMLElement => {
        const fc:IParticipantCamera=participantCameraList.filter((item:IParticipantCamera)=>item.streamID == streamId)[0];
        return document.getElementById(`video${fc?.intId}`)!;
    };

    // Attach video stream with additional checks and notifications
    const attachVideoStream = (stream:string) => {
        const videoElement:HTMLElement = getVideoElement(stream);
        const isLocal = false;
        const peer = webRtcPeers[stream];

        if (shouldAttachVideoStream(peer!, videoElement)) {
            console.log("Can attach video stream")
            // Attach the video stream
            attach(peer!, videoElement);
        }else{
            console.log("Cannot attach video stream")
        }
    };

    const startProcessForNewParticipants = () => {
        participantCameraList.forEach((camera:IParticipantCamera) => {
            //Removign the current user from being on the singlestick
            if(camera.intId != user?.meetingDetails?.internalUserID){
                if (camera.stream == null) {
                    startProcess(camera.streamID!);
                }
            }
        });
    };

    const startProcess :any = (cameraId: string) => {
        if (webRtcPeers[cameraId]) {
            console.warn(`WebRTC Peer already exists for cameraId: ${cameraId}`);
            return; // Don't create a new peer if one already exists
        }

        if (wsRef.current?.readyState !== WebSocket.OPEN) {
            console.log('WebSocket not open yet. Delaying process for cameraId:', cameraId);
            return setTimeout(() => startProcess(cameraId), 2000);
        }

        console.log('Starting WebRTC connection for cameraId:', cameraId);

        const constraints = {
            audio: false,
            video: {
                width: {min: 640, ideal: 1280},
                height: {min: 480, ideal: 720},
                frameRate: 15,
            },
        };

        const options = {
            localVideo: null,
            remoteVideo: null,
            onicecandidate: (candidate: any) => {
                // sendMessage({
                //     id: 'onIceCandidate',
                //     candidate,
                //     cameraId,
                //     type: 'video',
                //     role: 'viewer',
                // });
            },
            mediaConstraints: constraints,
            configuration: {
                iceServers: connectionStatus.iceServers,
            },
        };

        const webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (this:any,error: any) {
            if (error) return console.error('WebRTC peer creation failed:', error);
            // this.generateOffer((error: any, offerSdp: any) => {
            //     if (error) return console.error('SDP offer generation failed:', error);
                sendMessage({
                    id: 'start',
                    type: 'video',
                    role: 'viewer',
                    cameraId,
                    bitrate: 500,
                    record: true
                });
            // });
        });

        setupSignalingStateLogger(webRtcPeer.peerConnection);

        webRtcPeers[cameraId] = webRtcPeer;
        setActiveStreams((prevStreams) => new Set(prevStreams).add(cameraId)); // Mark stream as active
    };

    const cleanUpWebRtcPeers = () => {
        Object.values(webRtcPeers).forEach((peer) => {
            peer.dispose();
        });
    };

    const disposeUnusedWebRtcPeers = (activeParticipantCameraList: IParticipantCamera[]) => {
        // Loop over all the webRtcPeers and check if they exist in the current participantCameraList
        Object.keys(webRtcPeers).forEach((cameraId) => {
            // Find the corresponding participant camera in the list
            const isActiveCamera = activeParticipantCameraList.some((camera: IParticipantCamera) => camera.streamID === cameraId);

            // If the camera is not active anymore, dispose of its WebRTC peer
            if (!isActiveCamera) {
                const peerToDispose = webRtcPeers[cameraId];
                if (peerToDispose) {
                    peerToDispose.dispose();
                    console.log(`Disposed WebRTC peer for cameraId: ${cameraId}`);
                    delete webRtcPeers[cameraId]; // Remove it from the webRtcPeers object
                }
            }
        });
    };


    const setupSignalingStateLogger = (peerConnection: RTCPeerConnection) => {
        peerConnection.addEventListener('signalingstatechange', () => {
            console.log(`Signaling state changed to: ${peerConnection.signalingState}`);
        });
    };


    // Update the ref whenever participantCameraList changes
    useEffect(() => {
        cameraListRef.current = participantCameraList;
    }, [participantCameraList]);

    useEffect(() => {
        initializeWebSocket();

        return () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
            cleanUpWebRtcPeers();
        };
    }, []);

    useEffect(() => {
        startProcessForNewParticipants();
        disposeUnusedWebRtcPeers(participantCameraList);
        }, [participantCameraList]);


    useEffect(() => {
            if(connectionStatus.websocket_connection_reconnect) {
                let up=participantCameraList.filter((item:IParticipantCamera)=> item.intId == user?.meetingDetails?.internalUserID);
                setParticipantCameraList(up);
            }
        }, [connectionStatus.websocket_connection_reconnect]);


    return <div>{/* Render participant videos here */}</div>;
};

export default KurentoVideoSingleStick;
