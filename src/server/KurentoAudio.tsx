import React, {useEffect, useRef, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, connectionStatusState, microphoneStreamState, selectedSpeakersState} from "~/recoil/atom";


let ws: WebSocket | null = null;
let webRtcPeer:kurentoUtils.WebRtcPeer| null = null;

export async function kurentoAudioSetNewStream(stream:MediaStream) {
    console.log('kurentoAudioSetNewStream');

    const newTracks = stream.getAudioTracks();
    const localStream = webRtcPeer?.getLocalStream();
    const oldTracks = localStream ? localStream.getAudioTracks() : [];


    webRtcPeer?.peerConnection.getSenders().forEach((sender, index) => {
        if (sender.track && sender.track.kind === 'audio') {
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

export function kurentoAudioEndStream() {
    console.log('Ending Audio on KurentoAudio websocket');

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


const KurentoAudio = () => {

    const user = useRecoilValue(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);

    const [microphoneStream, setMicrophoneStream] = useRecoilState(
        microphoneStreamState,
    );

    const [selectedSpeaker, setSelectedSpeaker] = useRecoilState(
        selectedSpeakersState,
    );


    const [audioState, setAudioState] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);

    function kurentoSend(data: any) {
        ws?.send(JSON.stringify(data))
        console.log('Sending this data via kurento websocket')
    }

    useEffect(() => {
        console.log(`selectedSpeaker : ${selectedSpeaker}`)
        const changeAudioOutput = async () => {
            try {
                if (audioRef.current) {
                    // Use type assertion to tell TypeScript that audioRef.current has the setSinkId method
                    (audioRef.current as any).setSinkId(selectedSpeaker?.deviceId)
                        .then(() => console.log(`Audio output set to device: ${selectedSpeaker?.deviceId}`))
                        .catch((error:any) => console.error('Error setting audio output device:', error));
                    console.log(`Audio output set to: ${selectedSpeaker?.label}`);
                    console.log('Audio output set successfully.');
                    console.log(`Audio output readyState : ${audioRef.current.readyState}`);
                    if (audioRef.current.readyState > 0) {
                        console.log('Audio output is in ready state');
                        audioRef.current.load();
                    }
                } else {
                    console.error('Audio element not found.');
                }
            } catch (error) {
                console.error('Error changing audio output:', error);
            }
        };

        if(selectedSpeaker != null) {
            // Change the audio output when the selectedSpeaker change
            changeAudioOutput();
        }

    },[selectedSpeaker])


    useEffect(() => {

        if(!connectionStatus.audio_connection && connectionStatus.websocket_connection && user?.sessiontoken !=null && microphoneStream!=null ){
            console.log("kurentoAudio websocket_connection is active")
            console.log("kurentoAudio microphoneStream is set")
            ws = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${user?.sessiontoken}`);
        }

        if (ws != null) {

            // Add event listeners for various socket events
            ws.onopen = () => {
                console.log('kurentoAudio Socket connection established');
                setAudioState(true);
                setTimeout(()=>{
                    startProcess();
                }, 40);

            };

            ws.onmessage = (message) => {
                let parsedMessage = JSON.parse(message.data);
                console.info('kurentoAudio Received message: ' + message.data);
                console.log("kurentoAudio Websocket");
                console.log(parsedMessage.id);
                switch (parsedMessage.id) {
                    case 'startResponse':
                        startResponse(parsedMessage);
                        break;
                    case 'error':
                        onError('kurentoAudio Error message from server: ' + parsedMessage.message);
                        setConnection((prev)=>({
                            ...prev,
                            audio_connection:false
                        }))
                        break;
                    case 'iceCandidate':
                        console.log("iceCandidate");
                        webRtcPeer?.addIceCandidate(parsedMessage.candidate);
                        break;
                    case 'webRTCAudioSuccess':
                        console.log("kurentoAudio Audio Connected Successfully");
                        setConnection((prev)=>({
                            ...prev,
                            audio_connection:true
                        }))
                        break;
                    case 'pong':
                        console.log("kurentoAudio Active connection");
                        break;
                    default:
                        onError(`Unrecognized message: ${parsedMessage}`);
                }
            };

            ws.onclose = () => {
                console.log('kurentoAudio Socket connection closed');
                setConnection((prev)=>({
                    ...prev,
                    audio_connection:false
                }))
                webRtcPeer?.dispose();
            };
        }
    // },[ ])
    },[connectionStatus?.websocket_connection, connectionStatus?.audio_connection, microphoneStream])

    function startProcess() {
        console.log('Creating WebRtcPeer and generating local sdp offer ...');

        const audioElement = document.getElementById('audioElement');
        let constraints = {
            audio: false,
            video: false
        };

        let options = {
            remoteVideo:audioElement,
            audioStream:microphoneStream,
            onicecandidate: onIceCandidate,
            mediaConstraints: constraints,
            configuration:{
                iceServers: connectionStatus.iceServers
            }
        }

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

    }

    function onOffer(error:any, offerSdp:any) {

        if (error) return onError(error);

        console.info('Invoking SDP offer callback function ' + offerSdp);
        let message = {
            "id": "start",
            "type": "audio",
            "role": "sendrecv",
            "clientSessionNumber": 2,
            "sdpOffer": offerSdp,
            "extension": null,
            "transparentListenOnly": false
        }
        kurentoSend(message);
    }

    function onIceCandidate(candidate:any) {
        console.log('Local candidate' + JSON.stringify(candidate));

        let message = {"id":"ping"};

        kurentoSend(message);
    }

    function onError(error:any) {
        console.log("kurento error:", error);
    }

    function startResponse(message:any) {
        // setState(I_CAN_STOP);
        console.log('SDP answer received from server. Processing ...');
        webRtcPeer?.processAnswer(message.sdpAnswer);
    }

    return (
        <div style={{height: 1}}>
            <audio ref={audioRef} id="audioElement" autoPlay/>
        </div>
    )

}

export default KurentoAudio
