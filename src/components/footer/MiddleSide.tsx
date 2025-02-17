import React, {useEffect, useState} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  authUserState,
  cameraOpenState,
  cameraStreamState,
  chatModalKonn3ctAiState,
  chatModalState,
  connectedUsersState,
  donationModalState,
  eCinemaModalState,
  endCallModalState,
  leaveRoomCallModalState,
  micOpenState,
  participantCameraListState,
  microphoneStreamState,
  pollModalState,
  recordingModalState,
  screenSharingState,
  screenSharingStreamState,
  settingsModalState,
  whiteBoardOpenState,
  participantListState,
  connectionStatusState,
  breakOutModalState,
  selectedCameraState,
  fileUploadModalState,
  newMessage, selectedMicrophoneState, micFilterState, CamQualityState, mediaPermissionState, manageUserSettingsState,
} from "~/recoil/atom";
import { useToast } from "../ui/use-toast";
import PhoneEndIcon from "../icon/outline/PhoneEndIcon";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import RecordOnIcon from "../icon/outline/RecordOnIcon";
import ExitIcon from "../icon/outline/ExitIcon";
import { cn } from "~/lib/utils";
import stopMicrophoneStream from "~/lib/microphone/stopMicrophoneStream";
import requestMicrophoneAccess from "~/lib/microphone/requestMicrophoneAccess";
import MicOnIcon from "../icon/outline/MicOnIcon";
import MicOffIcon from "../icon/outline/MicOffIcon";
import stopCameraStream from "~/lib/camera/stopCameraStream";
import requestCameraAccess from "~/lib/camera/requestCameraAccess";
import VideoOnIcon from "../icon/outline/VideoOnIcon";
import VideoOffIcon from "../icon/outline/VideoOffIcon";
import SettingsIcon from "../icon/outline/SettingsIcon";
import ShareIcon from "../icon/outline/ShareIcon";
import ChatIcon from "../icon/outline/ChatIcon";
import RefreshIcon from "../icon/outline/RefreshIcon";
import ExpandIcon from "../icon/outline/ExpandIcon";
import DesktopIcon from "../icon/outline/DesktopIcon";
import FolderOpenIcon from "../icon/outline/FolderOpenIcon";
import TextFormatIcon from "../icon/outline/TextFormatIcon";
import GiftIcon from "../icon/outline/GiftIcon";
import BotIcon from "../icon/outline/BotIcon";
import requestScreenSharingAccess from "~/lib/screenSharing/requestScreenSharingAccess";
import ShareScreenOnIcon from "../icon/outline/ShareScreenOnIcon";
import ShareScreenOffIcon from "../icon/outline/ShareScreenOffIcon";
import stopScreenSharingStream from "~/lib/screenSharing/stopScreenSharingStream";
import HandOnIcon from "../icon/outline/HandOnIcon";
import HandOffIcon from "../icon/outline/HandOffIcon";
import {
  websocketMuteAllParticipants,
  websocketMuteMic,
  websocketPresenter,
  websocketRaiseHand,
  websocketStopCamera,
} from "~/server/Websocket";
import { IChat, IParticipant, IParticipantCamera } from "~/types";
import MovieColoredIcon from "../icon/outline/MovieColoredIcon";
import {generateRandomId} from "~/server/ServerInfo";
import {
  websocketKurentoScreenshareEndScreenshare,
} from "~/server/KurentoScreenshare";
import {CurrentUserIsPresenter, CurrentUserRoleIsModerator, ModeratorRole} from "~/lib/checkFunctions";
import {Tooltip, TooltipTrigger, TooltipContent, TooltipProvider} from "~/components/ui/tooltip";

