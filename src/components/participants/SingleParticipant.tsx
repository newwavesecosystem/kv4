import React, { useState } from "react";
import DummyChat from "~/data/dummyChat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import InformationIcon from "../icon/outline/InformationIcon";
import {
  authUserState,
  privateChatModalState,
  removeUserModalState,
  participantTalkingListState, participantListState, manageUserSettingsState
} from "~/recoil/atom";
import { useRecoilState, useRecoilValue } from "recoil";
import VolumeOnIcon from "../icon/outline/VolumeOnIcon";
import ChatIcon from "../icon/outline/ChatIcon";
import MicOffIcon from "../icon/outline/MicOffIcon";
import PeopleRemove from "../icon/outline/PeopleRemove";
import RepeatIcon from "../icon/outline/RepeatIcon";
import MicOnIcon from "~/components/icon/outline/MicOnIcon";
import userRolesData from "~/data/userRolesData";
import {
  websocketMuteParticipants,
  websocketParticipantsChangeRole,
  websocketPresenter,
  websocketStartPrivateChat
} from "~/server/Websocket";
import {IParticipant, IVoiceUser} from "~/types";
import {CurrentUserRoleIsModerator, FindAvatarfromUserId, ModeratorRole, ViewerRole} from "~/lib/checkFunctions";
import Image from "next/image";
import HandOnIcon from "~/components/icon/outline/HandOnIcon";
import VolumeOffIcon from "~/components/icon/outline/VolumeOffIcon";
import {cn} from "~/lib/utils";

