import { useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import CameraComponent from "~/components/camera/CameraComponent";
import MicOffIcon from "~/components/icon/outline/MicOffIcon";
import MicOnIcon from "~/components/icon/outline/MicOnIcon";
import SettingsIcon from "~/components/icon/outline/SettingsIcon";
import VideoOffIcon from "~/components/icon/outline/VideoOffIcon";
import VideoOnIcon from "~/components/icon/outline/VideoOnIcon";
import WifiOnIcon from "~/components/icon/outline/WifiOnIcon";
import Settings from "~/components/settings/Settings";
import Guest from "~/layouts/Guest";
import requestMicrophoneAccess from "~/lib/microphone/requestMicrophoneAccess";
import { cn } from "~/lib/utils";
import {
  authUserState,
  cameraOpenState,
  cameraStreamState,
  connectedUsersState,
  micOpenState,
  microphoneStreamState,
  settingsModalState,
} from "~/recoil/atom";
import { useToast } from "./ui/use-toast";
import requestCameraAccess from "~/lib/camera/requestCameraAccess";
import stopMicrophoneStream from "~/lib/microphone/stopMicrophoneStream";
import stopCameraStream from "~/lib/camera/stopCameraStream";
import axios from "axios";
import * as ServerInfo from '../server/ServerInfo';

export default function PreSignIn() {
  const [micState, setMicState] = useRecoilState(micOpenState);
  const [videoState, setVideoState] = useRecoilState(cameraOpenState);
  const [settingsOpen, setSettingsOpen] = useRecoilState(settingsModalState);
  const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);
  const [microphoneStream, setMicrophoneStream] = useRecoilState(
    microphoneStreamState,
  );

  const setUser = useSetRecoilState(authUserState);
  const setConnectedUsers = useSetRecoilState(connectedUsersState);

  const [data, setData] = useState({
    fullName: "dev init",
    email: "dev",
    passCode: "",
    meetingId: "konn3ct.com/join/konn3ct",
  });

  // import { getMeetingIdFromLink } from "~/lib/utils";
  // const meetingId = getMeetingIdFromLink(data.meetingId)
  const passCode = true;

  const onChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const joinRoom=()=>{
    axios.post(`${ServerInfo.joinURL}join-room`,{
      "room": "tesss",
      "name": data.fullName,
      "email": data.email
    })
        .then(function (response) {
          const responseData = response.data;

          console.log(responseData)
          console.log(response);
          if (responseData?.success) {
            localStorage.setItem("meetingDetails", JSON.stringify(responseData?.response));
            // localStorage.setItem("sessiontoken", sessiontoken);
            // navigate("/call");
            // window.location.reload()

            setUser({
              connectionAuthTime: 0, connectionID: "",
              meetingDetails: null, sessiontoken: "",
              ...data,
              id: Math.floor(Math.random() * 100)
            })
          } else {
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: responseData?.message,
            });
          }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .finally(function () {
          // always executed
        })

  }

  const { toast } = useToast();
  return (
    <Guest>
      <Settings />
      <div className="flex h-screen items-center justify-center bg-primary md:h-full md:flex-1">
        <div className="m-auto flex flex-col items-center justify-center gap-3 px-5 text-center">
          <span className=" text-xl font-semibold md:text-2xl">
            Join Meeting
          </span>
          <p>Meeting ID or Personal Link Name</p>
          <div className=" flex w-full flex-col items-center justify-center gap-5">
            {videoState ? (
              <div className="relative flex h-72 w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-a11y/20 md:w-[500px]">
                <CameraComponent />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg  bg-primary/60 px-2 py-1 text-sm">
                  <span className="hidden max-w-[150px] truncate lg:block">
                    {data.fullName}
                  </span>
                  <WifiOnIcon className="h-6 w-6 " />
                </div>
              </div>
            ) : (
              <div className=" flex aspect-auto h-64 w-full flex-col items-center justify-center rounded-2xl bg-a11y/20 md:w-[500px]">
                <div className="flex aspect-square h-32 items-center justify-center rounded-full bg-primary/80 text-3xl font-extrabold uppercase">
                  {data.fullName.split(" ")[0]?.slice(0, 1)}
                  {data.fullName.split(" ")[1]?.slice(0, 1)}
                </div>
                <span className="capitalize">{data.fullName}</span>
              </div>
            )}

            {/* action buttons */}
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-4">
                <button
                  className={cn(
                    "rounded-full p-2",
                    micState ? "bg-a11y/20" : "border border-a11y/20",
                  )}
                  onClick={async () => {
                    if (micState && microphoneStream) {
                      stopMicrophoneStream(microphoneStream);
                      setMicrophoneStream(null);
                      setMicState(!micState);
                      return;
                    }

                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const desiredMic = devices.filter((device) => device.kind === "audioinput");

                    if(desiredMic.length < 1){
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: `No microphone device detected. Kindly check if you need to grant permission`,
                      });
                      return;
                    }

                    const mic = await requestMicrophoneAccess(desiredMic[0], false,false,false);
                    if (mic) {
                      setMicrophoneStream(mic);
                      setMicState(!micState);
                    } else {
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "Kindly check your microphone settings.",
                      });
                    }
                  }}
                >
                  {micState ? (
                    <MicOnIcon className="h-6 w-6 " />
                  ) : (
                    <MicOffIcon className="h-6 w-6 " />
                  )}
                </button>
                <button
                  className={cn(
                    "rounded-full p-2",
                    videoState ? "bg-a11y/20" : "border border-a11y/20",
                  )}
                  onClick={async () => {
                    if (videoState && cameraStream) {
                      stopCameraStream(cameraStream);
                      setCameraSteam(null);
                      setVideoState(!videoState);
                      return;
                    }

                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const desiredCamera = devices.filter((device) => device.kind === "videoinput");

                    if(desiredCamera.length < 1){
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: `No camera device detected. Kindly check if you need to grant permission`,
                      });
                      return;
                    }

                    const video = await requestCameraAccess(desiredCamera[0],{});

                    if (video) {
                      setCameraSteam(video);
                      setVideoState(!videoState);
                    } else {
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "Kindly check your camera settings.",
                      });
                    }
                  }}
                >
                  {videoState ? (
                    <VideoOnIcon className="h-6 w-6 " />
                  ) : (
                    <VideoOffIcon className="h-6 w-6 " />
                  )}
                </button>
              </div>
              <button
                className="rounded-full bg-a11y/20 p-2"
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <SettingsIcon className="h-6 w-6 " />
              </button>
            </div>

            <div className="flex w-full gap-4 text-start text-sm">
              <div
                className={cn(
                  "flex flex-col gap-1",
                  passCode ? "w-[60%] md:w-full" : "w-full",
                )}
              >
                <label htmlFor="Meeting ID" className="self-start truncate">
                  Meeting Link or ID
                </label>
                <input
                  type="meetingId"
                  name="meetingId"
                  placeholder="Meeting Link or ID"
                  value={data.meetingId}
                  onChange={onChange}
                  className="w-full truncate rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80  focus:shadow-none focus:outline-none"
                />
              </div>
              {passCode && (
                <div className="md:full flex w-full flex-col gap-1">
                  <label htmlFor="passCode" className="self-start">
                    Passcode
                  </label>
                  <input
                    type="text"
                    name="passCode"
                    placeholder="passcode"
                    value={data.passCode}
                    onChange={onChange}
                    className="w-full truncate rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80  focus:shadow-none focus:outline-none"
                  />
                </div>
              )}
            </div>
            <div className="flex w-full gap-4 text-start text-sm">
              <div className="md:full flex w-[60%] flex-col gap-1">
                <label htmlFor="fullName">Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={data.fullName}
                  onChange={onChange}
                  className="w-full truncate rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80  focus:shadow-none focus:outline-none"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={data.email}
                  onChange={onChange}
                  className=" w-full truncate rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80  focus:shadow-none focus:outline-none "
                />
              </div>
            </div>
            <div className="flex w-full text-sm ">
              <button
                disabled={!data.email || !data.fullName || !data.meetingId}
                onClick={() => {
                  const id = Math.floor(Math.random() * 100);
                  // login user
                  setUser({
                    connectionAuthTime: 0, connectionID: "",
                    meetingDetails: null, sessiontoken: "",
                    ...data,
                    id
                  });

                  // add user to connected list array
                  setConnectedUsers((prev) => [
                    ...prev,
                    {
                      cameraFeed: cameraStream,
                      email: data.email,
                      fullName: data.fullName,
                      id: id,
                      isCameraOpen: videoState,
                      isHandRaised: false,
                      isMicOpen: micState,
                      isScreenSharing: false,
                      microphoneFeed: microphoneStream,
                      screenSharingFeed: null,
                      isModerator: false,
                      speaker: null,
                      profilePicture: null,
                    },
                  ]);
                }}
                className=" rounded-lg bg-secondary/30 px-10 py-2 disabled:opacity-40"
              >
                Konn3ct
              </button>
            </div>
          </div>
        </div>
      </div>
    </Guest>
  );
}
