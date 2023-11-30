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
    meetingDetails: IMeetingDetails
}

export interface IMeetingDetails {
    returncode:string;
    fullname: string;
    confname: string;
    meetingID: string;
    externMeetingID: string;
    externUserID: string;
    internalUserID: string;
    authToken: string;
    role: string;
    guest: boolean;
    guestStatus: string;
    conference: string;
    room: string;
    voicebridge: string;
    dialnumber: string;
    webvoiceconf: string;
    mode: string;
    record: string;
    isBreakout: boolean;
    logoutTimer: number;
    allowStartStopRecording: boolean;
    recordFullDurationMedia: boolean;
    welcome: string;
    customLogoURL: string;
    customCopyright: string;
    muteOnStart: boolean;
    allowModsToUnmuteUsers: boolean;
    logoutUrl: string;
    defaultLayout: string;
    avatarURL: string;
    breakoutRooms: {
        record: boolean;
        privateChatEnabled: boolean;
        captureNotes: boolean;
        captureSlides: boolean;
        captureNotesFilename: string;
        captureSlidesFilename: string;
    };
    customdata: any[]; // Assuming customdata and metadata are arrays of any type
    metadata: any[];
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


export interface IParticipantCamera {
    id: string;
    intId: string|undefined;
    streamID: string;
    deviceID: string|null;
    stream:MediaStream | null
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

