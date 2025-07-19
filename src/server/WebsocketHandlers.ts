import { IWebSocketState, IWebSocketStateSetters } from '~/server/types';
import { websocketService } from './WebsocketService';
import { addOrUpdateUser, removeUser, updateUser } from '~/lib/userUtils';
import { FindUserNamefromUserId, ModeratorRole } from '~/lib/checkFunctions';
import { startWatching, stopWatching, receivedPlay, receivedPlayerUpdate, receivedPresenterReady, receivedStop, receiveVideoLinkFromWebsocket, stopVideoLinkFromWebsocket } from '~/components/eCinema/EcinemaService';
import { receiveStopBreakoutRoom, receiveFreeJoinRoom, receiveForceJoinRoom } from '~/components/breakout/BreakoutRoomService';
import { SetCurrentSessionEjected } from '~/lib/localStorageFunctions';
import {IManageUserSettings, IRecordingModal} from "~/types/index";


type Handler = (data: any, state: IWebSocketState, stateSetters: IWebSocketStateSetters) => void;

// --- INDIVIDUAL HANDLERS ---

const handleResult: Handler = (obj, state, stateSetters) => {
    if (obj.result != null) {
        const { validationStatus, reason } = obj.result;
        if (validationStatus === 'INVALID') {
            console.error(`WebSocket validation error: ${reason}`);
            stateSetters.shouldStopReconnectingLocal();
            stateSetters.setPostLeaveMeeting((prev: any) => ({ ...prev, isOthers: true }));
        }
    }
};

const handleIncomingmsg: Handler = (data, state, stateSetters) => {
    if (data.fields.args[0].msg === 'You are now a presenter.') {
        return;
    }
        stateSetters.setChatList((prev: IChatMessage[]) => [...prev, data.fields.args[0]]);
    stateSetters.setIsNewMessage(true);
};

const handleGroupChat: Handler = (data, state, stateSetters) => {
    if (data.msg === 'added') {
        stateSetters.setChatTypeList((prev: any[]) => [...prev, data.fields]);
    }
    if (data.msg === 'removed') {
        stateSetters.setChatTypeList((prev: any[]) => prev.filter((p) => p._id !== data.id));
    }
};

const handleTyping: Handler = (obj, state, stateSetters) => {
    const { fields } = obj;
    if (obj.msg === 'added') {
                stateSetters.setChatTypingList((prev: string[]) => [...prev, fields.userId]);
    }
    if (obj.msg === 'removed') {
                stateSetters.setChatTypingList((prev: string[]) => prev.filter((id: string) => id !== fields.userId));
    }
};

const handleUsers: Handler = (data, state, stateSetters) => {
    const { fields, id, msg } = data;

    if (msg === 'added') {
        const newUser = { ...fields, id };
        stateSetters.setParticipantList(prev => addOrUpdateUser(prev, newUser));
    }

    if (msg === 'removed') {
        stateSetters.setParticipantList(prev => removeUser(prev, id));
    }

    if (msg === 'changed') {
        const changedUser = state.participantList.find(p => p.extId === id);
        if (changedUser?.intId === state.user?.meetingDetails?.internalUserID && fields.logoutTime) {
            stateSetters.setPostLeaveMeeting({ isKicked: true });

            stateSetters.shouldStopReconnectingLocal();
        } else {
            const updatedUser = { ...fields, id };
            stateSetters.setParticipantList(prev => updateUser(prev, updatedUser));
        }
    }
};

const handleCurrentUser: Handler = (data, state, stateSetters) => {
    if (data.msg === 'changed') {
                stateSetters.setUser((prev: IAuthUser | null) => ({ ...prev!, ...data.fields }));
    }
};

const handleRecording: Handler = (data, state, stateSetters) => {
    if (data.msg === 'changed') {
                stateSetters.setRecordingState((prev: IRecordingState) => ({ ...prev, ...data.fields }));
    }
};

const handleMeetings: Handler = (data, state, stateSetters) => {
    const { fields } = data;
    if (data.msg === 'changed') {
        const newSettings: IManageUserSettings = { ...state.manageUserSettings, ...fields.usersProp };
        stateSetters.setManageUserSettings(newSettings);
        // if (fields.meetingProp?.isRecorded) {
        //                 stateSetters.setRecordingState((prev: IRecordingModal) => ({ ...prev, isRecorded: true }));
        // }
    }
};

const handleExternalVideo: Handler = (data, state, stateSetters) => {
    if (data.msg === 'added') {
        // receiveVideoLinkFromWebsocket(data.fields.videoUrl, state.eCinemaModal, stateSetters.setECinemaModal, state.user);
    }
    if (data.msg === 'removed') {
        // stopVideoLinkFromWebsocket(state.eCinemaModal, stateSetters.setECinemaModal);
    }
};

const handleECinema: Handler = (data, state, stateSetters) => {
    const { fields } = data;
    if (fields.args.length > 0) {
        // const status = fields.args[0].status;
        // if (status === 'PLAYING') {
        //     receivedPlay(fields.args[0].time, stateSetters.setECinemaModal);
        // } else if (status === 'STOPPED') {
        //     receivedStop(fields.args[0].time, stateSetters.setECinemaModal);
        // } else if (status === 'PLAYER_UPDATE') {
        //     receivedPlayerUpdate(fields.args[0].playerStatus, stateSetters.setECinemaModal);
        // } else if (status === 'PRESENTER_READY') {
        //     receivedPresenterReady(stateSetters.setECinemaModal);
        // }
    }
};

