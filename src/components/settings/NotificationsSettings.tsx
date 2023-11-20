import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import { currentTabState, settingsModalMetaState } from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import { Switch } from "../ui/switch";
import PeopleAdd from "../icon/outline/PeopleAdd";
import ExitIcon from "../icon/outline/ExitIcon";
import ChatIcon from "../icon/outline/ChatIcon";
import AlertOctagonIcon from "../icon/outline/AlertOctagonIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import HandOnIcon from "../icon/outline/Hand/HandOnIcon";

function NotificationsSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );

  const screenSize = useScreenSize();

  const [data, setData] = useState({
    joined: false,
    leave: false,
    newMessage: true,
    handRaised: true,
    error: false,
  });

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
      <div className="flex flex-col divide-y divide-white/20 py-6">
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !data.joined && "opacity-60")}>
            <PeopleAdd className="h-6 w-6" />
            <label htmlFor="joined">Joined</label>
          </div>
          <Switch
            checked={data.joined}
            onCheckedChange={(checked) => setData({ ...data, joined: checked })}
            id="joined"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !data.leave && "opacity-60")}>
            <ExitIcon className="h-6 w-6" />
            <label htmlFor="leave">Leave</label>
          </div>
          <Switch
            checked={data.leave}
            onCheckedChange={(checked) => setData({ ...data, leave: checked })}
            id="leave"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !data.newMessage && "opacity-60")}>
            <ChatIcon className="h-6 w-6" />
            <label htmlFor="newMessage">New Message</label>
          </div>
          <Switch
            checked={data.newMessage}
            onCheckedChange={(checked) =>
              setData({ ...data, newMessage: checked })
            }
            id="newMessage"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !data.handRaised && "opacity-60")}>
            <HandOnIcon className="h-6 w-6" />
            <label htmlFor="handRaised">Hand Raise</label>
          </div>
          <Switch
            checked={data.handRaised}
            onCheckedChange={(checked) =>
              setData({ ...data, handRaised: checked })
            }
            id="leave"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !data.error && "opacity-60")}>
            <AlertOctagonIcon className="h-6 w-6" />
            <label htmlFor="error">Error</label>
          </div>
          <Switch
            checked={data.error}
            onCheckedChange={(checked) => setData({ ...data, error: checked })}
            id="leave"
          />
        </div>
      </div>
    </div>
  );
}

export default NotificationsSettings;
