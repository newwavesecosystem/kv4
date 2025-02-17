import React, {useEffect, useRef, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    authUserState,
    connectionStatusState, mediaPermissionState, micFilterState,
    microphoneStreamState,
    selectedMicrophoneState,
    selectedSpeakersState
} from "~/recoil/atom";
import requestMicrophoneAccess from "~/lib/microphone/requestMicrophoneAccess";
import {useToast} from "~/components/ui/use-toast";
import stopMicrophoneStream from "~/lib/microphone/stopMicrophoneStream";


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

export async function kurentoAudioPlaySound(source:string, deviceId:string|undefined) {
    console.log('kurentoAudioPlaySound');

    const sound = new Audio(source);

    if (deviceId && sound.setSinkId) await sound.setSinkId(deviceId);

    sound.play();
}

export function kurentoAudioEndStream() {
    console.log('Ending Audio on KurentoAudio websocket');
    console.log('Ending webRtcPeer ',webRtcPeer);
    console.log('Ending ws ',ws);

    //to stop webRtcPeer
    if (webRtcPeer) {
        console.log('Ending webRtcPeer track ',webRtcPeer.getLocalStream().getAudioTracks()[0]);
        webRtcPeer.getLocalStream().getAudioTracks()[0]?.stop();
        webRtcPeer.getLocalStream().removeTrack(webRtcPeer.getLocalStream().getAudioTracks()[0]!);
        console.log('Ending webRtcPeer track ',webRtcPeer.getLocalStream().getAudioTracks()[0]);
        webRtcPeer.dispose();
        webRtcPeer = null;
    }

    //to stop websocket
    if(ws != null){
        console.log("ws is not null");
        ws.close();
        ws=null;
    }

    console.log('Ending webRtcPeer ',webRtcPeer);
    console.log('Ending ws ',ws);
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

    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const maxReconnectAttempts = 10;


    const audioRef = useRef<HTMLAudioElement>(null);

    const [selectedMicrophone, setSelectedMicrophone] = useRecoilState(
        selectedMicrophoneState,
    );

    const [micFilter, setMicFilter] = useRecoilState(micFilterState);

    const mediaPermission = useRecoilValue(mediaPermissionState);

    const { toast } = useToast();

    function kurentoSend(data: any) {
        ws?.send(JSON.stringify(data))
        console.log('Sending this data via kurento websocket')
    }

    useEffect(() => {
        console.log(`selectedSpeaker : ${selectedSpeaker}`)
        const changeAudioOutput = async () => {
            try {

                const audioElement:any = document.getElementById('audioElement');
                var from = audioElement?.sinkId;
                await audioElement?.setSinkId(selectedSpeaker?.deviceId);
                if (audioElement && (audioElement.readyState > 0)) {
                    audioElement.load();
                }
                console.log(`Audio output set to: ${selectedSpeaker?.deviceId} from:${from}`);
                console.log(`Audio output set successfully ${selectedSpeaker?.label}`);
                console.log(`Audio output readyState : ${audioElement.readyState}`);

                //     if (audioRef.current) {
            //         // Use type assertion to tell TypeScript that audioRef.current has the setSinkId method
            //         (audioRef.current as any).setSinkId(selectedSpeaker?.deviceId)
            //             .then(() => console.log(`Audio output set to device: ${selectedSpeaker?.deviceId}`))
            //             .catch((error:any) => console.error('Error setting audio output device:', error));
            //         console.log(`Audio output set to: ${selectedSpeaker?.label}`);
            //         console.log('Audio output set successfully.');
            //         console.log(`Audio output readyState : ${audioRef.current.readyState}`);
            //         if (audioRef.current.readyState > 0) {
            //             console.log('Audio output is in ready state');
            //             audioRef.current.load();
            //         }
            //     } else {
            //         console.error('Audio element not found.');
            //     }
            } catch (error) {
                console.error('Error changing audio output:', error);
            }
        };

        if(selectedSpeaker != null) {
            // Change the audio output when the selectedSpeaker change
            changeAudioOutput();
        }

        console.log("getCurrentAudioSinkId",audioRef.current?.sinkId);



    },[selectedSpeaker])


    const setMicStream=async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const desiredMic = devices.filter((device) => device.kind === "audioinput");

        if (desiredMic.length < 1) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: `No microphone device detected. Kindly check if you need to grant permission`,
            });
            return;
        }

        const mic = await requestMicrophoneAccess(desiredMic[0],micFilter.autoGainControl, micFilter.noiseSuppression, micFilter.echoCancellation);
        if (mic) {
            setMicrophoneStream(mic);
            // setMicState(true);

            if(desiredMic[0] != undefined){
                setSelectedMicrophone(desiredMic[0])
            }

        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Kindly check your microphone settings.",
            });
        }
    }

    // useEffect(()=> {
    //     console.log("StartEvent changed for mic stream");
    //     if (mediaPermission.audioAllowed) {
    //         console.log("Starting mic stream");
    //         setMicStream();
    //     }
    // },[mediaPermission.audioAllowed]);




    useEffect(() => {
        console.log("kurentoAudio connectionStatus.audio_connection: ",connectionStatus.audio_connection)
        console.log("kurentoAudio connectionStatus.websocket_connection: ",connectionStatus.websocket_connection)
        console.log("kurentoAudio user?.sessiontoken: ",user?.sessiontoken)
        console.log("kurentoAudio microphoneStream: ",microphoneStream)
        if(!connectionStatus.audio_connection && connectionStatus.websocket_connection && user?.sessiontoken !=null ){
            console.log("kurentoAudio websocket_connection is active")
            console.log("kurentoAudio microphoneStream is set")

            if(reconnectAttempts == 0) {
                console.log("kurentoAudio new reconnectAttempts :",reconnectAttempts);
                initializeWebSocket();
            }else{
                console.log("kurentoAudio reconnectAttempts :",reconnectAttempts);
                console.log("Starting mic stream");
                // setMicStream();
                const timeout = Math.min(1000 * 2 ** reconnectAttempts, 30000);  // Exponential backoff
                console.log("Reconnecting in:",timeout);
                setTimeout(() => {
                    initializeWebSocket();  // Try reconnecting
                }, timeout);
            }
        }

        if(!connectionStatus.audio_connection && !connectionStatus.websocket_connection && user?.sessiontoken !=null ){
            console.log("Reconnection started on websocket")
            console.log("Releasing resources")
            stopMicrophoneStream(microphoneStream);
            kurentoAudioEndStream();
        }

        if(connectionStatus.websocket_connection_reconnect && user?.sessiontoken !=null ){
            console.log("Reconnection initiated on websocket")
            setReconnectAttempts(reconnectAttempts + 1);
        }

        // return () => {
        //     if (ws) ws.close();
        // };
    }, [connectionStatus?.websocket_connection, connectionStatus?.audio_connection, connectionStatus.websocket_connection_reconnect,  microphoneStream]);

    function initializeWebSocket() {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            ws = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${user?.sessiontoken}`);

            ws.onopen = () => {
                console.log("KurentoAudio Connected");
                setAudioState(true);
                setTimeout(()=>{
                    startProcess(); // Restart WebRTC after reconnect
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

                        if(parsedMessage.message == "SFU_UNAUTHORIZED"){
                            setTimeout(() => {
                                startProcess();
                            }, 5000);

                        }
                        break;
                    case 'iceCandidate':
                        console.log("iceCandidate");
                        addIceCandidate(parsedMessage.candidate);
                        break;
                    case 'webRTCAudioSuccess':
                        console.log("kurentoAudio Audio Connected Successfully");
                        setConnection((prev)=>({
                            ...prev,
                            audio_connection:true
                        }))
                        setReconnectAttempts(0);  // Reset attempts on success
                        pinger();
                        break;
                    case 'pong':
                        console.log("kurentoAudio Active connection");
                        break;
                    default:
                        onError(`Unrecognized message: ${parsedMessage}`);
                }
            };

            // ws.onclose = handleReconnect;  // Trigger reconnection on close
            // ws.onerror = handleReconnect;  // Trigger reconnection on error
        }
    }

    function addIceCandidate(iceCandidate:any) {
        switch (webRtcPeer?.peerConnection?.signalingState) {
            case 'closed':
                console.warn("WebRtcPeer::addIceCandidate - peer connection closed");
            case 'stable': {
                if (webRtcPeer?.peerConnection.remoteDescription) {
                    console.log("WebRtcPeer::addIceCandidate - adding candidate",iceCandidate);
                    webRtcPeer?.addIceCandidate(iceCandidate);
                }else{
                    console.warn("WebRtcPeer::addIceCandidate - remoteDescription not set yet");
                }
            }
            default: {
                console.warn(`WebRtcPeer::addIceCandidate - peer connection ${webRtcPeer?.peerConnection?.signalingState}`);
            }
        }
    }

    function isPeerConnectionClosed() {
        return !webRtcPeer?.peerConnection || webRtcPeer?.peerConnection.signalingState === 'closed';
    }


    function isPeerConnectionStable() {
        return !webRtcPeer?.peerConnection || webRtcPeer?.peerConnection.signalingState === 'stable';
    }


    function handleReconnect() {
        console.log("Attempting reconnection...");

        // Update connection status
        setConnection((prev) => ({
            ...prev,
            audio_connection: false,
        }));
        setAudioState(false);

        if (reconnectAttempts < maxReconnectAttempts) {
            const timeout = Math.min(1000 * 2 ** reconnectAttempts, 30000);  // Exponential backoff
            setTimeout(() => {
                setReconnectAttempts(reconnectAttempts + 1);
                initializeWebSocket();  // Try reconnecting
            }, timeout);
        } else {
            console.log("Max reconnection attempts reached");
        }
    }

    function pinger(){
        let myVar = setInterval(ping, 15000);
        function ping(){
            if(!connectionStatus.audio_connection){
                clearInterval(myVar);
            }
            kurentoSend({"id":"ping"});
        }
    }

    function startProcess() {
        console.log('Creating WebRtcPeer and generating local sdp offer ...');

        const audioElement = document.getElementById('audioElement');
        let constraints = {
            audio: true,
            video: false
        };
        // let constraints = {
        //     audio: {
        //         autoGainControl: micFilter.autoGainControl,
        //         noiseSuppression: micFilter.noiseSuppression,
        //         echoCancellation: micFilter.echoCancellation
        //     },
        //     video: false
        // };

        let options = {
            remoteVideo:audioElement,
            // audioStream:microphoneStream,
            onicecandidate: onIceCandidate,
            mediaConstraints: constraints,
            configuration: {
                iceServers: connectionStatus.iceServers
            }
        }

        if (ws?.readyState === WebSocket.OPEN) {
            webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(this: any, error) {
                if (error) return onError(error);
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
        if (isPeerConnectionClosed()) {
            console.log("WebRtcPeer::process answer - peer connection closed");
            return;
        }

        if (isPeerConnectionStable()) {
            console.log("WebRtcPeer::process answer - peer connection stable already");
            return;
        }

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
