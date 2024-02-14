import React, {useEffect, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, connectionStatusState, microphoneStreamState} from "~/recoil/atom";


const KurentoAudio = () => {

    const user = useRecoilValue(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);

    const [microphoneStream, setMicrophoneStream] = useRecoilState(
        microphoneStreamState,
    );

    const [audioState, setAudioState] = useState(false);

    let ws: WebSocket | null = null;
    let webRtcPeer:kurentoUtils.WebRtcPeer| null = null;


    function kurentoSend(data: any) {
        ws?.send(JSON.stringify(data))
        console.log('Sending this data via kurento websocket')
    }

    useEffect(() => {

        if(!connectionStatus?.audio_connection && connectionStatus?.websocket_connection && user?.sessiontoken !=null && microphoneStream!=null ){
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
                        break;
                    case 'iceCandidate':
                        console.log("iceCandidate");
                        webRtcPeer?.addIceCandidate(parsedMessage.candidate);
                        break;
                    case 'webRTCAudioSuccess':
                        console.log("kurentoAudio Audio Connected Successfully");
                        setConnection({
                            websocket_connection: true,
                            audio_connection:true
                        })
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
                setConnection({
                    websocket_connection: true,
                    audio_connection:false
                })
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
            mediaConstraints: constraints
        }

        webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(this: any, error) {
            if (error) return this.onError(error);
            this.generateOffer(onOffer);
        });

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
            <audio id="audioElement" autoPlay/>
        </div>
    )

}

export default KurentoAudio