const handleRemoteVideo: Handler = (data, state, stateSetters) => {
    const { id, fields } = data;
    // const newCamera: IParticipantCamera = { ...fields, id: id };
    // if (data.msg === 'added') {
    //             stateSetters.setParticipantCameraList((prev: IParticipantCamera[]) => [...prev, newCamera]);
    // }
    // if (data.msg === 'removed') {
    //             stateSetters.setParticipantCameraList((prev: IParticipantCamera[]) => prev.filter((c: IParticipantCamera) => c.id !== id));
    // }
};

const handleVoiceUsers: Handler = (data, state, stateSetters) => {
    const { id, fields, msg } = data;
    // const newVoiceUser: IVoiceUser = { ...fields, id: id };
    // if (msg === 'added') {
    //             stateSetters.setParticipantTalkingList((prev: IVoiceUser[]) => [...prev, newVoiceUser]);
    // }
    // if (msg === 'changed') {
    //             stateSetters.setParticipantTalkingList((prev: IVoiceUser[]) => prev.map((v: IVoiceUser) => (v.id === id ? { ...v, ...fields } : v)));
    // }
    // if (msg === 'removed') {
    //             stateSetters.setParticipantTalkingList((prev: IVoiceUser[]) => prev.filter((v: IVoiceUser) => v.id !== id));
    // }
};

const handleRemoteScreenShare: Handler = (data, state, stateSetters) => {
    // if (data.msg === 'added') {
    //             stateSetters.setViewerScreenShareState((prev: IScreenShareState) => ({ ...prev, ...data.fields }));
    // }
    // if (data.msg === 'removed') {
    //     stateSetters.setViewerScreenShareState({ isScreenSharing: false, stream: '' });
    // }
};

const handlePolls: Handler = (data, state, stateSetters) => {
    // if (data.msg === 'added' || data.msg === 'changed') {
    //             stateSetters.setPollModal((prev: IPoll | null) => ({ ...(prev || {}), ...data.fields, isPollStarted: true }));
    // }
    // if (data.msg === 'removed') {
    //     stateSetters.setPollModal((prev: IPoll | null) => ({ ...(prev || {}), isPollStarted: false }));
    // }
};

const handlePresentations: Handler = (data, state, stateSetters) => {
    // const newSlide: IPresentationSlideState = { ...data.fields };
    // if (data.msg === 'added' || data.msg === 'changed') {
    //     stateSetters.setPresentationSlide(newSlide);
    // }
    // if (data.msg === 'removed') {
    //     stateSetters.setPresentationSlide({} as IPresentationSlideState);
    // }
};

const handleGuestUsers: Handler = (data, state, stateSetters) => {
    const { id, fields, msg } = data;
    // const newWaitingUser: IWaitingUser = { ...fields, _id: id };
    // if (msg === 'added') {
    //             stateSetters.setWaitingRoomUsers((prev: IWaitingUser[]) => [...prev, newWaitingUser]);
    // }
    // if (msg === 'removed') {
    //             stateSetters.setWaitingRoomUsers((prev: IWaitingUser[]) => prev.filter((u: IWaitingUser) => u._id !== id));
    // }
};

const handleBreakout: Handler = (data, state, stateSetters) => {
    const { fields, msg } = data;
    if (msg === 'added') {
        const newBreakout: IBreakoutRoom = { ...fields };
        stateSetters.setBreakOutRoomState(newBreakout);
    }
    if (msg === 'changed') {
        if (fields.breakoutRooms) {
            receiveFreeJoinRoom(fields.breakoutRooms, stateSetters.setBreakOutRoomState);
        }
        if (fields.users) {
            receiveForceJoinRoom(fields.users, stateSetters.setBreakOutRoomState);
        }
    }
    if (msg === 'removed') {
        receiveStopBreakoutRoom(stateSetters.setBreakOutRoomState);
    }
};

const handlePresentationPreUpload: Handler = (data, state, stateSetters) => {
    if (data.msg === 'added') {
                stateSetters.setFileUploadModal((prev: any) => ({ ...prev, ...data.fields }));
    }
};

const handleConnectionStatus: Handler = (data, state, stateSetters) => {
    // if (data.msg === 'changed' && !data.fields.status.connected) {
    //     const userName = FindUserNamefromUserId(state.user?.meetingDetails?.internalUserID, state.participantList);
    //     if (userName !== 'Moderator' || !ModeratorRole(state.user?.meetingDetails?.role)) {
    //
    //         stateSetters.shouldStopReconnectingLocal();
    //         stateSetters.setPostLeaveMeeting((prev: any) => ({ ...prev, isKicked: true }));
    //     }
    // }
};

const handleStreamExternalVideos: Handler = (data, state, stateSetters) => {
    // The 'stream-external-videos' collection does not seem to have 'added' or 'removed' messages.
    // The logic to start/stop watching is handled via different methods/collections ('startWatchingExternalVideo').
    // This handler might be for a different purpose or is legacy code.
    // For now, we will log the data to understand its purpose better.
    console.log('Received unhandled stream-external-videos message:', data);
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
        // 'external-video-meetings': handleExternalVideo,
        // 'video-meetings': handleECinema,
        'video-streams': handleRemoteVideo,
        'voiceUsers': handleVoiceUsers,
        'screenshare': handleRemoteScreenShare,
        'polls': handlePolls,
        'presentations': handlePresentations,
        'guest-users': handleGuestUsers,
        'breakouts': handleBreakout,
        'presentation-preupload': handlePresentationPreUpload,
        'connection-status': handleConnectionStatus,
    };

    const handler = handlers[collection];

    if (handler) {
        handler(obj, state, stateSetters);
    } else if (collection.includes('stream-external-videos')) {
        handleStreamExternalVideos(obj, state, stateSetters);
    }
};

