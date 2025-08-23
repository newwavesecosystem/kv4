import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import {
  authUserState,
  currentTabState,
  participantListState,
  settingsModalMetaState,
  waitingRoomTypeState,
  waitingRoomUsersState
} from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import TickIcon from "../icon/outline/TickIcon";
import ChatIcon from "../icon/outline/ChatIcon";
import {IWaitingUser} from "~/types";
import {CurrentUserRoleIsModerator} from "~/lib/checkFunctions";
import {
  websocketAllowAllWaitingUser,
  websocketDenyAllWaitingUser,
  websocketSetWaitingRoom
} from "~/server/WebsocketActions";

function WaitingRoomSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );
  const [waitingRoomUsers, setWaitingRoomUsers] = useRecoilState(waitingRoomUsersState);
  const [waitingRoomType, setWaitingRoomType] = useRecoilState(waitingRoomTypeState);

  console.log("waitingRoomUsers:",waitingRoomUsers);

  const screenSize = useScreenSize();

  const participantList = useRecoilValue(participantListState);

  const user = useRecoilValue(authUserState);


  return (
    <div
      className={cn(
        "hidden w-full rounded-t-2xl bg-primary px-5 lg:block lg:rounded-t-none ",
        currentTab.clickSourceId <= 3 && settingsMeta.isFoward && "block",
      )}
    >
      <div className="border-a11y/20 flex items-center justify-between border-b-2 py-6 ">
        <button
          className="bg-a11y/20 mr-auto rounded-full p-2 lg:hidden"
          onClick={() => {
            if (screenSize.id <= 3) {
              setSettingsMeta({
                isFoward: false,
                sourceId: screenSize.id,
              });
            }
          }}
        >
          <ArrowChevronLeftIcon className="h-5 w-5" />
        </button>
        <span className="mr-auto text-lg font-semibold lg:text-xl ">
          {currentTab.name}
        </span>
        <SettingsSheetClose className="">
          <CloseIcon className="h-6 w-6 " />
          <span className="sr-only">Close</span>
        </SettingsSheetClose>
      </div>
      {CurrentUserRoleIsModerator(participantList, user) ? (<div className="divide-a11y/20 flex flex-col divide-y py-4">

        <div className="flex items-center justify-between py-3 text-sm">
          <button className={`${waitingRoomType == 1 ? 'bg-a11y/40': 'bg-a11y/10'} flex items-center rounded-lg p-2`} onClick={()=>{
            setWaitingRoomType(1);
            websocketSetWaitingRoom('ASK_MODERATOR');
          }}>
            <span className="ml-2">Ask Moderator</span>
          </button>
          <button className={`${waitingRoomType == 2 ? 'bg-a11y/40': 'bg-a11y/10'} flex items-center rounded-lg p-2`} onClick={()=>{
            setWaitingRoomType(2);
            websocketSetWaitingRoom('ALWAYS_ACCEPT');
          }}>
            {" "}
            <span className="ml-2">Always Accept</span>
          </button>
          {/*<button className={`${waitingRoomType == 3 ? 'bg-a11y/40': 'bg-a11y/10'} flex items-center rounded-lg p-2`} onClick={()=>{*/}
          {/*  setWaitingRoomType(3);*/}
          {/*  websocketSetWaitingRoom(3);*/}
          {/*}}>*/}
          {/*  {" "}*/}
          {/*  <span className="ml-2">Always Deny</span>*/}
          {/*</button>*/}
        </div>

        {waitingRoomType == 1 && (<div className="flex items-center justify-between py-3 text-sm">
          <button className="bg-a11y/20 flex items-center rounded-lg p-2"  onClick={()=>{
            websocketAllowAllWaitingUser(waitingRoomUsers);
            setWaitingRoomUsers([]);
          }}>
            <TickIcon className="h-6 w-6" />
            <span className="ml-2">Allow Everyone</span>
          </button>
          <button className="bg-red-700 flex items-center rounded-lg p-2" onClick={()=>{
            websocketDenyAllWaitingUser(waitingRoomUsers);
            setWaitingRoomUsers([]);
          }}>
            {" "}
            <CloseIcon className="h-6 w-6" />
            <span className="ml-2">Deny Everyone</span>
          </button>
        </div>)}

        <div className="flex flex-col gap-2 py-5">
          {waitingRoomUsers.map((item:IWaitingUser,index:number)=>{
            return (<div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full border-[1px] border-secondary/20 bg-secondary"></div>
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {/*<button>*/}
                {/*  <ChatIcon className="h-7 w-7" />*/}
                {/*</button>*/}
                <button className="border-a11y/20 rounded-2xl border px-4 py-1 text-sm" onClick={()=>{
                  websocketAllowAllWaitingUser([item]);

                  let ur=waitingRoomUsers.filter((item:IWaitingUser) => item?._id != item._id);
                  console.log("waitingRoomUsers: handleRemoval ",ur)
                  setWaitingRoomUsers(ur);
                }}>
                  Allow
                </button>
                <button className="bg-red-700 rounded-2xl border px-4 py-1 text-sm" onClick={()=>{
                  websocketDenyAllWaitingUser([item]);

                  let ur=waitingRoomUsers.filter((item:IWaitingUser) => item?._id != item._id);
                  console.log("waitingRoomUsers: handleRemoval ",ur)
                  setWaitingRoomUsers(ur);
                }}>
                  Deny
                </button>
              </div>
            </div>)

          })}
        </div>
      </div>) : <div className="flex items-center justify-between py-4">This page can only be seen by a Moderator</div>}
    </div>
  );
}

export default WaitingRoomSettings;
