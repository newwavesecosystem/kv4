import { atom } from "recoil";
// import { UsersData } from "~/data/UsersData";
import settingsTabData from "~/data/settingsTabData";
import {
  IColumnBreakOutRoom,
  IConnectedUser,
  IMeetingDetails,
  IParticipant,
  IWaitingUser,
  IUserBreakOutRoom,
  IBreakoutRoom, IWhiteBoardAnnotationRemote, IPrivateChatMessage, IBreakOutRecord, IPresentationSlideState
} from "~/types";

export const authUserState = atom<{
  id: number;
  fullName: string;
  email: string;
  passCode: string;
  meetingId: string;
  sessiontoken: string;
  meetingDetails: IMeetingDetails | null;
} | null>({
  key: "authUserState",
  default: null,
});

export const newMessage = atom<boolean>({
  key: "newMessage",
  default: false,
});

export const connectionStatusState = atom<{
  websocket_connection: boolean;
  audio_connection: boolean;
}>({
  key: "connectionStatusState",
  default: {websocket_connection:false, audio_connection:false},
});

export const participantListState = atom<any>({
  key: "participantListState",
  default: [],
});

export const participantTalkingListState = atom<any>({
  key: "participantTalkingListState",
  default: [],
});

export const participantCameraListState = atom<any>({
  key: "participantCameraListState",
  default: [],
});

export const chatTypeListState = atom<any>({
  key: "chatTypeListState",
  default: [],
});

export const chatListState = atom<any>({
  key: "chatListState",
  default: [],
});

export const chatTypingListState = atom<any>({
  key: "chatTypingListState",
  default: [],
});


export const kaiChatListState = atom<any>({
  key: "kaiChatListState",
  default: [],
});

export const waitingRoomUsersState = atom<IWaitingUser[]>({
  key: "waitingRoomUsersState",
  default: [],
});

export const currentColorTheme = atom<{
  background: string;
  text: string;
}>({
  key: "currentColorTheme",
  default: {
    background: "#FFFFFF",
    text: "#227451",
  },
});

export const settingsModalState = atom<boolean>({
  key: "settingsModalState",
  default: false,
});

export const endCallModalState = atom<boolean>({
  key: "endCallModalState",
  default: false,
});

export const leaveRoomCallModalState = atom<boolean>({
  key: "leaveRoomCallModalState",
  default: false,
});

export const postLeaveMeetingState = atom<{
  isLeave: boolean;
  isEndCall: boolean;
  isLeaveRoomCall: boolean;
  isKicked: boolean;
  isSessionExpired: boolean;
  isOthers: boolean;
}>({
  key: "postLeaveMeetingState",
  default: {
    isLeave: false,
    isEndCall: false,
    isKicked: false,
    isLeaveRoomCall: false,
    isSessionExpired: false,
    isOthers: false,
  },
});

export const cameraStreamState = atom<MediaStream | null>({
  key: "cameraStreamState",
  default: null,
});
export const microphoneStreamState = atom<MediaStream | null>({
  key: "microphoneStreamState",
  default: null,
});
export const screenSharingStreamState = atom<MediaStream | null>({
  key: "screenSharingStreamState",
  default: null,
});
export const whiteBoardOpenState = atom<boolean>({
  key: "whiteBoardOpenState",
  default: false,
});

export const micOpenState = atom<boolean>({
  key: "micOpenState",
  default: false,
});

export const cameraOpenState = atom<boolean>({
  key: "cameraOpenState",
  default: false,
});
export const screenSharingState = atom<boolean>({
  key: "screenSharingState",
  default: false,
});

export const viewerScreenSharingState = atom<boolean>({
  key: "viewerScreenSharingState",
  default: false,
});

export const participantsModalState = atom<boolean>({
  key: "participantsModalState",
  default: false,
});

export const chatModalState = atom<boolean>({
  key: "chatModalState",
  default: false,
});

export const chatModalKonn3ctAiState = atom<boolean>({
  key: "chatModalKonn3ctAiState",
  default: false,
});

export const settingsModalMetaState = atom<{
  isFoward: boolean;
  sourceId: number;
}>({
  key: "settingsModalMetaState",
  default: {
    isFoward: false,
    sourceId: 0,
  },
});

export const currentTabState = atom<{
  id: number;
  name: string;
  icon: React.JSX.Element;
  disable: boolean;
  auth: boolean;
  clickSourceId: number;
}>({
  key: "currentTabState",
  default: settingsTabData[0],
});

export const presentationSlideState = atom<{
  show: boolean,
  currentPresentationID: "",
  presentations: IPresentationSlideState[]
}>({
  key: "presentationSlideState",
  default: {
    show: false,
    currentPresentationID: "",
    presentations: []
  },
});

export const recordingModalState = atom<{
  isActive: boolean;
  isStarted: boolean;
  recordingConsent: boolean;
  step: number;
  id: number;
  width: number;
  height: number;
  name: string;
}>({
  key: "recordingModalState",
  default: { step: 0, isActive: false, isStarted: false, recordingConsent: false, height: 0, width: 0, id: 0, name: "" },
});

export const eCinemaModalState = atom<{
  isActive: boolean;
  source: string;
  step: number;
}>({
  key: "eCinemaModalState",
  default: {
    isActive: false,
    source: "",
    step: 0,
  },
});