function SingleParticipant({
  participant,
}: {
  participant: IParticipant;
}) {
  const [open, setOpen] = useState(false);
  const user = useRecoilValue(authUserState);
  const talkingList = useRecoilValue(participantTalkingListState);
  const [removeParticipant, setRemoveParticipant] =
    useRecoilState(removeUserModalState);
  const [privateChatState, setPrivateChatState] = useRecoilState(privateChatModalState);
  const participantList = useRecoilValue(participantListState);
  const [manageUserSettings, setManageUserSettings] = useRecoilState(manageUserSettingsState);


  const displayActions=(item:any,index:number)=>{
    return (<DropdownMenuItem onClick={()=>{
      if(item.id==1){
        websocketParticipantsChangeRole(participant.userId,1);
      }

      if(item.id==4){
        websocketPresenter(participant.userId);
      }

      if(item.id==5){
        websocketParticipantsChangeRole(participant.userId,2);
      }
    }} key={index} className="py-2">
      {item.name}
    </DropdownMenuItem>);
  }
  return (
    <div className="flex justify-between border-b border-b-a11y/20 py-4 text-sm">
      <div className="flex items-center gap-3">
        <Image
            src={participant.avatar}
            width={20}
            height={20}
            className="h-9 w-9 rounded-full bg-secondary/40"
            alt="profile picture"
        />
        <div className="flex flex-col">
          <span className="font-bold">
            {participant.name}
            {user?.meetingDetails?.internalUserID === participant.intId && " (You)"}
          </span>

          <div>
            {participant.role === ModeratorRole() && (<span className="text-xs">Moderator</span>) }
            {participant.presenter && (<span className="text-xs"> | Presenter</span>) }
            {participant.mobile && (<span className="text-xs"> | Mobile</span>) }
          </div>
          {/*<span className="text-xs">host</span>*/}
        </div>
      </div>
      {participant.id != user?.id.toString() && <div className=" flex items-center gap-2">

        <button>
          {participant.raiseHand && <HandOnIcon className="h-6 w-6"/>}
        </button>

        <button
            className={cn(
                "p-1 z-10",
                talkingList
                    .filter((eachItem: any) => eachItem?.intId == participant.intId)
                    .map((eachItem: any) =>
                        eachItem?.joined && eachItem?.muted
                            ? "rounded-full border border-konn3ct-red bg-white"
                            : "rounded-full border border-black/20",
                    ),
            )}
        >
          {talkingList
              .filter((eachItem: any, index: number) => eachItem?.intId == participant.intId)
              .map((eachItem: any,i:number) =>
                  !eachItem?.joined ? (
                      <VolumeOffIcon key={i} className="h-5 w-5 "/>
                  ) : eachItem?.joined && !eachItem?.muted ? (
                      <MicOnIcon key={i} className="h-5 w-5 "/>
                  ) : (
                      <MicOffIcon muted={true} key={i} className="h-5 w-5 "/>
                  ),
              )}
        </button>

        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button>
              <EllipsisIcon className="h-6 w-6 "/>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
              align="end"
              className="divide-y divide-a11y/20 border-a11y/20 bg-primary text-a11y shadow-lg"
          >
            {CurrentUserRoleIsModerator(participantList, user) && <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <RepeatIcon className="mr-2 h-5 w-5"/>
                Change Role
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                    className="divide-y divide-a11y/20 border border-a11y/20 bg-primary text-a11y shadow-2xl">
                  {userRolesData.map((item: any, index: number) => {

                    if (participant.role !== ModeratorRole() && item.id === 1) {
                      return displayActions(item, index);
                    }

                    if (participant.role !== ViewerRole() && item.id === 5 && participant.intId != user?.meetingDetails?.internalUserID) {
                      return displayActions(item, index);
                    }

                    if (!participant.presenter && item.id === 4) {
                      return displayActions(item, index);
                    }

                    // Make sure to handle the case where neither condition is met
                    return null;
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>}

            {CurrentUserRoleIsModerator(participantList, user) && talkingList.filter((eachItem: IVoiceUser) =>
                eachItem?.intId == participant.intId && eachItem?.joined && !eachItem?.muted).length > 0 && (
                <DropdownMenuItem className="py-4" onClick={() => {
                  websocketMuteParticipants(participant.userId);
                }}>
                  <VolumeOnIcon volume={1} className="mr-2 h-5 w-5"/>
                  Mute User
                </DropdownMenuItem>)}

            {user?.meetingDetails?.internalUserID == participant.intId ? null : (CurrentUserRoleIsModerator(participantList, user) || !manageUserSettings.disablePrivateChat) && (
                <DropdownMenuItem
                    onClick={() => {
                      if (!user) return;

                      console.log("Private Chat: searching in privateChatState.users", privateChatState.users)

                      if (privateChatState.users.filter((item) => item.id == participant.intId).length > 0) {
                        console.log("Private Chat: searching in privateChatState.chatRooms", privateChatState.chatRooms)
                        privateChatState.chatRooms.map((citem) => {
                          citem.participants.map((ccitem) => {
                            if (ccitem.id == participant.intId) {
                              setPrivateChatState((prev) => ({
                                ...prev,
                                isActive: true,
                                id: citem.chatId,
                              }));

                              return;
                            }
                          });
                        });

                        return;
                      }

                      console.log("Private Chat: starting a new chat")
                      websocketStartPrivateChat(participant);
                      setPrivateChatState({
                        ...privateChatState,
                        // isActive: !privateChatState.isActive,
                        users: [
                          // {
                          //   email: user.email,
                          //   fullName: user.fullName,
                          //   id: user.id,
                          // },
                          ...privateChatState.users,
                          {
                            email: participant.extId,
                            fullName: participant.name,
                            id: participant.intId,
                          },
                        ],
                        isActive: true,
                      });
                    }}
                    className="py-4"
                >
                  <ChatIcon className="mr-2 h-5 w-5"/>
                  Private Chat
                </DropdownMenuItem>)}

            {user?.meetingDetails?.internalUserID == participant.intId ? null : CurrentUserRoleIsModerator(participantList, user) &&
                <DropdownMenuItem
                    onClick={() => {
                      setRemoveParticipant({
                        ...removeParticipant,
                        isActive: !removeParticipant.isActive,
                        userId: participant.intId,
                        userFullName: participant.name,
                      });
                    }}
                    className="py-4"
                >
                  <PeopleRemove className="mr-2 h-5 w-5"/>
                  Remove User
                </DropdownMenuItem>}

          </DropdownMenuContent>
        </DropdownMenu>


      </div>}
    </div>
  );
}

export default SingleParticipant;
