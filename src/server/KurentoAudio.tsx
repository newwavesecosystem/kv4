import {useContext, useEffect, useRef, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import * as UserInfo from './UserInfo';
import * as ServerInfo from './ServerInfo';


var ws = null;
var webRtcPeer;
var streamID;


export function kurentoSend(data) {
    ws.send(JSON.stringify(data))
    console.log('Sending this data via kurento websocket')
}

function generateRandomId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}


const KurentoAudio = () => {

    // const groupChatContext = useContext(GroupChatContext)
    // const {groupchat, togglePanel, closeGroupchat, addtypingUsers, removetypingUsers, sendnewMessage} = groupChatContext
    //
    // const participantContext = useContext(ParticipantContext)
    // const {participant, toggleParticipant, closeParticipant, addtoUserlist, removeUserlist} = participantContext
    //
    // const recordingContext = useContext(RecordingContext)
    // const {startRecording, stopRecording, recordingTiming} = recordingContext
    //
    // const connectionStatusContext = useContext(ConnectionStatusContext)
    // const {connectionStatus,audioChanged} = connectionStatusContext

    useEffect(() => {

        // if(connectionStatus?.websocket_connection == 1){
        //     console.log("websocket_connection is active")
        //     audioChanged(2)
        //     ws = new WebSocket(`${ServerInfo.sfuURL}?sessionToken=${UserInfo.sessionToken}`);
        // }
        if (ws != null) {

            // Add event listeners for various socket events
            ws.onopen = () => {
                console.log('Kurento audio Socket connection established');
                // audioChanged(1)
                // setTimeout(startProcess(), 40);

            };

            ws.onmessage = (message) => {
                var parsedMessage = JSON.parse(message.data);
                console.info('Kurento Received message: ' + message.data);
                console.log("Kurento Websocket");
                console.log(parsedMessage.id);
                switch (parsedMessage.id) {
                    case 'startResponse':
                        startResponse(parsedMessage);
                        break;
                    case 'error':
                        onError('Error message from server: ' + parsedMessage.message);
                        break;
                    case 'iceCandidate':
                        console.log("iceCandidate");
                        webRtcPeer.addIceCandidate(parsedMessage.candidate);
                        break;
                    case 'webRTCAudioSuccess':
                        console.log("Audio Connected Successfully");
                        break;
                    case 'pong':
                        console.log("Active connection");
                        break;
                    default:
                        onError(`Unrecognized message: ${parsedMessage}`);
                }
            };

            ws.onclose = () => {
                console.log('Kurento Socket connection closed');
                // audioChanged(0)
            };
        }
    },[ ])
    // },[connectionStatus?.websocket_connection])

    function startProcess() {
        console.log('Creating WebRtcPeer and generating local sdp offer ...');

        const audioElement = document.getElementById('audioElement');
        var constraints = {
            audio: true,
            video: false
        };

        var options = {
            remoteVideo:audioElement,
            onicecandidate: onIceCandidate,
            mediaConstraints: constraints
        }

        // webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function (error) {
        //     if (error) return onError(error)
        //     this.generateOffer(onOffer)
        // });
    }

    function onOffer(error, offerSdp) {

        if (error) return onError(error);

        console.info('Invoking SDP offer callback function ' + offerSdp);
        var message = {
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

    function onIceCandidate(candidate) {
        console.log('Local candidate' + JSON.stringify(candidate));

        var message = {"id":"ping"};

        kurentoSend(message);
    }

    function onError(error) {
        console.log("kurento error:", error);
    }

    function startResponse(message) {
        // setState(I_CAN_STOP);
        console.log('SDP answer received from server. Processing ...');
        webRtcPeer.processAnswer(message.sdpAnswer);
    }

    return (
        <div style={{height: 1}}>
            <audio id="audioElement" autoPlay></audio>
        </div>
    )

}

export default KurentoAudio
