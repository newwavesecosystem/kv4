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
  micOpenState,
  microphoneStreamState,
  screenSharingStreamState,
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
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );
  const setUser = useSetRecoilState(authUserState);

  const [data, setData] = useState({
    fullName: "dev init",
    email: "dev",
  });
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
              ...data,
              id: Math.floor(Math.random() * 100),
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
      <div className="flex h-screen items-center justify-center bg-konn3ct-gray-light md:h-full md:flex-1">
        <div className="flex flex-col items-center justify-center gap-3 px-5 text-center">
          <span className=" text-xl font-semibold md:text-2xl">
            Get Started
          </span>
          <p>Setup your audio and video before joining</p>
          <div className=" mt-9 flex w-full flex-col items-center justify-center gap-5">
            {videoState ? (
              <div className="relative flex h-72 w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-konn3ct-inactive text-white md:w-[500px]">
                <CameraComponent />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg  bg-konn3ct-black px-2 py-1 text-sm">
                  <span className="hidden max-w-[150px] truncate lg:block">
                    {data.fullName}
                  </span>
                  <WifiOnIcon className="h-6 w-6 " />
                </div>
              </div>
            ) : (
              <div className=" flex aspect-auto h-64 w-full flex-col items-center justify-center rounded-2xl bg-konn3ct-inactive text-white md:w-[500px]">
                <div className="flex aspect-square h-32 items-center justify-center rounded-full bg-[#93B3A5] text-3xl font-extrabold uppercase">
                  {data.fullName.split(" ")[0]?.slice(0, 1)}
                  {data.fullName.split(" ")[1]?.slice(0, 1)}
                </div>
                <span className="capitalize">{data.fullName}</span>
              </div>
            )}
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-4">
                <button
                  className={cn(
                    "rounded-full p-2",
                    micState
                      ? "bg-konn3ct-active dark:bg-red-900"
                      : "bg-konn3ct-inactive",
                  )}
                  onClick={async () => {
                    if (micState && microphoneStream) {
                      stopMicrophoneStream(microphoneStream);
                      setMicrophoneStream(null);
                      setMicState(!micState);
                      return;
                    }

                    const mic = await requestMicrophoneAccess();
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
                    videoState ? "bg-konn3ct-active" : "bg-konn3ct-inactive",
                  )}
                  onClick={async () => {
                    if (videoState && cameraStream) {
                      stopCameraStream(cameraStream);
                      setCameraSteam(null);
                      setVideoState(!videoState);
                      return;
                    }
                    const video = await requestCameraAccess();
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
                className="rounded-full bg-konn3ct-inactive p-2"
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <SettingsIcon className="h-6 w-6 " />
              </button>
            </div>
            <div className="flex w-full gap-4 text-start text-sm">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={data.fullName}
                onChange={onChange}
                className="w-[60%] truncate rounded-md border border-konn3ct-green bg-transparent px-2 py-2  focus:shadow-none focus:outline-none md:w-full"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={data.email}
                onChange={onChange}
                className=" w-full truncate rounded-md border border-konn3ct-green bg-transparent px-2 py-2  focus:shadow-none focus:outline-none "
              />
            </div>
            <div className="flex w-full text-sm ">
              <button
                disabled={!data.email || !data.fullName}
                onClick={() =>
                    joinRoom()
                  // setUser({
                  //   ...data,
                  //   id: Math.floor(Math.random() * 100),
                  // })
                }
                className=" rounded-lg bg-konn3ct-green px-10 py-2 text-white disabled:opacity-40"
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
