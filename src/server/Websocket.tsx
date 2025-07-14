import SockJS from 'sockjs-client';
import React, {useContext, useEffect, useState} from 'react';
import * as UserInfo from './UserInfo';
import * as ServerInfo from './ServerInfo';

import {generateRandomId, generatesSmallId} from "./ServerInfo";

import {
    authUserState,
    breakOutModalState,
    chatListState, chatTypeListState,
    chatTypingListState,
    connectionStatusState,
    donationModalState,
    eCinemaModalState,
    fileUploadModalState, manageUserSettingsState, mediaPermissionState,
    micOpenState, microphoneStreamState,
    newMessage, newRaiseHand, notificationSettingsState,
    participantCameraListState,
    participantListState,
    participantTalkingListState, pinnedUsersState,
    pollModalState, postLeaveMeetingState,
    presentationSlideState, privateChatModalState,
    recordingModalState, screenSharingState,
    screenSharingStreamState, selectedSpeakersState, soundNotificationState,
    viewerScreenSharingState, waitingRoomTypeState,
    waitingRoomUsersState
} from "~/recoil/atom";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
    IBreakoutRoom,
    IColumnBreakOutRoom,
    IManageUserSettings,
    IParticipant,
    IParticipantCamera, IPresentationSlideState,
    IVoiceUser,
    IWaitingUser
} from "~/types";
import dayjs from "dayjs";
import axios from "axios";
import {toast} from "~/components/ui/use-toast";
import {FindUserNamefromUserId, ModeratorRole} from "~/lib/checkFunctions";
import {SetCurrentSessionEjected} from "~/lib/localStorageFunctions";
import {ValidationStates} from "~/lib/utils";
import stopMicrophoneStream from "~/lib/microphone/stopMicrophoneStream";
import {kurentoAudioEndStream, kurentoAudioPlaySound} from "~/server/KurentoAudio";
import {kurentoVideoEndStream} from "~/server/KurentoVideo";
import {websocketKurentoScreenshareEndScreenshare} from "~/server/KurentoScreenshare";
import {
    receivedPlay, receivedPlayerUpdate, receivedPresenterReady,
    receivedStop,
    receiveVideoLinkFromWebsocket,
    stopVideoLinkFromWebsocket
} from "~/components/eCinema/EcinemaService";
import {
    receiveForceJoinRoom,
    receiveFreeJoinRoom,
    receiveStopBreakoutRoom
} from "~/components/breakout/BreakoutRoomService";

const maxReconnectAttempts = 10;



// var sock = null;
var sock = new SockJS(ServerInfo.websocketURL);


export function websocketSend(data:any) {
    sock.send(data)

    console.log('Sending this data via websocket')
}


export function websocketEnd() {
    console.log('Ending websocket');

    //to stop websocket
    if(sock !== null){
        console.log("sock is not null");
        sock.close();
    }
}



