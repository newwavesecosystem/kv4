import { websocketService } from './WebsocketService';
import { generatesSmallId, generateRandomId } from "./ServerInfo";
import { IAuthUser, IBreakoutRoom, IManageUserSettings, IParticipant, BreakoutRoomOptions, IColumnBreakOutRoom } from "~/types";

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
    if (!manageUserSettings.meetingId) return;
    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'lockUsers',
        params: [{
            meetingId: manageUserSettings.meetingId,
            userId: internalUserID,
            settings: [
                { locked: manageUserSettings.shareWebcam, name: 'shareWebcam', setBy: null },
                { locked: manageUserSettings.shareMicrophone, name: 'shareMicrophone', setBy: null },
                { locked: manageUserSettings.sendPublicChatMessage, name: 'sendPublicChatMessage', setBy: null },
                { locked: manageUserSettings.sendPrivateChatMessage, name: 'sendPrivateChatMessage', setBy: null },
                { locked: manageUserSettings.editSharedNotes, name: 'editSharedNotes', setBy: null },
                { locked: manageUserSettings.seeOtherViewers, name: 'seeOtherViewers', setBy: null }
            ]
        }]
    };
    send(msg);
}

export const websocketSetWaitingRoom = (policy: 'ALWAYS_ACCEPT' | 'ALWAYS_DENY' | 'ASK_MODERATOR') => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'updateGuestPolicy', params: [policy] };
    send(msg);
}

export const websocketDenyAllWaitingUser = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'denyAllGuests', params: [] };
    send(msg);
}

export const websocketAllowAllWaitingUser = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'allowAllGuests', params: [] };
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

export const websocketToggleVoice = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'toggleSelfVoice', params: [] };
    send(msg);
}

export const websocketPresenter = (internalUserID: string | undefined) => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'assignPresenter', params: [internalUserID] };
    send(msg);
}

export const websocketStartPoll = (question: string, answers: string[]) => {
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

export const websocketStartPrivateChat = (participant: IParticipant) => {
    const msg = { msg: 'sub', id: generateRandomId(17), name: 'group-chat-msg', params: [participant.chatId] };
    send(msg);
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

export const websocketEndBreakoutRoom = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'endAllBreakoutRooms', params: [] };
    send(msg);
}

export const handleRequestPresentationUploadToken = (uniqueID: string) => {
    const msg = { msg: 'sub', id: uniqueID, name: 'presentation-upload-token', params: [uniqueID] };
    send(msg);
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

export const websocketLeaveMeeting = (user: IAuthUser) => {
    if (!user.meetingDetails) return;
    const msg = { msg: 'method', id: generatesSmallId(), method: 'userLeaveMeeting', params: [user.meetingDetails.internalUserID] };
    send(msg);
}

export const websocketEndMeeting = () => {
    const msg = { msg: 'method', id: generatesSmallId(), method: 'endMeeting', params: [] };
    send(msg);
}
