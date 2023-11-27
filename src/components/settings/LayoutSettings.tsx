import React, { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn, getContrastColor } from "~/lib/utils";
import {
  currentColorTheme,
  currentTabState,
  settingsModalMetaState,
} from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import { Switch } from "../ui/switch";
import MicOnIcon from "../icon/outline/MicOnIcon";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Slider } from "../ui/slider";
import predefinedColorsData from "~/data/predefinedColorsData";

function LayoutSettings() {
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );
  const [currentColor, setCurrentColor] = useRecoilState(currentColorTheme);

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
      <div className="divide-a11y/20 flex flex-col divide-y pb-6 pt-2">
        <div className="flex items-center justify-between py-4">
          <div className="flex w-full items-center gap-1">
            {predefinedColorsData.map((color, index) => (
              <button
                key={index}
                // TODO use tailwind classes
                style={{
                  backgroundColor: color.background,
                }}
                className={cn(
                  "border-a11y h-7 w-7 rounded-full",
                  color.background === currentColor.background && "border-2",
                )}
                onClick={() => {
                  setCurrentColor({
                    background: color.background,
                    text: color.text,
                  });
                }}
              ></button>
            ))}
            {/* check if the current colour not in predefined list then render it */}
            {predefinedColorsData.filter(
              (color) => color.background === currentColor.background,
            ).length === 0 && (
              <button>
                <div
                  style={{
                    backgroundColor: currentColor.background,
                    borderColor: currentColor.text,
                  }}
                  className="h-7 w-7 rounded-full border-2"
                ></div>
              </button>
            )}
          </div>
          <button
            onClick={() => {
              if (colorPickerRef.current) {
                colorPickerRef.current.click();
              }
            }}
            className=" border-a11y/20 shrink-0 rounded-lg border px-4 py-2 text-xs"
          >
            Edit Color
          </button>
          <input
            ref={colorPickerRef}
            type="color"
            onChange={(e) => {
              setCurrentColor({
                background: e.target.value,
                text: getContrastColor(e.target.value),
              });
            }}
            hidden
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
            <button className=" border-a11y/20 bg-a11y/20 rounded-lg border px-4 py-2 text-sm">
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
              <div className="bg-a11y h-full w-full"></div>
              <div className="bg-a11y h-full w-full"></div>
              <div className="bg-a11y h-full w-full"></div>
              <div className="bg-a11y h-full w-full"></div>
            </div>
            <Slider
              value={data.maxTiles}
              onValueChange={(value) => setData({ ...data, maxTiles: value })}
              max={20}
              step={2}
            />
            <div className="grid h-5 w-8 grid-cols-3 gap-[2px]">
              <div className="bg-a11y h-full w-full"></div>
              <div className="bg-a11y h-full w-full"></div>
              <div className="bg-a11y h-full w-full"></div>
              <div className="bg-a11y h-full w-full"></div>
              <div className="bg-a11y h-full w-full"></div>
              <div className="bg-a11y h-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayoutSettings;
