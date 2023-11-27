import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import { currentTabState, settingsModalMetaState } from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import { Switch } from "../ui/switch";
import MicOffIcon from "../icon/outline/MicOffIcon";
import PeopleSpeakIcon from "../icon/outline/PeopleSpeakIcon";
import LockOffIcon from "../icon/outline/LockOffIcon";

function ManageUserSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );

  const [data, setData] = useState({
    muteAllUsers: false,
    muteAllUsersExceptPresenter: false,
    lockViewers: false,
  });

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
      <div className="divide-a11y/20 flex flex-col divide-y py-6">
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !data.muteAllUsers && "opacity-60")}>
            <MicOffIcon className="h-6 w-6" />
            <label htmlFor="muteAllUsers">Mute all users</label>
          </div>
          <Switch
            checked={data.muteAllUsers}
            onCheckedChange={(checked) =>
              setData({ ...data, muteAllUsers: checked })
            }
            id="muteAllUsers"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div
            className={cn(
              "flex gap-3",
              !data.muteAllUsersExceptPresenter && "opacity-60",
            )}
          >
            <PeopleSpeakIcon className="h-6 w-6" />
            <label htmlFor="muteAllUsersExceptPresenter">
              Mute all users except presenter
            </label>
          </div>
          <Switch
            checked={data.muteAllUsersExceptPresenter}
            onCheckedChange={(checked) =>
              setData({ ...data, muteAllUsersExceptPresenter: checked })
            }
            id="muteAllUsersExceptPresenter"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !data.lockViewers && "opacity-60")}>
            <LockOffIcon className="h-6 w-6" />
            <label htmlFor="lockViewers">Lock viewers</label>
          </div>
          <Switch
            checked={data.lockViewers}
            onCheckedChange={(checked) =>
              setData({ ...data, lockViewers: checked })
            }
            id="lockViewers"
          />
        </div>
      </div>
    </div>
  );
}

export default ManageUserSettings;
