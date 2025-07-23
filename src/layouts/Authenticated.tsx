import Image from "next/image";
import React, { useEffect, useState } from "react";
import MovieColoredIcon from "~/components/icon/outline/MovieColoredIcon";
import BotIcon from "~/components/icon/outline/BotIcon";
import CCIcon from "~/components/icon/outline/CCIcon";
import ChatIcon from "~/components/icon/outline/ChatIcon";
import HandOnIcon from "~/components/icon/outline/HandOnIcon";
import PeoplesIcon from "~/components/icon/outline/PeoplesIcon";
import ShareIcon from "~/components/icon/outline/ShareIcon";

import { Separator } from "~/components/ui/separator";
import { inter } from "~/lib/fonts";
import { cn } from "~/lib/utils";
import MoneyIcon from "~/components/icon/outline/MoneyIcon";
import Settings from "~/components/settings/Settings";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  authUserState,
  ccModalState,
  chatModalKonn3ctAiState,
  chatModalState,
  connectedUsersState,
  donationModalState,
  cameraOpenState,
  cameraStreamState,
  connectionStatusState,
  micOpenState,
  microphoneStreamState,
  participantListState,
  eCinemaModalState,
  participantsModalState,
  recordingModalState,
  newMessage, newRaiseHand, selectedSpeakersState, manageUserSettingsState, soundNotificationState,
} from "~/recoil/atom";
import requestMicrophoneAccess from "~/lib/microphone/requestMicrophoneAccess";

import ResolutionModal from "~/components/recording/ResolutionModal";
import EndRecordingModal from "~/components/recording/EndRecordingModal";
import ParticipantsModal from "~/components/participants/ParticipantsModal";
import ChatModal from "~/components/chat/ChatModal";
import EndCallModal from "~/components/endCall/EndCallModal";
import RecordOnIcon from "~/components/icon/outline/RecordOnIcon";
import MiddleSide from "~/components/footer/MiddleSide";
import DonationModal from "~/components/donation/DonationModal";
import ChatModalKonn3ctAi from "~/components/chat/ChatModalKonn3ctAi";
import ChatModalPrivateMessage from "~/components/chat/ChatModalPrivateMessage";
import PollModal from "~/components/poll/PollModal";
import { toast } from "~/components/ui/use-toast";
import ECinemaModal from "~/components/eCinema/ECinemaModal";
import CCModal from "~/components/cc/CCModal";
import RemoveUserModal from "~/components/participants/RemoveUserModal";
import LeaveRoomCallModal from "~/components/endCall/LeaveRoomCallModal";
import { IParticipant } from "~/types";
import BreakOutModal from "~/components/breakout/BreakOutModal";
import HandOffIcon from "~/components/icon/outline/HandOffIcon";
import FileUploadModal from "~/components/fileUpload/FileUploadModal";
import { Howl } from 'howler';
import RecordingConsentModal from "~/components/recording/RecordingConsentModal";
import {CurrentUserIsPresenter, CurrentUserRoleIsModerator} from "~/lib/checkFunctions";
import MediaOnboardingDialog from "~/lib/MediaOnboardingDialog";
import {kurentoAudioPlaySound} from "~/server/KurentoAudio";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip";
import PhoneEndIcon from "~/components/icon/outline/PhoneEndIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import EllipsisIcon from "~/components/icon/outline/EllipsisIcon";
import ExitIcon from "~/components/icon/outline/ExitIcon";
import {websocketRaiseHand} from "~/server/WebsocketActions";


