import SockJS from 'sockjs-client';
import {useContext, useEffect} from 'react';
import * as UserInfo from './UserInfo';
import * as ServerInfo from './ServerInfo';

import {generateRandomId} from "./ServerInfo";

import {
    authUserState,
    connectionStatusState,
    participantListState,
    participantTalkingListState,
    recordingModalState
} from "~/recoil/atom";
import {useRecoilState, useRecoilValue} from "recoil";

// var sock = null;
var sock = new SockJS(ServerInfo.websocketURL);

const reConnect = () => {
    sock = new SockJS(ServerInfo.websocketURL);
    // websocketConnect()
}

function pinger(){

    function ping(){
        websocketSend(["{\"msg\":\"pong\"}"])
    }

    setInterval(ping,10000);
}


// export function websocketConnect() {
//     // Add event listeners for various socket events
//
//     sock.onopen = () => {
//         console.log('Websocket connection established');
//         websocketSend(["{\"msg\":\"connect\",\"version\":\"1\",\"support\":[\"1\",\"pre2\",\"pre1\"]}"])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"meteor_autoupdate_clientVersions\",\"params\":[]}`])
//         websocketSend(["{\"msg\":\"method\",\"id\":\"1\",\"method\":\"userChangedLocalSettings\",\"params\":[{\"application\":{\"animations\":true,\"chatAudioAlerts\":false,\"chatPushAlerts\":false,\"userJoinAudioAlerts\":false,\"userJoinPushAlerts\":false,\"userLeaveAudioAlerts\":false,\"userLeavePushAlerts\":false,\"raiseHandAudioAlerts\":true,\"raiseHandPushAlerts\":true,\"guestWaitingAudioAlerts\":true,\"guestWaitingPushAlerts\":true,\"paginationEnabled\":true,\"pushLayoutToEveryone\":false,\"fallbackLocale\":\"en\",\"overrideLocale\":null,\"locale\":\"en-US\"},\"audio\":{\"inputDeviceId\":\"undefined\",\"outputDeviceId\":\"undefined\"},\"dataSaving\":{\"viewParticipantsWebcams\":true,\"viewScreenshare\":true}}]}"])
//         websocketSend([`{\"msg\":\"method\",\"id\":\"2\",\"method\":\"validateAuthToken\",\"params\":[\"${UserInfo.meetingID}\",\"${UserInfo.internalUserID}\",\"${UserInfo.authToken}\",\"${UserInfo.externUserID}\"]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"auth-token-validation\",\"params\":[{\"meetingId\":\"${UserInfo.meetingID}\",\"userId\":\"${UserInfo.internalUserID}\"}]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"current-user\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"meetings\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"polls\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"presentations\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"slides\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"slide-positions\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"captions\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"voiceUsers\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"whiteboard-multi-user\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"screenshare\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"group-chat\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"group-chat-msg\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"presentation-pods\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users-settings\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"guestUser\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users-infos\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"note\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"meeting-time-remaining\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"local-settings\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users-typing\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"record-meetings\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"video-streams\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"connection-status\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"voice-call-states\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"external-video-meetings\",\"params\":[]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"meetings\",\"params\":[\"MODERATOR\"]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users\",\"params\":[\"MODERATOR\"]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"breakouts\",\"params\":[\"MODERATOR\"]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"guestUser\",\"params\":[\"MODERATOR\"]}`])
//         websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"annotations\",\"params\":[]}`])
//
//         pinger();
//     };
//
//     sock.onmessage = (e) => {
//         console.log('Received message:', e.data);
//         // handleIncomingmsg(e.data)
//     };
// }

export function websocketSend(data:any) {
    // addNewmessage2()
    sock.send(data)

    console.log('Sending this data via websocket')
}


