import Image from "next/image";
import React, { useState } from "react";
import MovieColoredIcon from "~/components/icon/outline/MovieColoredIcon";
import AllAppsIcon from "~/components/icon/outline/AllAppsIcon";
import BotIcon from "~/components/icon/outline/BotIcon";
import CCIcon from "~/components/icon/outline/CCIcon";
import ChatIcon from "~/components/icon/outline/ChatIcon";
import DesktopIcon from "~/components/icon/outline/DesktopIcon";
import EllipsisIcon from "~/components/icon/outline/EllipsisIcon";
import EmojiIcon from "~/components/icon/outline/EmojiIcon";
import ExpandIcon from "~/components/icon/outline/ExpandIcon";
import FolderOpenIcon from "~/components/icon/outline/FolderOpenIcon";
import HandOnIcon from "~/components/icon/outline/Hand/HandOnIcon";
import MicOffIcon from "~/components/icon/outline/MicOffIcon";
import MicOnIcon from "~/components/icon/outline/MicOnIcon";
import PeoplesIcon from "~/components/icon/outline/PeoplesIcon";
import PhoneEndIcon from "~/components/icon/outline/PhoneEndIcon";
import RecordOnIcon from "~/components/icon/outline/Record/RecordOnIcon";
import ShareIcon from "~/components/icon/outline/ShareIcon";
import ShareScreenOffIcon from "~/components/icon/outline/ShareScreenOffIcon";
import ShareScreenOnIcon from "~/components/icon/outline/ShareScreenOnIcon";
import TextFormatIcon from "~/components/icon/outline/TextFormatIcon";
import VideoOffIcon from "~/components/icon/outline/VideoOffIcon";
import VideoOnIcon from "~/components/icon/outline/VideoOnIcon";
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
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { inter } from "~/lib/fonts";
import { cn } from "~/lib/utils";
import MoneyIcon from "~/components/icon/outline/MoneyIcon";
import SettingsIcon from "~/components/icon/outline/SettingsIcon";
import Settings from "~/components/settings/Settings";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
  authUserState,
  cameraOpenState,
  cameraStreamState,
  chatModalState, connectionStatusState,
  micOpenState,
  microphoneStreamState, participantListState,
  participantsModalState,
  recordingModalState,
  screenSharingStreamState,
  settingsModalState,
} from "~/recoil/atom";
import requestMicrophoneAccess from "~/lib/microphone/requestMicrophoneAccess";
import {toast, useToast} from "~/components/ui/use-toast";
import ResolutionModal from "~/components/recording/ResolutionModal";
import EndRecordingModal from "~/components/recording/EndRecordingModal";
import ParticipantsModal from "~/components/participants/ParticipantsModal";
import requestScreenSharingAccess from "~/lib/screenSharing/requestScreenSharingAccess";
import requestCameraAccess from "~/lib/camera/requestCameraAccess";
import stopMicrophoneStream from "~/lib/microphone/stopMicrophoneStream";
import stopCameraStream from "~/lib/camera/stopCameraStream";
import stopScreenSharingStream from "~/lib/screenSharing/stopScreenSharingStream";
import ScreenSharingComponent from "~/components/screenSharing/ScreenSharingComponent";
import ChatModal from "~/components/chat/ChatModal";
import {websocketMuteMic} from "~/server/Websocket";