const Websocket = () => {

    const [user, setUser] = useRecoilState(authUserState);
    const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);
    const [participantList, setParticipantList] = useRecoilState(participantListState);
    const [participantTalkingList, setParticipantTalkingList] = useRecoilState(participantTalkingListState);
    const [recordingState, setRecordingState] = useRecoilState(recordingModalState);
    const [participantCameraList, setParticipantCameraList] = useRecoilState(participantCameraListState);
    const [viewerscreenShareState, setViewerScreenShareState] = useRecoilState(viewerScreenSharingState);
    const [screenSharingStream, setScreenSharingStream] = useRecoilState(screenSharingStreamState);
    const [chatList, setChatList] = useRecoilState(chatListState);
    const [chatTypingList, setChatTypingList] = useRecoilState(chatTypingListState);
    const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);
    const [donationState, setDonationState] = useRecoilState(donationModalState);
    const [pollModal, setPollModal] = useRecoilState(pollModalState);
    const [presentationSlide, setPresentationSlide] = useRecoilState(presentationSlideState);
    const [waitingRoomUsers, setWaitingRoomUsers] = useRecoilState(waitingRoomUsersState);
    const [micState, setMicState] = useRecoilState(micOpenState);
    const [breakOutRoomState, setBreakOutRoomState] = useRecoilState(breakOutModalState);
    const [isNewMessage, setIsNewMessage] = useRecoilState(newMessage);
    const [fileUploadModal, setFileUploadModal] = useRecoilState(fileUploadModalState);
    const [privateChatState, setPrivateChatState] = useRecoilState(privateChatModalState);
    const [screenShareState, setScreenShareState] = useRecoilState(screenSharingState);
    const [chatTypeList, setChatTypeList] = useRecoilState(chatTypeListState);
    const [isnewRaiseHand, setIsnewRaiseHand] = useRecoilState(newRaiseHand);
    const [manageUserSettings, setManageUserSettings] = useRecoilState(manageUserSettingsState);
    const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(
        postLeaveMeetingState,
    );
    const [waitingRoomType, setWaitingRoomType] = useRecoilState(waitingRoomTypeState);
    const [pinnedParticipant, setPinnedParticipant] = useRecoilState(pinnedUsersState);
    const [microphoneStream, setMicrophoneStream] = useRecoilState(
        microphoneStreamState,
    );
    const [mediaPermission, setMediaPermission] = useRecoilState(mediaPermissionState);

    const [selectedSpeaker, setSelectedSpeaker] = useRecoilState(selectedSpeakersState);

    const [notificationSettings, setNotificationSettingsState] = useRecoilState(notificationSettingsState);

    const [soundNotification, setSoundNotification] = useRecoilState(soundNotificationState);

    const [stopReconnection, setStopReconnection] = useState(false);

    const [reconnectAttempts, setReconnectAttempts] = useState(0);


    const [num, setNum] = useState(1);

    const getNum=()=>{
        setNum(num+1);
        return num;
    }

    let myPingVar:any=null;


    function pinger(){

        myPingVar = setInterval(ping, 14000);

        function ping(){
            websocketSend(["{\"msg\":\"ping\"}"])
        }

    }


    useEffect(() => {
        initializeWebSocket();
    })

    useEffect(() => {
        console.log("reconnection state is changing: ",connectionStatus.websocket_connection_reconnect)
        const reConnect = () => {
            console.log("Reconnection launched");
            console.log("should stop reconnection,",stopReconnection);
            console.log("should stop reconnection connectionStatus,",connectionStatus);
            if (stopReconnection) {
                console.log('Stopping Websocket reconnection due to meeting exit condition');
                return;
            }


            if (!connectionStatus.websocket_connection_reconnect) {
                shouldStopReconnectingLocal();
                console.log('Stopping Websocket reconnection due to meeting exit condition should not retry');
                return;
            }

            if (reconnectAttempts < maxReconnectAttempts) {
                const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000); // Exponential backoff
                setTimeout(() => {
                    console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}`);
                    sock = new SockJS(ServerInfo.websocketURL);
                    initializeWebSocket();
                    setReconnectAttempts(reconnectAttempts + 1);
                }, delay);
            } else {
                console.log("Max reconnection attempts reached");
                window.location.reload();
            }
        };

        if(connectionStatus.websocket_connection_reconnect) {
            clearInterval(myPingVar);
            setTimeout(() => {
                reConnect();
            }, 2000);
        }
    }, [connectionStatus.websocket_connection_reconnect]);

    const shouldStopReconnectingLocal = () => {
        console.log("updating should stop reconnection local")
        clearInterval(myPingVar);
        setReconnectAttempts(maxReconnectAttempts);
        setConnection((prev)=>({
            ...prev,
            websocket_connection:false,
            websocket_connection_reconnect:false
        }))
        websocketEnd();
        stopMicrophoneStream(microphoneStream);
        kurentoAudioEndStream();
        kurentoVideoEndStream();
        if(screenSharingStream != null){
            websocketKurentoScreenshareEndScreenshare(screenSharingStream);
        }
    };

    const startSub = () => {
        setTimeout(() => {
            console.log("Starting validate auth token and subs")
            websocketSend([`{\"msg\":\"method\",\"id\":\"2\",\"method\":\"validateAuthToken\",\"params\":[\"${user?.meetingDetails?.meetingID}\",\"${user?.meetingDetails?.internalUserID}\",\"${user?.meetingDetails?.authToken}\",\"${user?.meetingDetails?.externUserID}\"]}`])
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
            // websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"note\",\"params\":[]}`])
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
        }, 500);
    };

    const initializeWebSocket = () => {
        if (sock !== null) {
            sock.onopen = () => {
                console.log('Websocket connection established');

                websocketSend(["{\"msg\":\"connect\",\"version\":\"1\",\"support\":[\"1\",\"pre2\",\"pre1\"]}"])
                websocketSend([`{\"msg\":\"sub\",\"id\":\"${generateRandomId(17)}\",\"name\":\"meteor_autoupdate_clientVersions\",\"params\":[]}`])
                websocketSend(["{\"msg\":\"method\",\"id\":\"1\",\"method\":\"userChangedLocalSettings\",\"params\":[{\"application\":{\"animations\":true,\"chatAudioAlerts\":false,\"chatPushAlerts\":false,\"userJoinAudioAlerts\":false,\"userJoinPushAlerts\":false,\"userLeaveAudioAlerts\":false,\"userLeavePushAlerts\":false,\"raiseHandAudioAlerts\":true,\"raiseHandPushAlerts\":true,\"guestWaitingAudioAlerts\":true,\"guestWaitingPushAlerts\":true,\"paginationEnabled\":true,\"pushLayoutToEveryone\":false,\"fallbackLocale\":\"en\",\"overrideLocale\":null,\"locale\":\"en-US\"},\"audio\":{\"inputDeviceId\":\"undefined\",\"outputDeviceId\":\"undefined\"},\"dataSaving\":{\"viewParticipantsWebcams\":true,\"viewScreenshare\":true}}]}"])
            };

            sock.onmessage = (e) => {

                console.log('Received message:', e.data);
                const obj = JSON.parse(e.data);
                const {collection} = obj;

                if (obj.msg == "connected") {
                    startSub();
                    // a["{\"msg\":\"connected\",\"session\":\"4qajGwWr4bziuofh9\"}"]
                }

                if (obj.msg == "ping") {
                    if(!postLeaveMeeting.isLeave || !postLeaveMeeting.isLeaveRoomCall || !postLeaveMeeting.isEndCall || !postLeaveMeeting.isOthers || !postLeaveMeeting.isSessionExpired || !postLeaveMeeting.isKicked) {
                        websocketSend(["{\"msg\":\"pong\"}"]);
                    }
                }

                if (obj.msg == "result") {
                    if(obj.result != null) {
                        // a["{\"msg\":\"result\",\"id\":\"2\",\"result\":{\"connectionId\":\"53iPKsgGXaJndzZBd\",\"meetingId\":\"90af7edbfd8a161a7f711504a114aaf5bf597f9f-1728092698015\",\"userId\":\"w_jfvnaaon0fa8\",\"reason\":null,\"updatedAt\":1728094173674,\"validationStatus\":3,\"_id\":\"JhnM7euG7emiXsvSn\"}}"]

                        const {connectionId, validationStatus, reason} = obj.result;

                        if (connectionId != null) {
                            switch (validationStatus) {
                                case ValidationStates.INVALID:
                                    console.log(reason);
                                    shouldStopReconnectingLocal();

                                    setPostLeaveMeeting({
                                        ...postLeaveMeeting,
                                        isOthers: true,
                                    });
                                    return;

                                    break;
                                case ValidationStates.VALIDATED:
                                    setTimeout(()=>{
                                        setConnection((prev)=>({
                                            ...prev,
                                            websocket_connection:true,
                                            websocket_connection_reconnect:false
                                        }))
                                    }, 500);

                                    setUser((prev) => ({
                                        ...prev!,
                                        connectionID: connectionId,
                                        connectionAuthTime: new Date().getTime()
                                    }))
                                    pinger();
                                    setReconnectAttempts(0); // Reset attempts on successful connection
                                    break;
                                default:
                            }

                        }
                    }
                }

                if (collection == "group-chat-msg") {
                    handleIncomingmsg(e.data)
                }

                if (collection == "group-chat") {
                    handleGroupChat(e.data)
                }
                if (collection == "users-typing") {
                    handleTyping(e.data)
                }
                if (collection == "users") {
                    handleUsers(e.data)
                }

                if (collection == "current-user") {
                    handleCurrentUsers(e.data)
                }
                if (collection == "record-meetings") {
                    handleRecording(e.data)
                }

                if(collection == "meetings"){
                    handleMeetings(e.data)
                }

                if(collection == "external-video-meetings"){
                    handleExternalVideo(e.data)
                }


                if(collection!= null && collection.includes("stream-external-videos")){
                    handleStreamExternalVideos(e.data)
                }

                if(collection == "video-streams"){
                    handleRemoteVideo(e.data)
                }

                if(collection == "voiceUsers"){
                    handleVoiceUsers(e.data)
                }

                if(collection == "screenshare"){
                    handleRemoteScreenShare(e.data)
                }

                if(collection == "polls" || collection == "current-poll" ){
                    handlePolls(e.data)
                }

                if(collection == "presentations"){
                    handlePresentations(e.data)
                }

                if(collection == "guestUsers"){
                    handleGuestUsers(e.data)
                }

                if(collection == "breakouts"){
                    handleBreakout(e.data)
                }


                if(collection == "presentation-upload-token"){
                    handlePresentationPreUpload(e.data)
                }

                if(collection == "connection-status"){
                    handleConnectionStatus(e.data)
                }

                // if(collection.toString().includes("stream-annotations")){
                //     handleStreamAnnotation(e.data)
                // }

            };
            sock.onclose = () => {
                console.log('Socket connection closed, attempting to reconnect...');
                setConnection((prev)=>({
                    ...prev,
                    websocket_connection:false,
                    websocket_connection_reconnect:true,
                    audio_connection:false
                }))
            };
            sock.onerror = () => {
                console.log('Socket connection error, attempting to reconnect...');
                setConnection((prev)=>({
                    ...prev,
                    websocket_connection:false,
                    websocket_connection_reconnect:true,
                    audio_connection:false
                }))
            };
        }
    };


    const handleIncomingmsg = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {sender, senderName, timestamp, message, id, chatId} = obj.fields;
        console.log("handleIncomingmsg:", obj.fields);
        console.log("Sender:", sender);
        console.log("Message:", message);
        console.log("Message:", message);

        if(message.toString().includes('Donation created')){
            let dn=message.toString().split('|');

            setDonationState({
                donationAmount: dn[3] as number,
                donationAmountType: dn[2],
                donationName: dn[1],
                enableFlashNotification: false,
                totalAmountDonatated: 0,
                usersDonated: [],
                step: 0,
                isActive: true,
                donationCreatedAt: new Date(),
                donationCreatorId: dn[4] as number,
                donationCreatorName: user?.fullName as string
            });
            addMessage(senderName,dn[0],timestamp,id,sender);
            return;
        }

        if(chatId == "MAIN-PUBLIC-GROUP-CHAT"){
            if(id == "SYSTEM_MESSAGE-PUBLIC_CHAT_POLL_RESULT"){
                //{ "msg": "added", "collection": "group-chat-msg", "id": "RnpLNxM9dm6ScSDYk", "fields": { "id": "SYSTEM_MESSAGE-PUBLIC_CHAT_POLL_RESULT", "timestamp": 1713358122001, "correlationId": "SYSTEM_MESSAGE-1713358122001", "sender": "SYSTEM_MESSAGE", "message": "", "extra": { "type": "poll", "pollResultData": { "id": "5522506823d42b15259f1a751d5ff6a1e23c271c-1713354101372/1/1713358049905", "questionType": "CUSTOM", "questionText": "What is ur name?", "answers": [ { "id": 0, "key": "Samji", "numVotes": 1 }, { "id": 1, "key": "Sam", "numVotes": 1 }, { "id": 2, "key": "Test", "numVotes": 0 } ], "numRespondents": 2, "numResponders": 2 } }, "meetingId": "90af7edbfd8a161a7f711504a114aaf5bf597f9f-1713354101371", "chatId": "MAIN-PUBLIC-GROUP-CHAT" } }

                const {pollResultData} = obj.fields.extra;

                setPollModal((prev) => ({
                    ...prev,
                    step: 2,
                    isActive: false,
                    isEnded: true,
                    isEdit: false,
                    isUserHost: false,
                    pollQuestion: pollResultData.questionText,
                    pollCreatorName: "",
                    pollCreatorId: "0",
                    pollCreatedAt: new Date(),
                    totalVotes: pollResultData.numRespondents,
                    usersVoted: [],
                    pollOptions: pollResultData.answers.map((option:any, index:number) => {
                        return {
                            id: option.id,
                            option: option.key,
                            votes: option.numVotes,
                        };
                    }),
                }));
                return;
            }

            addMessage(senderName,message,timestamp,id,sender);
            return;
        }

        addPrivateMessage(senderName,message,timestamp,id, chatId);

    }

    const handleGroupChat = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;

        if(msg == "added") {
            const {chatId, meetingId, access} = obj.fields;

            if (chatId == "MAIN-PUBLIC-GROUP-CHAT") {
                return;
            }

            // a["{"msg":"added","collection":"group-chat","id":"QNz7Est4eYr895e4M","fields":{"chatId":"1709041032349-4hb295a9","meetingId":"6216f8a75fd5bb3d5f22b6f9958cdede3fc086c2-1709040921995","access":"PRIVATE_ACCESS","createdBy":"w_yqu0qgo2gbps","participants":[{"id":"w_4amx2midtfcd","name":"Odejinmi Samuel","role":"MODERATOR"},{"id":"w_yqu0qgo2gbps","name":"Odejinmi Samuel","role":"MODERATOR"}],"users":["w_4amx2midtfcd","w_yqu0qgo2gbps"]}}"]

            setPrivateChatState((prev) => ({
                ...prev,
                chatRooms: [...prev.chatRooms, obj.fields],
                // isActive: true,
                id: chatId,
            }));
        }

    }

    const handleTyping = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id} = obj;
        if (msg == 'added') {
            const {userId, name, isTypingTo} = obj.fields;
            addtypingUsers(id,name,isTypingTo)
        } else {
            removetypingUsers(id)
        }
    }

    const handleUsers = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;
        // console.log("UserState: handleUsers",obj);
        if (msg == 'added') {
            if(fields.userId != null) {
                let urecord = {
                    ...fields,
                    connection_status: 'normal',
                    id
                }
                addtoUserlist(urecord)
            }
        }

        if (msg == 'changed') {
            const {presenter, role, raiseHand, pin} = fields;

            if(presenter != null){
                console.log("UserState: handling presenter change",obj);
                modifyPresenterStateUser(id,presenter)
            }

            if(role != null){
                console.log("UserState: handling role change",obj);
                modifyRoleStateUser(id,role)
            }

            if(raiseHand != null){
                console.log("UserState: handling raiseHand change",obj);
                modifyRaiseHandStateUser(id,raiseHand)
            }

            if(pin != null){
                console.log("UserState: handling pin change",obj);
                modifyPinStateUser(id,pin)
            }
        }

        if (msg == 'removed') {
            removeUserlist(id)
        }
    }

    const handleCurrentUsers = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;
        // console.log("CurrentUserState: handleUsers",obj);

        if (msg == 'changed') {
            const {currentConnectionId, connectionIdUpdateTime, authTokenValidatedTime, loggedOut, exitReason, ejected} = fields;

            // if (currentConnectionId && currentConnectionId !== user?.connectionID && connectionIdUpdateTime > user?.connectionAuthTime!) {
            //     console.log("joined_another_window_reason");
            //     setPostLeaveMeeting({
            //         ...postLeaveMeeting,
            //         isKicked: true,
            //     });
            // }

            if(loggedOut != null && loggedOut){
                console.log("User logout ",loggedOut);
                SetCurrentSessionEjected(user?.sessiontoken!);
                setPostLeaveMeeting({
                    ...postLeaveMeeting,
                    isLeave: true,
                });
                shouldStopReconnectingLocal();
            }

            if(ejected != null && ejected){
                console.log("User ejected ",ejected);
                SetCurrentSessionEjected(user?.sessiontoken!);
                setPostLeaveMeeting({
                    ...postLeaveMeeting,
                    isKicked: true,
                });
                shouldStopReconnectingLocal();
            }

            if(exitReason != null){
                if(exitReason =="meetingEnded") {
                    console.log("Meeting Ended ", exitReason);
                    setPostLeaveMeeting({
                        ...postLeaveMeeting,
                        isEndCall: true,
                    });
                    shouldStopReconnectingLocal();
                }

                if(exitReason =="error"){
                    console.log("User kicked",exitReason);
                    setPostLeaveMeeting({
                        ...postLeaveMeeting,
                        isKicked: true,
                    });
                    shouldStopReconnectingLocal();
                }
            }
        }
    }

    const handleRemoteVideo = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id} = obj;

        if(msg == "added"){
            const {stream, name,userId} = obj?.fields;

            if(userId != user?.meetingDetails?.internalUserID){
                console.log("stream video request received on websocket")
                openRemoteCamera(id,userId,stream);
            }
        }

        if(msg == "removed"){
            closeRemoteCamera(id);
        }
    }

    const handleRemoteScreenShare = (eventData:any) => {
        console.log('I got to handle incoming  screenshare messages')
        const obj = JSON.parse(eventData);
        const {msg, id} = obj;

        if(msg == "added"){
            // a["{\"msg\":\"added\",\"collection\":\"screenshare\",\"id\":\"2drKzXSS2H33iQQ9B\",\"fields\":{\"meetingId\":\"bcac9d1d8eab3713ae489224d0130c9468e7a0e3-1728646144507\",\"screenshare\":{\"voiceConf\":\"57493\",\"screenshareConf\":\"57493\",\"stream\":\"1455a736-2a0b-4652-ae46-a15055fbdaf8\",\"vidWidth\":0,\"vidHeight\":0,\"timestamp\":\"1728655842761\",\"hasAudio\":false,\"contentType\":\"screenshare\"}}}"]
            const {stream, name,callerName} = obj?.fields;
            console.log(`screenSharingState: ${JSON.stringify(screenSharingState)}`);
            if(!screenShareState) {
                setViewerScreenShareState(true);
            }
        }

        if(msg == "removed"){
            if(!screenShareState) {
                setViewerScreenShareState(false);
                setScreenSharingStream(null);
            }
        }
    }

    const handleVoiceUsers = (eventData:any) => {
        // console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id} = obj;

        if(msg == "added"){
            // a["{\"msg\":\"added\",\"collection\":\"voiceUsers\",\"id\":\"7J2pQrMaH5C58ZsHj\",\"fields\":{\"intId\":\"w_6pjsehfq5dcf\",\"meetingId\":\"05a8ea5382b9fd885261bb3eed0527d1d3b07262-1695982480527\",\"callerName\":\"Test Sam\",\"callerNum\":\"\",\"callingWith\":\"\",\"color\":\"#7b1fa2\",\"joined\":false,\"listenOnly\":false,\"muted\":false,\"spoke\":false,\"talking\":false,\"voiceConf\":\"\",\"voiceUserId\":\"\"}}"]
            var data={
                id,
                ...obj.fields
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

        if(msg == "removed"){
            removeVoiceUser(id);
        }

    }

    const handleConnectionStatus = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id} = obj;

        if(msg == "changed"){
            // a["{\"msg\":\"changed\",\"collection\":\"connection-status\",\"id\":\"BKJN47DdYthRg4nPp\",\"fields\":{\"status\":\"warning\",\"statusUpdatedAt\":1708676997324}}"]

            const {status} = obj.fields;

            const updatedArray = participantList?.map((item:any) => {
                if (item.id === id) {
                    return {...item, connection_status: status};
                }
                return item;
            });

            // 'updatedArray' now contains the modified object
            console.log(updatedArray);

            setParticipantList(updatedArray)
        }

    }

    const handleStreamAnnotation = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id} = obj;

        if(msg == "changed"){
            //{"msg":"changed","collection":"stream-annotations-90af7edbfd8a161a7f711504a114aaf5bf597f9f-1713439593216","id":"id","fields":{"eventName":"added","args":[{"meetingId":"90af7edbfd8a161a7f711504a114aaf5bf597f9f-1713439593216","annotations":[{"meetingId":"90af7edbfd8a161a7f711504a114aaf5bf597f9f-1713439593216","whiteboardId":"306666003ee5ab331169f9408a5feda7f42b9284-1713439593219/2","userId":"w_orrivn7cqyqe","annotation":{"id":"581d8ffe-24b9-4bc9-0b18-68958ad0ae52","annotationInfo":{"size":[547.44,182.71],"style":{"isFilled":false,"size":"small","scale":1,"color":"black","textAlign":"start","font":"script","dash":"draw"},"label":"","rotation":0,"id":"581d8ffe-24b9-4bc9-0b18-68958ad0ae52","parentId":"2","childIndex":1,"name":"Rectangle","point":[852.03,596.93],"isModerator":true,"labelPoint":[0.5,0.5],"userId":"w_orrivn7cqyqe","type":"rectangle"},"wbId":"306666003ee5ab331169f9408a5feda7f42b9284-1713439593219/2","userId":"w_orrivn7cqyqe"}}]}]}}

            const {eventName, args} = obj.fields;


        }

    }


    const handleExternalVideo = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;

        if(msg == "added") {
            const {externalVideoUrl} = fields;

            if (externalVideoUrl != null) {
                receiveVideoLinkFromWebsocket(externalVideoUrl,eCinemaModal, setECinemaModal,user!)
            }
        }

        if(msg == "changed") {
            const {externalVideoUrl} = fields;

            if (externalVideoUrl != null) {
                receiveVideoLinkFromWebsocket(externalVideoUrl,eCinemaModal, setECinemaModal,user!)
            } else {
                stopVideoLinkFromWebsocket(null,eCinemaModal, setECinemaModal)
            }
        }
    }

    const handleStreamExternalVideos = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;

        if(msg == "changed") {
            // a["{\"msg\":\"changed\",\"collection\":\"stream-external-videos-8f2b2142080438f766fd0f47c999e9158a9c2208-1730879553096\",\"id\":\"id\",\"fields\":{\"eventName\":\"stop\",\"args\":[{\"meetingId\":\"8f2b2142080438f766fd0f47c999e9158a9c2208-1730879553096\",\"userId\":\"w_tnozspbocr3x\",\"rate\":0,\"time\":293,\"state\":0}]}}"]
            const {eventName} = fields;
            const {time, state, rate} = fields.args[0];

            if (eventName == "stop" ) {
                console.log("ecm stop event name")
                receivedStop(time,setECinemaModal);
            }

            if (eventName == "play") {
                console.log("ecm play event name")
                receivedPlay(time,setECinemaModal);
            }

            if (eventName == "presenterReady") {
                console.log("ecm presenterReady event name")
                receivedPresenterReady(time,setECinemaModal);
            }


            if (eventName == "playerUpdate") {
                console.log("ecm playerUpdate event name")
                receivedPlayerUpdate({ time, rate, state },setECinemaModal);
            }
        }
    }

    const handlePolls = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;

        if(msg == "added") {
            const {question,answers,requester,id} = fields;
            setPollModal((prev) => ({
                ...prev,
                isActive: true,
                step: 2,
                pollQuestion: question,
                pollOptions: answers.map((option:any, index:number) => {
                    return {
                        id: option.id,
                        option: option.key,
                        votes: 0,
                    };
                }),
                pollCreatedAt: new Date(),
                pollCreatorId: id,
                pollCreatorName: FindUserNamefromUserId(requester, participantList),
                isUserHost: false,
            }));
        }

        if(msg == "changed") {
            // ["{\"msg\":\"changed\",\"collection\":\"current-poll\",\"id\":\"YdpwudAXrkR2kNcYN\",\"fields\":{\"answers\":[{\"id\":0,\"key\":\"Samji\",\"numVotes\":0},{\"id\":1,\"key\":\"baddest\",\"numVotes\":0},{\"id\":2,\"key\":\"Olawale\",\"numVotes\":1},{\"id\":3,\"key\":\"Jesus\",\"numVotes\":0}],\"numRespondents\":1,\"numResponders\":1,\"questionText\":\"What is your name?\",\"questionType\":\"CUSTOM\"}}"]
            const {answers,responses} = fields;

            if(answers != null){
                let tVote=0;
                let answ=answers.map((option: any, index:number) => {
                    tVote+=option.numVotes as number;
                    return {
                        id: option.id,
                        option: option.key,
                        votes: option.numVotes,
                    };
                });

                console.log(`vote answers : ${tVote} `)
                console.log(`vote answers : ${answ} `)

                setPollModal((prev) => ({
                    ...prev,
                    pollOptions: answ,
                }));

                setPollModal((prev) => ({
                    ...prev,
                    totalVotes: tVote
                }));
            }


            if(responses != null){
                let vUsers:any=[];

                for (let i = 0; i < responses.length; i++) {
                    let vUser= {
                        id: responses[i].userId,
                        fullName: FindUserNamefromUserId(responses[i].userId, participantList),
                        email: null,
                        votedOption: "NA",
                        votedOptionId: responses[i].answerIds,
                    };

                    vUsers.push(vUser);
                }

                setPollModal((prev) => ({
                    ...prev,
                    usersVoted:vUsers,
                }));
            }

        }

        if(msg == "removed") {
            // a["{\"msg\":\"removed\",\"collection\":\"current-poll\",\"id\":\"k87dmCATZ69Ld7WoQ\"}"]

            setPollModal((prev) => ({
                ...prev,
                step: 0,
                isActive: false,
                isEnded: false,
                isEdit: false,
                isUserHost: false,
                pollQuestion: "",
                pollCreatorName: "",
                pollCreatorId: "0",
                pollCreatedAt: new Date(),
                pollOptions: [],
                totalVotes: 0,
                usersVoted: [],
            }));

        }
    }

    const handlePresentations = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;

        if(msg == "added") {
            const {pages,current,downloadable,name,podId,id,conversion} = fields;

            console.log(`pages issues:`,pages);

            if(conversion.done){
                setPresentationSlide((prev)=>({
                    show:false,
                    currentPresentationID:id,
                    presentations: [...prev.presentations,{
                        pages: pages,
                        current: current,
                        downloadable: downloadable,
                        name: name,
                        podId: podId,
                        id: id,
                    }]
                }));
            }else{
                setPresentationSlide((prev)=>({
                    show:true,
                    currentPresentationID:id,
                    presentations: [...prev.presentations,{
                        pages: [],
                        current: false,
                        downloadable: false,
                        name: name,
                        podId: podId,
                        id: id,
                    }]
                }));
            }

        }

        if(msg == "changed") {
            const {pages,current,downloadable,name,podId,id,conversion} = fields;

            console.log(`pages issues:`,pages);

            if(conversion.done && pages!= null){
                setPresentationSlide((prev:any)=>({
                    show:false,
                    currentPresentationID:id,
                    presentations: [prev.presentations?.map((item:IPresentationSlideState) => {
                        if (item.id === id) {
                            return {...item, pages: pages,
                                current: current,
                                downloadable: downloadable};
                        }
                        return item;
                    })]
                }));
            }

        }
    }

    const handleGuestUsers = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;

        if(msg == "added") {
            const {name,intId,role,avatar,guest,authenticated,approved,denied} = fields;
            if(!approved && !denied) {
                if (waitingRoomUsers.filter((item :IWaitingUser) => item?._id == id).length < 1) {
                    setWaitingRoomUsers([...waitingRoomUsers, {
                        name,
                        intId,
                        role,
                        avatar,
                        guest,
                        authenticated,
                        "_id": id
                    }]);

                    toast({
                        title: "Someone wants to join this meeting",
                        description: `${name}`,
                        duration: 5000,
                    });

                    setSoundNotification((prev)=>({
                        ...prev,
                        newWaitingUser:true
                    }))
                }
            }
        }

        if(msg == "changed") {
            const {approved,denied} = fields;
            if(approved || denied) {
                let ur = waitingRoomUsers.filter((item: IWaitingUser) => item?._id != id);
                console.log("waitingRoomUsers: handleRemoval ", ur)
                setWaitingRoomUsers(ur);
            }
        }

        if(msg == "removed") {
            let ur=waitingRoomUsers.filter((item:IWaitingUser) => item?._id != id);
            console.log("waitingRoomUsers: handleRemoval ",ur)
            setWaitingRoomUsers(ur);
        }
    }

    const handleBreakout = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;

        if(msg == "added") {
            // ["{\"msg\":\"added\",\"collection\":\"breakouts\",\"id\":\"dF7ZMsFdC7zvFANbr\",\"fields\":{\"breakoutId\":\"60b5008f1dbdb7f487ab51c637cd80f757f8c9be-1707763221040\",\"captureNotes\":false,\"captureSlides\":false,\"externalId\":\"4d3cc89d80677808207417d4aa82a5868f6c75de-1707763221040\",\"freeJoin\":true,\"isDefaultName\":true,\"joinedUsers\":[],\"name\":\"Odejinmi Room (Room 2)\",\"parentMeetingId\":\"d02560dd9d7db4467627745bd6701e809ffca6e3-1707762025148\",\"sendInviteToModerators\":false,\"sequence\":2,\"shortName\":\"Room 2\",\"timeRemaining\":0}}"]

            const {breakoutId,joinedUsers,shortName,name,sendInviteToModerators,sequence,freeJoin} = fields;

            console.log('breakoutId',breakoutId);
            console.log('breakoutId',fields);

            if(breakoutId != null) {
                if(!participantList.filter((e:IParticipant)=>e.intId == user?.meetingDetails?.internalUserID)[0]?.breakoutProps.isBreakoutUser){
                    if(freeJoin){
                        receiveFreeJoinRoom(fields,id,breakOutRoomState,setBreakOutRoomState);
                    }else{
                        receiveForceJoinRoom(fields,id,breakOutRoomState,setBreakOutRoomState);
                    }
                }
            }
        }


        if(msg == "changed") {
            // ["{\"msg\":\"changed\",\"collection\":\"breakouts\",\"id\":\"dF7ZMsFdC7zvFANbr\",\"fields\":{\"url_w_flxa3jsczb7i\":{\"redirectToHtml5JoinURL\":\"https://meet.konn3ct.ng/bigbluebutton/api/join?fullName=Odejinmi+Samuel&isBreakout=true&joinViaHtml5=true&meetingID=4d3cc89d80677808207417d4aa82a5868f6c75de-1707763221040&password=moderator&redirect=true&userID=w_flxa3jsczb7i-2&checksum=4f0e6f1b3f1ef8db8b3795f7f94eeb1bbef15cee1296f47acede66bd45439572\",\"insertedTime\":1707763310590}}}"]

            // Extracting redirectToHtml5JoinURL dynamically
            const dynamicKey = Object.keys(fields)[0] ?? "0"; // Assuming there's only one dynamic key, adjust accordingly
            const redirectToHtml5JoinURL = fields[dynamicKey]?.redirectToHtml5JoinURL;

            console.log("redirectToHtml5JoinURL",redirectToHtml5JoinURL);

            if(redirectToHtml5JoinURL != null){
                if(micState){
                    websocketMuteMic();
                }
                window.open(redirectToHtml5JoinURL, '_blank');
            }

        }

        if(msg == "removed") {
            receiveStopBreakoutRoom(fields,id,breakOutRoomState,setBreakOutRoomState);
        }

    }


    const handleMeetings =(eventData:any)=>{
        // console.log('Random User Handler')
        const obj = JSON.parse(eventData);

        const {msg, id, fields} = obj;

        if(msg == "added") {
            const {lockSettingsProps, voiceProp, usersProp} = obj.fields;

            if(lockSettingsProps != null){
                setManageUserSettings((prev)=>({
                    ...prev,
                    disableCam: lockSettingsProps.disableCam,
                    disableMic: lockSettingsProps.disableMic,
                    disableNotes: lockSettingsProps.disableNotes,
                    disablePrivateChat: lockSettingsProps.disablePrivateChat,
                    disablePublicChat: lockSettingsProps.disablePublicChat,
                    hideUserList: lockSettingsProps.hideUserList,
                    hideViewersAnnotation: lockSettingsProps.hideViewersAnnotation,
                    hideViewersCursor: lockSettingsProps.hideViewersCursor,
                    lockOnJoin: lockSettingsProps.lockOnJoin,
                    lockOnJoinConfigurable: lockSettingsProps.lockOnJoinConfigurable
                }));
            }

            if (voiceProp != null) {
                setManageUserSettings((prev)=>({
                    ...prev,
                    muteAllUsers: voiceProp.muteOnStart,
                }));
                if (voiceProp.muteOnStart) {
                    setMicState(voiceProp.muteOnStart);
                }
            }

            if (usersProp != null) {
                setWaitingRoomType(usersProp?.guestPolicy == "ASK_MODERATOR" ? 1 :usersProp?.guestPolicy == "ALWAYS_ACCEPT" ? 2 :3);
            }

        }

        if(msg == "changed") {
            const {randomlySelectedUser, meetingEnded, meetingEndedReason, voiceProp, lockSettingsProps, usersProp} = obj.fields

            if (meetingEnded != null && meetingEnded) {
                if(meetingEndedReason == "BREAKOUT_ENDED_BY_MOD"){
                    console.log("Breakout Room ended");
                    return;
                }
                console.log("Meeting has been Ended ",meetingEnded);
                setPostLeaveMeeting({
                    ...postLeaveMeeting,
                    isEndCall: true,
                });
                shouldStopReconnectingLocal();
            }

            if (randomlySelectedUser != null) {
                // handleRandomUsers(eventData)
            }

            if (usersProp != null) {
                setWaitingRoomType(usersProp?.guestPolicy == "ASK_MODERATOR" ? 1 :usersProp?.guestPolicy == "ALWAYS_ACCEPT" ? 2 :3);
            }

            if (voiceProp != null) {
                setManageUserSettings((prev)=>({
                    ...prev,
                    muteAllUsers: voiceProp.muteOnStart,
                }));
                if (!voiceProp.muteOnStart) {
                    setMicState(voiceProp.muteOnStart);
                }

            }

            if(lockSettingsProps != null){
                setManageUserSettings((prev)=>({
                    ...prev,
                    disableCam: lockSettingsProps.disableCam,
                    disableMic: lockSettingsProps.disableMic,
                    disableNotes: lockSettingsProps.disableNotes,
                    disablePrivateChat: lockSettingsProps.disablePrivateChat,
                    disablePublicChat: lockSettingsProps.disablePublicChat,
                    hideUserList: lockSettingsProps.hideUserList,
                    hideViewersAnnotation: lockSettingsProps.hideViewersAnnotation,
                    hideViewersCursor: lockSettingsProps.hideViewersCursor,
                    lockOnJoin: lockSettingsProps.lockOnJoin,
                    lockOnJoinConfigurable: lockSettingsProps.lockOnJoinConfigurable
                }));
            }
        }
    }

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

    const handlePresentationPreUpload = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);

        console.log("settingfunction: webhook received")

        if (obj.msg == "added") {
            const {authzToken, temporaryPresentationId, filename, userId,podId,meetingId} = obj.fields;

            handleUploadTCP(obj.id,authzToken,podId,temporaryPresentationId,meetingId);
        }
    }

    const handleUploadTCP = async (id:string,authToken:string,podId:string,temporaryPresentationId:string,meetingId:string) => {

        console.log("websocket: handling tcpUpload")
        console.log("websocket: handler receive request",id,authToken,podId,temporaryPresentationId,meetingId)
        console.log("websocket: available files",fileUploadModal.filesUploadInProgress)
        let find = fileUploadModal?.filesUploadInProgress.filter(item => item.id == temporaryPresentationId);

        if(find.length < 1){
            console.log("settingfunction: file to upload not found");
            return;
        }

        console.log("settingfunction: file to upload found",find);


        const formData = new FormData();
        if (find) {
            formData.append("fileUpload", find[0].file);
        }
        formData.append("conference", meetingId);
        formData.append("room", meetingId);
        formData.append("temporaryPresentationId", temporaryPresentationId);
        formData.append("pod_id", podId);
        formData.append("is_downloadable", "false");

        try {
            const response = await axios({
                method: "post",
                url: `https://${ServerInfo.engineBaseURL}/bigbluebutton/presentation/${authToken}/upload`,
                data: formData,
                headers: {"Content-Type": "multipart/form-data"},
                onDownloadProgress: (progressEvent) => {
                    console.log("percentCompleted progressEvent: ",progressEvent);
                    var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
                    console.log("percentCompleted upload: ",percentCompleted);
                },
            });

            console.log("settingfunction: upload response",response);
            const responseData = response.data;

            if(response.status == 200){
                handlePresentationUploaded(find[0].file.name, id,authToken);

                setFileUploadModal((prev) => ({
                    ...prev,
                    step: 0,
                }));

                toast({
                    title: "File Upload Completed",
                    description: `${find[0].file.name} uploaded successfully`,
                    duration: 5000,
                });
            }

        } catch (error) {
            console.log(error)
        }




        // POST: https://meet.konn3ct.com/bigbluebutton/presentation/PresUploadToken-gsm839h8DEFAULT_PRESENTATION_POD-w_xhlpo015vbrv/upload
        //     Content-Type:multipart/form-data
        //
        // Payload:
        //     fileUpload: (binary)
        // conference: 490ad150b2b18ea8eab01401ceea403bcd523765-1692191722847
        // room: 490ad150b2b18ea8eab01401ceea403bcd523765-1692191722847
        // temporaryPresentationId: xya7XwDywsgzb3QFJGpL272
        // pod_id: DEFAULT_PRESENTATION_POD
        // is_downloadable: false


    }

    const addtoUserlist = (user:any) => {
        if (participantList.filter((item :IParticipant) => item?.userId == user?.userId).length < 1) {
            setParticipantList([...participantList,user]);
            if(notificationSettings.joined) {
                toast({
                    title: "User Joined",
                    description: `${user.name} has joined the Meeting`,
                    duration: 5000,
                });
            }
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

    const removeUserlist = (id:any) => {
        console.log('removing user ',id);

        participantList?.map((item:IParticipant) => {
            if (item.id === id) {
                if(item.userId != user?.meetingDetails?.internalUserID){
                    if(notificationSettings.leave) {
                        toast({
                            title: "User Left",
                            description: `${item.name} has left the Meeting`,
                            duration: 5000,
                        });
                    }
                }
            }
        });

        let ur=participantList.filter((item:any) => item?.id != id);
        setParticipantList(ur);

    }


    const addTalkingUser = (voiceUser:any) => {
        console.log('voice user', voiceUser);
        // { "intId": "w_1r7gdsvbegfj", "meetingId": "90af7edbfd8a161a7f711504a114aaf5bf597f9f-1727768989277", "callerName": "Odejinmi+Samuel", "callerNum": "w_1r7gdsvbegfj_2-bbbID-Odejinmi+Samuel", "callingWith": "none", "color": "#4a148c", "joined": false, "listenOnly": false, "muted": false, "spoke": false, "talking": false, "voiceConf": "55004", "voiceUserId": "303", "endTime": 1727769305417, "startTime": 1727768997499, "floor": true, "lastFloorTime": "1727769305394997" }
        // { id: '7J2pQrMaH5C58ZsHj', intId: 'w_6pjsehfq5dcf', callerName: 'Test Sam', joined: false, talking: false, muted:false }

        if (participantTalkingList.filter((item:IVoiceUser) => item?.intId == voiceUser?.intId).length < 1) {
            setParticipantTalkingList([...participantTalkingList,voiceUser])
        }else{
            var removeExisting=participantTalkingList.filter((item:IVoiceUser) => item?.intId != voiceUser?.intId);
            setParticipantTalkingList([...removeExisting,voiceUser])
        }

        if(voiceUser.intId == user?.meetingDetails?.internalUserID){
            setMicState(voiceUser.muted);
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


    const modifyJoinedUser = (id:string, state:boolean) => {
        // Update the 'joined' property to 'true' for the object with id '7J2pQrMaH5C58ZsHj' for Audio state
        const updatedArray = participantTalkingList?.map((item:IVoiceUser) => {
            if (item.id === id) {
                if(item.intId ==  user?.meetingDetails?.internalUserID){
                    if(mediaPermission.muteMicOnJoin){
                        websocketMuteMic();
                    }
                }
                return {...item, joined: state};
            }
            return item;
        });

// 'updatedArray' now contains the modified object
//         console.log(updatedArray);

        setParticipantTalkingList(updatedArray)

    }

    const modifyMutedUser = (id:any, state:boolean) => {
        // Update the 'muted' property to 'true' for the object with id '7J2pQrMaH5C58ZsHj' for Audio
        const updatedArray = participantTalkingList?.map((item:any) => {
            if (item.id === id) {

                if(item.intId == user?.meetingDetails?.internalUserID){
                    console.log('micState',id)
                    console.log('micState',state)
                    setMicState(state);
                }
                return {...item, muted: state, talking: false};
            }
            return item;
        });

// 'updatedArray' now contains the modified object
        console.log(updatedArray);

        setParticipantTalkingList(updatedArray)
    }

    const removeVoiceUser = (id:number) => {
        console.log('Hi, im here')

        let ishola = participantTalkingList;

        let ur=ishola.filter((item:any) => item?.id != id);
        console.log("setParticipantTalkingList: remove Voice User",id)
        setParticipantTalkingList(ur);
    }


    const modifyPresenterStateUser = (id:any, state:boolean) => {

        const updatedArray = participantList?.map((item:IParticipant) => {
            if (item.id === id) {
                if(state) {
                    if (item.userId == user?.meetingDetails?.internalUserID) {
                        console.log("UserState: You have been made Presenter 📺");
                        toast({
                            title: "You have been made a Presenter",
                            description: `You can now share your screen using the button beside camera icon`,
                            duration: 9000,
                        });
                    }
                }
                return {...item, presenter: state};
            }
            return item;
        });

        console.log(updatedArray);

        console.log("UserState: updatedArray", updatedArray);

        setParticipantList(updatedArray)
    }

    const modifyRoleStateUser = (id:any, role:string) => {

        const updatedArray = participantList?.map((item:IParticipant) => {
            if (item.id === id) {
                if (item.userId == user?.meetingDetails?.internalUserID) {
                    console.log(`UserState: You have been made ${role}`);

                    if(role == ModeratorRole()) {
                        toast({
                            title: "You have been made a Co-Moderator 🫅🏾",
                            description: `You can now start recording, End Recording, remove user, mute users,...`,
                            duration: 9000,
                        });
                    }

                }
                return {...item, role: role};
            }
            return item;
        });

        console.log(updatedArray);

        console.log("UserState: updatedArray", updatedArray);

        setParticipantList(updatedArray)
    }

    const modifyRaiseHandStateUser = (id:any, raiseHand:boolean) => {

        var name="You";
        const updatedArray = participantList?.map((item:IParticipant) => {
            if (item.id === id) {
                if (item.userId == user?.meetingDetails?.internalUserID) {
                    console.log(`UserState: You have raise hand ${raiseHand}`);
                }else{
                    name=item.name;
                }
                return {...item, raiseHand: raiseHand};
            }
            return item;
        });

        if(notificationSettings.handRaised){
            // setIsnewRaiseHand(raiseHand);

            setSoundNotification((prev)=>({
                ...prev,
                newRaiseHand:true
            }))


            if(raiseHand){
                toast({
                    title: "Raised Hand 🙋🏽",
                    description: `${name} raised hand`,
                    duration: 1000,
                });
            }

            if(!raiseHand && name=="You"){
                toast({
                    title: "Raised Hand 🙋🏽",
                    description: `Your hand has been lowered`,
                    duration: 1000,
                });
            }
        }

        setParticipantList(updatedArray)
    }

    const modifyPinStateUser = (id:any, pin:boolean) => {

        const updatedArray = participantList?.map((item:IParticipant) => {
            if (item.id === id) {
                if (pinnedParticipant.length > 0) {
                    setPinnedParticipant(
                        pinnedParticipant.filter(
                            (eachItem: any) => eachItem?.intId != item.intId,
                        ),
                    );
                } else {
                    setPinnedParticipant([item]);
                }
                return {...item};
            }
            return item;
        });

        console.log(updatedArray);

        console.log("UserState: updatedArray", updatedArray);

        setParticipantList(updatedArray)

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

        const {msg, id, fields} = obj;

        if(msg == "changed") {
            const {recording, time,} = fields;
            if (recording == null) {
                // recordingTiming(time)
            } else {
                if (recording) {
                    setRecordingState((prev) => ({
                        ...prev,
                        isActive: true,
                        recordingConsent: true,
                    }));
                } else {
                    setRecordingState((prev) => ({
                        ...prev,
                        isActive: false,
                    }));
                }
            }
        }
    }


    const openRemoteCamera = (id:string,intId:string, streamID:string) => {
        console.log('Hi, im here')

        let newRecord:{ intId: string; streamID: string; stream: null; id: string; deviceID: null }={
            deviceID: null, stream: null,
            intId,streamID,id
        }

        var ishola = participantCameraList
        console.log(ishola)
        if (ishola.filter((item:any) => item?.id == id).length < 1) {
            setParticipantCameraList([...participantCameraList,newRecord])
        }

    };

    const closeRemoteCamera = (id:string) => {
        console.log('Hi, im here')

        let ishola = participantCameraList;

        let ur=ishola.filter((item:any) => item?.id != id);
        console.log("setParticipantCameraList: remove stream ",ur)
        setParticipantCameraList(ur);
    };

    const addMessage=(sender:string, message:string,timestamp:any,id:any,senderID:any)=>{
        // Convert timestamp to Date object
        const date = new Date(timestamp);

        // Extract date components
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Month is zero-based
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // Create a formatted date string
        const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hours}:${minutes}:${seconds}`;


        let chat=  {
            id: id,
            name: sender,
            message: message,
            time: formattedDate,
        }
        setChatList([...chatList,chat])

        if(senderID != user?.meetingDetails?.internalUserID) {
            if (notificationSettings.newMessage) {
                toast({
                    title: `Public Message From ${sender}`,
                    description: `${message}`,
                    duration: 5000,
                });

                setSoundNotification((prev)=>({
                    ...prev,
                    newMessage:true
                }))
            }
        }
    }

    const addPrivateMessage=(sender:string, message:string,timestamp:any,id:any,chatId:any)=>{
        // Convert timestamp to Date object
        const date = new Date(timestamp);

        // Extract date components
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Month is zero-based
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // Create a formatted date string
        const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hours}:${minutes}:${seconds}`;


        let chat=  {
            id: id as string,
            name: sender,
            message: message,
            chatId: chatId as string,
            time: formattedDate as unknown as Date,
        }

        setPrivateChatState((prev)=>({
            ...prev,
            chatMessages: [...prev.chatMessages,chat],
            isActive: true,
            id: chatId,
        }));



        setIsNewMessage(true);
    }

    const addtypingUsers=(id:any,name:string,type:string)=>{
     let ishola = chatTypingList
        let convertedUser={
         id,name,type
        };
        console.log(ishola)
        if (ishola.filter((item:any) => item.id == id).length < 1) {
            setChatTypingList([...chatTypingList,convertedUser])
        }


    }
    const removetypingUsers = (id:any) =>{
        console.log('removing typing users' , id);

        let ishola = chatTypingList;

        let ur=ishola.filter((item:any) => item.id != id);
        console.log("UserState: handleUsers ",ur)
        setChatTypingList(ur);
    }

    return (
        <div>
        </div>
    )

}

export function websocketSendMessage(internalUserID: any, meetingTitle: any, sender: any, message: string) {
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"sendGroupChatMsg\",\"params\":[\"MAIN-PUBLIC-GROUP-CHAT\",{\"correlationId\":\"${internalUserID}-${Date.now()}\",\"sender\":{\"id\":\"${internalUserID}\",\"name\":\"\",\"role\":\"\"},\"chatEmphasizedText\":true,\"message\":\"${message}\"}]}`]);
    websocketStopTyping();
}

export function websocketSendPrivateMessage(internalUserID:any,message:string,chatID:string) {
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"sendGroupChatMsg\",\"params\":[\"${chatID}\",{\"correlationId\":\"${internalUserID}\",\"sender\":{\"id\":\"${internalUserID}\",\"name\":\"\",\"role\":\"\"},\"chatEmphasizedText\":true,\"message\":\"${message}\"}]}`]);
}

export function websocketStartTyping(type:String) {
    console.log('I am websocketStartTyping')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"startUserTyping\",\"params\":[\"${type}\"]}`])
}

export function websocketStopTyping() {
    console.log('I am websocketStopTyping')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"stopUserTyping\",\"params\":[]}`])
}

export function websocketRemoveUser(internalUserID:any,preventRejoin:boolean) {
    console.log('I am websocketRemoveUser')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"removeUser\",\"params\":[\"${internalUserID}\",${preventRejoin}]}`])
}

export function websocketStopCamera(streamID:string) {
    console.log('I am websocketStopCamera')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"userUnshareWebcam\",\"params\":[\"${streamID}\"]}`])
}

export function websocketRecord() {
    console.log('I am Websockets')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"toggleRecording\",\"params\":[]}`])
}

export function websocketParticipantsChangeRole(internalUserID:any,type:number) {
    console.log('I am websocketParticipantsChangeStatus')

    let role='VIEWER';

    if(type==1){
        role='MODERATOR';
    }
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"changeRole\",\"params\":[\"${internalUserID}\",\"${role}\"]}`])
}

export function websocketMuteParticipants(internalUserID:any) {
    console.log('Muted User')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"toggleVoice\",\"params\":[\"${internalUserID}\"]}`])
}

export function websocketMuteAllParticipants(internalUserID:any) {
    console.log('Muted all')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"muteAllUsers\",\"params\":[\"${internalUserID}\"]}`])
}

export function websocketMuteParticipantsePresenter(internalUserID:any) {
    console.log('Muted all except presenter')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"muteAllExceptPresenter\",\"params\":[\"${internalUserID}\"]}`])
}

export function websocketLockViewers(manageUserSettings:IManageUserSettings,internalUserID:any) {
    console.log('LockViewers')
    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"toggleLockSettings","params":[{"disableCam":${manageUserSettings.disableCam},"disableMic":${manageUserSettings.disableMic},"disableNotes":${manageUserSettings.disableNotes},"disablePrivateChat":${manageUserSettings.disablePrivateChat},"disablePublicChat":${manageUserSettings.disablePublicChat},"hideUserList":${manageUserSettings.hideUserList},"hideViewersAnnotation":${manageUserSettings.hideViewersAnnotation},"hideViewersCursor":${manageUserSettings.hideViewersCursor},"lockOnJoin":true,"lockOnJoinConfigurable":false,"setBy":"${internalUserID}"}]}`])
    // websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"toggleWebcamsOnlyForModerator","params":[true]}`])
}

