import React, { use, useEffect } from "react";
import SettingsIcon from "../icon/outline/SettingsIcon";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  authUserState,
  currentTabState,
  settingsModalMetaState,
} from "~/recoil/atom";
import settingsTabData from "~/data/settingsTabData";
import { cn } from "~/lib/utils";
import useScreenSize from "~/lib/useScreenSize";

function SettingsTab() {
  const [currentTab, setCurrentTab] = useRecoilState(currentTabState);
  const setSettingsMeta = useSetRecoilState(settingsModalMetaState);
  const user = useRecoilValue(authUserState);

  const screenSize = useScreenSize();

  return (
    <div className="py-5 lg:py-0">
      {user ? (
        <>
          {settingsTabData.map((tab, index) => (
            <button
              onClick={() => {
                setCurrentTab({
                  ...tab,
                  clickSourceId: screenSize.id,
                });
                if (screenSize.id <= 3) {
                  setSettingsMeta({
                    isFoward: true,
                    sourceId: screenSize.id,
                  });
                } else {
                  setSettingsMeta({
                    isFoward: false,
                    sourceId: screenSize.id,
                  });
                }
              }}
              className={cn(
                "my-1 flex w-full items-center gap-2 px-2 py-4 disabled:opacity-40",
                currentTab.id === tab.id && "rounded-lg bg-a11y/20",
              )}
              disabled={tab.disable}
              key={index}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </>
      ) : (
        <>
          {settingsTabData
            .filter((tab) => tab.auth === false)
            .map((tab, index) => (
              <button
                onClick={() => {
                  setCurrentTab({
                    ...tab,
                    clickSourceId: screenSize.id,
                  });
                  if (screenSize.id <= 3) {
                    setSettingsMeta({
                      isFoward: true,
                      sourceId: screenSize.id,
                    });
                  } else {
                    setSettingsMeta({
                      isFoward: false,
                      sourceId: screenSize.id,
                    });
                  }
                }}
                className={cn(
                  "my-1 flex w-full items-center gap-2 px-2 py-4 disabled:opacity-40",
                  currentTab.id === tab.id &&
                    "rounded-lg bg-a11y/20",
                )}
                disabled={tab.disable}
                key={index}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
        </>
      )}
    </div>
  );
}

export default SettingsTab;
