import { IWebSocketState, IWebSocketStateSetters } from '~/server/types';
import { websocketService } from './WebsocketService';
import { addOrUpdateUser, removeUser, updateUser } from '~/lib/userUtils';
import { FindUserNamefromUserId, ModeratorRole } from '~/lib/checkFunctions';
import { startWatching, stopWatching, receivedPlay, receivedPlayerUpdate, receivedPresenterReady, receivedStop, receiveVideoLinkFromWebsocket, stopVideoLinkFromWebsocket } from '~/components/eCinema/EcinemaService';
import { receiveStopBreakoutRoom, receiveFreeJoinRoom, receiveForceJoinRoom } from '~/components/breakout/BreakoutRoomService';
import { SetCurrentSessionEjected } from '~/lib/localStorageFunctions';
import {
    IAuthUser,
    IChatMessage,
    IConnectionStatus,
    IManageUserSettings,
    IParticipant,
    IPollModal,
    IPostLeaveMeeting,
    IRecordingModal, ISoundNotificationState,
    IVoiceUser
} from "~/types/index";
import { ValidationStates } from "~/lib/utils";
import {handlePresentationUploaded, websocketMuteMic} from '~/server/WebsocketActions';
import axios from 'axios';
import * as ServerInfo from './ServerInfo';

type Handler = (data: any, state: IWebSocketState, stateSetters: IWebSocketStateSetters) => void;

// --- INDIVIDUAL HANDLERS ---

const handleResult: Handler = (obj, state, stateSetters) => {
    if (obj.result != null) {
        const { connectionId, validationStatus, reason } = obj.result;

        if (connectionId != null) {
            switch (validationStatus) {
                case ValidationStates.INVALID:
                    console.log(reason);
                    stateSetters.shouldStopReconnectingLocal();
                    stateSetters.setPostLeaveMeeting((prev:IPostLeaveMeeting)=>({
                        ...prev,
                        isOthers: true,
                    }));
                    return;
                case ValidationStates.VALIDATED:
                    setTimeout(()=>{
                        stateSetters.setConnection((prev: IConnectionStatus)=>(
                            {
                            ...prev,
                            websocket_connection:true,
                            websocket_connection_reconnect:false
                        }
                        ))
                    }, 500);

                    stateSetters.setUser((prev: IAuthUser | null) => ({
                        ...prev!,
                        connectionID: connectionId,
                        connectionAuthTime: new Date().getTime()
                    }))
                    stateSetters.setReconnectAttempts(0); // Reset attempts on successful connection
                    break;
                default:
            }
        }
    }
};

