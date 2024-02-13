import Image from "next/image";
import React, { useState } from "react";
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
import { websocketMuteMic , websocketRaiseHand} from "~/server/Websocket";
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

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col font-inter text-a11y antialiased",
        inter.variable,
      )}
    >
      <ResolutionModal />
      <EndRecordingModal />
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
      <CCModal />
      <BreakOutModal />
      <div className="sticky top-0 z-50 flex h-16 w-full justify-between border-b border-a11y/20 bg-primary px-5 text-sm backdrop-blur-[3px] md:py-4">
        {/* left side */}
        <div className=" flex items-center gap-2 md:gap-5">
          <Image
            src={user?.meetingDetails?.customLogoURL ?? '/logo.png'}
            alt="logo"
            width={145}
            height={48}
            className="hidden md:block"
          />
          <Separator
            className="hidden bg-a11y md:block"
            orientation="vertical"
          />
          <div className="hidden flex-col md:flex">
            <span>{user?.meetingDetails?.confname}</span>
            <p>{new Date().toDateString()}</p>
          </div>
          <button
            onClick={() => {
              // copy link to clipboard and show toast
              const meetingId = user?.meetingId || "";

              if (navigator.clipboard) {
                navigator.clipboard.writeText(
                  `https://konn3ct.com/join/${meetingId}`,
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
          {recordingState.isActive && (
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
          )}
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
                  step:
                    participantList.filter(
                      (item: IParticipant) =>
                        item.intId == user?.meetingDetails?.internalUserID,
                    )[0]?.role == "MODERATOR"
                      ? 2
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
          {recordingState.isActive ? (
            <button
              onClick={() => {
                if (user?.meetingDetails?.role == "MODERATOR") {
                  setRecordingState((prev) => ({
                    ...prev,
                    step: 2,
                  }));
                } else {
                  toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
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
                if (user?.meetingDetails?.role == "MODERATOR") {
                  setRecordingState((prev) => ({
                    ...prev,
                    step: 1,
                  }));
                } else {
                  toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description:
                      "You dont have the permission for this action. Kindly chat with the host or moderator",
                  });
                }
              }}
              className="hidden items-center gap-2 rounded-lg border border-a11y/20 px-3 py-2 md:flex"
            >
              <RecordOnIcon className="h-6 w-6" />
              <span>Start Recording</span>
            </button>
          )}

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
          <button
            onClick={() => {
              setParticipantState(!participantState);
            }}
            className="flex items-center gap-2 rounded-lg border-a11y/20 bg-a11y/20 px-3 py-2 text-a11y md:border "
          >
            <PeoplesIcon className="h-5 w-5" />
            <span>{participantList.length}</span>
          </button>
        </div>
      </div>
      {children}
      <div className="sticky bottom-0 z-50 flex h-16 w-full justify-center border-t border-a11y/20 bg-primary px-5 text-sm backdrop-blur-[3px] md:justify-between">
        {/* left side */}
        <div className="hidden w-full items-center justify-start gap-5 md:flex">
          <button
            onClick={() => {
              // copy link to clipboard and show toast
              const meetingId = user?.meetingId || "";

              if (navigator.clipboard) {
                navigator.clipboard.writeText(
                  `https://konn3ct.com/join/${meetingId}`,
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
            <ShareIcon className="h-6 w-6" />
          </button>

          {participantList.filter(
            (item: IParticipant) =>
              item.intId == user?.meetingDetails?.internalUserID,
          )[0]?.presenter && (
            <button
              onClick={() => {
                setECinemaModal((prev) => ({
                  ...prev,
                  step: 1,
                }));
              }}
              className="items-center rounded-full border border-a11y/20 p-2"
            >
              <MovieColoredIcon className="h-6 w-6" />
            </button>
          )}

          <button
            onClick={() => {
              setKonn3ctAiChatState(!konn3ctAiChatState);
            }}
            className="items-center rounded-full border border-a11y/20 p-2"
          >
            <BotIcon className="h-6 w-6" />
          </button>
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
                  step:
                    participantList.filter(
                      (item: IParticipant) =>
                        item.intId == user?.meetingDetails?.internalUserID,
                    )[0]?.role == "MODERATOR"
                      ? 2
                      : 3,
                }));
              }}
              className="hidden items-center rounded-3xl border bg-a11y/20 p-2 text-xs text-a11y md:flex"
            >
              <MoneyIcon className="h-6 w-6 pt-1" />
              <span>Donation</span>
            </button>
          )}
        </div>

        {/* middle side */}
        <MiddleSide />

        {/* right side */}
        <div className="hidden w-full items-center justify-end gap-5 md:flex">
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


              const updatedArray = participantList?.map((item:IParticipant) => {
                if (item.userId == user?.meetingDetails?.internalUserID) {
                  return {...item, raiseHand: !item.raiseHand};
                }
                return item;
              });

              console.log(updatedArray);

              console.log("UserState: updatedArray", updatedArray);

              setParticipantList(updatedArray)

              websocketRaiseHand(user?.meetingDetails?.internalUserID);
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
              <HandOffIcon className="h-6 w-6" />
            ) : (
              <HandOnIcon className="h-6 w-6" />
            )}
          </button>
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
          <button
            onClick={() => {
              setChatState(!chatState);
            }}
            className="items-center rounded-full border border-a11y/20 bg-transparent p-2"
          >
            <ChatIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Authenticated;
