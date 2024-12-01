import { useRouter } from "next/router";
import React, {useEffect, useState} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import CameraComponent from "~/components/camera/CameraComponent";
import MicOffIcon from "~/components/icon/outline/MicOffIcon";
import MicOnIcon from "~/components/icon/outline/MicOnIcon";
import SettingsIcon from "~/components/icon/outline/SettingsIcon";
import VideoOffIcon from "~/components/icon/outline/VideoOffIcon";
import VideoOnIcon from "~/components/icon/outline/VideoOnIcon";
import WifiOnIcon from "~/components/icon/outline/WifiOnIcon";
import Settings from "~/components/settings/Settings";
import { toast } from "~/components/ui/use-toast";
import Guest from "~/layouts/Guest";
import requestCameraAccess from "~/lib/camera/requestCameraAccess";
import stopCameraStream from "~/lib/camera/stopCameraStream";
import requestMicrophoneAccess from "~/lib/microphone/requestMicrophoneAccess";
import stopMicrophoneStream from "~/lib/microphone/stopMicrophoneStream";
import { cn } from "~/lib/utils";
import {
    authUserState,
    cameraOpenState,
    cameraStreamState,
    connectedUsersState, mediaPermissionState,
    micOpenState,
    microphoneStreamState, postLeaveMeetingState,
    settingsModalState,
} from "~/recoil/atom";
import {id} from "postcss-selector-parser";
import axios from "axios";
import * as ServerInfo from "~/server/ServerInfo";
import {IAuthUser} from "~/types/index";
import SpinnerIcon from "~/components/icon/outline/SpinnerIcon";
import Image from "next/image";
import {SetCurrentSessionToken} from "~/lib/localStorageFunctions";
import MediaOnboardingDialog from "~/lib/MediaOnboardingDialog";