const handleIncomingmsg: Handler = (data, state, stateSetters) => {
    const { sender, senderName, timestamp, message, id, chatId } = data.fields;

    if(message.toString().includes('Donation created')){
        let dn=message.toString().split('|');

        stateSetters.setDonationState({
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
            donationCreatorName: state.user?.fullName as string
        });
        addMessage(senderName,dn[0],timestamp,id,sender,state, stateSetters);
        return;
    }

    if(chatId == "MAIN-PUBLIC-GROUP-CHAT"){
        if(id == "SYSTEM_MESSAGE-PUBLIC_CHAT_POLL_RESULT"){
            const {pollResultData} = data.fields.extra;

            stateSetters.setPollModal((prev: any) => ({
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

        addMessage(senderName,message,timestamp,id,sender,state, stateSetters);
        return;
    }

    addPrivateMessage(senderName,message,timestamp,id, chatId,state, stateSetters);
};

const handleGroupChat: Handler = (data, state, stateSetters) => {
    const {msg, id, fields} = data;

    if(msg == "added") {
        const {chatId} = fields;

        if (chatId == "MAIN-PUBLIC-GROUP-CHAT") {
            return;
        }

        stateSetters.setPrivateChatState((prev: any) => ({
            ...prev,
            chatRooms: [...prev.chatRooms, fields],
            id: chatId,
        }));
    }
};

const handleTyping: Handler = (data, state, stateSetters) => {
    const {msg, id, fields} = data;
    if (msg == 'added') {
        const {name, isTypingTo} = fields;
        addtypingUsers(id,name,isTypingTo,state, stateSetters)
    } else {
        removetypingUsers(id,state, stateSetters)
    }
};

const handleUsers: Handler = (data, state, stateSetters) => {
    const {msg, id, fields} = data;
    if (msg == 'added') {
        if(fields.userId != null) {
            let urecord = {
                ...fields,
                connection_status: 'normal',
                id
            }
            addtoUserlist(urecord,state, stateSetters)
        }
    }

    if (msg == 'changed') {
        const {presenter, role, raiseHand, pin} = fields;

        if(presenter != null){
            modifyPresenterStateUser(id,presenter,state, stateSetters)
        }

        if(role != null){
            modifyRoleStateUser(id,role,state, stateSetters)
        }

        if(raiseHand != null){
            modifyRaiseHandStateUser(id,raiseHand,state, stateSetters)
        }

        if(pin != null){
            modifyPinStateUser(id,pin,state, stateSetters)
        }
    }

    if (msg == 'removed') {
        removeUserlist(id,state, stateSetters)
    }
};

const handleCurrentUser: Handler = (data, state, stateSetters) => {
    const {msg, fields} = data;

    if (msg == 'changed') {
        const {loggedOut, exitReason, ejected} = fields;

        if(loggedOut != null && loggedOut){
            SetCurrentSessionEjected(state.user?.sessiontoken!);
            stateSetters.setPostLeaveMeeting({
                ...state.postLeaveMeeting,
                isLeave: true,
            });
            stateSetters.shouldStopReconnectingLocal();
        }

        if(ejected != null && ejected){
            SetCurrentSessionEjected(state.user?.sessiontoken!);
            stateSetters.setPostLeaveMeeting({
                ...state.postLeaveMeeting,
                isKicked: true,
            });
            stateSetters.shouldStopReconnectingLocal();
        }

        if(exitReason != null){
            if(exitReason =="meetingEnded") {
                stateSetters.setPostLeaveMeeting({
                    ...state.postLeaveMeeting,
                    isEndCall: true,
                });
                stateSetters.shouldStopReconnectingLocal();
            }

            if(exitReason =="error"){
                stateSetters.setPostLeaveMeeting({
                    ...state.postLeaveMeeting,
                    isKicked: true,
                });
                stateSetters.shouldStopReconnectingLocal();
            }
        }
    }
};

const handleRecording: Handler = (data, state, stateSetters) => {
    if (data.msg === 'changed') {
        const {recording, time,} = data.fields;
        if (recording == null) {
            // recordingTiming(time)
        } else {
            if (recording) {
                stateSetters.setRecordingState((prev: IRecordingModal) => ({
                    ...prev,
                    isActive: true,
                    recordingConsent: true,
                }));
            }else{
                stateSetters.setRecordingState((prev: IRecordingModal) => ({
                    ...prev,
                    isActive: false,
                }));
            }
        }
    }
};

const handleMeetings: Handler = (data, state, stateSetters) => {
    const {msg, fields} = data;

    if(msg == "added") {
        const {lockSettingsProps, voiceProp, usersProp} = fields;

        if(lockSettingsProps != null){
            stateSetters.setManageUserSettings((prev: any)=>({...prev, ...lockSettingsProps}));
        }

        if (voiceProp != null) {
            stateSetters.setManageUserSettings((prev: any)=>({...prev, muteAllUsers: voiceProp.muteOnStart}));
            if (voiceProp.muteOnStart) {
                stateSetters.setMicState(voiceProp.muteOnStart);
            }
        }

        if (usersProp != null) {
            stateSetters.setWaitingRoomType(usersProp?.guestPolicy == "ASK_MODERATOR" ? 1 :usersProp?.guestPolicy == "ALWAYS_ACCEPT" ? 2 :3);
        }
    }

    if(msg == "changed") {
        const {meetingEnded, meetingEndedReason, voiceProp, lockSettingsProps, usersProp} = fields

        if (meetingEnded != null && meetingEnded) {
            if(meetingEndedReason == "BREAKOUT_ENDED_BY_MOD"){
                return;
            }
            stateSetters.setPostLeaveMeeting({...state.postLeaveMeeting, isEndCall: true});
            stateSetters.shouldStopReconnectingLocal();
        }

        if (usersProp != null) {
            stateSetters.setWaitingRoomType(usersProp?.guestPolicy == "ASK_MODERATOR" ? 1 :usersProp?.guestPolicy == "ALWAYS_ACCEPT" ? 2 :3);
        }

        if (voiceProp != null) {
            stateSetters.setManageUserSettings((prev: any)=>({...prev, muteAllUsers: voiceProp.muteOnStart}));
            if (!voiceProp.muteOnStart) {
                stateSetters.setMicState(voiceProp.muteOnStart);
            }
        }

        if(lockSettingsProps != null){
            stateSetters.setManageUserSettings((prev: any)=>({...prev, ...lockSettingsProps}));
        }
    }
};

const handleExternalVideo: Handler = (data, state, stateSetters) => {
    const {msg, fields} = data;

    if(msg == "added" || msg == "changed") {
        const {externalVideoUrl} = fields;
        if (externalVideoUrl != null) {
            // receiveVideoLinkFromWebsocket(externalVideoUrl,state.eCinemaModal, stateSetters.setECinemaModal,state.user!)
        } else {
            // stopVideoLinkFromWebsocket(null,state.eCinemaModal, stateSetters.setECinemaModal)
        }
    }
};

const handleStreamExternalVideos: Handler = (data, state, stateSetters) => {
    const {msg, fields} = data;

    if(msg == "changed") {
        const {eventName} = fields;
        const {time, state: videoState, rate} = fields.args[0];

        if (eventName == "stop" ) {
            receivedStop(time,stateSetters.setECinemaModal);
        }
        if (eventName == "play") {
            receivedPlay(time,stateSetters.setECinemaModal);
        }
        if (eventName == "presenterReady") {
            receivedPresenterReady(time,stateSetters.setECinemaModal);
        }
        if (eventName == "playerUpdate") {
            receivedPlayerUpdate({ time, rate, state: videoState },stateSetters.setECinemaModal);
        }
    }
};

const handleRemoteVideo: Handler = (data, state, stateSetters) => {
    const {msg, id} = data;

    if(msg == "added"){
        const {stream, userId} = data?.fields;

        if(userId != state.user?.meetingDetails?.internalUserID){
            openRemoteCamera(id,userId,stream,state, stateSetters);
        }
    }

    if(msg == "removed"){
        closeRemoteCamera(id,state, stateSetters);
    }
};

const handleVoiceUsers: Handler = (data, state, stateSetters) => {
    const {msg, id, fields} = data;

    if(msg == "added"){
        var voiceUserData={ id, ...fields }
        addTalkingUser(voiceUserData,state, stateSetters);
    }

    if(msg == "changed"){
        const {talking,joined,muted} = fields;

        if(joined != null ){
            modifyJoinedUser(id,joined,state, stateSetters);
        }
        if(talking != null ){
            modifyTalkingUser(id,talking,state, stateSetters);
        }
        if(muted != null ){
            modifyMutedUser(id,muted,state, stateSetters);
        }
    }

    if(msg == "removed"){
        removeVoiceUser(id,state, stateSetters);
    }
};

const handleRemoteScreenShare: Handler = (data, state, stateSetters) => {
    const {msg} = data;

    if(msg == "added"){
        if(!state.screenShareState) {
            stateSetters.setViewerScreenShareState(true);
        }
    }

    if(msg == "removed"){
        if(!state.screenShareState) {
            stateSetters.setViewerScreenShareState(false);
            stateSetters.setScreenSharingStream(null);
        }
    }
};

const handlePolls: Handler = (data, state, stateSetters) => {
    const {msg, fields} = data;

    if(msg == "added") {
        const {question,answers,requester,id} = fields;
        stateSetters.setPollModal((prev: any) => ({
            ...prev,
            isActive: true,
            step: 2,
            pollQuestion: question,
            pollOptions: answers.map((option:any) => ({ id: option.id, option: option.key, votes: 0 })),
            pollCreatedAt: new Date(),
            pollCreatorId: id,
            pollCreatorName: FindUserNamefromUserId(requester, state.participantList),
            isUserHost: false,
        }));
    }

    if(msg == "changed") {
        const {answers,responses} = fields;

        if(answers != null){
            let tVote=0;
            let answ=answers.map((option: any) => {
                tVote+=option.numVotes as number;
                return { id: option.id, option: option.key, votes: option.numVotes };
            });

            stateSetters.setPollModal((prev: any) => ({ ...prev, pollOptions: answ, totalVotes: tVote }));
        }

        if(responses != null){
            let vUsers:any=[];
            for (let i = 0; i < responses.length; i++) {
                vUsers.push({
                    id: responses[i].userId,
                    fullName: FindUserNamefromUserId(responses[i].userId, state.participantList),
                    email: null,
                    votedOption: "NA",
                    votedOptionId: responses[i].answerIds,
                });
            }
            stateSetters.setPollModal((prev: any) => ({ ...prev, usersVoted:vUsers }));
        }
    }

    if(msg == "removed") {
        stateSetters.setPollModal((prev: any) => ({
            ...prev,
            step: 0, isActive: false, isEnded: false, isEdit: false, isUserHost: false,
            pollQuestion: "", pollCreatorName: "", pollCreatorId: "0", pollCreatedAt: new Date(),
            pollOptions: [], totalVotes: 0, usersVoted: [],
        }));
    }
};

const handlePresentations: Handler = (data, state, stateSetters) => {
    const {msg, id, fields} = data;

    if(msg == "added") {
        const {pages,current,downloadable,name,podId,conversion} = fields;
        const newPresentation = {
            pages: conversion.done ? pages : [],
            current: conversion.done ? current : false,
            downloadable: conversion.done ? downloadable : false,
            name, podId, id
        };
        stateSetters.setPresentationSlide((prev: any)=>({...prev, presentations: [...prev.presentations, newPresentation]}));
    }

    if(msg == "changed") {
        const {pages,current,downloadable,conversion} = fields;

        if(conversion.done && pages!= null){
            stateSetters.setPresentationSlide((prev:any)=>({...prev, presentations: prev.presentations?.map((item:any) => 
                item.id === id ? {...item, pages, current, downloadable} : item
            )}));
        }
    }
};

const handleGuestUsers: Handler = (data, state, stateSetters) => {
    const {msg, id, fields} = data;

    if(msg == "added") {
        const {approved, denied} = fields;
        if(!approved && !denied) {
            if (state.waitingRoomUsers.filter((item :any) => item?._id == id).length < 1) {
                stateSetters.setWaitingRoomUsers([...state.waitingRoomUsers, { ...fields, "_id": id }]);
                stateSetters.toast({ title: "Someone wants to join this meeting", description: `${fields.name}`, duration: 5000 });
                stateSetters.setSoundNotification((prev: any)=>({...prev, newWaitingUser:true}))
            }
        }
    }

    if(msg == "changed") {
        const {approved,denied} = fields;
        if(approved || denied) {
            let ur = state.waitingRoomUsers.filter((item: any) => item?._id != id);
            stateSetters.setWaitingRoomUsers(ur);
        }
    }

    if(msg == "removed") {
        let ur=state.waitingRoomUsers.filter((item:any) => item?._id != id);
        stateSetters.setWaitingRoomUsers(ur);
    }
};

const handleBreakout: Handler = (data, state, stateSetters) => {
    const {msg, id, fields} = data;

    if(msg == "added") {
        const {breakoutId, freeJoin} = fields;
        if(breakoutId != null) {
            if(!state.participantList.find((e:IParticipant)=>e.intId == state.user?.meetingDetails?.internalUserID)?.breakoutProps.isBreakoutUser){
                if(freeJoin){
                    receiveFreeJoinRoom(fields,id,state.breakOutRoomState,stateSetters.setBreakOutRoomState);
                }else{
                    receiveForceJoinRoom(fields,id,state.breakOutRoomState,stateSetters.setBreakOutRoomState);
                }
            }
        }
    }

    if(msg == "changed") {
        const dynamicKey = Object.keys(fields)[0] ?? "0";
        const redirectToHtml5JoinURL = fields[dynamicKey]?.redirectToHtml5JoinURL;

        if(redirectToHtml5JoinURL != null){
            if(state.micState){
                // websocketMuteMic(); // This function is in WebsocketActions, cannot be called directly here.
            }
            window.open(redirectToHtml5JoinURL, '_blank');
        }
    }

    if(msg == "removed") {
        receiveStopBreakoutRoom(fields,id,state.breakOutRoomState,stateSetters.setBreakOutRoomState);
    }
};

const handlePresentationPreUpload: Handler = (data, state, stateSetters) => {
    if (data.msg == "added") {
        const {authzToken, temporaryPresentationId, filename, userId,podId,meetingId} = data.fields;
        handleUploadTCP(data.id,authzToken,podId,temporaryPresentationId,meetingId, state, stateSetters);
    }
};

const handleUploadTCP = async (id:string,authToken:string,podId:string,temporaryPresentationId:string,meetingId:string, state: IWebSocketState, stateSetters: IWebSocketStateSetters) => {
    let find = state.fileUploadModal?.filesUploadInProgress.filter(item => item.id == temporaryPresentationId);

    if(!find || find.length < 1){
        return;
    }

    const formData = new FormData();
    formData.append("fileUpload", find[0].file);
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
        });

        if(response.status == 200){
            handlePresentationUploaded(find[0].file.name, id, authToken);
            stateSetters.setFileUploadModal((prev: any) => ({ ...prev, step: 0 }));
            stateSetters.toast({ title: "File Upload Completed", description: `${find[0].file.name} uploaded successfully`, duration: 5000 });
        }
    } catch (error) {
        console.log(error)
    }
}

const handleConnectionStatus: Handler = (data, state, stateSetters) => {
    const {msg, id, fields} = data;

    if(msg == "changed"){
        const {status} = fields;
        const updatedArray = state.participantList.map((item:any) => {
            if (item.id === id) {
                return {...item, connection_status: status};
            }
            return item;
        });
        stateSetters.setParticipantList(updatedArray)
    }
};

// --- MAIN DISPATCHER ---

export const handleWebSocketMessage = (rawMessage: string, state: IWebSocketState, stateSetters: IWebSocketStateSetters) => {
    let obj;
    try {
        obj = JSON.parse(rawMessage);
    } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        return;
    }

    const { collection, msg } = obj;

    if (msg === 'connected') {
        stateSetters.startSub();
        return;
    }
    if (msg === 'ping') {
        if (!state.postLeaveMeeting.isLeave && !state.postLeaveMeeting.isLeaveRoomCall && !state.postLeaveMeeting.isEndCall && !state.postLeaveMeeting.isOthers && !state.postLeaveMeeting.isSessionExpired && !state.postLeaveMeeting.isKicked) {
            websocketService.send(JSON.stringify({ msg: 'pong' }));
        }
        return;
    }
    if (msg === 'result') {
        handleResult(obj, state, stateSetters);
        return;
    }

    if (!collection) return;

    const handlers: { [key: string]: Handler } = {
        'group-chat-msg': handleIncomingmsg,
        'group-chat': handleGroupChat,
        'users-typing': handleTyping,
        'users': handleUsers,
        'current-user': handleCurrentUser,
        'record-meetings': handleRecording,
        'meetings': handleMeetings,
        'external-video-meetings': handleExternalVideo,
        'video-streams': handleRemoteVideo,
        'voiceUsers': handleVoiceUsers,
        'screenshare': handleRemoteScreenShare,
        'polls': handlePolls,
        'current-poll': handlePolls, // Both poll collections can use the same handler
        'presentations': handlePresentations,
        'guestUsers': handleGuestUsers,
        'breakouts': handleBreakout,
        'presentation-upload-token': handlePresentationPreUpload,
        'connection-status': handleConnectionStatus,
    };

    const handler = handlers[collection];

    if (handler) {
        handler(obj, state, stateSetters);
    } else if (collection.includes('stream-external-videos')) {
        handleStreamExternalVideos(obj, state, stateSetters);
    } else {
        // console.log(`No handler for collection: ${collection}`)
    }
};


