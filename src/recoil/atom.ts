import { atom } from "recoil";
import settingsTabData from "~/data/settingsTabData";

export const authUserState = atom<{
  id: number;
  fullName: string;
  email: string;
  sessiontoken: string;
  meetingDetails: any;
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


export const settingsModalState = atom<boolean>({
  key: "settingsModalState",
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

export const micOpenState = atom<boolean>({
  key: "micOpenState",
  default: false,
});

export const cameraOpenState = atom<boolean>({
  key: "cameraOpenState",
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
