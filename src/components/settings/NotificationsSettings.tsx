import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import {
  currentTabState,
  manageUserSettingsState,
  notificationSettingsState,
  settingsModalMetaState
} from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import { Switch } from "../ui/switch";
import PeopleAdd from "../icon/outline/PeopleAdd";
import ExitIcon from "../icon/outline/ExitIcon";
import ChatIcon from "../icon/outline/ChatIcon";
import AlertOctagonIcon from "../icon/outline/AlertOctagonIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import HandOnIcon from "../icon/outline/HandOnIcon";

function NotificationsSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );

  const screenSize = useScreenSize();

  const [notificationSettings, setNotificationSettingsState] = useRecoilState(notificationSettingsState);

  return (
    <div
      className={cn(
        "hidden w-full rounded-t-2xl bg-primary px-5 lg:block lg:rounded-t-none ",
        currentTab.clickSourceId <= 3 && settingsMeta.isFoward && "block",
      )}
    >
      <div className="flex items-center justify-between border-b-2 border-a11y/20 py-6 ">
        <button
          className="mr-auto rounded-full bg-a11y/20 p-2 lg:hidden"
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
      <div className="flex flex-col divide-y divide-a11y/20 py-6">
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !notificationSettings.joined && "opacity-60")}>
            <PeopleAdd className="h-6 w-6" />
            <label htmlFor="joined">Joined</label>
          </div>
          <Switch
            checked={notificationSettings.joined}
            onCheckedChange={(checked) => setNotificationSettingsState({ ...notificationSettings, joined: checked })}
            id="joined"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !notificationSettings.leave && "opacity-60")}>
            <ExitIcon className="h-6 w-6" />
            <label htmlFor="leave">Leave</label>
          </div>
          <Switch
            checked={notificationSettings.leave}
            onCheckedChange={(checked) => setNotificationSettingsState({ ...notificationSettings, leave: checked })}
            id="leave"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !notificationSettings.newMessage && "opacity-60")}>
            <ChatIcon className="h-6 w-6" />
            <label htmlFor="newMessage">New Message</label>
          </div>
          <Switch
            checked={notificationSettings.newMessage}
            onCheckedChange={(checked) =>
                setNotificationSettingsState({ ...notificationSettings, newMessage: checked })
            }
            id="newMessage"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !notificationSettings.handRaised && "opacity-60")}>
            <HandOnIcon className="h-6 w-6" />
            <label htmlFor="handRaised">Hand Raise</label>
          </div>
          <Switch
            checked={notificationSettings.handRaised}
            onCheckedChange={(checked) =>
                setNotificationSettingsState({ ...notificationSettings, handRaised: checked })
            }
            id="leave"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !notificationSettings.error && "opacity-60")}>
            <AlertOctagonIcon className="h-6 w-6" />
            <label htmlFor="error">Error</label>
          </div>
          <Switch
            checked={notificationSettings.error}
            onCheckedChange={(checked) => setNotificationSettingsState({ ...notificationSettings, error: checked })}
            id="leave"
          />
        </div>
      </div>
    </div>
  );
}

export default NotificationsSettings;