export function websocketSetWaitingRoom(type:number) {
    console.log('SetWaitingRoom')
    // ALWAYS_ACCEPT
    // ASK_MODERATOR
    // ALWAYS_DENY

    let eType='ALWAYS_DENY';

    if(type==1){
        eType='ASK_MODERATOR';
    }else if(type==2){
        eType='ALWAYS_ACCEPT';
    }

    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"changeGuestPolicy\",\"params\":[\"${eType}\"]}`])
}

export function websocketDenyAllWaitingUser(user:any) {
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"allowPendingUsers\",\"params\":[${JSON.stringify(user)},\"DENY\"]}`])
}

export function websocketAllowAllWaitingUser(user:any) {
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"allowPendingUsers\",\"params\":[${JSON.stringify(user)},\"ALLOW\"]}`])
}

export function websocketSendMessage2AllWaitingUser(message:string) {
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"setGuestLobbyMessage\",\"params\":[\"${message}\"]}`])
}

export function websocketSendMessage2PrivateWaitingUser(message:string,internalUserID:string) {
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"setPrivateGuestLobbyMessage\",\"params\":[\"${message}\",\"${internalUserID}\"]}`])
}


export function websocketClear() {
    // websocketSend([`{\"msg\":\"method\",\"id\":\"51\",\"method\":\"setEmojiStatus\",\"params\":[\"${UserInfo.internalUserID}\",\"none\"]}`])
}