function MiddleSide() {
  const [settingsOpen, setSettingsOpen] = useRecoilState(settingsModalState);
  const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);
  const [microphoneStream, setMicrophoneStream] = useRecoilState(
    microphoneStreamState,
  );
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );
  const [recordingState, setRecordingState] =
    useRecoilState(recordingModalState);
  const [breakOutRoomState, setBreakOutRoomState] =
    useRecoilState(breakOutModalState);
  const [donationState, setDonationState] = useRecoilState(donationModalState);
  const [chatState, setChatState] = useRecoilState(chatModalState);
  const [endCallModal, setEndCallModal] = useRecoilState(endCallModalState);
  const [isWhiteboardOpen, setIsWhiteboardOpen] =
    useRecoilState(whiteBoardOpenState);
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);
  const { toast } = useToast();

  const user = useRecoilValue(authUserState);
  const [participantList, setParticipantList] =
    useRecoilState(participantListState);
  const [micState, setMicState] = useRecoilState(micOpenState);
  const [videoState, setVideoState] = useRecoilState(cameraOpenState);
  const [screenShareState, setScreenShareState] =
    useRecoilState(screenSharingState);
  const [participantCameraList, setParticipantCameraList] = useRecoilState(
    participantCameraListState,
  );

  const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);
  const [pollModal, setPollModal] = useRecoilState(pollModalState);
  const [konn3ctAiChatState, setKonn3ctAiChatState] = useRecoilState(
    chatModalKonn3ctAiState,
  );
  const [leaveRoomCallModal, setRoomCallModal] = useRecoilState(
    leaveRoomCallModalState,
  );

  const [fileUploadModal, setFileUploadModal] =
    useRecoilState(fileUploadModalState);

  const [selectedCamera, setSelectedCamera] = useRecoilState(
      selectedCameraState,
  );

  const [selectedMicrophone, setSelectedMicrophone] = useRecoilState(
      selectedMicrophoneState,
  );

  const [selectedVideoQuality, setSelectedVideoQuality] = useRecoilState(
      CamQualityState
  );


  const [micFilter, setMicFilter] = useRecoilState(micFilterState);



  const [ssscreen, setScreen] = useState<null|MediaStream>(null);
  const [isNewMessage, setIsNewMessage] = useRecoilState(newMessage);

  const mediaPermission = useRecoilValue(mediaPermissionState);

  const [manageUserSettings, setManageUserSettings] = useRecoilState(manageUserSettingsState);


  return (
    <div className=" flex w-full items-center justify-center gap-5">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 rounded-3xl border border-a11y/40 bg-[#DF2622] p-2 md:hidden">
                        <button
                            onClick={() => {
                                setRoomCallModal(true);
                            }}
                            className="px-1"
                        >
                            <PhoneEndIcon className="h-6 w-6"/>
                        </button>
                        <Separator className="w-0.5 bg-a11y/20" orientation="vertical"/>
                        {CurrentUserRoleIsModerator(participantList, user) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="px-1">
                                        <EllipsisIcon className="h-6 w-6"/>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="mb-5 w-80 rounded-b-none border-0 bg-primary text-a11y md:mb-3 md:hidden md:rounded-b-md">
                                    <DropdownMenuGroup className="divide-y divide-a11y/20">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEndCallModal(true);
                                            }}
                                            className="flex items-start p-4 focus:bg-[#DF2622]"
                                        >
                                            <RecordOnIcon className="mr-2 h-5 w-5 shrink-0"/>
                                            <div className="flex flex-col">
                                                <span className="">End Room For All</span>
                                                <span>
                    The session will end for everyone. You can't undo this
                    action.
                  </span>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setRoomCallModal(true);
                                            }}
                                            className="flex items-start p-4"
                                        >
                                            <ExitIcon className="mr-2 h-5 w-5 shrink-0"/>
                                            <div className="flex flex-col">
                                                <span className="">Leave Room</span>
                                                <span>
                    Others will continue after you leave. You can join the
                    session again.
                  </span>
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Leave Meeting</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        className={cn(
                            "rounded-full p-2",
                            !micState ? "border border-a11y/20 bg-transparent" : "bg-konn3ct-red",
                        )}
                        onClick={async () => {
                            if(!CurrentUserRoleIsModerator(participantList, user) && manageUserSettings.disableMic) {
                                toast({
                                    variant: "destructive",
                                    title: "Access Denied",
                                    description: `Your Microphone has been disabled by the Moderator.`,
                                });

                                return;
                            }
                            websocketMuteMic();
                        }}
                    >
                        {!micState ? (
                            <MicOnIcon className="h-6 w-6 "/>
                        ) : (
                            <MicOffIcon className="h-6 w-6 "/>
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{!micState ? "Mute Mic" : "Unmute Mic"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {(CurrentUserRoleIsModerator(participantList, user) || !manageUserSettings.disableCam) && (<button
                        className={cn(
                            "rounded-full p-2",
                            videoState ? "border border-a11y/20 bg-transparent" : "bg-konn3ct-red",
                        )}
                        onClick={async () => {
                            if (videoState) {
                                websocketStopCamera(
                                    `${user?.meetingDetails?.internalUserID}${user?.meetingDetails
                                        ?.authToken}${participantCameraList.filter(
                                        (item: any) =>
                                            item?.intId == user?.meetingDetails?.internalUserID,
                                    )[0]?.deviceID}`,
                                );

                                stopCameraStream(cameraStream);
                                setVideoState(!videoState);

                                let ur = participantCameraList.filter(
                                    (item: any) =>
                                        item?.intId != user?.meetingDetails?.internalUserID,
                                );
                    console.log("setParticipantCameraList: remove stream ", ur);
                    setParticipantCameraList(ur);

                    console.log("ParticipantCameraList: ",participantCameraList);

                    return;
                  }

                  const devices = await navigator.mediaDevices.enumerateDevices();
                  const desiredCamera = devices.filter((device) => device.kind === "videoinput");

                  if(desiredCamera.length < 1){
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Something went wrong.",
                      description: `No camera device detected. Kindly check if you need to grant permission`,
                    });
                    return;
                  }

                  const video = await requestCameraAccess(selectedCamera == null ? desiredCamera[0] : selectedCamera, selectedVideoQuality);
                  if (video) {
                    console.log('Camera is on');
                    setCameraSteam(video);
                    setVideoState(!videoState);

                    if(selectedCamera == null && desiredCamera[0] != undefined){
                      setSelectedCamera(desiredCamera[0]);
                    }

                    // update the connected users state for the user where the id is the same
                    let newRecord:IParticipantCamera={
                      intId:user?.meetingDetails?.internalUserID,
                      streamID:`${user?.meetingDetails?.internalUserID}${user?.meetingDetails?.authToken}${selectedCamera == null ? desiredCamera[0]?.deviceId : selectedCamera.deviceId}`,
                      id:desiredCamera[0]?.groupId,
                      deviceID: desiredCamera[0]?.deviceId,
                      stream:video
                    }

                    setParticipantCameraList([...participantCameraList,newRecord])

                    console.log("ParticipantCameraList: ",participantCameraList);

                  } else {
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Something went wrong.",
                      description: "Kindly check your camera settings.",
                    });
                  }
                }}
            >
              {videoState ? (
                  <VideoOnIcon className="h-6 w-6 " />
              ) : (
                  <VideoOffIcon className="h-6 w-6 " />
              )}
            </button>)}
          </TooltipTrigger>
          <TooltipContent>
            <p>{videoState ? "Turn Off Camera" : "Turn On Camera"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>



      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {CurrentUserIsPresenter(participantList, user) && (
                <button
                    className={cn(
                        "rounded-full p-2",
                        screenShareState
                            ? "border border-a11y/20 bg-transparent"
                            : "bg-konn3ct-red",
                    )}
                    onClick={async () => {
                      if (screenShareState && screenSharingStream) {

                        websocketKurentoScreenshareEndScreenshare(screenSharingStream);

                        setScreenSharingStream(null);
                        setScreenShareState(false);

                        return;
                      }
                      const screen = await requestScreenSharingAccess();

                      setScreen(screen);

                      if (screen) {
                        setScreenSharingStream(screen);
                        // update the connected users state for the user where the id is the same
                        setConnectedUsers((prev) =>
                            prev.map((prevUser) => {
                              if (prevUser.id === user?.id) {
                                return {
                                  ...prevUser,
                                  screenSharingFeed: screen,
                                  isScreenSharing: true,
                                };
                              }
                              return prevUser;
                            }),
                        );
                        setScreenShareState(!screenShareState);
                      } else {
                        // toast({
                        //   variant: "destructive",
                        //   title: "Uh oh! Something went wrong.",
                        //   description: "Kindly check your screen sharing settings.",
                        // });
                      }
                    }}
                >
                  {screenShareState ? (
                      <ShareScreenOnIcon className="h-6 w-6 " />
                  ) : (
                      <ShareScreenOffIcon className="h-6 w-6 " />
                  )}
                </button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>{!screenShareState ? "Share your screen" : "Stop Sharing Screen"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

        <DropdownMenu>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <button className="items-center rounded-full border border-a11y/20 bg-transparent p-2">
                                    <EllipsisIcon className="h-6 w-6"/>
                                </button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>More Options</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            <DropdownMenuContent className="mb-2 w-52 rounded-b-none border-0 bg-primary text-a11y md:mb-3 md:rounded-b-md">
                <div className="absolute bottom-0 right-[45%] hidden h-0 w-0 border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-primary md:block"></div>
                <DropdownMenuGroup className="py-1">
                    {breakOutRoomState.isActive ? (
                        <DropdownMenuItem
                            onClick={() => {
                                setBreakOutRoomState((prev) => ({
                                    ...prev,
                                    step: 2,
                                }));
                            }}
                            className="bg-[#DF2622]"
                        >
                            <RecordOnIcon className="mr-2 h-5 w-5" />
                            <span>View Breakout Rooms</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={() => {
                                setBreakOutRoomState((prev) => ({
                                    ...prev,
                                    step: 1,
                                }));
                            }}
                        >
                            <RecordOnIcon className="mr-2 h-5 w-5" />
                            <span>Breakout Rooms</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="" />
                <DropdownMenuGroup className="py-1 md:hidden">
                    {user?.meetingDetails?.record == "true" ? recordingState.isActive ? (
                        <DropdownMenuItem
                            onClick={() => {
                                if (CurrentUserRoleIsModerator(participantList,user)) {
                                    setRecordingState((prev) => ({
                                        ...prev,
                                        step: 2,
                                    }));
                                } else {
                                    toast({
                                        variant: "destructive",
                                        title: "Permission Denied!!",
                                        description:
                                            "You dont have the permission for this action. Kindly chat with the host or moderator",
                                    });
                                }
                            }}
                            className="bg-[#DF2622]"
                        >
                            <RecordOnIcon className="mr-2 h-5 w-5" />
                            <span>End Recording</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={() => {
                                if (CurrentUserRoleIsModerator(participantList,user)) {
                                    setRecordingState((prev) => ({
                                        ...prev,
                                        step: 1,
                                    }));
                                } else {
                                    toast({
                                        variant: "destructive",
                                        title: "Permission Denied!!",
                                        description:
                                            "You dont have the permission for this action. Kindly chat with the host or moderator",
                                    });
                                }
                            }}
                        >
                            <RecordOnIcon className="mr-2 h-5 w-5" />
                            <span>{recordingState.isStarted ? "Start" : "Start"} Recording</span>
                        </DropdownMenuItem>
                    ) : null }
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuGroup>
                    {(CurrentUserRoleIsModerator(participantList, user) || !manageUserSettings.disablePublicChat) && (<DropdownMenuItem
                        onClick={() => {
                            setChatState(!chatState);
                            setIsNewMessage(false)
                        }}
                        className="relative py-2 md:hidden"
                    >
                        <ChatIcon className="mr-2 h-5 w-5" />
                        <span>Chat</span>
                        {isNewMessage && (
                            <div className="absolute left-5 top-2 h-2 w-2 animate-pulse rounded-full bg-a11y"></div>
                        )}
                    </DropdownMenuItem>)}
                    <DropdownMenuItem
                        onClick={() => {
                            // setChatState(!chatState);
                            window.location.reload();
                            toast({
                                title: "Rekonn3ct",
                                description: "Re-konn3cting, Please wait for few moment",
                            });
                        }}
                        className="py-2"
                    >
                        <RefreshIcon className="mr-2 h-5 w-5" />
                        <span>Rekonn3ct</span>
                    </DropdownMenuItem>
                    {/* disabled because its redundant with layout on settings */}
                    {/* <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <AllAppsIcon className="mr-1 h-6 w-6" />
                <span>Change layout</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="border-0 bg-primary text-a11y">
                  <DropdownMenuItem>
                    <span>Email</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Message</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub> */}
                    <DropdownMenuItem
                        onClick={() => {
                            document.documentElement.requestFullscreen();
                        }}
                        className="py-2"
                    >
                        <ExpandIcon className="mr-2 h-5 w-5" />
                        <span>Go Fullscreen</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setIsWhiteboardOpen(!isWhiteboardOpen);
                        }}
                        className="py-2"
                    >
                        <DesktopIcon className="mr-2 h-5 w-5" />
                        <span>
                {isWhiteboardOpen ? "Close White Board" : "White Board"}
              </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setConnectedUsers((prev) =>
                                prev.map((prevUser) => {
                                    if (prevUser.id === user?.id) {
                                        return {
                                            ...prevUser,
                                            isHandRaised: !prevUser.isHandRaised,
                                        };
                                    }
                                    return prevUser;
                                }),
                            );

                            var raiseH=false;
                            const updatedArray = participantList?.map(
                                (item: IParticipant) => {
                                    if (item.userId == user?.meetingDetails?.internalUserID) {
                                        raiseH=!item.raiseHand;
                                        return { ...item, raiseHand: !item.raiseHand };
                                    }
                                    return item;
                                },
                            );

                            console.log(updatedArray);

                            console.log("UserState: updatedArray", updatedArray);

                            setParticipantList(updatedArray);

                            websocketRaiseHand(raiseH);
                        }}
                        className="py-2 md:hidden"
                    >
                        {connectedUsers.find((user) => user.id === user.id)
                            ?.isHandRaised ? (
                            <HandOffIcon className="mr-2 h-5 w-5" />
                        ) : (
                            <HandOnIcon className="mr-2 h-5 w-5" />
                        )}
                        <span>
                {connectedUsers.find((user) => user.id === user.id)
                    ?.isHandRaised
                    ? "Lower Hand"
                    : "Raise Hand"}
              </span>
                    </DropdownMenuItem>
                    {CurrentUserIsPresenter(participantList, user) && (<DropdownMenuItem
                        onClick={() => {
                            setFileUploadModal((prev) => ({
                                ...prev,
                                step: 1,
                            }));
                        }}
                        className="py-2"
                    >
                        <FolderOpenIcon className="mr-2 h-5 w-5" />
                        <span>Upload Files</span>
                    </DropdownMenuItem>)}

                    {CurrentUserIsPresenter(participantList, user) && (
                        <DropdownMenuItem
                            onClick={() => {
                                if (eCinemaModal.isActive)
                                    return toast({
                                        variant: "destructive",
                                        title: "Uh oh! Something went wrong.",
                                        description:
                                            "You can't start a new eCinema session while one is ongoing.",
                                    });
                                setECinemaModal((prev) => ({
                                    ...prev,
                                    step: 1,
                                }));
                            }}
                            className="py-2 md:hidden"
                        >
                            <MovieColoredIcon className="mr-2 h-5 w-5" />
                            <span>ECinema</span>
                        </DropdownMenuItem>
                    )}

                    {CurrentUserIsPresenter(participantList, user) && (
                        <DropdownMenuItem
                            onClick={() => {
                                setManageUserSettings({...manageUserSettings, muteAllUsers: !manageUserSettings.muteAllUsers})
                                websocketMuteAllParticipants(
                                    user?.meetingDetails?.internalUserID,
                                );
                            }}
                            className="py-2"
                        >
                            {manageUserSettings.muteAllUsers ? <MicOnIcon className="mr-2 h-5 w-5" />: <MicOffIcon className="mr-2 h-5 w-5" />}
                            <span>{manageUserSettings.muteAllUsers ? "UnMute": "Mute"} All</span>
                        </DropdownMenuItem>
                    )}

                    {CurrentUserIsPresenter(participantList, user) && (
                        <DropdownMenuItem
                            onClick={() => {
                                if (pollModal.isActive || pollModal.isEnded) return;
                                setPollModal((prev) => ({
                                    ...prev,
                                    step: 1,
                                }));
                            }}
                            className="py-2"
                        >
                            <TextFormatIcon className="mr-2 h-5 w-5" />
                            <span>Polls</span>
                        </DropdownMenuItem>
                    )}

                    {!donationState.isActive && (
                        <DropdownMenuItem
                            className="py-2"
                            onClick={() => {
                                setDonationState((prev) => ({
                                    ...prev,
                                    step: 1,
                                }));
                            }}
                        >
                            <GiftIcon className="mr-2 h-5 w-5" />
                            <span>Donation</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {/*<DropdownMenuSub>*/}
                    {/*  <DropdownMenuSubTrigger className="py-2">*/}
                    {/*    <BotIcon className="mr-2 h-5 w-5" />*/}
                    {/*    <span>Konn3ct AI</span>*/}
                    {/*  </DropdownMenuSubTrigger>*/}
                    {/*  <DropdownMenuPortal>*/}
                    {/*    <DropdownMenuSubContent className="border-0 bg-primary text-a11y">*/}
                    {/*      <DropdownMenuItem>*/}
                    {/*        <span>Transcript</span>*/}
                    {/*      </DropdownMenuItem>*/}
                    {/*      <DropdownMenuItem>*/}
                    {/*        <span>Highlights</span>*/}
                    {/*      </DropdownMenuItem>*/}
                    {/*      <DropdownMenuItem>*/}
                    {/*        <span className="">Notes</span>*/}
                    {/*      </DropdownMenuItem>*/}
                    {/*      <DropdownMenuItem*/}
                    {/*        onClick={() => {*/}
                    {/*          setKonn3ctAiChatState(!konn3ctAiChatState);*/}
                    {/*        }}*/}
                    {/*        className="md:hidden"*/}
                    {/*      >*/}
                    {/*        <span className="">Chat</span>*/}
                    {/*      </DropdownMenuItem>*/}
                    {/*    </DropdownMenuSubContent>*/}
                    {/*  </DropdownMenuPortal>*/}
                    {/*</DropdownMenuSub>*/}

                    <DropdownMenuItem
                        onClick={() => {
                            setSettingsOpen(!settingsOpen);
                        }}
                        className="py-2"
                    >
                        <SettingsIcon className="mr-2 h-5 w-5" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>


      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="hidden items-center gap-1 rounded-3xl border border-a11y/40 bg-[#DF2622] p-2 md:flex">
              <button
                  onClick={() => {
                    setRoomCallModal(true);
                  }}
                  className="px-1"
              >
                <PhoneEndIcon className="h-6 w-6"/>
              </button>
              <Separator className=" bg-a11y/20 " orientation="vertical"/>
              {CurrentUserRoleIsModerator(participantList, user) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="px-1">
                        <EllipsisIcon className="h-6 w-6"/>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="mb-2 w-80 rounded-b-none border-0 bg-primary text-a11y md:mb-3 md:rounded-b-md">
                      <DropdownMenuGroup className="divide-y divide-a11y/20">
                        <DropdownMenuItem
                            onClick={() => {
                              setEndCallModal(true);
                            }}
                            className="flex items-start p-4 focus:bg-[#DF2622]"
                        >
                          <RecordOnIcon className="mr-2 h-5 w-5 shrink-0"/>
                          <div className="flex flex-col">
                            <span className="">End Room For All</span>
                            <span>
                      The session will end for everyone. You can't undo this
                      action.
                    </span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                              setRoomCallModal(true);
                            }}
                            className="flex items-start p-4"
                        >
                          <ExitIcon className="mr-2 h-5 w-5 shrink-0"/>
                          <div className="flex flex-col">
                            <span className="">Leave Room</span>
                            <span>
                      Others will continue after you leave. You can join the
                      session again.
                    </span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Leave Meeting</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>


    </div>
  );
}

export default MiddleSide;
