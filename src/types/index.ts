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
export interface IVoiceUser {
  id: string;
  intId: string;
  callerName: string;
  joined: boolean;
  talking: boolean;
  muted: boolean;
}
export interface IAuthUser {
  id: number;
  fullName: string;
  email: string;
  sessiontoken: string
  meetingDetails:{
    meetingId: string;
    userId: string;
    clientType: string;
    validated: boolean;
    left: boolean;
    approved: boolean;
    authTokenValidatedTime: number;
    inactivityCheck: boolean;
    loginTime: number;
    authed: boolean;
    avatar: string;
    away: boolean;
    breakoutProps: {
      isBreakoutUser: boolean;
      parentId: string;
    };
    color: string;
    effectiveConnectionType: null | string;
    emoji: string;
    extId: string;
    guest: boolean;
    guestStatus: string;
    intId: string;
    locked: boolean;
    loggedOut: boolean;
    mobile: boolean;
    name: string;
    pin: boolean;
    presenter: boolean;
    raiseHand: boolean;
    reactionEmoji: string;
    responseDelay: number;
    role: string;
    sortName: string;
    speechLocale: string;
    connectionIdUpdateTime: number;
    currentConnectionId: string;
    id: string;
  }
}

export interface IParticipant {
    meetingId: string;
    userId: string;
    clientType: string;
    validated: boolean;
    left: boolean;
    approved: boolean;
    authTokenValidatedTime: number;
    inactivityCheck: boolean;
    loginTime: number;
    authed: boolean;
    avatar: string;
    away: boolean;
    breakoutProps: {
      isBreakoutUser: boolean;
      parentId: string;
    };
    color: string;
    effectiveConnectionType: null | string;
    emoji: string;
    extId: string;
    guest: boolean;
    guestStatus: string;
    intId: string;
    locked: boolean;
    loggedOut: boolean;
    mobile: boolean;
    name: string;
    pin: boolean;
    presenter: boolean;
    raiseHand: boolean;
    reactionEmoji: string;
    responseDelay: number;
    role: string;
    sortName: string;
    speechLocale: string;
    connectionIdUpdateTime: number;
    currentConnectionId: string;
    id: string;
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

