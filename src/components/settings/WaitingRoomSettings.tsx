import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import { currentTabState, settingsModalMetaState } from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import TickIcon from "../icon/outline/TickIcon";
import ChatIcon from "../icon/outline/ChatIcon";

function WaitingRoomSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );

  const screenSize = useScreenSize();

  return (
    <div
      className={cn(
        "hidden w-full rounded-t-2xl bg-[#5D957E] px-5 lg:block lg:rounded-t-none ",
        currentTab.clickSourceId <= 3 && settingsMeta.isFoward && "block",
      )}
    >
      <div className="flex items-center justify-between border-b-2 border-white/20 py-6 ">
        <button
          className="mr-auto rounded-full bg-konn3ct-green p-2 lg:hidden"
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
      <div className="flex flex-col divide-y divide-white/20 py-4">
        <div className="flex items-center justify-between py-3 text-sm">
          <button className="flex items-center rounded-lg bg-konn3ct-green p-2">
            <TickIcon className="h-6 w-6" />
            <span className="ml-2">Allow Everyone</span>
          </button>
          <button className="bg-konn3ct-red flex items-center rounded-lg p-2">
            {" "}
            <CloseIcon className="h-6 w-6" />
            <span className="ml-2">Deny Everyone</span>
          </button>
        </div>
        <div className="flex flex-col gap-2 py-5">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full border-[1px] bg-slate-500"></div>
              <span>Samuel Odejinmi</span>
            </div>
            <div className="flex items-center gap-2">
              <button>
                <ChatIcon className="h-7 w-7" />
              </button>
              <button className="rounded-2xl border px-4 py-1 text-sm">
                Allow
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full border-[1px] bg-slate-700"></div>
              <span>Femi Williams</span>
            </div>
            <div className="flex items-center gap-2">
              <button>
                <ChatIcon className="h-7 w-7" />
              </button>
              <button className="rounded-2xl border px-4 py-1 text-sm">
                Allow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaitingRoomSettings;
