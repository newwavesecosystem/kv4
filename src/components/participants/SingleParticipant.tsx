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
  participantTalkingListState, participantListState
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
import {IParticipant} from "~/types";

function SingleParticipant({
  key,
  participant,
}: {
  key: number;
  participant: IParticipant;
}) {
  const [open, setOpen] = useState(false);
  const user = useRecoilValue(authUserState);
  const talkingList = useRecoilValue(participantTalkingListState);
  const [removeParticipant, setRemoveParticipant] =
    useRecoilState(removeUserModalState);
  const [privateChat, setPrivateChat] = useRecoilState(privateChatModalState);
  const participantList = useRecoilValue(participantListState);

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
        <div className="h-9 w-9 rounded-full bg-secondary/40"></div>
        <div className="flex flex-col">
          <span className="font-bold">
            {participant.name}
            {user?.meetingDetails?.internalUserID === participant.intId && " (You)"}
          </span>

          <div>
            {participant.role === "MODERATOR" && (<span className="text-xs">Moderator</span>) }
            {participant.presenter && (<span className="text-xs"> | Presenter</span>) }
            {participant.mobile && (<span className="text-xs"> | Mobile</span>) }
          </div>
          {/*<span className="text-xs">host</span>*/}
        </div>
      </div>
      {participant.id != user?.id.toString() && <div className=" flex items-center gap-2">

        <button>
          {talkingList.map((eachItem:any) => (
              eachItem?.intId == participant.intId && eachItem?.joined ? (eachItem?.muted ? <MicOffIcon className="h-6 w-6" /> :
                <MicOnIcon className="h-6 w-6" />): null
          ))}
        </button>

        {participantList.filter((item:IParticipant) => item.intId == user?.meetingDetails?.internalUserID)[0]?.role=='MODERATOR' && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button>
              <EllipsisIcon className="h-6 w-6 " />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="divide-y divide-a11y/20 border-a11y/20 bg-primary text-a11y shadow-lg"
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <RepeatIcon className="mr-2 h-5 w-5" />
                  Change Role
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="divide-y divide-a11y/20 border border-a11y/20 bg-primary text-a11y shadow-2xl">
                    {userRolesData.map((item: any, index: number) => {

                      if (participant.role !== "MODERATOR" && item.id === 1) {
                        return displayActions(item, index);
                      }

                      if (participant.role !== "VIEWER" && item.id === 5) {
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
              </DropdownMenuSub>

              <DropdownMenuItem className="py-4" onClick={()=>{
                websocketMuteParticipants(participant.userId);
              }}>
                <VolumeOnIcon volume={1} className="mr-2 h-5 w-5" />
                Mute User
              </DropdownMenuItem>

            {user?.meetingDetails?.internalUserID == participant.intId ? null :<DropdownMenuItem
                onClick={() => {
                  if (!user) return;

                  if(privateChat.users.filter((item)=> item.id == participant.intId).length > 0){
                    privateChat.chatRooms.map((citem)=>{
                      citem.participants.map((ccitem)=>{
                        if(ccitem.id == participant.intId){
                          setPrivateChat((prev)=>({
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

                  websocketStartPrivateChat(participant);
                  setPrivateChat({
                    ...privateChat,
                    // isActive: !privateChat.isActive,
                    users: [
                      // {
                      //   email: user.email,
                      //   fullName: user.fullName,
                      //   id: user.id,
                      // },
                        ...privateChat.users,
                      {
                        email: participant.extId,
                        fullName: participant.name,
                        id: participant.intId,
                      },
                    ],
                  });
                }}
                className="py-4"
              >
                <ChatIcon className="mr-2 h-5 w-5" />
                Private Chat
              </DropdownMenuItem>}

            {user?.meetingDetails?.internalUserID == participant.intId ? null : <DropdownMenuItem
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
                <PeopleRemove className="mr-2 h-5 w-5" />
                Remove User
              </DropdownMenuItem>}

            </DropdownMenuContent>
          </DropdownMenu>
        )}


        </div>}
    </div>
  );
}

export default SingleParticipant;