function Authenticated({ children }: { children: React.ReactNode }) {
  const [recordingState, setRecordingState] =
    useRecoilState(recordingModalState);
  const [participantState, setParticipantState] = useRecoilState(
    participantsModalState,
  );
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);
  const [chatState, setChatState] = useRecoilState(chatModalState);

  const user = useRecoilValue(authUserState);
  const [donationState, setDonationState] = useRecoilState(donationModalState);
  const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);
  const [ccModal, setCCModal] = useRecoilState(ccModalState);
  const [konn3ctAiChatState, setKonn3ctAiChatState] = useRecoilState(
    chatModalKonn3ctAiState,
  );

  const [connectionStatus, setConnection] = useRecoilState(
    connectionStatusState,
  );

  const [participantList, setParticipantList] = useRecoilState(participantListState);

  const [soundNotification, setSoundNotification] = useRecoilState(soundNotificationState);

  const [isNewMessage, setIsNewMessage] = useRecoilState(newMessage);

  const [isnewRaiseHand, setIsnewRaiseHand] = useRecoilState(newRaiseHand);

  const [selectedSpeaker, setSelectedSpeaker] = useRecoilState(
      selectedSpeakersState,
  );

  const [manageUserSettings, setManageUserSettings] = useRecoilState(manageUserSettingsState);


  const sound = new Howl({
    src: ['/message.mp3'],
  });

  const raiseHandSound = new Howl({
    src: ['/finger-snaps.mp3'],
  });

  const NewMessageSound = "/message.mp3";
  const RaiseHandSound = "/finger-snaps.mp3";
  const WaitingSound = "/waiting_room.mp3";

  useEffect(() => {
    if(soundNotification.newMessage) {
      kurentoAudioPlaySound(NewMessageSound, selectedSpeaker?.deviceId);
    }

    if(soundNotification.newRaiseHand) {
      kurentoAudioPlaySound(RaiseHandSound, selectedSpeaker?.deviceId);
    }

    if(soundNotification.newWaitingUser) {
      kurentoAudioPlaySound(WaitingSound, selectedSpeaker?.deviceId);
    }

    // setSoundNotification({
    //   newMessage: false, newRaiseHand: false, newWaitingUser: false
    // })
  }, [soundNotification])


  return (
    <div
      className={cn(
        "flex min-h-svh flex-col font-inter text-a11y antialiased",
        inter.variable,
      )}
    >

      <ResolutionModal />
      <EndRecordingModal />
      <RecordingConsentModal />
      <ParticipantsModal />
      <RemoveUserModal />
      <ChatModal />
      <ChatModalKonn3ctAi />
      <ChatModalPrivateMessage />
      <EndCallModal />
      <LeaveRoomCallModal />
      <Settings />
      <DonationModal />
      <PollModal />
      <ECinemaModal />
      {user?.meetingDetails?.meetingID && <CCModal />}
      <BreakOutModal />
      <FileUploadModal />
      <div className="sticky top-0 z-50 flex h-16 w-full justify-between border-b border-a11y/20 bg-primary px-5 text-sm backdrop-blur-[3px] md:py-4">
        {/* left side */}
        <div className=" flex items-center gap-2 md:gap-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {user?.meetingDetails?.customLogoURL != null && user?.meetingDetails?.customLogoURL != "" &&
                    <Image
                        src={user?.meetingDetails?.customLogoURL!}
                        alt="logo"
                        width={60}
                        height={28}
                        className="hidden md:block"
                        loading="lazy"
                    />}
              </TooltipTrigger>
              <TooltipContent>
                <p>Conference Banner</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator
            className="hidden bg-a11y md:block"
            orientation="vertical"
          />
          <div className="hidden flex-col md:flex">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{user?.meetingDetails?.confname}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Conference Name</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p>{new Date().toDateString()}</p>
                </TooltipTrigger>
                <TooltipContent>
                <p>Conference Date</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <button
            onClick={() => {
              // copy link to clipboard and show toast
              const meetingId = user?.meetingId || "";

              if (navigator.clipboard) {
                navigator.clipboard.writeText(
                  user?.meetingDetails?.customdata[0]?.meetingLink,
                );
                toast({
                  title: "Copied",
                  description: "Link copied to clipboard",
                  duration: 5000,
                });
              } else {
                toast({
                  title: "Error",
                  description: "Your browser does not support clipboard",
                  duration: 5000,
                });
              }
            }}
            className="items-center rounded-full border border-a11y/20 p-2 md:hidden"
          >
            <ShareIcon className="h-6 w-6" />
          </button>
          {user?.meetingDetails?.record == "true" ? recordingState.isActive && (
            <button
              onClick={() => {
                setRecordingState((prev) => ({
                  ...prev,
                  step: 2,
                }));
              }}
              className={cn(
                "flex items-center gap-1 rounded-lg bg-[#DF2622] p-2 text-xs text-a11y md:hidden",
                donationState.isActive &&
                  recordingState.isActive &&
                  " rounded-full p-1.5",
              )}
            >
              <RecordOnIcon
                className={cn(
                  "h-6 w-6",
                  donationState.isActive &&
                    recordingState.isActive &&
                    "h-8 w-8",
                )}
              />
              <span
                className={cn(
                  donationState.isActive && recordingState.isActive && "hidden",
                )}
              >
                End Recording
              </span>
            </button>
          ) : null}
          {donationState.isActive && (
            <button
              onClick={() => {
                // TODO check if user is mod then set step to 2 else 3
                setDonationState((prev) => ({
                  ...prev,
                  // trigger admin view
                  // step: 2,
                  // trigger user view
                  // step: 3,
                  step: CurrentUserRoleIsModerator(participantList,user)  ? 2
                      : 3,
                }));
              }}
              className="flex items-center rounded-3xl border bg-a11y/20 p-2 text-xs text-a11y md:hidden"
            >
              <MoneyIcon className="h-6 w-6 pt-1" />
              <span>Donation</span>
            </button>
          )}
        </div>
        {/* right side */}
        <div className="flex items-center gap-2 md:gap-5">
          {user?.meetingDetails?.record == "true" ? recordingState.isActive ? (
            <button
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
              className="hidden items-center gap-2 rounded-lg bg-[#DF2622] px-3 py-2 md:flex"
            >
              <RecordOnIcon className="h-6 w-6" />
              <span>End Recording</span>
            </button>
          ) : (
            <button
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
              className="hidden items-center gap-2 rounded-lg border border-a11y/20 px-3 py-2 md:flex"
            >
              <RecordOnIcon className="h-6 w-6" />
              <span>{recordingState.isStarted ? "Start" : "Start"} Recording</span>
            </button>
          ): null}

          <button
            onClick={() => {
              setCCModal((prev) => ({
                ...prev,
                isActive: true,
                step: 1,
              }));
            }}
            className="items-center rounded-full border border-a11y/20 p-2 md:hidden"
          >
            <CCIcon className="h-6 w-6" />
          </button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {(CurrentUserRoleIsModerator(participantList, user) || !manageUserSettings.hideUserList) && (<button
                    onClick={() => {
                      setParticipantState(!participantState);
                    }}
                    className="flex items-center gap-2 rounded-lg border-a11y/20 bg-a11y/20 px-3 py-2 text-a11y md:border "
                >
                  <PeoplesIcon className="h-5 w-5" />
                  <span>{participantList.length}</span>
                </button>)}
              </TooltipTrigger>
              <TooltipContent>
                <p>Participant List</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {children}
      <div className="sticky bottom-0 z-50 flex h-16 w-full justify-center border-t border-a11y/20 bg-primary px-5 text-sm backdrop-blur-[3px] md:justify-between">
        {/* left side */}
        <div className="hidden w-full items-center justify-start gap-5 md:flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                    onClick={() => {
                      // copy link to clipboard and show toast
                      const meetingId = user?.meetingId || "";

                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(
                            user?.meetingDetails?.customdata[0]?.meetingLink,
                        );
                        toast({
                          title: "Copied",
                          description: "Link copied to clipboard",
                          duration: 5000,
                        });
                      } else {
                        toast({
                          title: "Error",
                          description: "Your browser does not support clipboard",
                          duration: 5000,
                        });
                      }
                    }}
                    className="items-center rounded-full border border-a11y/20 p-2"
                >
                  <ShareIcon className="h-6 w-6"/>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Meeting Link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {CurrentUserIsPresenter(participantList, user) && (
                    <button
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
                        className="items-center rounded-full border border-a11y/20 p-2"
                    >
                      <MovieColoredIcon className="h-6 w-6"/>
                    </button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>E-Cinema</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                    onClick={() => {
                      setKonn3ctAiChatState(!konn3ctAiChatState);
                    }}
                    className="items-center rounded-full border border-a11y/20 p-2"
                >
                  <BotIcon className="h-6 w-6"/>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Konn3ct AI for Meeting Summary</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {donationState.isActive && (
                    <button
                        onClick={() => {
                          // TODO check if user is mod then set step to 2 else 3
                          setDonationState((prev) => ({
                            ...prev,
                            // trigger admin view
                            // step: 2,
                            // trigger user view
                            // step: 3,
                            step: CurrentUserRoleIsModerator(participantList,user)? 2 : 3,
                          }));
                        }}
                        className="hidden items-center rounded-3xl border bg-a11y/20 p-2 text-xs text-a11y md:flex"
                    >
                      <MoneyIcon className="h-6 w-6 pt-1" />
                      <span>Donation</span>
                    </button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>Make Donation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>

        {/* middle side */}
        <MiddleSide />

        {/* right side */}
        <div className="hidden w-full items-center justify-end gap-5 md:flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                    onClick={() => {

                      setParticipantList((prev: any[]) =>
                          prev.map((prevUser) => {
                            if (prevUser.intId === user?.meetingDetails?.internalUserID) {
                              return {
                                ...prevUser,
                                raiseHand: !prevUser.raiseHand,
                              };
                            }
                            return prevUser;
                          }),
                      );


                      var raiseH = false;
                      const updatedArray = participantList?.map((item: IParticipant) => {
                        if (item.userId == user?.meetingDetails?.internalUserID) {
                          raiseH = !item.raiseHand;
                          return {...item, raiseHand: !item.raiseHand};
                        }
                        return item;
                      });

                      console.log(updatedArray);

                      console.log("UserState: updatedArray", updatedArray);

                      setParticipantList(updatedArray)

                      websocketRaiseHand(user?.meetingDetails?.internalUserID!,raiseH);
                    }}
                    className={cn(
                        "items-center rounded-full border border-a11y/20 bg-transparent p-2",
                        participantList.filter(
                            (item: IParticipant) =>
                                item.intId == user?.meetingDetails?.internalUserID,
                        )[0]?.raiseHand && "bg-a11y/20",
                    )}
                >
                  {participantList.filter(
                      (item: IParticipant) =>
                          item.intId == user?.meetingDetails?.internalUserID,
                  )[0]?.raiseHand ? (
                      <HandOffIcon className="h-6 w-6"/>
                  ) : (
                      <HandOnIcon className="h-6 w-6"/>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{participantList.filter(
                    (item: IParticipant) =>
                        item.intId == user?.meetingDetails?.internalUserID,
                )[0]?.raiseHand ? "Unraise Hand": "Raise Hand"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


          <button
            onClick={() => {
              setCCModal((prev) => ({
                ...prev,
                isActive: true,
                step: 1,
              }));
            }}
            className="items-center rounded-full border border-a11y/20 bg-transparent p-2"
          >
            <CCIcon className="h-6 w-6" />
          </button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {(CurrentUserRoleIsModerator(participantList, user) || !manageUserSettings.disablePublicChat) && (<button
                    onClick={() => {
                      setChatState(!chatState);
                      setIsNewMessage(false);
                    }}
                    className="relative items-center rounded-full border border-a11y/20 bg-transparent p-2"
                >
                  <ChatIcon className="h-6 w-6"/>
                  {isNewMessage && (
                      <div className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-a11y"></div>
                  )}
                </button>)}
              </TooltipTrigger>
              <TooltipContent>
                <p>Chat with Everyone</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
      </div>
    </div>
  );
}

export default Authenticated;
