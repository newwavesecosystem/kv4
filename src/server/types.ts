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
    participantList: IParticipant[];
    manageUserSettings: IManageUserSettings;
    postLeaveMeeting: IPostLeaveMeeting;
    eCinemaModal: IECinemaModal;
    micState: boolean;
    screenShareState: boolean;
    waitingRoomUsers: IWaitingUser[];
    breakOutRoomState: IBreakOutRecord;
    fileUploadModal: IFileUploadModal;
    notificationSettings: INotificationSettings;
    chatTypingList: any;
    mediaPermission:IMediaPermission,
    participantTalkingList:IVoiceUser[],
    pinnedParticipant:IParticipant[],
    participantCameraList:any
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
    setPollModal: SetterOrUpdater<IPollModal | any>;
    setPresentationSlide: SetterOrUpdater<IPresentationMain | any>;
    setWaitingRoomUsers: SetterOrUpdater<IWaitingUser[] | any>;
    setMicState: SetterOrUpdater<boolean>;
    setBreakOutRoomState: SetterOrUpdater<IBreakOutRecord | any>;
    setIsNewMessage: SetterOrUpdater<boolean>;
    setFileUploadModal: SetterOrUpdater<IFileUploadModal | any>;
    setPrivateChatState: SetterOrUpdater<IPrivateChatMessage | any>;
    setScreenShareState: SetterOrUpdater<boolean>;
    setChatTypeList: SetterOrUpdater<any[]>;
    setIsnewRaiseHand: SetterOrUpdater<boolean>;
    setManageUserSettings: SetterOrUpdater<IManageUserSettings | any>;
    setPostLeaveMeeting: SetterOrUpdater<IPostLeaveMeeting | any>;
    setWaitingRoomType: SetterOrUpdater<number>;
    setPinnedParticipant: SetterOrUpdater<IParticipant[]>;
    setMicrophoneStream: SetterOrUpdater<any>;
    setMediaPermission: SetterOrUpdater<IMediaPermission>;
    setSelectedSpeaker: SetterOrUpdater<MediaDeviceInfo | null>;
    setNotificationSettingsState: SetterOrUpdater<INotificationSettings>;
    setSoundNotification: SetterOrUpdater<ISoundNotificationState | any>;
    shouldStopReconnectingLocal: () => void;
    startSub: () => void;
    setReconnectAttempts: (value: number) => void;
    toast: (props: { title: string; description: string; duration: number; }) => void;
}
