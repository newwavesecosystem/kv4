import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import { currentTabState, settingsModalMetaState } from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import { Switch } from "../ui/switch";
import VolumeOnIcon from "../icon/outline/VolumeOnIcon";
import MicOnIcon from "../icon/outline/MicOnIcon";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Slider } from "../ui/slider";

function LayoutSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );

  const [data, setData] = useState<{
    speakerMode: boolean;
    audioMode: boolean;
    maxTiles: number[];
    layout: string;
  }>({
    speakerMode: false,
    audioMode: false,
    maxTiles: [4],
    layout: "",
  });

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
      <div className="flex flex-col divide-y divide-white/20 py-6">
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !data.speakerMode && "opacity-60")}>
            <VolumeOnIcon volume={2} className="h-6 w-6" />
            <label htmlFor="speakerMode">Active Speaker Mode</label>
          </div>
          <Switch
            checked={data.speakerMode}
            onCheckedChange={(checked) =>
              setData({ ...data, speakerMode: checked })
            }
            id="speakerMode"
          />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className={cn("flex gap-3", !data.audioMode && "opacity-60")}>
            <MicOnIcon className="h-6 w-6" />
            <label htmlFor="audioMode">Audio Only Mode</label>
          </div>
          <Switch
            checked={data.audioMode}
            onCheckedChange={(checked) =>
              setData({ ...data, audioMode: checked })
            }
            id="audioMode"
          />
        </div>
        <div className="flex flex-col py-4">
          <div>
            <span>Change layout</span>
            <p className="text-xs opacity-50">
              Maximum tiles to display within the window
            </p>
          </div>
          <RadioGroup className="my-5 space-y-2" defaultValue="1">
            <div className="flex items-center justify-between">
              <label htmlFor="1">Smart layout</label>
              <RadioGroupItem value="1" id="1" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="2">Focus on video</label>
              <RadioGroupItem value="2" id="2" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="3">Focus on presentation</label>
              <RadioGroupItem value="3" id="3" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="4">Focus on presenter</label>
              <RadioGroupItem value="4" id="4" />
            </div>
          </RadioGroup>
          <div>
            <button className=" rounded-lg border border-white bg-konn3ct-green px-4 py-2 text-sm">
              Update Everyone
            </button>
          </div>
        </div>
        <div className="flex flex-col py-4">
          <div>
            <span>Tiles in view ({data.maxTiles[0]})</span>
            <p className="text-xs opacity-50">
              Maximum tiles to display within the window
            </p>
          </div>
          <div className="mt-5 flex w-full items-center gap-4">
            <div className="grid aspect-square h-5 w-5 grid-cols-2 gap-1">
              <div className="h-full w-full bg-white"></div>
              <div className="h-full w-full bg-white"></div>
              <div className="h-full w-full bg-white"></div>
              <div className="h-full w-full bg-white"></div>
            </div>
            <Slider
              value={data.maxTiles}
              onValueChange={(value) => setData({ ...data, maxTiles: value })}
              max={20}
              step={2}
            />
            <div className="grid h-5 w-8 grid-cols-3 gap-[2px]">
              <div className="h-full w-full bg-white"></div>
              <div className="h-full w-full bg-white"></div>
              <div className="h-full w-full bg-white"></div>
              <div className="h-full w-full bg-white"></div>
              <div className="h-full w-full bg-white"></div>
              <div className="h-full w-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayoutSettings;
