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

  const [selectedCamera, setSelectedCamera] =
    useRecoilState(selectedCameraState);

  const [selectedMicrophone, setSelectedMicrophone] = useRecoilState(
    selectedMicrophoneState,
  );

  const [selectedSpeaker, setSelectedSpeaker] = useRecoilState(
    selectedSpeakersState,
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
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
      <div className="flex flex-col gap-5 py-6">
        <div className="flex flex-col gap-3">
          <span>Video</span>
          <Select>
            <SelectTrigger className="bg-konn3ct-green">
              <div className="flex items-center gap-4">
                <VideoOnIcon className="h-6 w-6" />{" "}
                <SelectValue placeholder="Pick a camera" />
              </div>
            </SelectTrigger>
            <SelectContent className="w-full bg-konn3ct-green text-white">
              {availableCameras.map((camera) => (
                <SelectItem className="" value={camera.deviceId}>
                  {camera.label}
                </SelectItem>
              ))}
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
            <SelectTrigger className="bg-konn3ct-green">
              {selectedVideoQuality?.name}
            </SelectTrigger>
            <SelectContent className="bg-konn3ct-green text-white">
              {VideoQuality.map((item) => (
                <SelectItem className="" value={item.id.toString()}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3">
          <span>Microphone</span>
          <Select>
            <SelectTrigger className="bg-konn3ct-green">
              <div className="flex items-center gap-4">
                <VideoOnIcon className="h-6 w-6" />{" "}
                <SelectValue placeholder="Pick a microphone" />
              </div>
            </SelectTrigger>
            <SelectContent className="w-full bg-konn3ct-green text-white">
              {availableMicrophones.map((microphone) => (
                <SelectItem className="" value={microphone.deviceId}>
                  {microphone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3">
          <span>Speakers</span>
          <div className="flex items-center gap-3">
            <Select>
              <SelectTrigger className="bg-konn3ct-green">
                <div className="flex items-center gap-4">
                  <VideoOnIcon className="h-6 w-6" />{" "}
                  <SelectValue placeholder="Pick a microphone" />
                </div>
              </SelectTrigger>
              <SelectContent className="w-full bg-konn3ct-green text-white">
                {availableSpeakers.map((speaker) => (
                  <SelectItem className="" value={speaker.deviceId}>
                    {speaker.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button onClick={testSpeaker} className="flex items-center gap-2 rounded-md bg-konn3ct-green px-2 py-2 text-sm">
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
