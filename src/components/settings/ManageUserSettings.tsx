import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import {
  authUserState,
  currentTabState,
  manageUserSettingsState,
  participantListState,
  settingsModalMetaState
} from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import { Switch } from "../ui/switch";
import MicOffIcon from "../icon/outline/MicOffIcon";
import PeopleSpeakIcon from "../icon/outline/PeopleSpeakIcon";
import LockOffIcon from "../icon/outline/LockOffIcon";
import {
  websocketLockViewers,
  websocketMuteAllParticipants,
  websocketMuteParticipantsePresenter
} from "~/server/Websocket";
import VideoOnIcon from "~/components/icon/outline/VideoOnIcon";
import {CurrentUserRoleIsModerator} from "~/lib/checkFunctions";

function ManageUserSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );
  const [manageUserSettings, setManageUserSettings] = useRecoilState(manageUserSettingsState);


  const participantList = useRecoilValue(participantListState);

  const screenSize = useScreenSize();

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
      {CurrentUserRoleIsModerator(participantList, user) ? (<div className="divide-a11y/20 flex flex-col divide-y py-6">
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !manageUserSettings.disableMic && "opacity-60")}>
            <MicOffIcon className="h-6 w-6"/>
            <label htmlFor="disableMic">Disable Mic</label>
          </div>
          <Switch
              checked={manageUserSettings.disableMic}
              onCheckedChange={(checked) => {
                setManageUserSettings({...manageUserSettings, disableMic: checked})
                console.log(manageUserSettings);
                websocketLockViewers({...manageUserSettings, disableMic: checked}, user?.meetingDetails?.internalUserID);
              }}
              id="disableMic"
          />
        </div>
        {/*<div className="flex items-center justify-between py-4">*/}
        {/*  <div*/}
        {/*      className={cn(*/}
        {/*          "flex gap-3",*/}
        {/*          !manageUserSettings.muteAllUsersExceptPresenter && "opacity-60",*/}
        {/*      )}*/}
        {/*  >*/}
        {/*    <PeopleSpeakIcon className="h-6 w-6"/>*/}
        {/*    <label htmlFor="muteAllUsersExceptPresenter">*/}
        {/*      Mute all users except presenter*/}
        {/*    </label>*/}
        {/*  </div>*/}
        {/*  <Switch*/}
        {/*      checked={manageUserSettings.muteAllUsersExceptPresenter}*/}
        {/*      onCheckedChange={(checked) => {*/}
        {/*        setManageUserSettings({...manageUserSettings, muteAllUsersExceptPresenter: checked});*/}

        {/*        if (checked) {*/}
        {/*          websocketMuteParticipantsePresenter(user?.meetingDetails?.internalUserID);*/}
        {/*        } else {*/}
        {/*          websocketMuteAllParticipants(user?.meetingDetails?.internalUserID);*/}
        {/*        }*/}
        {/*      }}*/}
        {/*      id="muteAllUsersExceptPresenter"*/}
        {/*  />*/}
        {/*</div>*/}
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !manageUserSettings.disableCam && "opacity-60")}>
            <VideoOnIcon className="h-6 w-6"/>
            <label htmlFor="disableCam">Disable Camera</label>
          </div>
          <Switch
              checked={manageUserSettings.disableCam}
              onCheckedChange={(checked) => {
                setManageUserSettings({...manageUserSettings, disableCam: checked})
                console.log(manageUserSettings);
                websocketLockViewers({...manageUserSettings, disableCam: checked}, user?.meetingDetails?.internalUserID);
              }}
              id="disableCam"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !manageUserSettings.disablePublicChat && "opacity-60")}>
            <LockOffIcon className="h-6 w-6"/>
            <label htmlFor="disablePublicChat">Disable Public Chat</label>
          </div>
          <Switch
              checked={manageUserSettings.disablePublicChat}
              onCheckedChange={(checked) => {
                setManageUserSettings({...manageUserSettings, disablePublicChat: checked})
                websocketLockViewers({...manageUserSettings, disablePublicChat: checked}, user?.meetingDetails?.internalUserID);
              }}
              id="disablePublicChat"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !manageUserSettings.disablePrivateChat && "opacity-60")}>
            <LockOffIcon className="h-6 w-6"/>
            <label htmlFor="disablePrivateChat">Disable Private Chat</label>
          </div>
          <Switch
              checked={manageUserSettings.disablePrivateChat}
              onCheckedChange={(checked) => {
                setManageUserSettings({...manageUserSettings, disablePrivateChat: checked})
                websocketLockViewers({...manageUserSettings, disablePrivateChat: checked}, user?.meetingDetails?.internalUserID);
              }}
              id="disablePrivateChat"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !manageUserSettings.hideUserList && "opacity-60")}>
            <LockOffIcon className="h-6 w-6"/>
            <label htmlFor="hideUserList">Hide Participants List</label>
          </div>
          <Switch
              checked={manageUserSettings.hideUserList}
              onCheckedChange={(checked) => {
                setManageUserSettings({...manageUserSettings, hideUserList: checked})
                websocketLockViewers({...manageUserSettings, hideUserList: checked}, user?.meetingDetails?.internalUserID);
              }}
              id="hideUserList"
          />
        </div>
      </div>) : <div className="flex items-center justify-between py-4">This page can only be seen by a Moderator</div>}
    </div>
  );
}

export default ManageUserSettings;