const Websocket = () => {

    const user = useRecoilValue(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);
    const [participantList, setParticipantList] = useRecoilState(participantListState);
    const [participantTalkingList, setParticipantTalkingList] = useRecoilState(participantTalkingListState);
    const [recordingState, setRecordingState] = useRecoilState(recordingModalState);

    // const connectionContext = useContext(ConnectionStatusContext)
    // const {websocket_connection, webSocketChanged} = connectionContext


    useEffect(() => {
        // websocketConnect()
        if (sock !== null) {
            sock.onopen = () => {
                console.log('Websocket connection established');
                websocketSend(["{\"msg\":\"connect\",\"version\":\"1\",\"support\":[\"1\",\"pre2\",\"pre1\"]}"])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"meteor_autoupdate_clientVersions\",\"params\":[]}`])
                websocketSend(["{\"msg\":\"method\",\"id\":\"1\",\"method\":\"userChangedLocalSettings\",\"params\":[{\"application\":{\"animations\":true,\"chatAudioAlerts\":false,\"chatPushAlerts\":false,\"userJoinAudioAlerts\":false,\"userJoinPushAlerts\":false,\"userLeaveAudioAlerts\":false,\"userLeavePushAlerts\":false,\"raiseHandAudioAlerts\":true,\"raiseHandPushAlerts\":true,\"guestWaitingAudioAlerts\":true,\"guestWaitingPushAlerts\":true,\"paginationEnabled\":true,\"pushLayoutToEveryone\":false,\"fallbackLocale\":\"en\",\"overrideLocale\":null,\"locale\":\"en-US\"},\"audio\":{\"inputDeviceId\":\"undefined\",\"outputDeviceId\":\"undefined\"},\"dataSaving\":{\"viewParticipantsWebcams\":true,\"viewScreenshare\":true}}]}"])
                websocketSend([`{\"msg\":\"method\",\"id\":\"2\",\"method\":\"validateAuthToken\",\"params\":[\"${user?.meetingDetails?.meetingID}\",\"${user?.meetingDetails?.internalUserID}\",\"${user?.meetingDetails?.authToken}\",\"${user?.meetingDetails?.externUserID}\"]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"auth-token-validation\",\"params\":[{\"meetingId\":\"${user?.meetingDetails?.meetingID}\",\"userId\":\"${user?.meetingDetails?.internalUserID}\"}]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"current-user\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"meetings\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"polls\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"presentations\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"slides\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"slide-positions\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"captions\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"voiceUsers\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"whiteboard-multi-user\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"screenshare\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"group-chat\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"group-chat-msg\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"presentation-pods\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users-settings\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"guestUser\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users-infos\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"note\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"meeting-time-remaining\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"local-settings\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users-typing\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"record-meetings\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"video-streams\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"connection-status\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"voice-call-states\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"external-video-meetings\",\"params\":[]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"meetings\",\"params\":[\"MODERATOR\"]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"users\",\"params\":[\"MODERATOR\"]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"breakouts\",\"params\":[\"MODERATOR\"]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"guestUser\",\"params\":[\"MODERATOR\"]}`])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"annotations\",\"params\":[]}`])

                pinger();
            };

            sock.onmessage = (e) => {
                setConnection({
                    audio_connection: false,
                    websocket_connection:true
                })
                console.log('Received message:', e.data);
                const obj = JSON.parse(e.data);
                const {collection} = obj;
                // if (collection == "group-chat-msg") {
                //     handleIncomingmsg(e.data)
                // }
                // if (collection == "users-typing") {
                //     handleTyping(e.data)
                // }
                if (collection == "users") {
                    handleUsers(e.data)
                }
                if (collection == "record-meetings") {
                    handleRecording(e.data)
                }
                // if (collection == "video-streams") {
                //     handleRecording(e.data)
                // }
                // if(collection == "meetings"){
                //     handleMeetings(e.data)
                // }
                // if(collection == "external-video-meetings"){
                //     handleExternalVideo(e.data)
                // }
                //
                // if(collection == "video-streams"){
                //     handleRemoteVideo(e.data)
                // }
                //
                if(collection == "voiceUsers"){
                    handleVoiceUsers(e.data)
                }
                //
                // if(collection == "screenshare"){
                //     handleRemoteScreenShare(e.data)
                // }
                //
                //
                // if(collection == "presentation-upload-token"){
                //     handlePresentationPreUpload(e.data)
                // }

            };
            sock.onclose = () => {
                console.log('Socket connection closed');
                console.log('Trying to Reconnect');
                setConnection({
                    audio_connection: false,
                    websocket_connection:false
                })
                // reConnect()

            };
        }
    })
    // const groupChatContext = useContext(GroupChatContext)
    // const {groupchat, togglePanel, closeGroupchat, addtypingUsers, removetypingUsers, sendnewMessage, timeoutUsers} = groupChatContext
    //
    // const participantContext = useContext(ParticipantContext)
    // const {participant, toggleParticipant, modifyPresenterStateUser, randomlyselectedUser, addtoUserlist, removeUserlist,findUserfromUserId,addTalkingUser,removeTalkingUser,modifyTalkingUser,modifyJoinedUser,modifyMutedUser} = participantContext
    //
    // const recordingContext = useContext(RecordingContext)
    // const {startRecording, stopRecording, recordingTiming} = recordingContext
    //
    // const settingsContext = useContext(SettingFunctionContext)
    // const {receiveVideoLinkFromWebsocket,stopVideoLinkFromWebsocket, endCall, handleUploadTCP} = settingsContext
    //
    // const cameracontext = useContext(CameraContext)
    // const {openRemoteCamera,closeRemoteCamera} = cameracontext
    //
    //
    // const screenshareContext = useContext(ScreenshareContext)
    // const {screenshare,toggleRemoteScreenshare} = screenshareContext


    // const handleIncomingvideo = (eventData) => {
    //     console.log('I got to handle incoming messages')
    //     const obj = JSON.parse(eventData);
    //     const {deviceId, message} = obj.fields;
    // }
    // const handleIncomingmsg = (eventData) => {
    //     console.log('I got to handle incoming messages')
    //     const obj = JSON.parse(eventData);
    //     const {sender, message} = obj.fields;
    //     console.log("Sender:", sender);
    //     console.log("Message:", message);
    //     // sendnewMessage(sender, message)
    // }
    //
    // const handleTyping = (eventData) => {
    //     console.log('I got to handle incoming messages')
    //     const obj = JSON.parse(eventData);
    //     const {msg, id} = obj;
    //     if (msg == 'added') {
    //         const {userId, id} = obj.fields;
    //         addtypingUsers(userId)
    //     } else {
    //         removetypingUsers(id)
    //     }
    // }
    //
    const handleUsers = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;
        console.log("UserState: handleUsers",obj);
        if (msg == 'added') {
            let urecord={
                ...fields,
                id
            }
            addtoUserlist(urecord)
        }

        // if (msg == 'changed') {
        //     const {presenter} = fields;
        //
        //     if(presenter != null){
        //         console.log("UserState: handling presenter change",obj);
        //         modifyPresenterStateUser(id,presenter)
        //     }
        // }
        //
        if (msg == 'removed') {
            removeUserlist(id)
        }
    }

    // const handleRemoteVideo = (eventData) => {
    //     console.log('I got to handle incoming messages')
    //     const obj = JSON.parse(eventData);
    //     const {msg, id} = obj;
    //
    //     if(msg == "added"){
    //         const {stream, name,userId} = obj.fields;
    //
    //         if(userId != UserInfo?.internalUserID){
    //             console.log("stream video request received on websocket")
    //             openRemoteCamera(userId,stream);
    //         }
    //     }
    //
    //     if(msg == "removed"){
    //         closeRemoteCamera(id);
    //     }
    // }
    //
    // const handleRemoteScreenShare = (eventData) => {
    //     console.log('I got to handle incoming  screenshare messages')
    //     const obj = JSON.parse(eventData);
    //     const {msg, id} = obj;
    //
    //     if(msg == "added"){
    //         const {stream, name,callerName} = obj.fields;
    //
    //         // if(userId != UserInfo?.internalUserID){
    //         //     openRemoteCamera(stream);
    //         // }
    //
    //         toggleRemoteScreenshare();
    //     }
    //
    //     if(msg == "removed"){
    //         toggleRemoteScreenshare();
    //     }
    // }
    //
    const handleVoiceUsers = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id} = obj;

        if(msg == "added"){
            // a["{\"msg\":\"added\",\"collection\":\"voiceUsers\",\"id\":\"7J2pQrMaH5C58ZsHj\",\"fields\":{\"intId\":\"w_6pjsehfq5dcf\",\"meetingId\":\"05a8ea5382b9fd885261bb3eed0527d1d3b07262-1695982480527\",\"callerName\":\"Test Sam\",\"callerNum\":\"\",\"callingWith\":\"\",\"color\":\"#7b1fa2\",\"joined\":false,\"listenOnly\":false,\"muted\":false,\"spoke\":false,\"talking\":false,\"voiceConf\":\"\",\"voiceUserId\":\"\"}}"]
            const {intId, callerName,talking,joined,muted} = obj.fields;

            var data={
                id,intId,callerName,joined,talking,muted
            }
            addTalkingUser(data);
        }

        if(msg == "changed"){
            // a["{\"msg\":\"changed\",\"collection\":\"voiceUsers\",\"id\":\"kceJYpBeocewDNe9a\",\"fields\":{\"talking\":true,\"endTime\":null}}"]
            // a["{\"msg\":\"changed\",\"collection\":\"voiceUsers\",\"id\":\"xTqLH8jgBeLEo89Pc\",\"fields\":{\"talking\":false,\"endTime\":1695982673969}}"]
            // {"msg":"changed","collection":"voiceUsers","id":"FmabtQYbhbkspgLaG","fields":{"spoke":true,"talking":true,"endTime":null,"startTime":1696315506766}}
            // {"msg":"changed","collection":"voiceUsers","id":"FmabtQYbhbkspgLaG","fields":{"color":"#283593","joined":true,"voiceUserId":"122"}}
            const {talking,joined,muted} = obj.fields;

            if(joined != null ){
                modifyJoinedUser(id,joined);
            }

            if(talking != null ){
                modifyTalkingUser(id,talking);
            }

            if(muted != null ){
                modifyMutedUser(id,muted);
            }
        }

    }
    //
    //
    // const handleExternalVideo = (eventData) => {
    //     console.log('I got to handle incoming messages')
    //     const obj = JSON.parse(eventData);
    //     const {msg, id, fields} = obj;
    //     const {externalVideoUrl} = fields;
    //
    //     if(msg == "changed") {
    //         if (externalVideoUrl != null) {
    //             receiveVideoLinkFromWebsocket(externalVideoUrl)
    //         } else {
    //             stopVideoLinkFromWebsocket(null)
    //         }
    //     }
    // }
    //
    // const handleMeetings =(eventData)=>{
    //     console.log('Random User Handler')
    //     const obj = JSON.parse(eventData);
    //     const {msg, randomlySelectedUser, meetingEnded} = obj.fields
    //
    //     if(meetingEnded != null && meetingEnded){
    //         endCall();
    //     }
    //
    //     if(randomlySelectedUser != null){
    //         handleRandomUsers(eventData)
    //     }
    // }
    //
    // const handleRandomUsers =(eventData)=>{
    //     console.log('Random User Handler')
    //     const obj = JSON.parse(eventData);
    //     const {msg, randomlySelectedUser} = obj.fields
    //     // console.log(findUserfromUserId(selectedUSer))
    //     let userName = 'unknown';
    //     for(let i = 0; i < randomlySelectedUser.length; i++){
    //         const selectedUserId = randomlySelectedUser[i].toString().split(',')[0]
    //         const selectedUser = randomlySelectedUser[i].toString().split(',')[1]
    //         console.log(selectedUserId)
    //         console.log(selectedUser)
    //         if(selectedUser === '1'){
    //             userName = findUserfromUserId(selectedUserId)
    //         }
    //     }
    //     console.log(userName)
    //     randomlyselectedUser(userName)
    // }
    //
    // const handleRecording = (eventData) => {
    //     console.log('I got to handle incoming messages')
    //     const obj = JSON.parse(eventData);
    //     const {recording, time,} = obj.fields;
    //     if (recording == null) {
    //         recordingTiming(time)
    //     } else {
    //         if (recording) {
    //             // startRecording()
    //         } else {
    //             stopRecording()
    //         }
    //     }
    // }
    //
    // const handlePresentationPreUpload = (eventData) => {
    //     console.log('I got to handle incoming messages')
    //     const obj = JSON.parse(eventData);
    //
    //     console.log("settingfunction: webhook received")
    //
    //     if (obj.msg == "added") {
    //         const {authzToken, temporaryPresentationId, filename, userId,podId,meetingId} = obj.fields;
    //
    //         handleUploadTCP(obj.id,authzToken,podId,temporaryPresentationId,meetingId);
    //     }
    // }

    const addtoUserlist = (user:any) => {
        let ishola = participantList;
        console.log("UserState: ishola", ishola)
        if (ishola.filter((item :any) => item?.userId == user?.userId).length < 1) {
            setParticipantList([...participantList,user]);
        }

        // {
        //     "meetingId": "d02560dd9d7db4467627745bd6701e809ffca6e3-1701064782303",
        //     "userId": "w_tu65s6he8zqn",
        //     "clientType": "HTML5",
        //     "validated": true,
        //     "left": false,
        //     "approved": true,
        //     "authTokenValidatedTime": 1701067468275,
        //     "inactivityCheck": false,
        //     "loginTime": 1701064783506,
        //     "authed": true,
        //     "avatar": "https://dev.konn3ct.ng/storage/profile-photos/26wlZMlsGVuMMxJHbiV9wg0eaBCZm2ZA1sUw3kBV.jpg",
        //     "away": false,
        //     "breakoutProps": {
        //     "isBreakoutUser": false,
        //         "parentId": "bbb-none"
        // },
        //     "color": "#7b1fa2",
        //     "effectiveConnectionType": null,
        //     "emoji": "none",
        //     "extId": "odejinmisamuel@gmail.com",
        //     "guest": false,
        //     "guestStatus": "ALLOW",
        //     "intId": "w_tu65s6he8zqn",
        //     "locked": true,
        //     "loggedOut": false,
        //     "mobile": false,
        //     "name": "Odejinmi Samuel",
        //     "pin": false,
        //     "presenter": false,
        //     "raiseHand": false,
        //     "reactionEmoji": "none",
        //     "responseDelay": 0,
        //     "role": "MODERATOR",
        //     "sortName": "odejinmi samuel",
        //     "speechLocale": "",
        //     "connectionIdUpdateTime": 1701067468280,
        //     "currentConnectionId": "askDvSHaaWCbRLX6N",
        //     "id": "kwikdeF9gpkoGriFn"
        // }
    }

    const removeUserlist = (id:number) => {
        console.log('removing user ',id);
        let ishola = participantList;

        let ur=ishola.filter((item:any) => item?.id != id);
        console.log("UserState: handleUsers ",ur)
        setParticipantList(ur);

    }


    const addTalkingUser = (user:any) => {
        console.log('voice user', user);
        // { id: '7J2pQrMaH5C58ZsHj', intId: 'w_6pjsehfq5dcf', callerName: 'Test Sam', joined: false, talking: false, muted:false }
        var ishola = participantTalkingList
        console.log(ishola)
        if (ishola.filter((item:any) => item?.id == user?.id).length < 1) {
            setParticipantTalkingList([...participantTalkingList,user])
        }
    }

    const modifyTalkingUser = (id:number, state:boolean) => {
        // Update the 'talking' property to 'true' for the object with id '7J2pQrMaH5C58ZsHj'
        const updatedArray = participantTalkingList?.map((item:any) => {
            if (item.id === id) {
                return {...item, talking: state};
            }
            return item;
        });

        console.log(updatedArray);
        setParticipantTalkingList(updatedArray)
    }


    const modifyJoinedUser = (id:number, state:boolean) => {
        // Update the 'joined' property to 'true' for the object with id '7J2pQrMaH5C58ZsHj' for Audio state
        const updatedArray = participantTalkingList?.map((item:any) => {
            if (item.id === id) {
                return {...item, joined: state};
            }
            return item;
        });

// 'updatedArray' now contains the modified object
        console.log(updatedArray);

        setParticipantTalkingList(updatedArray)

    }

    const modifyMutedUser = (id:number, state:boolean) => {
        // Update the 'muted' property to 'true' for the object with id '7J2pQrMaH5C58ZsHj' for Audio
        const updatedArray = participantTalkingList?.map((item:any) => {
            if (item.id === id) {
                return {...item, muted: state};
            }
            return item;
        });

// 'updatedArray' now contains the modified object
        console.log(updatedArray);

        setParticipantTalkingList(updatedArray)
    }

    const removeTalkingUser = (user:any) => {
        var ishola = participantTalkingList;
        // console.log(ishola)
        if (ishola.filter((item:any) => item?.userId == user?.userId).length > 0) {
            setParticipantTalkingList(ishola)
        }
    }

    const handleRecording = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {recording, time,} = obj.fields;
        if (recording == null) {
            // recordingTiming(time)
        } else {
            if (recording) {
                setRecordingState((prev) => ({
                    ...prev,
                    isActive: true,
                }));
            } else {
                setRecordingState((prev) => ({
                    ...prev,
                    isActive: false,
                }));
            }
        }
    }


    const findUserNamefromUserId = (userId:string) => {
        var ishola = participantList
        var damola = ishola.filter((item:any) => item?.userId == userId)
        console.log('damola')
        console.log(damola)
        if (damola.length > 0) {
            return damola[0]?.name
        } else {
            return 'unknown'
        }
    }

    const findAvatarfromUserId = (userId:string) => {
        var ishola = participantList
        var damola = ishola.filter((item:any) => item?.userId == userId)
        console.log('damola')
        console.log(damola)
        if (damola.length > 0) {
            return damola[0]?.avatar
        } else {
            return ''
        }
    }


    return (
        <div>
        </div>
    )

}

