import { SetterOrUpdater } from 'recoil';
import {
    IAuthUser, IBreakOutRecord,
    IBreakoutRoom,
    IChat, IConnectionStatus, IDonationModal,
    IECinemaModal, IFileUploadModal,
    IManageUserSettings, IMediaPermission,
    INotificationSettings,
    IParticipant,
    IParticipantCamera, IPollModal,
    IPostLeaveMeeting, IPresentationMain,
    IPresentationSlide, IPrivateChatMessage, IRecordingModal, ISoundNotificationState, IVoiceUser,
    IWaitingUser
} from '~/types';

export interface IWebSocketState {
    user: IAuthUser | null;
    participantList: any;
    manageUserSettings: IManageUserSettings;
    postLeaveMeeting: IPostLeaveMeeting;
    eCinemaModal: IECinemaModal;
}

export interface IWebSocketStateSetters {
    setUser: SetterOrUpdater<IAuthUser | null>;
    setConnection: SetterOrUpdater<IConnectionStatus>;
    setParticipantList: SetterOrUpdater<IParticipant[]>;
    setParticipantTalkingList: SetterOrUpdater<IVoiceUser[]>;
    setRecordingState: SetterOrUpdater<IRecordingModal>;
    setParticipantCameraList: SetterOrUpdater<IParticipantCamera[]>;
    setViewerScreenShareState: SetterOrUpdater<boolean>;
    setScreenSharingStream: SetterOrUpdater<MediaStream | null>;
    setChatList: SetterOrUpdater<any>;
    setChatTypingList: SetterOrUpdater<any>;
    setECinemaModal: SetterOrUpdater<IECinemaModal>;
    setDonationState: SetterOrUpdater<IDonationModal>;
    setPollModal: SetterOrUpdater<IPollModal>;
    setPresentationSlide: SetterOrUpdater<IPresentationMain>;
    setWaitingRoomUsers: SetterOrUpdater<IWaitingUser[]>;
    setMicState: SetterOrUpdater<boolean>;
    setBreakOutRoomState: SetterOrUpdater<IBreakOutRecord>;
    setIsNewMessage: SetterOrUpdater<boolean>;
    setFileUploadModal: SetterOrUpdater<IFileUploadModal>;
    setPrivateChatState: SetterOrUpdater<IPrivateChatMessage>;
    setScreenShareState: SetterOrUpdater<boolean>;
    setChatTypeList: SetterOrUpdater<any[]>;
    setIsnewRaiseHand: SetterOrUpdater<boolean>;
    setManageUserSettings: SetterOrUpdater<IManageUserSettings>;
    setPostLeaveMeeting: SetterOrUpdater<IPostLeaveMeeting>;
    setWaitingRoomType: SetterOrUpdater<number>;
    setPinnedParticipant: SetterOrUpdater<IParticipant[]>;
    setMicrophoneStream: SetterOrUpdater<any>;
    setMediaPermission: SetterOrUpdater<IMediaPermission>;
    setSelectedSpeaker: SetterOrUpdater<MediaDeviceInfo | null>;
    setNotificationSettingsState: SetterOrUpdater<INotificationSettings>;
    setSoundNotification: SetterOrUpdater<ISoundNotificationState>;
    shouldStopReconnectingLocal: () => void;
    startSub: () => void;
    setReconnectAttempts: (value: number) => void;
}
