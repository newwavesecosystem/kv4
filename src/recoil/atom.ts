import { atom } from "recoil";
import settingsTabData from "~/data/settingsTabData";
import {IConnectedUser, IMeetingDetails, IParticipant, IWaitingUser} from "~/types";

export const authUserState = atom<{
  id: number;
  fullName: string;
  email: string;
  passCode: string;
  meetingId: string;
  sessiontoken: string;
  meetingDetails: IMeetingDetails|null;
} | null>({
  key: "authUserState",
  default: null,
});

export const connectionStatusState = atom<{
  websocket_connection: boolean;
  audio_connection: boolean;
} | null>({
  key: "connectionStatusState",
  default: null,
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


export const chatListState = atom<any>({
  key: "chatListState",
  default: [],
});

export const chatTypingListState = atom<any>({
  key: "chatTypingListState",
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
    background: "#227451",
    text: "#FFFFFF",
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

export const postLeaveMeetingState = atom<boolean>({
  key: "postLeaveMeetingState",
  default: false,
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
  pages: [];
  current: boolean;
  downloadable: boolean;
  name: String;
  podId: String;
  id: String;
}>({
  key: "presentationSlideState",
  default: {  pages: [],
    current: false,
    downloadable: false,
    name: '',
    podId: '',
    id: ''},
});

export const recordingModalState = atom<{
  isActive: boolean;
  step: number;
  id: number;
  width: number;
  height: number;
  name: string;
}>({
  key: "recordingModalState",
  default: { step: 0, isActive: false, height: 0, width: 0, id: 0, name: "" },
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
    userId: '0',
    userFullName: "",
    isBan: false,
  },
});

export const privateChatModalState = atom<{
  isActive: boolean;
  id: number;
  users: {
    id: number;
    fullName: string;
    email: string;
  }[];
}>({
  key: "privateChatModalState",
  default: {
    isActive: false,
    id: 0,
    users: [],
  },
});

export const ccModalState = atom<{
  isActive: boolean;
  language: string;
  step: number;
}>({
  key: "ccModalState",
  default: {
    isActive: false,
    language: "en",
    step: 0,
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

export const selectedCameraState = atom<string | null>({
  key: "selectedCameraState",
  default: null,
});

export const selectedMicrophoneState = atom<string | null>({
  key: "selectedMicrophoneState",
  default: null,
});

export const selectedSpeakersState = atom<string | null>({
  key: "selectedSpeakersState",
  default: null,
});

export const connectedUsersState = atom<IConnectedUser[]>({
  key: "connectedUsersState",
  default: [],
});
