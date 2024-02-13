import SockJS from 'sockjs-client';
import {useContext, useEffect, useState} from 'react';
import * as UserInfo from './UserInfo';
import * as ServerInfo from './ServerInfo';

import {generateRandomId, generatesSmallId} from "./ServerInfo";

import {
    authUserState, breakOutModalState, chatListState, chatTypingListState,
    connectionStatusState, donationModalState, eCinemaModalState, micOpenState, participantCameraListState,
    participantListState,
    participantTalkingListState, pollModalState, presentationSlideState,
    recordingModalState, screenSharingStreamState, viewerScreenSharingState, waitingRoomUsersState
} from "~/recoil/atom";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {IBreakoutRoom, IColumnBreakOutRoom, IParticipant, IParticipantCamera, IWaitingUser} from "~/types";
import dayjs from "dayjs";

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

    const [num, setNum] = useState(1);

    const getNum=()=>{
        setNum(num+1);
        return num;
    }


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

                console.log('Received message:', e.data);
                const obj = JSON.parse(e.data);
                const {collection} = obj;

                if (obj.msg == "connected") {
                    // a["{\"msg\":\"connected\",\"session\":\"4qajGwWr4bziuofh9\"}"]
                    setConnection({
                        audio_connection: false,
                        websocket_connection:true
                    })
                }

                if (collection == "group-chat-msg") {
                    handleIncomingmsg(e.data)
                }
                if (collection == "users-typing") {
                    handleTyping(e.data)
                }
                if (collection == "users") {
                    handleUsers(e.data)
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

    const handleIncomingmsg = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {sender, senderName, timestamp, message, id} = obj.fields;
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
            addMessage(senderName,dn[0],timestamp,id);
            return;
        }

        addMessage(senderName,message,timestamp,id);
    }

    const handleTyping = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id} = obj;
        if (msg == 'added') {
            const {userId, name} = obj.fields;
            addtypingUsers(id,name)
        } else {
            removetypingUsers(id)
        }
    }

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

        if (msg == 'changed') {
            const {presenter, role, raiseHand} = fields;

            if(presenter != null){
                console.log("UserState: handling presenter change",obj);
                modifyPresenterStateUser(id,presenter)
            }

            if(role != null){
                console.log("UserState: handling role change",obj);
                modifyRoleStateUser(id,role)
            }

            if(raiseHand != null){
                console.log("UserState: handling role change",obj);
                modifyRaiseHandStateUser(id,raiseHand)
            }
        }

        if (msg == 'removed') {
            removeUserlist(id)
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
            const {stream, name,callerName} = obj?.fields;
            setViewerScreenShareState(true);
        }

        if(msg == "removed"){
            setViewerScreenShareState(false);
            setScreenSharingStream(null);
        }
    }

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


    const handleExternalVideo = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;
        const {externalVideoUrl} = fields;

        if(msg == "changed") {
            if (externalVideoUrl != null) {
                receiveVideoLinkFromWebsocket(externalVideoUrl)
            } else {
                stopVideoLinkFromWebsocket(null)
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
                pollCreatorName: findUserNamefromUserId(requester),
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
                        fullName: findUserNamefromUserId(responses[i].userId),
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
    }

    const handlePresentations = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;

        if(msg == "added") {
            const {pages,current,downloadable,name,podId,id} = fields;

            setPresentationSlide({
                pages: pages,
                current: current,
                downloadable: downloadable,
                name: name,
                podId: podId,
                id: id,
            })
        }
    }

    const handleGuestUsers = (eventData:any) => {
        console.log('I got to handle incoming messages')
        const obj = JSON.parse(eventData);
        const {msg, id, fields} = obj;

        if(msg == "added") {
            const {name,intId,role,avatar,guest,authenticated} = fields;
            setWaitingRoomUsers([...waitingRoomUsers,{name,intId,role,avatar,guest,authenticated,"_id":id}]);
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

            const {breakoutId,joinedUsers,shortName,name,sendInviteToModerators,sequence} = fields;

            console.log('breakoutId',breakoutId);
            console.log('breakoutId',fields);

            setBreakOutRoomState((prev) => ({
                ...prev,
                rooms: [
                    ...prev.rooms,
                    {
                        id: sequence,
                        breakoutId: breakoutId,
                        title: shortName,
                        users: joinedUsers,
                    }
                ],
            }));

            setBreakOutRoomState((prev) => ({
                ...prev,
                step: 2,
                activatedAt: new Date(),
                createdAt: new Date(),
                isActive: true,
                endedAt: dayjs()
                    .add(breakOutRoomState.duration, "minute")
                    .toDate(),
            }));
        }


        if(msg == "changed") {
            // ["{\"msg\":\"changed\",\"collection\":\"breakouts\",\"id\":\"dF7ZMsFdC7zvFANbr\",\"fields\":{\"url_w_flxa3jsczb7i\":{\"redirectToHtml5JoinURL\":\"https://meet.konn3ct.ng/bigbluebutton/api/join?fullName=Odejinmi+Samuel&isBreakout=true&joinViaHtml5=true&meetingID=4d3cc89d80677808207417d4aa82a5868f6c75de-1707763221040&password=moderator&redirect=true&userID=w_flxa3jsczb7i-2&checksum=4f0e6f1b3f1ef8db8b3795f7f94eeb1bbef15cee1296f47acede66bd45439572\",\"insertedTime\":1707763310590}}}"]

            // Extracting redirectToHtml5JoinURL dynamically
            const dynamicKey = Object.keys(fields)[0]; // Assuming there's only one dynamic key, adjust accordingly
            const redirectToHtml5JoinURL = fields[dynamicKey]?.redirectToHtml5JoinURL;

            console.log("redirectToHtml5JoinURL",redirectToHtml5JoinURL);

            if(redirectToHtml5JoinURL != null){
                window.open(redirectToHtml5JoinURL, '_blank');
            }

        }

    }


    const handleMeetings =(eventData:any)=>{
        console.log('Random User Handler')
        const obj = JSON.parse(eventData);
        const {msg, randomlySelectedUser, meetingEnded, voiceProp} = obj.fields

        if(meetingEnded != null && meetingEnded){
            // endCall();
        }

        if(randomlySelectedUser != null){
            // handleRandomUsers(eventData)
        }

        if(voiceProp != null){
            if(!voiceProp.muteOnStart){
                setMicState(voiceProp.muteOnStart);
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

                // if(item.intId == user?.meetingDetails?.internalUserID){
                //     setMicState(!micState);
                // }
                return {...item, muted: state};
            }
            return item;
        });