const addMessage=(sender:string, message:string,timestamp:any,id:any,senderID:any,state:IWebSocketState,stateSetters:IWebSocketStateSetters)=>{
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
    stateSetters.setChatList((prev:any)=>([...prev,chat]));

    if(senderID != state.user?.meetingDetails?.internalUserID) {
        if (state.notificationSettings.newMessage) {
            stateSetters.toast({
                title: `Public Message From ${sender}`,
                description: `${message}`,
                duration: 5000,
            });

            stateSetters.setSoundNotification((prev:ISoundNotificationState)=>({
                ...prev,
                newMessage:true
            }))
        }
    }
}

const addPrivateMessage=(sender:string, message:string,timestamp:any,id:any,chatId:any,state:IWebSocketState,stateSetters:IWebSocketStateSetters)=>{
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

    stateSetters.setPrivateChatState((prev:any)=>({
        ...prev,
        chatMessages: [...prev.chatMessages,chat],
        isActive: true,
        id: chatId,
    }));

    stateSetters.setSoundNotification((prev:ISoundNotificationState)=>({
        ...prev,
        newMessage:true
    }))
}

const addtypingUsers=(id:any,name:string,type:string,state:IWebSocketState,stateSetters:IWebSocketStateSetters)=>{
    let ishola = state.chatTypingList
    let convertedUser={
        id,name,type
    };
    console.log(ishola)
    if (ishola.filter((item:any) => item.id == id).length < 1) {
        stateSetters.setChatTypingList((prev:any)=>([...prev,convertedUser]))
    }
}
const removetypingUsers = (id:any,state:IWebSocketState,stateSetters:IWebSocketStateSetters) =>{
    console.log('removing typing users' , id);

    let ishola = state.chatTypingList;

    let ur=ishola.filter((item:any) => item.id != id);
    console.log("UserState: handleUsers ",ur)
    stateSetters.setChatTypingList(ur);
}


