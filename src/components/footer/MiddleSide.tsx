import React from "react";
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
  whiteBoardOpenState, participantListState, connectionStatusState,
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
import {websocketMuteMic, websocketStopCamera} from "~/server/Websocket";
import {IParticipant, IParticipantCamera} from "~/types";
import MovieColoredIcon from "../icon/outline/MovieColoredIcon";

function MiddleSide() {
  const [settingsOpen, setSettingsOpen] = useRecoilState(settingsModalState);
  const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);
  const [microphoneStream, setMicrophoneStream] = useRecoilState(microphoneStreamState,);
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(screenSharingStreamState,);
  const [recordingState, setRecordingState] = useRecoilState(recordingModalState);
  const [donationState, setDonationState] = useRecoilState(donationModalState);
  const [chatState, setChatState] = useRecoilState(chatModalState);
  const [endCallModal, setEndCallModal] = useRecoilState(endCallModalState);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useRecoilState(whiteBoardOpenState);
  const [connectedUsers, setConnectedUsers] = useRecoilState(connectedUsersState);
  const { toast } = useToast();

  const user = useRecoilValue(authUserState);
  const participantList = useRecoilValue(participantListState);
  const [micState, setMicState] = useRecoilState(micOpenState);
  const [videoState, setVideoState] = useRecoilState(cameraOpenState);
  const [screenShareState, setScreenShareState] = useRecoilState(screenSharingState);
  const [participantCameraList, setParticipantCameraList] = useRecoilState(participantCameraListState);

  const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);
  const [pollModal, setPollModal] = useRecoilState(pollModalState);
  const [konn3ctAiChatState, setKonn3ctAiChatState] = useRecoilState(
    chatModalKonn3ctAiState,
  );
  const [leaveRoomCallModal, setRoomCallModal] = useRecoilState(
    leaveRoomCallModalState,
  );


  return (
    <div className=" flex w-full items-center justify-center gap-5">
      <div className="flex items-center gap-1 rounded-3xl border border-a11y/40 bg-[#DF2622] p-2 md:hidden">
        <button
          onClick={() => {
            setEndCallModal(true);
          }}
          className="px-1"
        >
          <PhoneEndIcon className="h-6 w-6" />
        </button>
        <Separator className="w-0.5 bg-a11y/20" orientation="vertical" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-1">
              <EllipsisIcon className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mb-5 w-80 rounded-b-none border-0 bg-primary text-a11y md:mb-3 md:hidden md:rounded-b-md">
            <DropdownMenuGroup className="divide-y divide-a11y/20">
              <DropdownMenuItem
                onClick={() => {
                  setEndCallModal(true);
                }}
                className="flex items-start p-4 focus:bg-[#DF2622]"
              >
                <RecordOnIcon className="mr-2 h-5 w-5 shrink-0" />
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
                <ExitIcon className="mr-2 h-5 w-5 shrink-0" />
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
      </div>
      <button
        className={cn(
          "rounded-full p-2",
          !micState ? "border border-a11y/20 bg-transparent" : "bg-a11y/20",
        )}
        onClick={async () => {
          setMicState(!micState);
          websocketMuteMic();
        }}
      >
        {!micState ? (
          <MicOnIcon className="h-6 w-6 " />
        ) : (
          <MicOffIcon className="h-6 w-6 " />
        )}
      </button>
      <button
        className={cn(
          "rounded-full p-2",
          videoState ? "border border-a11y/20 bg-transparent" : "bg-a11y/20",
        )}
        onClick={async () => {
          if (videoState) {
            // stopCameraStream(cameraStream);
            // update the connected users state for the user where the id is the same
            // setConnectedUsers((prev) =>
            //   prev.map((prevUser) => {
            //     if (prevUser.id === user?.id) {
            //       return {
            //         ...prevUser,
            //         cameraFeed: null,
            //         isCameraOpen: false,
            //       };
            //     }
            //     return prevUser;
            //   }),
            // );
            // setCameraSteam(null);
            websocketStopCamera(`${user?.meetingDetails?.internalUserID}${user?.meetingDetails?.authToken}${participantCameraList.filter((item:any) => item?.intId != user?.meetingDetails?.internalUserID)[0]?.deviceID}`);
            setVideoState(!videoState);

            let ur=participantCameraList.filter((item:any) => item?.intId != user?.meetingDetails?.internalUserID);
            console.log("setParticipantCameraList: remove stream ",ur)
            setParticipantCameraList(ur);

            return;
          }

          navigator.mediaDevices
              .getUserMedia({
                video: true,
                audio: false,
              })
              .then((cameraStream) => {
                setVideoState(!videoState);
                let newRecord:IParticipantCamera={
                  intId:user?.meetingDetails?.internalUserID,
                  streamID:'6776767',
                  id:'55656',
                  deviceID:'4444',
                  stream:cameraStream
                }

                setParticipantCameraList([...participantCameraList,newRecord])

              })
              .catch((error) => {
                console.error('Error accessing camera:', error);
                toast({
                  variant: "destructive",
                  title: "Uh oh! Something went wrong.",
                  description: `Error accessing camera: ${error}`,
                });
              });

          // const video = await requestCameraAccess();
          // if (video) {
          //   console.log('Camera is on');
          //   setCameraSteam(video);
          //   // update the connected users state for the user where the id is the same
          //   setConnectedUsers((prev) =>
          //     prev.map((prevUser) => {
          //       if (prevUser.id === user?.id) {
          //         return {
          //           ...prevUser,
          //           cameraFeed: video,
          //           isCameraOpen: true,
          //         };
          //       }
          //       return prevUser;
          //     }),
          //   );
          //   setVideoState(!videoState);
          //   let newRecord:IParticipantCamera={
          //     intId:user?.meetingDetails.internalUserID,
          //     streamID:'6776767',
          //     id:'55656',
          //     deviceID:'4444',
          //     stream:video
          //   }
          //
          //   setParticipantCameraList([...participantCameraList,newRecord])
          //
          // } else {
          //   toast({
          //     variant: "destructive",
          //     title: "Uh oh! Something went wrong.",
          //     description: "Kindly check your camera settings.",
          //   });
          // }
        }}
      >
        {videoState ? (
          <VideoOnIcon className="h-6 w-6 " />
        ) : (
          <VideoOffIcon className="h-6 w-6 " />
        )}
      </button>

      { participantList.filter((eachItem:IParticipant) => eachItem?.intId == user?.meetingDetails?.internalUserID).map((eachItem:IParticipant) => ( eachItem.presenter && <button
        className={cn(
          "rounded-full p-2",
          screenShareState
            ? "border border-a11y/20 bg-transparent"
            : "bg-a11y/20",
        )}
        onClick={async () => {
          if (screenShareState && screenSharingStream) {
            stopScreenSharingStream(screenSharingStream);
            // update the connected users state for the user where the id is the same
            setConnectedUsers((prev) =>
              prev.map((prevUser) => {
                if (prevUser.id === user?.id) {
                  return {
                    ...prevUser,
                    screenSharingFeed: null,
                    isScreenSharing: false,
                  };
                }
                return prevUser;
              }),
            );
            setScreenSharingStream(null);
            setScreenShareState(!screenShareState);
            return;
          }
          const screen = await requestScreenSharingAccess();
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
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "Kindly check your screen sharing settings.",
            });
          }
        }}
      >
        {screenShareState ? (
          <ShareScreenOnIcon className="h-6 w-6 " />
        ) : (
          <ShareScreenOffIcon className="h-6 w-6 " />
        )}
      </button>))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="items-center rounded-full border border-a11y/20 bg-transparent p-2">
            <EllipsisIcon className="h-6 w-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mb-2 w-52 rounded-b-none border-0 bg-primary text-a11y md:mb-3 md:rounded-b-md">
          <div className="absolute bottom-0 right-[45%] hidden h-0 w-0 border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-primary md:block"></div>
          <DropdownMenuGroup className="py-2 md:hidden">
            {recordingState.isActive ? (
              <DropdownMenuItem
                onClick={() => {
                  setRecordingState((prev) => ({
                    ...prev,
                    step: 2,
                  }));
                }}
                className="bg-[#DF2622]"
              >
                <RecordOnIcon className="mr-2 h-5 w-5" />
                <span>End Recording</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  setRecordingState((prev) => ({
                    ...prev,
                    step: 1,
                  }));
                }}
              >
                <RecordOnIcon className="mr-2 h-5 w-5" />
                <span>Start Recording</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="md:hidden" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setChatState(!chatState);
              }}
              className="py-2 md:hidden"
            >
              <ChatIcon className="mr-2 h-5 w-5" />
              <span>Chat</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // setChatState(!chatState);
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
            <DropdownMenuItem className="py-2">
              <FolderOpenIcon className="mr-2 h-5 w-5" />
              <span>Upload Files</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (eCinemaModal.isActive)
                  return toast({
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
            <DropdownMenuItem className="py-2">
              <MicOffIcon className="mr-2 h-5 w-5" />
              <span>Mute All</span>
            </DropdownMenuItem>
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
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="py-2">
                <BotIcon className="mr-2 h-5 w-5" />
                <span>Konn3ct AI</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="border-0 bg-primary text-a11y">
                  <DropdownMenuItem>
                    <span>Transcript</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Highlights</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="">Notes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setKonn3ctAiChatState(!konn3ctAiChatState);
                    }}
                    className="md:hidden"
                  >
                    <span className="">Chat</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

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
      <div className="hidden items-center gap-1 rounded-3xl border border-a11y/40 bg-[#DF2622] p-2 md:flex">
        <button
          onClick={() => {
            setEndCallModal(true);
          }}
          className="px-1"
        >
          <PhoneEndIcon className="h-6 w-6" />
        </button>
        <Separator className=" bg-a11y/20 " orientation="vertical" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-1">
              <EllipsisIcon className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mb-2 w-80 rounded-b-none border-0 bg-primary text-a11y md:mb-3 md:rounded-b-md">
            <DropdownMenuGroup className="divide-y divide-a11y/20">
              <DropdownMenuItem
                onClick={() => {
                  setEndCallModal(true);
                }}
                className="flex items-start p-4 focus:bg-[#DF2622]"
              >
                <RecordOnIcon className="mr-2 h-5 w-5 shrink-0" />
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
                <ExitIcon className="mr-2 h-5 w-5 shrink-0" />
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
      </div>
    </div>
  );
}

export default MiddleSide;