function Authenticated({ children }: { children: React.ReactNode }) {
  const [micState, setMicState] = useRecoilState(micOpenState);
  const [videoState, setVideoState] = useRecoilState(cameraOpenState);
  const [screenShareState, setScreenShareState] = useState(false);
  const [recordingState, setRecordingState] =
    useRecoilState(recordingModalState);
  const [participantState, setParticipantState] = useRecoilState(
    participantsModalState,
  );
  const [donationState, setDonationState] = useState(false);
  const [settingsOpen, setSettingsOpen] = useRecoilState(settingsModalState);
  const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);
  const [microphoneStream, setMicrophoneStream] = useRecoilState(
    microphoneStreamState,
  );
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );
  const [chatState, setChatState] = useRecoilState(chatModalState);

  const [user, setUser] = useRecoilState(authUserState);
  const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);
  const participantList = useRecoilValue(participantListState);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-stretch bg-background font-inter antialiased",
        inter.variable,
      )}
    >
      <ResolutionModal />
      <EndRecordingModal />
      <ParticipantsModal />
      <ChatModal />
      <div className="sticky top-0 z-50 flex w-full justify-between bg-konn3ct-green px-5 py-3 text-sm backdrop-blur-[3px] md:bg-white md:py-4">
        {/* left side */}
        <div className=" flex items-center gap-2 md:gap-5">
          <Image
            src="/logo.png"
            alt="logo"
            width={145}
            height={48}
            className="hidden md:block"
          />
          <Separator
            className="hidden bg-konn3ct-black md:block"
            orientation="vertical"
          />
          <div className="hidden flex-col md:flex">
            <span>{user?.meetingDetails?.confname}</span>
            <p>{new Date().toDateString()}</p>
          </div>
          <button className="items-center rounded-full border p-2 md:hidden">
            <ShareIcon className="h-6 w-6" />
          </button>
          {recordingState.isActive && (
            <button
              onClick={() => {
                setRecordingState((prev) => ({
                  ...prev,
                  step: 2,
                }));
              }}
              className={cn(
                "flex items-center gap-1 rounded-lg bg-konn3ct-red p-2 text-xs text-white md:hidden",
                donationState &&
                  recordingState.isActive &&
                  " rounded-full p-1.5",
              )}
            >
              <RecordOnIcon
                className={cn(
                  "h-6 w-6",
                  donationState && recordingState.isActive && "h-8 w-8",
                )}
              />
              <span
                className={cn(
                  donationState && recordingState.isActive && "hidden",
                )}
              >
                End Recording
              </span>
            </button>
          )}
          {donationState && (
            <button
              onClick={() => {
                setDonationState(!donationState);
              }}
              className="flex items-center rounded-3xl border bg-konn3ct-active p-2 text-xs text-white md:hidden"
            >
              <MoneyIcon className="h-6 w-6 pt-1" />
              <span>Donation</span>
            </button>
          )}
        </div>
        {/* right side */}
         <div className="flex items-center gap-2 md:gap-5">
          {recordingState.isActive ? (
            <button
              onClick={() => {
                if(user?.meetingDetails?.role == "MODERATOR") {

                  setRecordingState((prev) => ({
                    ...prev,
                    step: 2,
                  }));

              }else{
              toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: 'You to have the permission for this. Kindly chat with the host or moderator',
              });
            }}}
              className="hidden items-center gap-2 rounded-lg bg-konn3ct-red px-3 py-2 text-white md:flex"
            >
              <RecordOnIcon className="h-6 w-6 fill-white" />
              <span>End Recording</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if(user?.meetingDetails?.role == "MODERATOR") {
                  setRecordingState((prev) => ({
                    ...prev,
                    step: 1,
                  }));

              }else{
              toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: 'You to have the permission for this. Kindly chat with the host or moderator',
              });
            }}}
              className="hidden items-center gap-2 rounded-lg border px-3 py-2 md:flex"
            >
              <RecordOnIcon className="h-6 w-6 fill-black" />
              <span>Start Recording</span>
            </button>
          )}

          <button className="items-center rounded-full border p-2 md:hidden">
            <CCIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => {
              setParticipantState(!participantState);
            }}
            className="flex items-center gap-2 rounded-lg bg-konn3ct-active px-3 py-2 text-white md:border md:bg-transparent md:text-black"
          >
            <PeoplesIcon className="h-5 w-5 md:fill-black" />
            <span>{participantList.length}</span>
          </button>
        </div>
      </div>
      {children}
      <Settings />
      <div className="sticky bottom-0 z-50 flex w-full justify-center bg-konn3ct-green px-5 py-3 text-sm text-white backdrop-blur-[3px] md:justify-between">
        {/* left side */}
        <div className="hidden w-full items-center justify-start gap-5 md:flex">
          <button className="items-center rounded-full border p-2">
            <ShareIcon className="h-6 w-6" />
          </button>
          <button className="items-center rounded-full border p-2">
            <MovieColoredIcon className="h-6 w-6" />
          </button>
          <button className="items-center rounded-full border p-2">
            <BotIcon className="h-6 w-6" />
          </button>
        </div>

        {/* middle side */}
        <div className=" flex w-full items-center justify-center gap-5">
          <div className="flex h-full items-center gap-1 rounded-3xl bg-konn3ct-red p-2 md:hidden">
            <button className="px-1">
              <PhoneEndIcon className="h-6 w-6" />
            </button>
            <Separator
              className=" bg-konn3ct-black/20 "
              orientation="vertical"
            />
            <button className="px-1">
              <EllipsisIcon className="h-6 w-6" />
            </button>
          </div>
          <button
            className={cn(
              "rounded-full border p-2",
              micState ? "bg-transparent" : "bg-konn3ct-active",
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
              "rounded-full border p-2",
              videoState ? "bg-transparent" : "bg-konn3ct-active",
            )}
            onClick={async () => {
              if (videoState && cameraStream) {
                stopCameraStream(cameraStream);
                setCameraSteam(null);
                setVideoState(!videoState);
                return;
              }
              const video = await requestCameraAccess();
              if (video) {
                setCameraSteam(video);
                setVideoState(!videoState);
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
          </button>
          <button
            className={cn(
              "rounded-full border p-2",
              screenShareState ? "bg-transparent" : "bg-konn3ct-active",
            )}
            onClick={async () => {
              if (screenShareState && screenSharingStream) {
                stopScreenSharingStream(screenSharingStream);
                setScreenSharingStream(null);
                setScreenShareState(!screenShareState);
                return;
              }
              const screen = await requestScreenSharingAccess();
              if (screen) {
                setScreenSharingStream(screen);
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
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="items-center rounded-full border p-2">
                <EllipsisIcon className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mb-2 w-52 rounded-b-none border-0 bg-konn3ct-active text-white md:mb-3 md:rounded-b-md">
              <div className="absolute bottom-0 right-[45%] hidden h-0 w-0 border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-konn3ct-active md:block"></div>
              <DropdownMenuGroup className="py-2 md:hidden">
                {recordingState.isActive ? (
                  <DropdownMenuItem
                    onClick={() => {
                      setRecordingState((prev) => ({
                        ...prev,
                        step: 2,
                      }));
                    }}
                    className="bg-konn3ct-red"
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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <AllAppsIcon className="mr-1 h-6 w-6" />
                    <span>Change layout</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="border-0 bg-konn3ct-active text-white">
                      <DropdownMenuItem>
                        <span>Email</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Message</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem className="py-2">
                  <ExpandIcon className="mr-2 h-5 w-5" />
                  <span>Go Fullscreen</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <DesktopIcon className="mr-2 h-5 w-5" />
                  <span>White Board</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <FolderOpenIcon className="mr-2 h-5 w-5" />
                  <span>Upload Files</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <EmojiIcon className="mr-2 h-5 w-5" />
                  <span>Emoji</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <MicOffIcon className="mr-2 h-5 w-5" />
                  <span>Mute All</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <TextFormatIcon className="mr-2 h-5 w-5" />
                  <span>Polls</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="py-2"
                  onClick={() => {
                    setDonationState(!donationState);
                  }}
                >
                  <MoneyIcon className="ml-1 mr-1 h-5 w-5" />
                  <span>Donation</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="py-2">
                    <BotIcon className="ml-1 mr-1 h-5 w-5" />
                    <span>Konn3ct AI</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="border-0 bg-konn3ct-active text-white">
                      <DropdownMenuItem>
                        <span>Transcript</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Highlights</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span className="">Notes</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem className="hidden py-2 md:flex">
                  <ShareIcon className="ml-1 mr-1 h-5 w-5" />
                  <span>Invite/Share</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSettingsOpen(!settingsOpen);
                  }}
                  className="py-2"
                >
                  <SettingsIcon className="ml-1 mr-1 h-5 w-5" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="hidden h-full items-center gap-1 rounded-3xl bg-konn3ct-red p-2 md:flex">
            <button className="px-1">
              <PhoneEndIcon className="h-6 w-6" />
            </button>
            <Separator
              className=" bg-konn3ct-black/20 "
              orientation="vertical"
            />
            <button className="px-1">
              <EllipsisIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* right side */}
        <div className="hidden w-full items-center justify-end gap-5 md:flex">
          <button className="items-center rounded-full border p-2">
            <HandOnIcon className="h-6 w-6" />
          </button>
          <button className="items-center rounded-full border p-2">
            <CCIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => {
              setChatState(!chatState);
            }}
            className="items-center rounded-full border p-2"
          >
            <ChatIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Authenticated;