const addtoUserlist = (user:any,state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    if (state.participantList.filter((item :IParticipant) => item?.userId == user?.userId).length < 1) {
        stateSetters.setParticipantList([...state.participantList,user]);
        if(state.notificationSettings.joined) {
            stateSetters.toast({
                title: "User Joined",
                description: `${user.name} has joined the Meeting`,
                duration: 5000,
            });
        }
    }
}

const removeUserlist = (id:any,state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    console.log('removing user ',id);

    state.participantList?.map((item:IParticipant) => {
        if (item.id === id) {
            if(item.userId != state.user?.meetingDetails?.internalUserID){
                if(state.notificationSettings.leave) {
                    stateSetters.toast({
                        title: "User Left",
                        description: `${item.name} has left the Meeting`,
                        duration: 5000,
                    });
                }
            }
        }
    });

    let ur=state.participantList.filter((item:any) => item?.id != id);
    stateSetters.setParticipantList(ur);

}


const addTalkingUser = (voiceUser:any,state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    console.log('voice user', voiceUser);
    if (state.participantTalkingList.filter((item:IVoiceUser) => item?.intId == voiceUser?.intId).length < 1) {
        //If it doesnt exist already add new one
        stateSetters.setParticipantTalkingList([...state.participantTalkingList,voiceUser])
    }else{
        //Remove existing one and add new one
        var removeExisting=state.participantTalkingList.filter((item:IVoiceUser) => item.intId != voiceUser.intId);
        stateSetters.setParticipantTalkingList([...removeExisting,voiceUser])
    }

    if(voiceUser.intId == state.user?.meetingDetails?.internalUserID){
        stateSetters.setMicState(voiceUser.muted);
    }
}

