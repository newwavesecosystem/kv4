import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import {currentTabState, settingsModalMetaState, waitingRoomUsersState} from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import TickIcon from "../icon/outline/TickIcon";
import ChatIcon from "../icon/outline/ChatIcon";
import {websocketSetWaitingRoom} from "~/server/Websocket";
import {IWaitingUser} from "~/types";

function WaitingRoomSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );
  const [waitingRoomUsers, setWaitingRoomUsers] = useRecoilState(waitingRoomUsersState);

  const screenSize = useScreenSize();

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
      <div className="divide-a11y/20 flex flex-col divide-y py-4">

        <div className="flex items-center justify-between py-3 text-sm">
          <button className="bg-a11y/40 flex items-center rounded-lg p-2" onClick={()=>{
            websocketSetWaitingRoom(1);
          }}>
            <span className="ml-2">Ask Moderator</span>
          </button>
          <button className="bg-a11y/20 flex items-center rounded-lg p-2" onClick={()=>{
            websocketSetWaitingRoom(2);
          }}>
            {" "}
            <span className="ml-2">Always Accept</span>
          </button>
          <button className="bg-a11y/20 flex items-center rounded-lg p-2" onClick={()=>{
            websocketSetWaitingRoom(3);
          }}>
            {" "}
            <span className="ml-2">Always Deny</span>
          </button>
        </div>

        <div className="flex items-center justify-between py-3 text-sm">
          <button className="bg-a11y/40 flex items-center rounded-lg p-2">
            <TickIcon className="h-6 w-6" />
            <span className="ml-2">Allow Everyone</span>
          </button>
          <button className="bg-a11y/20 flex items-center rounded-lg p-2">
            {" "}
            <CloseIcon className="h-6 w-6" />
            <span className="ml-2">Deny Everyone</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 py-5">
          {waitingRoomUsers.map((item:IWaitingUser,index:number)=>{
            return (<div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full border-[1px] border-secondary/20 bg-secondary"></div>
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button>
                  <ChatIcon className="h-7 w-7" />
                </button>
                <button className="border-a11y/20 rounded-2xl border px-4 py-1 text-sm">
                  Allow
                </button>
              </div>
            </div>)

          })}
        </div>
      </div>
    </div>
  );
}

export default WaitingRoomSettings;
