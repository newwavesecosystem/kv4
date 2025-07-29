import React, { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { websocketService } from './WebsocketService';
import { handleWebSocketMessage } from './WebsocketHandlers';
import { 
    authUserState,
    breakOutModalState,
    chatListState,
    chatTypeListState,
    chatTypingListState,
    connectionStatusState,
    donationModalState,
    eCinemaModalState,
    fileUploadModalState,
    manageUserSettingsState,
    mediaPermissionState,
    micOpenState,
    microphoneStreamState,
    newMessage,
    newRaiseHand,
    notificationSettingsState,
    participantCameraListState,
    participantListState,
    participantTalkingListState,
    pinnedUsersState,
    pollModalState,
    postLeaveMeetingState,
    presentationSlideState,
    privateChatModalState,
    recordingModalState,
    screenSharingState,
    screenSharingStreamState,
    selectedSpeakersState,
    soundNotificationState,
    viewerScreenSharingState,
    waitingRoomTypeState,
    waitingRoomUsersState,
} from '~/recoil/atom';
import { IWebSocketState, IWebSocketStateSetters } from '~/server/types';
import { generateRandomId } from '~/server/ServerInfo';
import {toast} from "~/components/ui/use-toast";


const Websocket: React.FC = () => {
    // --- Recoil State Hooks ---
    const [user, setUser] = useRecoilState(authUserState);
    const setConnection = useSetRecoilState(connectionStatusState);
    const [participantList, setParticipantList] = useRecoilState(participantListState);
    const setRecordingState = useSetRecoilState(recordingModalState);
    const setViewerScreenShareState = useSetRecoilState(viewerScreenSharingState);
    const setScreenSharingStream = useSetRecoilState(screenSharingStreamState);
    const setChatList = useSetRecoilState(chatListState);
    const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);
    const setDonationState = useSetRecoilState(donationModalState);
    const setPollModal = useSetRecoilState(pollModalState);
    const setPresentationSlide = useSetRecoilState(presentationSlideState);
    const setIsNewMessage = useSetRecoilState(newMessage);
    const setPrivateChatState = useSetRecoilState(privateChatModalState);
    const setChatTypeList = useSetRecoilState(chatTypeListState);
    const setIsnewRaiseHand = useSetRecoilState(newRaiseHand);
    const [manageUserSettings, setManageUserSettings] = useRecoilState(manageUserSettingsState);
    const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(postLeaveMeetingState);
    const setWaitingRoomType = useSetRecoilState(waitingRoomTypeState);
    const setMicrophoneStream = useSetRecoilState(microphoneStreamState);
    const setSelectedSpeaker = useSetRecoilState(selectedSpeakersState);
    const setSoundNotification = useSetRecoilState(soundNotificationState);
    const [notificationSettings, setNotificationSettingsState] = useRecoilState(notificationSettingsState);
    const [chatTypingList, setChatTypingList] = useRecoilState(chatTypingListState);
    const [mediaPermission, setMediaPermission] = useRecoilState(mediaPermissionState);
    const [participantTalkingList, setParticipantTalkingList] = useRecoilState(participantTalkingListState);
    const [pinnedParticipant, setPinnedParticipant] = useRecoilState(pinnedUsersState);
    const [participantCameraList, setParticipantCameraList] = useRecoilState(participantCameraListState);
    const [micState, setMicState] = useRecoilState(micOpenState);
    const [screenShareState, setScreenShareState] = useRecoilState(screenSharingState);
    const [waitingRoomUsers, setWaitingRoomUsers] = useRecoilState(waitingRoomUsersState);
    const [breakOutRoomState, setBreakOutRoomState] = useRecoilState(breakOutModalState);
    const [fileUploadModal, setFileUploadModal] = useRecoilState(fileUploadModalState);

    const messageHandlerRef = React.useRef<((rawMessage: string) => void) | null>(null);

    // This effect updates the message handler whenever state changes.
    useEffect(() => {
        const state: IWebSocketState = {
            user,
            participantList,
            manageUserSettings,
            postLeaveMeeting,
            eCinemaModal,
            micState,
            screenShareState,
            waitingRoomUsers,
            breakOutRoomState,
            fileUploadModal,
            notificationSettings,
            chatTypingList,
            mediaPermission,
            participantTalkingList,
            pinnedParticipant,
            participantCameraList
        };

        const stateSetters: IWebSocketStateSetters = {
            setUser,
            setConnection,
            setParticipantList,
            setParticipantTalkingList,
            setRecordingState,
            setParticipantCameraList,
            setViewerScreenShareState,
            setScreenSharingStream,
            setChatList,
            setChatTypingList,
            setECinemaModal,
            setDonationState,
            setPollModal,
            setPresentationSlide,
            setWaitingRoomUsers,
            setMicState,
            setBreakOutRoomState,
            setIsNewMessage,
            setFileUploadModal,
            setPrivateChatState,
            setScreenShareState,
            setChatTypeList,
            setIsnewRaiseHand,
            setManageUserSettings,
            setPostLeaveMeeting,
            setWaitingRoomType,
            setPinnedParticipant,
            setMicrophoneStream,
            setMediaPermission,
            setSelectedSpeaker,
            setNotificationSettingsState,
            setSoundNotification,
            shouldStopReconnectingLocal: () => websocketService.disconnect(),
            startSub: () => {
                console.log("Starting validate auth token and subs");
                const { meetingID, internalUserID, authToken, externUserID } = user?.meetingDetails!;
                const validationMsg = { msg: 'method', id: '2', method: 'validateAuthToken', params: [meetingID, internalUserID, authToken, externUserID] };
                websocketService.send(JSON.stringify(validationMsg));

                const subscriptions = [
                    'current-user', 'users', 'meetings', 'polls', 'presentations', 'slides', 'slide-positions',
                    'captions', 'voiceUsers', 'whiteboard-multi-user', 'screenshare', 'group-chat',
                    'group-chat-msg', 'presentation-pods', 'users-settings', 'guestUser', 'users-infos',
                    'meeting-time-remaining', 'local-settings', 'users-typing', 'record-meetings',
                    'video-streams', 'connection-status', 'voice-call-states', 'external-video-meetings',
                    'annotations'
                ];

                subscriptions.forEach(name => {
                    const subMsg = { msg: 'sub', id: generateRandomId(17), name, params: [] };
                    websocketService.send(JSON.stringify(subMsg));
                });

                const moderatorSubs = ['meetings', 'users', 'breakouts', 'guestUser'];
                moderatorSubs.forEach(name => {
                    const subMsg = { msg: 'sub', id: generateRandomId(17), name, params: ['MODERATOR'] };
                    websocketService.send(JSON.stringify(subMsg));
                });
            },
            setReconnectAttempts: () => {},
            toast: (props) => {
                toast(props);
            },
        };

        messageHandlerRef.current = (rawMessage: string) => {
            handleWebSocketMessage(rawMessage, state, stateSetters);
        };
    }, [user, participantList, manageUserSettings, postLeaveMeeting, eCinemaModal, participantTalkingList, setUser, setConnection, setParticipantList, setParticipantTalkingList, setRecordingState, setParticipantCameraList, setViewerScreenShareState, setScreenSharingStream, setChatList, setChatTypingList, setECinemaModal, setDonationState, setPollModal, setPresentationSlide, setWaitingRoomUsers, setMicState, setBreakOutRoomState, setIsNewMessage, setFileUploadModal, setPrivateChatState, setScreenShareState, setChatTypeList, setIsnewRaiseHand, setManageUserSettings, setPostLeaveMeeting, setWaitingRoomType, setPinnedParticipant, setMicrophoneStream, setMediaPermission, setSelectedSpeaker, setNotificationSettingsState, setSoundNotification]);

    // This effect manages the WebSocket connection and runs only once.
    useEffect(() => {
        const startSub = () => {
            if (!user) return;
            setTimeout(() => {
                const connectMsg = { msg: 'connect', version: '1', support: ['1', 'pre2', 'pre1'] };
                websocketService.send(JSON.stringify(connectMsg));

                const autoupdateSub = { msg: 'sub', id: generateRandomId(17), name: 'meteor_autoupdate_clientVersions', params: [] };
                websocketService.send(JSON.stringify(autoupdateSub));

                const settingsMsg = {
                    msg: 'method',
                    id: '1',
                    method: 'userChangedLocalSettings',
                    params: [{
                        application: {
                            animations: true,
                            chatAudioAlerts: false,
                            chatPushAlerts: false,
                            userJoinAudioAlerts: false,
                            userJoinPushAlerts: false,
                            userLeaveAudioAlerts: false,
                            userLeavePushAlerts: false,
                            raiseHandAudioAlerts: true,
                            raiseHandPushAlerts: true,
                            guestWaitingAudioAlerts: true,
                            guestWaitingPushAlerts: true,
                            paginationEnabled: true,
                            pushLayoutToEveryone: false,
                            fallbackLocale: 'en',
                            overrideLocale: null,
                            locale: 'en-US'
                        },
                        audio: {
                            inputDeviceId: 'undefined',
                            outputDeviceId: 'undefined'
                        },
                        dataSaving: {
                            viewParticipantsWebcams: true,
                            viewScreenshare: true
                        }
                    }]
                };
                websocketService.send(JSON.stringify(settingsMsg));

            }, 500);
        };

        const stableMessageHandler = (rawMessage: string) => {
            if (messageHandlerRef.current) {
                messageHandlerRef.current(rawMessage);
            }
        };

        websocketService.connect(stableMessageHandler, startSub);

        return () => {
            websocketService.disconnect();
        };
    }, [""]);

    return <></>;
};

export default Websocket;
