import { websocketService } from './WebsocketService';
import * as ServerInfo from './ServerInfo';
import {generateRandomId, generateSmallId, generatesSmallId} from "./ServerInfo";
import {IAuthUser, IBreakoutRoom, IColumnBreakOutRoom, IManageUserSettings, IParticipant} from "~/types/index";

/**
 * Helper function to send an array of messages through the WebSocket service.
 * The sockjs-client send method expects a single string, and the server expects
 * a JSON-stringified array of strings.
 * @param messages - An array of stringified JSON messages to send.
 */
export const websocketSend=(messages: string[])=> {
    websocketService.send(JSON.stringify(messages));
}

export function websocketRecord() {
    console.log('I am Websockets')
    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"toggleRecording","params":[]}`])
}

export function websocketClear() {
    // websocketSend([`{"msg":"method","id":"51","method":"setEmojiStatus","params":["${UserInfo.internalUserID}","none"]}`])
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

// A helper to stringify and send data
const send = (data: any) => {
    const jsonData = JSON.stringify(data);
    websocketService.send(jsonData);
};

export const sendStunTurn = (user: IAuthUser) => {
    const stunTurn = {
        msg: 'method',
        method: 'stunTurn',
        params: [],
        id: generatesSmallId()
    }
    send(stunTurn);
}

export const websocketSendMessage = (internalUserID: any, meetingTitle: any, sender: any, message: string) => {
    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'sendGroupChatMsg',
        params: [
            'MAIN-PUBLIC-GROUP-CHAT',
            {
                id: generatesSmallId(),
                chatId: 'MAIN-PUBLIC-GROUP-CHAT',
                message: message,
                sender: { id: internalUserID, name: sender, role: 'VIEWER' },
                timestamp: new Date().getTime(),
                correlationId: `${internalUserID}-${new Date().getTime()}`,
                senderId: internalUserID,
                chatName: meetingTitle
            }
        ]
    };
    send(msg);
};

export const websocketSendPrivateMessage = (internalUserID: any, message: string, chatID: string) => {
    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'sendGroupChatMsg',
        params: [
            chatID,
            {
                id: generatesSmallId(),
                chatId: chatID,
                message: message,
                sender: { id: internalUserID },
                timestamp: new Date().getTime(),
                correlationId: `${internalUserID}-${new Date().getTime()}`
            }
        ]
    };
    send(msg);
}

export const websocketStartPrivateChat = (participant: IParticipant) => {
    const msg = { msg: 'sub', id: generateRandomId(17), name: 'group-chat-msg', params: [participant.chatId] };
    send(msg);
}

export const websocketStartTyping = (internalUserID: string) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'startUserTyping', params: [internalUserID] };
    send(msg);
}

export const websocketStopTyping = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'stopUserTyping', params: [] };
    send(msg);
}

export const websocketRemoveUser = (internalUserID: any, preventRejoin: boolean) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'ejectUserFromMeeting', params: [internalUserID, preventRejoin ? "ALWAYS_EJECT" : "NORMAL_EJECT"] };
    send(msg);
}

export const websocketStopCamera = (streamID: string) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'userBroadcastUnpublish', params: [streamID] };
    send(msg);
}

export const websocketRecording = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'setRecordingStatus', params: [true] };
    send(msg);
}

export const websocketParticipantsChangeRole = (internalUserID: any, type: number) => {
    let role = "VIEWER";
    if (type == 1) {
        role = "MODERATOR"
    }
    const msg = { msg: 'method', id: generatesSmallId(), method: 'assignPresenter', params: [internalUserID, role] };
    send(msg);
}

export const websocketMuteParticipants = (internalUserID: any, userToMuteId: string) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'muteUser', params: [userToMuteId, internalUserID, true] };
    send(msg);
}

export const websocketMuteAllParticipants = (internalUserID: any) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'muteAllUsers', params: [internalUserID] };
    send(msg);
}

export const websocketMuteParticipantsePresenter = (internalUserID: any) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'muteAllExceptPresenter', params: [internalUserID] };
    send(msg);
}

export const websocketLockViewers = (manageUserSettings: IManageUserSettings, internalUserID: any) => {
    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'toggleLockSettings',
        params: [{
            "disableCam":manageUserSettings.disableCam,
            "disableMic":manageUserSettings.disableMic,
            "disableNotes":manageUserSettings.disableNotes,
            "disablePrivateChat":manageUserSettings.disablePrivateChat,
            "disablePublicChat":manageUserSettings.disablePublicChat,
            "hideUserList":manageUserSettings.hideUserList,
            "hideViewersAnnotation":manageUserSettings.hideViewersAnnotation,
            "hideViewersCursor":manageUserSettings.hideViewersCursor,
            "lockOnJoin":true,
            "lockOnJoinConfigurable":false,
            "setBy":internalUserID
        }]

    };
    send(msg);
}

export const websocketSetWaitingRoom = (policy: 'ALWAYS_ACCEPT' | 'ALWAYS_DENY' | 'ASK_MODERATOR') => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'updateGuestPolicy', params: [policy] };
    send(msg);
}

export const websocketDenyAllWaitingUser = (user:any) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'denyAllGuests', params: [user,"DENY"] };
    send(msg);
}

export const websocketAllowAllWaitingUser = (user:any) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'allowAllGuests', params: [user,"ALLOW"] };
    send(msg);
}

export const websocketSendMessage2AllWaitingUser = (message: string) => {
    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'sendGroupChatMsg',
        params: [
            'GUEST-WAITING-ROOM-CHAT',
            {
                id: generatesSmallId(),
                chatId: 'GUEST-WAITING-ROOM-CHAT',
                message: message,
                timestamp: new Date().getTime(),
                correlationId: generatesSmallId()
            }
        ]
    };
    send(msg);
}

export const websocketSendMessage2PrivateWaitingUser = (message: string, internalUserID: string) => {
    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'sendGroupChatMsg',
        params: [
            `GUEST-WAITING-ROOM-CHAT-${internalUserID}`,
            {
                id: generatesSmallId(),
                chatId: `GUEST-WAITING-ROOM-CHAT-${internalUserID}`,
                message: message,
                timestamp: new Date().getTime(),
                correlationId: generatesSmallId()
            }
        ]
    };
    send(msg);
}


export function websocketMuteMic() {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'toggleVoice', params: [] };
    send(msg);
}


export const websocketPresenter = (internalUserID: string | undefined) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'assignPresenter', params: [internalUserID] };
    send(msg);
}

export const websocketStartPoll = (id:any,question: string, answers: string[]) => {
    const pollAnswers = answers.map((answer, i) => ({ id: i, key: answer }));
    const msg = { msg: 'method', id: generatesSmallId(), method: 'startPoll', params: ['R_POLL', question, pollAnswers] };
    send(msg);
}

export const websocketVotePoll = (pollId: string, answerID: number) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'publishVote', params: [pollId, answerID] };
    send(msg);
}

export const websocketStopPoll = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'stopPoll', params: [] };
    send(msg);
}

export const websocketRaiseHand = (internalUserID: string, raiseHand: boolean) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'setEmojiStatus', params: [internalUserID, raiseHand ? 'raiseHand' : 'none'] };
    send(msg);
}

export const websocketPinUser = (internalUserID: string, pin: boolean) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'userSetPin', params: [internalUserID, pin] };
    send(msg);
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
    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"createBreakoutRoom","params":${jsonString}}`]);
}

