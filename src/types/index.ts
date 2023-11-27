export interface IConnectedUser {
  id: number;
  fullName: string;
  email: string;
  speaker: MediaStream | null;
  cameraFeed: MediaStream | null;
  microphoneFeed: MediaStream | null;
  screenSharingFeed: MediaStream | null;
  isCameraOpen: boolean;
  isMicOpen: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isModerator: boolean;
  profilePicture: string | null;
}

export interface IChatMessage {
  id: number;
  message: string;
  sender: IConnectedUser;
  timestamp: number;
}

export interface IChatState {
  messages: IChatMessage[];
}

export interface IParticipantsState {
  participants: IConnectedUser[];
}