export function websocketMuteMic() {
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"toggleVoice\",\"params\":[]}`])
}

export function websocketPresenter(internalUserID:string|undefined){
    websocketSend([`{\"msg\":\"method\",\"id\":\"27\",\"method\":\"assignPresenter\",\"params\":[\"${internalUserID}\"]}`])
}

export function websocketStartPoll(id:any,question:any,answers:any){
    //Moderator have to sub to get answer update
    websocketSend([`{"msg":"sub","id":"${ServerInfo.generateRandomId(17)}","name":"current-poll","params":[false,true]}`]);
    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"startPoll","params":[{"YesNo":"YN","YesNoAbstention":"YNA","TrueFalse":"TF","Letter":"A-","A2":"A-2","A3":"A-3","A4":"A-4","A5":"A-5","Custom":"CUSTOM","Response":"R-"},"CUSTOM","${id}",false,"${question}",false,${answers}]}`]);
}

export function websocketVotePoll(id:any,answerID:any){
    websocketSend([`{"msg":"sub","id":"${ServerInfo.generateRandomId(17)}","name":"polls","params":[false]}`]);
    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"publishVote","params":["${id}",[${answerID}]]}`]);
}

export function websocketStopPoll(){
    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"publishPoll","params":[]}`]);
    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"stopPoll","params":[]}`]);
}