function JoinId() {
  // get id from url
  const router = useRouter();
  const { id } = router.query;

  const [mediaPermission, setMediaPermission] = useRecoilState(mediaPermissionState);
  const [videoState, setVideoState] = useRecoilState(cameraOpenState);
  const [settingsOpen, setSettingsOpen] = useRecoilState(settingsModalState);
  const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);
  const [microphoneStream, setMicrophoneStream] = useRecoilState(
    microphoneStreamState,
  );
  const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(
        postLeaveMeetingState,
  );
  const passCode = false;
  const [user,setUser] = useRecoilState(authUserState);
  const setConnectedUsers = useSetRecoilState(connectedUsersState);

  const [data, setData] = useState({
    fullName: "",
    email: "",
    passCode: "",
    meetingId: id || "",
  });


  const [meetingData, setMeetingData] = useState({
    name: "",
    owner: "",
    passCode: false,
    display_image: null,
    meetingId: "",
  });

  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if(id) {
      validateRoom();
    }
  },[id] );
  const validateRoom=()=>{
    axios.post(`${ServerInfo.joinURL}kv4/validate-meeting`,{
      "name": id
    })
        .then(function (response) {
          const responseData = response.data;

          console.log(responseData)
          console.log(response);
          if (responseData?.success) {
            setMeetingData({
              meetingId: responseData?.data?.id, name: responseData?.data?.name, display_image: responseData?.data?.display_image, owner: responseData?.owner, passCode: responseData?.access_code
            })
          } else {
            // toast({
            //   variant: "destructive",
            //   title: "Uh oh! Something went wrong.",
            //   description: responseData?.message,
            // });

              setPostLeaveMeeting({
                  ...postLeaveMeeting,
                  isOthers: true,
              });
              // redirect to room
              router.push("/");
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

  const joinRoom=()=>{
    setLoading(true);
    axios.post(`${ServerInfo.joinURL}kv4/join-room`,{
      "room": id,
      "name": data.fullName,
      "email": data.email,
      "access_code": data.passCode
    })
        .then(function (response) {
          const responseData = response.data;

          console.log(responseData)
          console.log(response);
          if (responseData?.success) {
            // localStorage.setItem("meetingDetails", JSON.stringify(responseData?.response));
            // localStorage.setItem("sessiontoken", sessiontoken);
            // navigate("/call");
            // window.location.reload()

              // SetCurrentSessionToken(responseData.data!);

            setUser((prev:IAuthUser|null)=>({
              ...prev!,
              sessiontoken:responseData.data
            }));

            // redirect to room
            router.push("/");
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
          setLoading(false);
        })

  }


  const onChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  return (
      <Guest>
        {/*<Settings/>*/}
        <MediaOnboardingDialog />
        { meetingData.name == "" ? <div className="flex h-screen w-full items-center justify-center">
          <SpinnerIcon className="h-20 w-20 animate-spin"/>
        </div> :
        <div className="flex h-screen items-center justify-center bg-white md:h-full md:flex-1">
          <div className="m-auto flex flex-col items-center justify-center gap-3 px-5 text-center text-black">
          <span className=" text-xl font-semibold md:text-2xl">
            {meetingData.name}
          </span>
            <p>Hosted By {meetingData.owner}</p>
            <div className=" flex w-full flex-col items-center justify-center gap-5 animate-flip-down">
              {videoState ? (
                  <div
                      className="relative flex h-72 w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-a11y/20 md:w-[500px]">
                    <CameraComponent/>
                    <div
                        className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg  bg-[#1B1B1B] px-2 py-1 text-sm text-white">
                  <span className="hidden max-w-[150px] truncate lg:block">
                    {data.fullName}
                  </span>
                      <WifiOnIcon className="h-6 w-6 "/>
                    </div>
                  </div>
              ) : data.fullName == "" && meetingData.display_image != null ? (<div className="flex aspect-auto animate-pulse h-64 w-full flex-col items-center justify-center rounded-2xl bg-[#B9C9C2] md:w-[500px]"><Image
                  src={meetingData?.display_image}
                  width={90}
                  height={90}
                  className="rounded-full"
                  alt="profile picture"
              /></div>) : (
                  <div
                      className="flex aspect-auto h-64 w-full flex-col items-center justify-center rounded-2xl bg-[#B9C9C2] md:w-[500px]">
                    <div
                        className="flex aspect-square h-32 items-center justify-center rounded-full bg-[#93B3A5] text-3xl font-semibold uppercase text-white">
                      {data.fullName.split(" ")[0]?.slice(0, 1)}
                      {data.fullName.split(" ")[1]?.slice(0, 1)}
                    </div>
                    <span className="capitalize text-white">{data.fullName}</span>
                  </div>
              )}

              {/* action buttons */}
              <div className="flex w-full justify-between">
                <div className="flex items-center gap-4">
                  <button
                      className={cn(
                          "rounded-full p-2",
                          !mediaPermission.muteMicOnJoin ? "bg-primary" : "bg-[#B9C9C2]",
                      )}
                      onClick={async () => {
                          setMediaPermission((prev)=>({
                              ...prev,
                              muteMicOnJoin:!prev.muteMicOnJoin
                          }));
                      }}
                  >
                    {!mediaPermission.muteMicOnJoin ? (
                        <MicOnIcon className="h-6 w-6 "/>
                    ) : (
                        <MicOffIcon className="h-6 w-6 "/>
                    )}
                  </button>
                  <button
                      className={cn(
                          "rounded-full p-2",
                          videoState ? "bg-primary" : "bg-[#B9C9C2]",
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

                        if (desiredCamera.length < 1) {
                          toast({
                            variant: "destructive",
                            title: "Uh oh! Something went wrong.",
                            description: `No camera device detected. Kindly check if you need to grant permission`,
                          });
                          return;
                        }


                        const video = await requestCameraAccess(desiredCamera[0], {});
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
                        <VideoOnIcon className="h-6 w-6 "/>
                    ) : (
                        <VideoOffIcon className="h-6 w-6 "/>
                    )}
                  </button>
                </div>
                {/*<button*/}
                {/*  className="rounded-full bg-a11y/20 p-2"*/}
                {/*  onClick={() => setSettingsOpen(!settingsOpen)}*/}
                {/*>*/}
                {/*  <SettingsIcon className="h-6 w-6 " />*/}
                {/*</button>*/}
              </div>

              <div className="flex w-full gap-4 text-start">
                <div className="md:full flex w-[60%] flex-col gap-1">
                  <label className="" htmlFor="fullName">Name</label>
                  <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={data.fullName}
                      onChange={onChange}
                      required={true}
                      className="w-full truncate rounded-md border border-[#5D957E] bg-[#F8F8F8] px-2 py-2 placeholder:text-primary/80  focus:shadow-none focus:outline-none"
                  />
                </div>
                <div className="flex w-full flex-col gap-1">
                  <label htmlFor="email">Email</label>
                  <input
                      type="email"
                      name="email"
                      pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                      placeholder="Email"
                      value={data.email}
                      onChange={onChange}
                      required={true}
                      className=" w-full truncate rounded-md border border-[#5D957E] bg-[#F8F8F8] px-2 py-2 placeholder:text-primary/80  focus:shadow-none focus:outline-none "
                  />
                </div>
              </div>
              <div className="flex w-full gap-4 text-start text-sm">
                {/*<div*/}
                {/*    className={cn(*/}
                {/*        "flex flex-col gap-1",*/}
                {/*        passCode ? "w-[60%] md:w-full" : "w-full",*/}
                {/*    )}*/}
                {/*>*/}
                {/*  <label htmlFor="Meeting ID" className="self-start">*/}
                {/*    Meeting ID*/}
                {/*  </label>*/}
                {/*  {id ? (*/}
                {/*      <div className=" w-full truncate rounded-md border border-a11y/20 bg-transparent p-2 text-left ">*/}
                {/*        {id}*/}
                {/*      </div>*/}
                {/*  ) : (*/}
                {/*      <div className=" h-8 w-full animate-pulse rounded-md bg-a11y/40"></div>*/}
                {/*  )}*/}
                {/*</div>*/}
                {meetingData.passCode && (
                    <div className="md:full flex w-full flex-col gap-1">
                      <label htmlFor="passCode" className="self-start">
                        Access Code
                      </label>
                      <input
                          type="text"
                          name="passCode"
                          placeholder="Passcode"
                          value={data.passCode}
                          onChange={onChange}
                          className="w-full truncate rounded-md border border-[#5D957E] bg-[#F8F8F8] px-2 py-2 placeholder:text-primary/80  focus:shadow-none focus:outline-none"
                      />
                    </div>
                )}
              </div>
              <div className="flex w-full">
                <button
                    onClick={() => {
                        if( data.fullName == "") {
                            toast({
                                variant: "destructive",
                                title: "Uh oh! Something went wrong.",
                                description: "Name is invalid",
                            });
                            return;
                        }

                       if(data.email == "" || !/\S+@\S+\.\S+/.test(data.email)) {
                           toast({
                               variant: "destructive",
                               title: "Uh oh! Something went wrong.",
                               description: "Email is invalid",
                           });
                           return;
                       }

                      joinRoom();
                    }}
                    className="items-center gap-2 rounded-md border-2 border-a11y/20 bg-primary text-white font-semibold px-10 py-2 w-full disabled:opacity-40"
                >
                  {loading ? <SpinnerIcon className="animate-spin ml-32"/> : "Konn3ct"}
                </button>
              </div>
            </div>
          </div>
        </div>
        }
      </Guest>
  );
}

export default JoinId;
