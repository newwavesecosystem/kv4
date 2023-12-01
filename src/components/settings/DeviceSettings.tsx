import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import {
  availableCamerasState,
  availableMicrophonesState,
  availableSpeakersState,
  currentTabState,
  selectedCameraState,
  selectedMicrophoneState,
  selectedSpeakersState,
  settingsModalMetaState,
} from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import VideoOnIcon from "../icon/outline/VideoOnIcon";
import VolumeOnIcon from "../icon/outline/VolumeOnIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";

const VideoQuality = [
  {
    id: 1,
    name: "Low",
  },
  {
    id: 2,
    name: "Medium",
  },
  {
    id: 3,
    name: "High Definition",
  },
];

function DeviceSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );
  const [selectedVideoQuality, setSelectedVideoQuality] = useState(
    VideoQuality[2],
  );

  const [availableCameras, setAvailableCameras] = useRecoilState(
    availableCamerasState,
  );

  const [availableMicrophones, setAvailableMicrophones] = useRecoilState(
    availableMicrophonesState,
  );

  const [availableSpeakers, setAvailableSpeakers] = useRecoilState(
    availableSpeakersState,
  );

  const screenSize = useScreenSize();

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      const microphones = devices.filter(
        (device) => device.kind === "audioinput",
      );
      const speakers = devices.filter(
        (device) => device.kind === "audiooutput",
      );
      setAvailableCameras(cameras);
      setAvailableMicrophones(microphones);
      setAvailableSpeakers(speakers);
    } catch (error) {
      console.error("Error enumerating devices:", error);
    }
  };

  if (availableCameras.length === 0 || availableMicrophones.length === 0) {
    getDevices();
  }

  const testSpeaker = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const destination = audioContext.createMediaStreamDestination();
    oscillator.connect(destination);
    destination.stream.getAudioTracks().forEach((track) => {
      track.stop();
    });
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 2); // Stop the test sound after 2 seconds
  };

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
      <div className="flex flex-col gap-5 py-6">
        <div className="flex flex-col gap-3">
          <span>Video</span>
          <Select>
            <SelectTrigger className="bg-a11y/20">
              <div className="flex items-center gap-4">
                <VideoOnIcon className="h-6 w-6" />{" "}
                <SelectValue placeholder="Pick a camera" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-primary w-full border border-a11y/40 text-white">
              {availableCameras.length > 0 && availableCameras[0]?.deviceId ? (
                <>
                  {availableCameras.map((camera, index) => (
                    <SelectItem className="" key={index} value={camera.deviceId}>
                      {camera.label}
                    </SelectItem>
                  ))}

                </>
              ) : (

                <div className="py-2 px-4">
                  No Camera found.
                </div>

              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3">
          <span>Video Quality</span>
          <Select
            value={selectedVideoQuality?.id.toString()}
            onValueChange={(value) => {
              setSelectedVideoQuality(
                VideoQuality.find((item) => item.id.toString() === value),
              );
            }}
          >
            <SelectTrigger className="bg-a11y/20">
              {selectedVideoQuality?.name}
            </SelectTrigger>
            <SelectContent className="bg-primary w-full border border-a11y/40 text-white">
              {VideoQuality.map((item, index) => (
                <SelectItem className="" key={index} value={item.id.toString()}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3">
          <span>Microphone</span>
          <Select>
            <SelectTrigger className="bg-a11y/20">
              <div className="flex items-center gap-4">
                <VideoOnIcon className="h-6 w-6" />{" "}
                <SelectValue placeholder="Pick a microphone" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-primary w-full border border-a11y/40 text-white">
              {
                availableMicrophones.length > 0 && availableMicrophones[0]?.deviceId ? (
                  <>

                    {availableMicrophones.map((microphone, index) => (
                      <SelectItem
                        className=""
                        key={index}
                        value={microphone.deviceId}
                      >
                        {microphone.label}
                      </SelectItem>
                    ))}
                  </>
                ) : (

                  <div className="py-2 px-4">
                    No Microphone found.
                  </div>

                )
              }
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3">
          <span>Speakers</span>
          <div className="flex items-center gap-3">
            <Select>
              <SelectTrigger className="bg-a11y/20">
                <div className="flex items-center gap-4">
                  <VideoOnIcon className="h-6 w-6" />{" "}
                  <SelectValue placeholder="Pick a Speaker" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-primary w-full border border-a11y/40 text-white">

                {availableSpeakers.length > 0 && availableSpeakers[0]?.deviceId ? (
                  <>
                    {availableSpeakers.map((speaker, index) => (
                      <SelectItem className="" key={index} value={speaker.deviceId}>
                        {speaker.label}
                      </SelectItem>
                    ))}

                  </>
                ) : (

                  <div className="py-2 px-4">
                    No Speakers found.
                  </div>

                )}
              </SelectContent>
            </Select>
            <button
              onClick={testSpeaker}
              className="bg-a11y/20 flex items-center gap-2 rounded-md px-2 py-2 text-sm"
            >
              <VolumeOnIcon className="h-6 w-6" />
              <span>Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceSettings;
