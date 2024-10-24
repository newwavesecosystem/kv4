import React, { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn, getContrastColor } from "~/lib/utils";
import {
  LayoutSettingsState,
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

const Layouts = [
  {
    id: 1,
    name: "Smart layout",
  },
  {
    id: 2,
    name: "Focus on video",
  },
  {
    id: 3,
    name: "Focus on presentation",
  },
  {
    id: 4,
    name: "Focus on presenter",
  },
];

import deviceInfo from "~/lib/deviceInfo";

function LayoutSettings() {
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );
  const [currentColor, setCurrentColor] = useRecoilState(currentColorTheme);

  const [layoutSettings, setlayoutSettings] =
    useRecoilState(LayoutSettingsState);

  const screenSize = useScreenSize();

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
      <div className="flex flex-col divide-y divide-a11y/20 pb-6 pt-2">
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
                  "h-7 w-7 rounded-full border-a11y",
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
            className=" shrink-0 rounded-lg border border-a11y/20 px-4 py-2 text-xs"
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
          <div
            className={cn(
              "flex gap-3",
              !layoutSettings.audioMode && "opacity-60",
            )}
          >
            <MicOnIcon className="h-6 w-6" />
            <label htmlFor="audioMode">Audio Only Mode</label>
          </div>
          <Switch
            checked={layoutSettings.audioMode}
            onCheckedChange={(checked) =>
              setlayoutSettings({ ...layoutSettings, audioMode: checked })
            }
            id="audioMode"
          />
        </div>
        <div className="flex flex-col py-4">
          <div>
            <span>Change layout</span>
            <p className="text-xs opacity-50">
              Change style
            </p>
          </div>
          <RadioGroup
            onValueChange={(e) => {
              setlayoutSettings({
                ...layoutSettings,
                layout: e,
                layoutName:
                  Layouts.find((layout) => layout.id.toString() === e)?.name ??
                  "",
              });
            }}
            className="my-5 space-y-2"
            defaultValue={layoutSettings.layout}
          >
            {Layouts.map((layout, index) => (
              <div key={index} className="flex items-center justify-between">
                <label htmlFor={layout.id.toString()}>{layout.name}</label>
                <RadioGroupItem
                  value={layout.id.toString()}
                  id={layout.id.toString()}
                />
              </div>
            ))}
          </RadioGroup>
          <div>
            <button className=" rounded-lg border border-a11y/20 bg-a11y/20 px-4 py-2 text-sm">
              Update Everyone
            </button>
          </div>
        </div>
        <div className="flex flex-col py-4">
          <div>
            <span>Tiles in view ({layoutSettings.maxTiles[0]})</span>
            <p className="text-xs opacity-50">
              Maximum tiles to display within the window
            </p>
          </div>
          <div className="mt-5 flex w-full items-center gap-4">
            <div className="grid aspect-square h-5 w-5 grid-cols-2 gap-1">
              <div className="h-full w-full bg-a11y"></div>
              <div className="h-full w-full bg-a11y"></div>
              <div className="h-full w-full bg-a11y"></div>
              <div className="h-full w-full bg-a11y"></div>
            </div>
            <Slider
              value={layoutSettings.maxTiles}
              onValueChange={(value) =>
                setlayoutSettings({ ...layoutSettings, maxTiles: value })
              }
              max={deviceInfo.isMobile ? 6 : 12}
              min={4}
              step={2}
            />
            <div className="grid h-5 w-8 grid-cols-3 gap-[2px]">
              <div className="h-full w-full bg-a11y"></div>
              <div className="h-full w-full bg-a11y"></div>
              <div className="h-full w-full bg-a11y"></div>
              <div className="h-full w-full bg-a11y"></div>
              <div className="h-full w-full bg-a11y"></div>
              <div className="h-full w-full bg-a11y"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayoutSettings;
