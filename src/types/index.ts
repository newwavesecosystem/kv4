import DateTimeFormat = Intl.DateTimeFormat;
import {
  connectionStatusState,
  eCinemaModalState,
  fileUploadModalState,
  mediaPermissionState,
  presentationSlideState,
  soundNotificationState
} from "~/recoil/atom";

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
  intId:         string;
  meetingId:     string;
  callerName:    string;
  callerNum:     string;
  callingWith:   string;
  color:         string;
  joined:        boolean;
  listenOnly:    boolean;
  muted:         boolean;
  spoke:         boolean;
  talking:       boolean;
  voiceConf:     string;
  voiceUserId:   string;
  endTime:       number;
  startTime:     number;
  floor:         boolean;
  lastFloorTime: string;
}
export interface IAuthUser {
  id: number;
  fullName: string;
  email: string;
  passCode: string;
  meetingId: string;
  sessiontoken: string;
  connectionID: string;
  connectionAuthTime: number;
  meetingDetails: IMeetingDetails | null;
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
  chatId?: string; // Added for private chat
}

export interface IWaitingUser {
  _id: string;
  name: string;
  intId: string;
  role: string;
  avatar: string;
  guest: boolean;
  authenticated: boolean;
}

export interface IManageUserSettings {
  meetingId?: string; // Added for lock viewers
  muteAllUsers: boolean;
  muteAllUsersExceptPresenter: boolean;
  shareWebcam: boolean; // Renamed from disableCam
  shareMicrophone: boolean; // Renamed from disableMic
  sendPublicChatMessage: boolean; // Renamed from disablePublicChat
  sendPrivateChatMessage: boolean; // Renamed from disablePrivateChat
  editSharedNotes: boolean; // Renamed from disableNotes
  seeOtherViewers: boolean; // Renamed from hideUserList
  hideViewersAnnotation:boolean;
  hideViewersCursor:boolean,
  lockOnJoin:boolean,
  lockOnJoinConfigurable:boolean
}

export interface INotificationSettings {
  joined: boolean,
  leave: boolean,
  newMessage: boolean,
  handRaised: boolean,
  error: boolean,
}

export interface IPostLeaveMeeting {
  isLeave: boolean;
  isEndCall: boolean;
  isLeaveRoomCall: boolean;
  isKicked: boolean;
  isSessionExpired: boolean;
  isOthers: boolean;
}

export interface IECinemaModal {
  isActive: boolean;
  source: string;
  step: number;
  eventName: string;
  eventData: null;
}

export interface IRecordingModal {
  isActive: boolean;
  isStarted: boolean;
  recordingConsent: boolean;
  step: number;
  id: number;
  width: number;
  height: number;
  name: string;
}

export interface IDonationModal {
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
  }[]
}

export interface IPollModal {
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
}

export interface ISoundNotificationState {
  newMessage:boolean,
  newRaiseHand:boolean,
  newWaitingUser:boolean
}

export interface IFileUploadModal {
  step: number;
  isMinimized: boolean;
  isFull: boolean;
  files: File[];
  filesToUpload: string[];
  filesUploadInProgress: any[];
}

export interface IMediaPermission {
  audioAllowed:boolean,
  videoAllowed:boolean,
  muteMicOnJoin:boolean
}

export interface IConnectionStatus {
  websocket_connection: boolean;
  websocket_connection_reconnect: boolean;
  audio_connection: boolean;
  iceServers: {
    username: string;     credential: string;     urls: string;
  }[];
}


export interface IBreakOutRecord {
  isActive: boolean;
  step: number;
  rooms: IColumnBreakOutRoom[];
  users: IUserBreakOutRoom[];
  isAllowUsersToChooseRooms: boolean;
  isSendInvitationToAssignedModerators: boolean;
  duration: number;
  isSaveWhiteBoard: boolean;
  isSaveSharedNotes: boolean;
  createdAt: Date | null;
  creatorName: string;
  creatorId: number;
  isEnded: boolean;
  activatedAt: Date | null;
  endedAt: Date | null;
}

export interface IPresentationSlideState {
  pages: IPresentationSlidePages[];
  current: boolean;
  downloadable: boolean;
  name: String;
  podId: String;
  id: String;
}

export interface IPresentationSlidePages {
  id: string,
  num: string,
  thumbUri: string,
  txtUri: string,
  svgUri: string,
  imageUri: string,
  current: boolean,
}

export interface IWhiteBoardAnnotationRemote {
  meetingId: string;
  whiteboardId: string;
  userId: string;
  annotation: Annotation;
}

export interface Annotation {
  id: string;
  annotationInfo: AnnotationInfo;
  wbId: string;
  userId: string;
}

export interface AnnotationInfo {
  size: number[];
  style: Style;
  label: string;
  rotation: number;
  id: string;
  parentId: string;
  childIndex: number;
  name: string;
  point: number[];
  isModerator: boolean;
  labelPoint: number[];
  userId: string;
  type: string;
}

export interface Style {
  isFilled: boolean;
  size: string;
  scale: number;
  color: string;
  textAlign: string;
  font: string;
  dash: string;
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

export interface IPrivateChatMessage {
  isActive: boolean;
  id: string;
  users: {
    id: string;
    fullName: string;
    email: string;
  }[];
  chatRooms: {
    "chatId": string,
    "meetingId": string,
    "access": string,
    "createdBy": string,
    "participants": {
      "id": string,
      "name": string,
      "role": string
    }[],
    "users": string[]
  }[]
  chatMessages: {
    id: string,
    name: string,
    message: string,
    chatId: string,
    time: Date,
  }[]
}

export interface IChatState {
  messages: IChatMessage[];
}

export interface IParticipantsState {
  participants: IConnectedUser[];
}

export interface IColumnBreakOutRoom {
  id: string;
  breakoutId: string | null;
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

export class BreakoutRoomOptions {
	rooms: IColumnBreakOutRoom[] = [];
	time: number = 0;
	freeRoom: boolean = false;
	saveWhiteBoard: boolean = false;
	saveSharedNote: boolean = false;
	sendInvite: boolean = false;
	roomName: string | undefined;
}

export interface IPresentationMain {
  show: boolean,
  currentPresentationID: "",
  presentations: IPresentationSlideState[]
}
export interface IPresentationSlide {
  id: string,
  num: number,
  thumbUri: string,
  txtUri: string,
  svgUri: string,
  current: false,
  xOffset: number,
  yOffset: number,
  widthRatio: number,
  heightRatio: number
}