export const startBreakoutRoom = (user: IAuthUser, breakoutRoomOptions: BreakoutRoomOptions) => {
    if (!user.meetingDetails) return;
    const startBreakout = {
        msg: 'method',
        method: 'startBreakout',
        params: [
            user.meetingDetails.internalUserID,
            breakoutRoomOptions.time,
            breakoutRoomOptions.freeRoom,
            breakoutRoomOptions.rooms
        ],
        id: generatesSmallId()
    }
    send(startBreakout);
}
export const websocketRequest2JoinBreakoutRoom=(breakoutId: string | null)=>{
    const msg = { msg: 'method', id: generatesSmallId(), method: 'requestJoinURL', params: [
            {breakoutId: breakoutId}
        ] };
    send(msg);
}
export const websocketEndBreakoutRoom = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'endAllBreakoutRooms', params: [] };
    send(msg);
}

export const joinBreakoutRoom = (user: IAuthUser, room: IColumnBreakOutRoom) => {
    if (!user.meetingDetails) return;
    const joinBreakout = {
        msg: 'method',
        method: 'requestJoinURL',
        params: [{
            meetingID: user.meetingDetails.meetingID,
            userID: user.meetingDetails.internalUserID,
            userName: user.fullName,
            breakoutRoomId: room.id
        }],
        id: generatesSmallId()
    }
    send(joinBreakout);
}

export const handleRequestPresentationUploadToken = (uniqueID: string,file:File) => {
    const msg = { msg: 'sub', id: generateSmallId(), name: 'requestPresentationUploadToken', params: ["DEFAULT_PRESENTATION_POD",file?.name,uniqueID] };
    send(msg);

    const msg2 = { msg: 'sub', id: generateRandomId(17), name: 'presentation-upload-token', params: ["DEFAULT_PRESENTATION_POD",file?.name,uniqueID] };
    send(msg2);
}

export const handlePresentationUploaded = (name: string, id: string, presentationAuthToken: string) => {
    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'presentationUpload',
        params: [{
            name: name,
            id: id,
            authzToken: presentationAuthToken,
            current: true,
            temporary: true
        }]
    };
    send(msg);
}

export const websocketLeaveMeeting = (user: IAuthUser) => {
    if (!user.meetingDetails) return;
    const msg = { msg: 'method', id: generatesSmallId(), method: 'userLeaveMeeting', params: [user.meetingDetails.internalUserID] };
    send(msg);
}

export const websocketEndMeeting = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'endMeeting', params: [] };
    send(msg);
}
