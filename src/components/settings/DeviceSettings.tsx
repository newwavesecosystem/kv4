import React, {useEffect, useState} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import {
  authUserState,
  availableCamerasState,
  availableMicrophonesState,
  availableSpeakersState, cameraOpenState, cameraStreamState, connectionStatusState,
  currentTabState, microphoneStreamState, participantCameraListState, participantListState,
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

  // if (availableCameras.length === 0 || availableMicrophones.length === 0) {
  //   getDevices();
  // }

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

  const { toast } = useToast();

  useEffect(()=>{
    console.log('selectedMicrophone',selectedMicrophone)
    getDevices();
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
              onValueChange={(value:string) => {

                var vidvalue:MediaDeviceInfo|undefined=availableCameras.filter((item:MediaDeviceInfo) =>item.deviceId == value)[0];

                if (videoState) {
                  stopCameraStream(cameraStream);
                  setVideoState(!videoState);
                  console.log("change_device videoState",videoState)
                  let ur = participantCameraList.filter((item: any) => item?.intId == user?.meetingDetails?.internalUserID)[0];

                  console.log("change_device participantCameraList",ur)

                  if (ur.deviceID != vidvalue?.deviceId) {
                    console.log("change_device device id changed")
                    websocketStopCamera(`${user?.meetingDetails?.internalUserID}${user?.meetingDetails?.authToken}${ur.deviceID}`);

                    setTimeout(async()=>{
                      const video = await requestCameraAccess(vidvalue);
                      if (video) {
                        console.log('change_device Camera is on');
                        setCameraSteam(video);
                        setVideoState(true);

                        // update the user camera info

                        const updatedArray = participantCameraList?.map((item:any) => {
                          if (item.intId === user?.meetingDetails?.internalUserID) {
                            return {...item, stream: video, deviceID:vidvalue?.deviceId, streamID: `${user?.meetingDetails?.internalUserID}${user?.meetingDetails?.authToken}${vidvalue?.deviceId}`};
                          }
                          return item;
                        });

                        console.log(updatedArray);

                        setParticipantCameraList(updatedArray)

                      } else {
                        toast({
                          variant: "destructive",
                          title: "Uh oh! Something went wrong.",
                          description: "Kindly check your camera settings.",
                        });
                      }
                    }, 5000);


                  }

                }

                setSelectedCamera(vidvalue as MediaDeviceInfo)
              }}>
            <SelectTrigger className="bg-a11y/20">
              <div className="flex items-center gap-4">
                <VideoOnIcon className="h-6 w-6" />{" "}
                <SelectValue placeholder={selectedCamera == null ? "Pick a camera" : selectedCamera.label }  />
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
          <Select
              onValueChange={(value: string) => {

                var vidvalue: MediaDeviceInfo | undefined = availableMicrophones.filter((item: MediaDeviceInfo) => item.deviceId == value)[0];
                setSelectedMicrophone(vidvalue as MediaDeviceInfo)

                stopMicrophoneStream(microphoneStream);

                setTimeout(async()=> {
                  const mic = await requestMicrophoneAccess(vidvalue);
                  if (mic) {
                    setMicrophoneStream(mic);
                    setConnection({
                      websocket_connection: true,
                      audio_connection: false
                    })
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Something went wrong.",
                      description: "Kindly check your microphone settings.",
                    });
                  }
                },3000);

              }}>
            <SelectTrigger className="bg-a11y/20">
              <div className="flex items-center gap-4">
                <VideoOnIcon className="h-6 w-6" />{" "}
                <SelectValue placeholder={selectedMicrophone == null ?"Pick a microphone" : selectedMicrophone.label }  />
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
                  <VideoOnIcon className="h-6 w-6" />{" "}
                  <SelectValue placeholder={selectedSpeaker == null ? "Pick a Speaker" : selectedSpeaker.label } />
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
