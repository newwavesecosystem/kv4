import DateTimeFormat = Intl.DateTimeFormat;

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
  sessiontoken: string;
  meetingDetails: IMeetingDetails;
}

export interface IMeetingDetails {
  returncode: string;
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
  connection_status: string;
}

export interface IWaitingUser {
    _id:string;
    name:string;
    intId:string;
    role:string;
    avatar:string;
    guest:boolean;
    authenticated:boolean;
}

export interface IWhiteBoardAnnotationRemote {
  meetingId:    string;
  whiteboardId: string;
  userId:       string;
  annotation:   Annotation;
}

export interface Annotation {
  id:             string;
  annotationInfo: AnnotationInfo;
  wbId:           string;
  userId:         string;
}

export interface AnnotationInfo {
  size:        number[];
  style:       Style;
  label:       string;
  rotation:    number;
  id:          string;
  parentId:    string;
  childIndex:  number;
  name:        string;
  point:       number[];
  isModerator: boolean;
  labelPoint:  number[];
  userId:      string;
  type:        string;
}

export interface Style {
  isFilled:  boolean;
  size:      string;
  scale:     number;
  color:     string;
  textAlign: string;
  font:      string;
  dash:      string;
}


export interface IParticipantCamera {
  id: string | undefined;
  intId: string | undefined;
  streamID: string | null;
  deviceID: string | undefined;
  stream: MediaStream | null;
}

export interface IChat {
  id: any;
  name: string;
  message: string;
  time: Date;
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

export interface IColumnBreakOutRoom {
  id: string;
  breakoutId: string|null;
  title: string;
  users: string[];
}

export interface IBreakoutRoom {
  users: string[];
  name: string;
  captureNotesFilename: string;
  captureSlidesFilename: string;
  shortName: string;
  isDefaultName: boolean;
  freeJoin: boolean;
  sequence: number;
}

// {
//   users: ["w_0pknu2mdlwg3"],
//       name: "Odejinmi Room (Room 1)",
//     captureNotesFilename: "Room_01_Notes",
//     captureSlidesFilename: "Room_01_Whiteboard",
//     shortName: "Room 1",
//     isDefaultName: true,
//     freeJoin: true,
//     sequence: 1,
//     id: "1",
// },

export interface IUserBreakOutRoom {
  id: string | undefined;
  columnId: string | undefined;
  name: string | undefined;
  userId: string | undefined;
}

export interface IEmojiMart {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
  emoticons: string[];
}