export function websocketRecord() {
    console.log('I am Websockets')
    websocketSend(["{\"msg\":\"method\",\"id\":\"273\",\"method\":\"toggleRecording\",\"params\":[]}"])
}

export function websocketParticipantsStatus() {

}

export function websocketMuteParticipants() {
    console.log('Muted all')
    // websocketSend([`{\"msg\":\"method\",\"id\":\"11\",\"method\":\"muteAllUsers\",\"params\":[\"${UserInfo.internalUserID}\"]}`])
}

export function websocketMuteParticipantsePresenter() {
    // websocketSend([`{\"msg\":\"method\",\"id\":\"27\",\"method\":\"muteAllExceptPresenter\",\"params\":[\"${UserInfo.internalUserID}\"]}`])
}

export function websocketClear() {
    // websocketSend([`{\"msg\":\"method\",\"id\":\"51\",\"method\":\"setEmojiStatus\",\"params\":[\"${UserInfo.internalUserID}\",\"none\"]}`])
}

export function websocketMuteMic() {
    websocketSend(["{\"msg\":\"method\",\"id\":\"9\",\"method\":\"toggleVoice\",\"params\":[]}"])
}
export function websocketPresenter(){
    // websocketSend([`{\"msg\":\"method\",\"id\":\"27\",\"method\":\"assignPresenter\",\"params\":[\"${UserInfo.internalUserID}\"]}`])
}
export function endMeeting(){

    websocketSend(["{\"msg\":\"method\",\"id\":\"27\",\"method\":\"endMeeting\",\"params\":[]}"])
}
export default Websocket