const modifyTalkingUser = (id:any, talkState:boolean,state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    const updatedArray = state.participantTalkingList.map((item:IVoiceUser) => {
        if (item.id == id) {
            return {...item, talking: talkState};
        }
        return item;
    });
    stateSetters.setParticipantTalkingList(updatedArray)
}


const modifyJoinedUser = (id:string, joinState:boolean,state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    // Update the 'joined' property to 'true' for the object with id '7J2pQrMaH5C58ZsHj' for Audio state
    const updatedArray = state.participantTalkingList.map((item:IVoiceUser) => {
        if (item.id === id) {
            if(item.intId ==  state.user?.meetingDetails?.internalUserID){
                if(state.mediaPermission.muteMicOnJoin){
                    websocketMuteMic();
                }
            }
            return {...item, joined: joinState};
        }
        return item;
    });

// 'updatedArray' now contains the modified object
    stateSetters.setParticipantTalkingList(updatedArray)
}

const modifyMutedUser = (id:any, micState:boolean,state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    // Update the 'muted' property to 'true' for the object with id '7J2pQrMaH5C58ZsHj' for Audio
    const updatedArray = state.participantTalkingList.map((item:IVoiceUser) => {
        if (item.id === id) {
            if(item.intId == state.user?.meetingDetails?.internalUserID){
                console.log('micState',id)
                console.log('micState',state)
                stateSetters.setMicState(micState);
            }
            return {...item, muted: micState, talking: false};
        }
        return item;
    });

// 'updatedArray' now contains the modified object
    console.log(updatedArray);

    stateSetters.setParticipantTalkingList(updatedArray)
}