export const removeUserModalState = atom<{
  isActive: boolean;
  userId: string;
  userFullName: string;
  isBan: boolean;
}>({
  key: "removeUserModalState",
  default: {
    isActive: false,
    userId: "0",
    userFullName: "",
    isBan: false,
  },
});

export const privateChatModalState = atom<IPrivateChatMessage>({
  key: "privateChatModalState",
  default: {
    isActive: false,
    id: "0",
    users: [],
    chatRooms: [],
    chatMessages: [],
  },
});

export const ccModalState = atom<{
  isActive: boolean;
  language: string;
  step: number;
  caption: string;
}>({
  key: "ccModalState",
  default: {
    isActive: false,
    language: "df",
    step: 0,
    caption: "",
  },
});

export const donationModalState = atom<{
  isActive: boolean;
  step: number;
  donationName: string;
  donationAmount: number;
  donationAmountType: string;
  donationCreatorName: string;
  donationCreatorId: number;
  donationCreatedAt: Date;
  enableFlashNotification: boolean;
  totalAmountDonatated: number;
  usersDonated: {
    id: number;
    fullName: string | null;
    email: string | null;
    donationDescription: string;
    donationUniqueNumber: number | null;
    donationAmount: number;
  }[];
}>({
  key: "donationModalState",
  default: {
    step: 0,
    isActive: false,
    donationName: "",
    donationAmount: 0,
    donationAmountType: "2",
    donationCreatorName: "",
    donationCreatorId: 0,
    donationCreatedAt: new Date(),
    enableFlashNotification: false,
    totalAmountDonatated: 0,
    usersDonated: [],
  },
});

export const whiteboardAnnotationState = atom<IWhiteBoardAnnotationRemote[]>({
  key: "whiteBoardAnnotationRemote",
  default:[],
});

// const defaultUsers: IUserBreakOutRoom[] = [
//   ...UsersData.map((user) => ({
//     id: user.id,
//     columnId: "users",
//     name: user.name,
//     userId: user.name,
//   })),
// ];

export const fileUploadModalState = atom<{
  step: number;
  isMinimized: boolean;
  isFull: boolean;
  files: File[];
  filesToUpload: string[];
  filesUploadInProgress: any[];
}>({
  key: "fileUploadModalState",
  default: {
    step: 0,
    isMinimized: false,
    isFull: false,
    files: [],
    filesToUpload: [],
    filesUploadInProgress: [],
  },
});

export const breakOutModalState = atom<IBreakOutRecord>({
  key: "breakOutModalState",
  default: {
    step: 0,
    isActive: false,
    rooms: [],
    users: [],
    isAllowUsersToChooseRooms: true,
    isSendInvitationToAssignedModerators: false,
    duration: 15,
    isSaveWhiteBoard: false,
    isSaveSharedNotes: false,
    createdAt: null,
    creatorName: "",
    creatorId: 0,
    isEnded: false,
    activatedAt: null,
    endedAt: null,
  },
});

export const pollModalState = atom<{
  isActive: boolean;
  isEnded: boolean;
  isEdit: boolean;
  isUserHost: boolean;
  step: number;
  pollQuestion: string;
  pollCreatorName: string;
  pollCreatorId: string;
  pollCreatedAt: Date;
  pollOptions: {
    id: number;
    option: string;
    votes: number;
  }[];
  totalVotes: number;
  usersVoted: {
    id: string | null | undefined;
    fullName: string | null | undefined;
    email: string | null | undefined;
    votedOption: string;
    votedOptionId: number;
  }[];
}>({
  key: "pollModalState",
  default: {
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
  },
});

export const availableCamerasState = atom<Array<MediaDeviceInfo>>({
  key: "availableCamerasState",
  default: [],
});

export const availableMicrophonesState = atom<Array<MediaDeviceInfo>>({
  key: "availableMicrophonesState",
  default: [],
});

export const availableSpeakersState = atom<Array<MediaDeviceInfo>>({
  key: "availableSpeakersState",
  default: [],
});

export const selectedCameraState = atom<MediaDeviceInfo | null>({
  key: "selectedCameraState",
  default: null,
});

export const selectedMicrophoneState = atom<MediaDeviceInfo | null>({
  key: "selectedMicrophoneState",
  default: null,
});

export const selectedSpeakersState = atom<MediaDeviceInfo | null>({
  key: "selectedSpeakersState",
  default: null,
});

export const micFilterState = atom<{
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}>({
  key: "micFilterState",
  default: {
    echoCancellation: true,
    noiseSuppression: false,
    autoGainControl: false,
  },
});

export const CamQualityState = atom<{
  id: number,
  name: string,
  bitrate: number,
  default: boolean,
  constraints: {} | {
    width: number,
    height: number,
    frameRate: number,
  }
}>({
  key: "camQualityState",
  default: {
    id: 2,
    name: "Medium",
    bitrate: 200,
    default: true,
    constraints:{}
  },
});


export const connectedUsersState = atom<IConnectedUser[]>({
  key: "connectedUsersState",
  default: [],
});

export const pinnedUsersState = atom<IParticipant[]>({
  key: "pinnedUsersState",
  default: [],
});

export const LayoutSettingsState = atom<{
  speakerMode: boolean;
  audioMode: boolean;
  maxTiles: number[];
  layout: string;
  layoutName: string;
}>({
  key: "LayoutSettingsState",
  default: {
    speakerMode: false,
    audioMode: false,
    maxTiles: [6],
    layout: "1",
    layoutName: "",
  },
});