// 'updatedArray' now contains the modified object
        console.log(updatedArray);

        setParticipantTalkingList(updatedArray)
    }


    const modifyPresenterStateUser = (id:any, state:boolean) => {

        const updatedArray = participantList?.map((item:IParticipant) => {
            if (item.id === id) {
                if (item.userId == user?.meetingDetails?.internalUserID) {
                    console.log("UserState: You have been made Presenter");
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

        const updatedArray = participantList?.map((item:IParticipant) => {
            if (item.id === id) {
                if (item.userId == user?.meetingDetails?.internalUserID) {
                    console.log(`UserState: You have raise hand ${raiseHand}`);
                }
                return {...item, raiseHand: raiseHand};
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


    const openRemoteCamera = (id:string,intId:string, streamID:string) => {
        console.log('Hi, im here')

        let newRecord:IParticipantCamera={
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


    // const toggleRemoteScreenshare= async () => {
    //     console.log("remoteScreenshareStreamState: ",screenshare.remoteScreenshareStreamState);
    //     if(screenshare.localScreenshareStreamState){
    //         screenshareDispatch(closeRemotePanel());
    //     }else{
    //         screenshareDispatch(openRemotePanel());
    //     }
    // };

    const addMessage=(sender:string, message:string,timestamp:any,id:any)=>{
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
    }

    const addtypingUsers=(id:any,name:string)=>{
     let ishola = chatTypingList
        let convertedUser={
         id,name
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

    const receiveVideoLinkFromWebsocket =(link:any)=>{
        console.log('receive Link', link)
        setECinemaModal({
            ...eCinemaModal,
            source: link,
            isActive:true
        });
    }


    const stopVideoLinkFromWebsocket =(link:any)=>{
        console.log('receive Link', link)
        setECinemaModal({
            ...eCinemaModal,
            source: link,
            isActive:false
        });
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

export function websocketSendMessage(internalUserID:any,meetingTitle:any,sender:any,message:string) {
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"sendGroupChatMsg\",\"params\":[\"MAIN-PUBLIC-GROUP-CHAT\",{\"correlationId\":\"${internalUserID}-${Date.now()}\",\"sender\":{\"id\":\"${internalUserID}\",\"name\":\"\",\"role\":\"\"},\"chatEmphasizedText\":true,\"message\":\"${message}\"}]}`]);
    websocketStopTyping();
}

export function websocketStartTyping() {
    console.log('I am websocketStartTyping')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"startUserTyping\",\"params\":[\"public\"]`])
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

export function websocketMuteAllParticipants(internalUserID:any) {
    console.log('Muted all')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"muteAllUsers\",\"params\":[\"${internalUserID}\"]}`])
}

export function websocketMuteParticipants(internalUserID:any) {
    console.log('Muted all')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"muteAllUsers\",\"params\":[\"${internalUserID}\"]}`])
}

export function websocketMuteParticipantsePresenter(internalUserID:any) {
    console.log('Muted all except preseter')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"muteAllExceptPresenter\",\"params\":[\"${internalUserID}\"]}`])
}

export function websocketLockViewers(internalUserID:any) {
    console.log('LockViewers')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"toggleLockSettings\",\"params\":[{\"disableCam\":true,\"disableMic\":true,\"disableNotes\":true,\"disablePrivateChat\":true,\"disablePublicChat\":true,\"hideUserList\":true,\"hideViewersAnnotation\":true,\"hideViewersCursor\":true,\"lockOnJoin\":true,\"lockOnJoinConfigurable\":false,\"setBy\":\"temp\"}]}`])
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"toggleWebcamsOnlyForModerator\",\"params\":[true]}`])
}

export function websocketUnLockViewers(internalUserID:any) {
    console.log('unLockViewers')
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"toggleLockSettings\",\"params\":[{\"disableCam\":false,\"disableMic\":false,\"disablePrivateChat\":false,\"disablePublicChat\":false,\"disableNotes\":false,\"hideUserList\":false,\"lockOnJoin\":true,\"lockOnJoinConfigurable\":false,\"hideViewersCursor\":false,\"hideViewersAnnotation\":false,\"setBy\":\"w_gmo5zeyaswun\"}]}`])
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"toggleWebcamsOnlyForModerator\",\"params\":[false]}`])
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

export function websocketSendExternalVideo(link:string){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"startWatchingExternalVideo\",\"params\":[\"${link}"]}`]);
}

export function websocketStartPoll(id:any,question:any,answers:any){
    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"startPoll","params":[{"YesNo":"YN","YesNoAbstention":"YNA","TrueFalse":"TF","Letter":"A-","A2":"A-2","A3":"A-3","A4":"A-4","A5":"A-5","Custom":"CUSTOM","Response":"R-"},"CUSTOM","${id}",false,"${question}",false,${answers}]}`]);
}

export function websocketVotePoll(id:any,answerID:any){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"publishVote\",\"params\":[\"${id}\",[${answerID}]]}`]);
}

export function websocketStopPoll(){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"stopPoll\",\"params\":[]}`]);
}

export function websocketStopExternalVideo(){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"stopWatchingExternalVideo\",\"params\":[]}`]);
}

export function websocketRaiseHand(internalUserID:any){
    websocketSend([`{\"msg\":\"method\",\"id\":\"${ServerInfo.generateSmallId()}\",\"method\":\"setEmojiStatus\",\"params\":[\"${internalUserID}\",\"raiseHand\"]}`]);
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