export function websocketRaiseHand(raiseHand:boolean){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"changeRaiseHand\",\"params\":[${raiseHand}]}`]);
}

export function websocketPinUser(internalUserID:string,pin:boolean){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"changePin\",\"params\":["${internalUserID}",${!pin}]}`]);
}

export function websocketStartPrivateChat(participant:IParticipant){
    const pparams = [{'subscriptionId':ServerInfo.generateRandomId(17), ...participant,}];

    const jsonString = JSON.stringify(pparams);
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"createGroupChat\",\"params\":${jsonString}}`]);
}

interface BreakoutRoomOptions {
    rooms: IColumnBreakOutRoom[];
    time: number;
    freeRoom: boolean;
    saveWhiteBoard: boolean;
    saveSharedNote: boolean;
    sendInvite: boolean;
    roomName: string | undefined;
}

export function websocketCreateBreakoutRoom(options: BreakoutRoomOptions): void {
    const { rooms, time, freeRoom, saveWhiteBoard, saveSharedNote, sendInvite, roomName } = options;

    const record=true;

    const roomParams: IBreakoutRoom[]=[
    ...rooms.slice(1).map((item:IColumnBreakOutRoom, number)=>({
        users: [],
        name: `${roomName} (${item.title})`,
        captureNotesFilename: `Room_${number}_Notes`,
        captureSlidesFilename: `Room_${number}_Whiteboard`,
        shortName: item.title,
        isDefaultName: true,
        freeJoin: freeRoom,
        sequence: number+1,
    }))
    ]

    const breakoutRoomParams = [roomParams, time, record, saveWhiteBoard, saveSharedNote, sendInvite];

    const jsonString = JSON.stringify(breakoutRoomParams);
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"createBreakoutRoom\",\"params\":${jsonString}}`]);
}

