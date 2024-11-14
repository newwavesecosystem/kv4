import React, { useState } from "react";
import {
  SettingsSheet,
  SettingsSheetClose,
  SettingsSheetContent,
} from "../ui/settingsSheet";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentTabState,
  settingsModalMetaState,
  settingsModalState,
} from "~/recoil/atom";
import useScreenSize from "~/lib/useScreenSize";
import SettingsTab from "./SettingsTab";
import DeviceSettings from "./DeviceSettings";
import { cn } from "~/lib/utils";
import CloseIcon from "../icon/outline/CloseIcon";
import NotificationsSettings from "./NotificationsSettings";
import LayoutSettings from "./LayoutSettings";
import ManageUserSettings from "./ManageUserSettings";
import WaitingRoomSettings from "./WaitingRoomSettings";
import TakeSpotAttendanceSettings from "./TakeSpotAttendanceSettings";

function Settings() {
  const [settingsOpen, setSettingsOpen] = useRecoilState(settingsModalState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );

  const currentTab = useRecoilValue(currentTabState);

  const screenSize = useScreenSize();
  const handleModalClose = () => {
    setSettingsOpen(false);
  };

  return (
    <SettingsSheet open={settingsOpen} onOpenChange={handleModalClose}>
      <SettingsSheetContent
        className="text-a11y w-full lg:w-[900px] "
        side={screenSize.id <= 3 ? "bottom" : "right"}
      >
        <div className="flex">
          {/* left */}
          <div
            className={cn(
              "hidden w-full rounded-t-2xl bg-primary px-5 lg:block lg:h-svh lg:w-[600px] lg:rounded-bl-2xl lg:rounded-tr-none lg:pt-5",
              screenSize.id <= 3 && !settingsMeta.isFoward && "block",
            )}
          >
            <div className="border-a11y/20 flex items-center justify-between border-b py-5 lg:border-0">
              <span className="text-lg font-semibold lg:border-b-0 lg:text-xl ">
                Settings
              </span>
              <SettingsSheetClose className="lg:hidden">
                <CloseIcon className="h-6 w-6 " />
                <span className="sr-only">Close</span>
              </SettingsSheetClose>
            </div>
            <SettingsTab />
          </div>

          {/* right */}
          {currentTab.id === 1 && <DeviceSettings />}
          {currentTab.id === 2 && <NotificationsSettings />}
          {currentTab.id === 3 && <LayoutSettings />}
          {currentTab.id === 4 && <ManageUserSettings />}
          {currentTab.id === 5 && <WaitingRoomSettings />}
          {currentTab.id === 6 && <TakeSpotAttendanceSettings />}
        </div>
      </SettingsSheetContent>
    </SettingsSheet>
  );
}

export default Settings;
