import React, {useEffect, useState} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import {
  authUserState,
  availableCamerasState,
  availableMicrophonesState,
  availableSpeakersState, cameraOpenState, cameraStreamState, CamQualityState, connectionStatusState,
  currentTabState, micFilterState, microphoneStreamState, participantCameraListState, participantListState,
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
import stopCameraStream from "~/lib/camera/stopCameraStream";
import {websocketStopCamera} from "~/server/Websocket";
import requestCameraAccess from "~/lib/camera/requestCameraAccess";
import {IParticipantCamera} from "~/types";
import {useToast} from "~/components/ui/use-toast";
import stopMicrophoneStream from "~/lib/microphone/stopMicrophoneStream";
import requestMicrophoneAccess from "~/lib/microphone/requestMicrophoneAccess";
import {kurentoVideoSwitchCamera} from "~/server/KurentoVideo";
import {kurentoAudioPlaySound, kurentoAudioSetNewStream} from "~/server/KurentoAudio";
import {Switch} from "~/components/ui/switch";
import MicOnIcon from "~/components/icon/outline/MicOnIcon";

const VideoQuality = [
  {
    id: 1,
    name: "Low",
    bitrate: 100,
    default: false,
    constraints:{}
  },
  {
    id: 2,
    name: "Medium",
    bitrate: 200,
    default: false,
    constraints:{}
  },
  {
    id: 3,
    name: "High",
    default: true,
    bitrate: 500,
    constraints: {
      width: 1280,
      height: 720,
      frameRate: 15,
    }
  },
  {
    id: 4,
    name: "High Definition",
    default: false,
    bitrate: 800,
    constraints: {
      width: 1280,
      height: 720,
      frameRate: 30
    }
  },
];

function DeviceSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );
  const [selectedVideoQuality, setSelectedVideoQuality] = useRecoilState(
      CamQualityState
  );

  const [supportedConstraint, setSupportedConstraint] = useState<MediaTrackSupportedConstraints>();

  const [availableCameras, setAvailableCameras] = useRecoilState(
    availableCamerasState,
  );

  const [selectedCamera, setSelectedCamera] = useRecoilState(
    selectedCameraState,
  );

  const [availableMicrophones, setAvailableMicrophones] = useRecoilState(
    availableMicrophonesState,
  );

  const [selectedMicrophone, setSelectedMicrophone] = useRecoilState(
    selectedMicrophoneState,
  );

  const [availableSpeakers, setAvailableSpeakers] = useRecoilState(
    availableSpeakersState,
  );

  const [selectedSpeaker, setSelectedSpeaker] = useRecoilState(
    selectedSpeakersState,
  );

  const [videoState, setVideoState] = useRecoilState(cameraOpenState);

  const [micFilter, setMicFilter] = useRecoilState(micFilterState);

  const user = useRecoilValue(authUserState);

  const [participantCameraList, setParticipantCameraList] = useRecoilState(participantCameraListState);

  const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);

  const [microphoneStream, setMicrophoneStream] = useRecoilState(microphoneStreamState);

  const [connectionStatus, setConnection] = useRecoilState(connectionStatusState);

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

  const getSupportedConstraints = async () => {
    try {

      const s = await navigator.mediaDevices.getSupportedConstraints();

      console.log("Supported Constraint: ",s);

      //set echoCancellation to false if th device did not support echoCancellation
      if(!s.echoCancellation){
        setMicFilter({...micFilter, echoCancellation: false})
      }

      setSupportedConstraint(s);
    } catch (error) {
      console.error("Error on Supported Constraint:", error);
    }
  };

  // if (availableCameras.length === 0 || availableMicrophones.length === 0) {
  //   getDevices();
  // }

  const testSpeaker = () => {
    kurentoAudioPlaySound('/sound_test.mp3', selectedSpeaker?.deviceId);

    // const audioContext = new (window.AudioContext ||
    //   window.webkitAudioContext)();
    // const oscillator = audioContext.createOscillator();
    // const destination = audioContext.createMediaStreamDestination();
    // oscillator.connect(destination);
    // destination.stream.getAudioTracks().forEach((track) => {
    //   track.stop();
    // });
    // oscillator.start();
    // oscillator.stop(audioContext.currentTime + 2); // Stop the test sound after 2 seconds
  };

  const applyAudioSettings = async (desiredMic:MediaDeviceInfo) => {

    const mic = await requestMicrophoneAccess(desiredMic, micFilter.autoGainControl, micFilter.noiseSuppression, micFilter.echoCancellation);
    if (mic) {
      kurentoAudioSetNewStream(mic).then(r => console.log("Changed stream successfully"));
    }

  };

  const { toast } = useToast();

  useEffect(()=>{
    console.log('selectedMicrophone',selectedMicrophone)
    getDevices();
    getSupportedConstraints();
  }, [""])

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
          <Select
              onValueChange={async (value: string) => {

                var vidvalue: MediaDeviceInfo | undefined = availableCameras.filter((item: MediaDeviceInfo) => item.deviceId == value)[0];

                const video = await requestCameraAccess(vidvalue, selectedVideoQuality);
                if (video) {
                  console.log('change_device Camera is on');
                  kurentoVideoSwitchCamera(video).then(r => console.log('hello'));
                }

                setSelectedCamera(vidvalue!)

                return;
              }}>
            <SelectTrigger className="bg-a11y/20">
              <div className="flex items-center gap-4">
                <VideoOnIcon className="h-6 w-6" />{" "}
                <SelectValue placeholder={selectedCamera == null ? availableCameras[0]?.label : selectedCamera.label }  />
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
            value={selectedVideoQuality.id.toString()}
            onValueChange={(value) => {
              const selectedQuality = VideoQuality.find((item) => item.id.toString() === value);

              if (selectedQuality) {
                setSelectedVideoQuality(selectedQuality);
              } else {
                // Handle the case where no matching quality is found, e.g., log an error or set a default
                console.error("No matching video quality found for the selected value");
              }
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
          <Select
              onValueChange={async (value: string) => {

                var vidvalue: MediaDeviceInfo | undefined = availableMicrophones.filter((item: MediaDeviceInfo) => item.deviceId == value)[0];

                applyAudioSettings(vidvalue!).then(r=>console.log("apply audio settings"));

                setSelectedMicrophone(vidvalue!)

              }}>
            <SelectTrigger className="bg-a11y/20">
              <div className="flex items-center gap-4">
                <MicOnIcon className="h-6 w-6" />{" "}
                <SelectValue placeholder={selectedMicrophone == null ? availableMicrophones[0]?.label : selectedMicrophone.label }  />
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
            <Select
                onValueChange={(value) => {
                  var vidvalue:MediaDeviceInfo|undefined=availableSpeakers.filter((item:MediaDeviceInfo) => item.deviceId == value )[0];

                  setSelectedSpeaker(vidvalue as MediaDeviceInfo)
                }}>
              <SelectTrigger className="bg-a11y/20">
                <div className="flex items-center gap-4">
                  <VolumeOnIcon className="h-6 w-6" />{" "}
                  <SelectValue placeholder={selectedSpeaker == null ? availableSpeakers[0]?.label : selectedSpeaker.label } />
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

        <div className="flex flex-col divide-y divide-a11y/20 py-6">

          <div className="flex items-center justify-between py-4">
            <div className={cn("flex gap-3", !micFilter.noiseSuppression && "opacity-60")}>
              <MicOnIcon className="h-6 w-6" />
              <label htmlFor="noiseSuppression">Noise Suppression</label>
            </div>
            <Switch
                checked={micFilter.noiseSuppression}
                onCheckedChange={(checked) => {
                  if(supportedConstraint?.noiseSuppression) {
                    applyAudioSettings(selectedMicrophone!).then(r => console.log("apply audio settings"));
                    setMicFilter({...micFilter, noiseSuppression: checked})
                  }else{
                    toast({
                      variant: "destructive",
                      title: "Not Supported",
                      description: `Your device did not support this feature`,
                    });
                  }
                }}
                id="noiseSuppression"
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div className={cn("flex gap-3", !micFilter.echoCancellation && "opacity-60")}>
              <MicOnIcon className="h-6 w-6" />
              <label htmlFor="echoCancellation">Echo Cancellation</label>
            </div>
            <Switch
                checked={micFilter.echoCancellation}
                onCheckedChange={(checked) => {
                  if(supportedConstraint?.echoCancellation) {
                    applyAudioSettings(selectedMicrophone!).then(r => console.log("apply audio settings"));
                    setMicFilter({...micFilter, echoCancellation: checked})
                  }else{
                    toast({
                      variant: "destructive",
                      title: "Not Supported",
                      description: `Your device did not support this feature`,
                    });
                  }
                }}
                id="echoCancellation"
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div className={cn("flex gap-3", !micFilter.autoGainControl && "opacity-60")}>
              <MicOnIcon className="h-6 w-6" />
              <label htmlFor="autoGainControl">Audio Gain</label>
            </div>
            <Switch
                checked={micFilter.autoGainControl}
                onCheckedChange={(checked) => {
                  if(supportedConstraint?.autoGainControl) {
                    setMicFilter({...micFilter, autoGainControl: checked});
                    applyAudioSettings(selectedMicrophone!).then(r => console.log("apply audio settings"));
                  }else{
                    toast({
                      variant: "destructive",
                      title: "Not Supported",
                      description: `Your device did not support this feature`,
                    });
                  }
                }}
                id="autoGainControl"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default DeviceSettings;