const removeVoiceUser = (id:number,state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    console.log('Hi, im here')

    let ishola = state.participantTalkingList;

    let ur=ishola.filter((item:any) => item?.id != id);
    console.log("setParticipantTalkingList: remove Voice User",id)
    stateSetters.setParticipantTalkingList(ur);
}


const modifyPresenterStateUser = (id:any, preState:boolean,state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    const updatedArray = state.participantList.map((item:IParticipant) => {
        if (item.id === id) {
            if(state) {
                if (item.userId == state.user?.meetingDetails?.internalUserID) {
                    console.log("UserState: You have been made Presenter 📺");
                    stateSetters.toast({
                        title: "You have been made a Presenter",
                        description: `You can now share your screen using the button beside camera icon`,
                        duration: 9000,
                    });
                }
            }
            return {...item, presenter: preState};
        }
        return item;
    });

    console.log(updatedArray);

    stateSetters.setParticipantList(updatedArray)
}

const modifyRoleStateUser = (id:any, role:string, state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {

    const updatedArray = state.participantList.map((item:IParticipant) => {
        if (item.id === id) {
            if (item.userId == state.user?.meetingDetails?.internalUserID) {
                console.log(`UserState: You have been made ${role}`);

                if(role == ModeratorRole()) {
                    stateSetters.toast({
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

    stateSetters.setParticipantList(updatedArray)
}

const modifyRaiseHandStateUser = (id:any, raiseHand:boolean, state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    var name="You";
    const updatedArray = state.participantList.map((item:IParticipant) => {
        if (item.id === id) {
            if (item.userId == state.user?.meetingDetails?.internalUserID) {
                console.log(`UserState: You have raise hand ${raiseHand}`);
            }else{
                name=item.name;
            }
            return {...item, raiseHand: raiseHand};
        }
        return item;
    });

    if(state.notificationSettings.handRaised){
        // setIsnewRaiseHand(raiseHand);

        stateSetters.setSoundNotification((prev:ISoundNotificationState)=>({
            ...prev,
            newRaiseHand:true
        }))

        if(raiseHand){
            stateSetters.toast({
                title: "Raised Hand 🙋🏽",
                description: `${name} raised hand`,
                duration: 1000,
            });
        }

        if(!raiseHand && name=="You"){
            stateSetters.toast({
                title: "Raised Hand 🙋🏽",
                description: `Your hand has been lowered`,
                duration: 1000,
            });
        }
    }

    stateSetters.setParticipantList(updatedArray)
}

const modifyPinStateUser = (id:any, pin:boolean, state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {

    const updatedArray = state.participantList.map((item:IParticipant) => {
        if (item.id === id) {
            if (state.pinnedParticipant.length > 0) {
                stateSetters.setPinnedParticipant(
                    state.pinnedParticipant.filter(
                        (eachItem: any) => eachItem?.intId != item.intId,
                    ),
                );
            } else {
                stateSetters.setPinnedParticipant([item]);
            }
            return {...item};
        }
        return item;
    });

    console.log(updatedArray);

    console.log("UserState: updatedArray", updatedArray);

    stateSetters.setParticipantList(updatedArray)

}


const removeTalkingUser = (user:any, state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    var ishola = state.participantTalkingList;
    // console.log(ishola)
    if (ishola.filter((item:any) => item?.userId == user?.userId).length > 0) {
        stateSetters.setParticipantTalkingList(ishola)
    }
}


const openRemoteCamera = (id:string,intId:string, streamID:string, state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    console.log('Hi, im here')

    let newRecord:{ intId: string; streamID: string; stream: null; id: string; deviceID: null }={
        deviceID: null, stream: null,
        intId,streamID,id
    }

    var ishola = state.participantCameraList
    console.log(ishola)
    if (ishola.filter((item:any) => item?.id == id).length < 1) {
        stateSetters.setParticipantCameraList([...state.participantCameraList,newRecord])
    }

};

const closeRemoteCamera = (id:string, state:IWebSocketState,stateSetters:IWebSocketStateSetters) => {
    console.log('Hi, im here')

    let ishola = state.participantCameraList;

    let ur=ishola.filter((item:any) => item?.id != id);
    console.log("setParticipantCameraList: remove stream ",ur)
    stateSetters.setParticipantCameraList(ur);
};