export function websocketEndBreakoutRoom(){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"endAllBreakouts\",\"params\":[]}`]);
}


export function handleRequestPresentationUploadToken(uniqueID:string,file:File){
    console.log("settingfunction: saving file to upload with ",uniqueID)
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"requestPresentationUploadToken\",\"params\":[\"DEFAULT_PRESENTATION_POD\",\"${file?.name}\",\"${uniqueID}\"]}`])
    websocketSend([`{\"msg\":\"sub\",\"id\":\"${ServerInfo.generateRandomId(17)}\",\"name\":\"presentation-upload-token\",\"params\":[\"DEFAULT_PRESENTATION_POD\",\"${file?.name}\",\"${uniqueID}\"]}`])
}

const handlePresentationUploaded = (name:string,id:string,presentationAuthToken:string)=>{
    websocketSend([`{\"msg\":\"sub\",\"id\":\"${ServerInfo.generateRandomId(17)}\",\"name\":\"presentation-upload-token\",\"params\":[\"DEFAULT_PRESENTATION_POD\",\"${name}\",\"${id}\"]}`])

    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"setUsedToken\",\"params\":[\"${presentationAuthToken}\"]}`])
}

export function websocketRequest2JoinBreakoutRoom(breakoutId: string | null){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"requestJoinURL\",\"params\":[{\"breakoutId\":\"${breakoutId}\"}]}`]);
}

export function websocketLeaveMeeting(){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"userLeftMeeting\",\"params\":[]}`])
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"setExitReason\",\"params\":[\"logout\"]}`])
    websocketSend(["{\"msg\":\"unsub\",\"id\":\"mSxKqr4q4tGPLvXyN\"}"])
    websocketSend(["{\"msg\":\"unsub\",\"id\":\"whbeWHhAFELhDD8Gn\"}"])
}

export function websocketEndMeeting(){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"endMeeting\",\"params\":[]}`])
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"setExitReason\",\"params\":[\"meetingEnded\"]}`])
    websocketSend(["{\"msg\":\"unsub\",\"id\":\"8ADqKJeTX9KdLCY7u\"}"])
    websocketSend(["{\"msg\":\"unsub\",\"id\":\"ZapBdy6HAuBvCRvqy\"}"])
}
export default Websocket
