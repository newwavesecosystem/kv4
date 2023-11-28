import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import React, {useEffect, useState} from "react";
import {useRecoilState, useSetRecoilState} from "recoil";
import Authenticated from "~/layouts/Authenticated";
import {
  connectedUsersState,
  currentColorTheme,
  screenSharingStreamState,
  whiteBoardOpenState,
} from "~/recoil/atom";
import Image from "next/image";
import MicOnIcon from "./icon/outline/MicOnIcon";
import SingleCameraComponent from "./camera/SingleCameraComponent";
import { cn } from "~/lib/utils";

// import "~/styles/tldraw.css";
import dynamic from "next/dynamic";
import {authUserState, screenSharingStreamState} from "~/recoil/atom";
import ScreenSharingComponent from "./screenSharing/ScreenSharingComponent";
import Websocket from "~/server/Websocket";
import KurentoAudio from "~/server/KurentoAudio";
import axios from "axios";
import * as ServerInfo from "~/server/ServerInfo";
import {toast} from "~/components/ui/use-toast";
// import WhiteboardComponent from "./whiteboard/WhiteboardComponent";
const WhiteboardComponent = dynamic(
  () => import("~/components/whiteboard/WhiteboardComponent"),
  { ssr: false },
);

function PostSignIn() {
  const [screenShareState, setScreenShareState] = useState(true);
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);

  const [isWhiteboardOpen, setIsWhiteboardOpen] =
    useRecoilState(whiteBoardOpenState);

  return (

  const setUser = useSetRecoilState(authUserState);

  const validateToken= (token: string | null)=>{
    axios.get(`${ServerInfo.tokenValidationURL}?sessionToken=${token}`)
        .then(function (response) {
          const responseData = response.data;

          console.log(responseData)
          console.log(response);

            if (responseData?.response?.returncode === 'SUCCESS') {

                setUser({
                    email: "", fullName: "", id: 0,
                    meetingDetails: responseData?.response,
                    sessiontoken: token ?? ' '
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: 'Invalid Session Token',
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

    useEffect(() => {

      // Get the URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      console.log("urlParams")
      console.log(urlParams)
      const token = urlParams.get('sessionToken');
      console.log("token")
      console.log(token)

        validateToken(token);
    }, ['']);



    return (
    <Authenticated>
      <div className="relative h-[calc(100vh-128px)] bg-primary/60 ">
        {/* temp button to stimulate ppl joining */}
        <div className={"fixed right-[50%] top-0 z-[999] flex gap-2 "}>
          <button
            className="  rounded-md bg-orange-400 p-1"
            onClick={() => {
              const newUser = connectedUsers[0];
              if (!newUser) return;
              setConnectedUsers((prev) => [
                ...prev,
                {
                  ...newUser,
                  id: Math.floor(Math.random() * 100),
                },
              ]);
            }}
          >
            add
          </button>
          <button
            className="  rounded-md bg-orange-400 p-1"
            onClick={() => {
              if (connectedUsers.length === 1) return;
              setConnectedUsers((prev) => prev.slice(0, prev.length - 1));
            }}
          >
            remove
          </button>
        </div>

        {/* show active people talking */}
        {connectedUsers.filter((user) => user.isMicOpen === true)?.length >
          0 && (
          <div className="no-scrollbar absolute top-2 flex h-6 w-full justify-center gap-3 overflow-x-scroll text-xs antialiased">
            {connectedUsers
              .filter((user) => user.isMicOpen === true)
              .map((user, index) => (
                <div
                  key={index}
                  className="border-a11y/20 flex max-w-[100px] items-center justify-center gap-1 rounded-3xl border p-1"
                >
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      width={20}
                      height={20}
                      className="rounded-full"
                      alt="profile picture"
                    />
                  ) : (
                    <div className="bg-a11y/20 flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                      {" "}
                      {user.fullName.split(" ")[0]?.slice(0, 1)}
                      {user.fullName.split(" ")[1]?.slice(0, 1)}
                    </div>
                  )}
                  <span className="truncate">{user.fullName}</span>
                  <MicOnIcon className="h-4 w-4 shrink-0" />
                </div>
              ))}
          </div>
        )}

        {/* render camera feed if not whiteboard or screensharing */}
        {!isWhiteboardOpen && !screenSharingStream && (
          <div
            className={cn(
              " m-auto h-[calc(100vh-128px)] p-4 ",
              connectedUsers.filter((user) => user.isMicOpen === true)?.length >
                0 && "mt-6 h-[calc(100vh-150px)]",
              connectedUsers.length === 1 &&
                " flex items-center justify-center md:aspect-square  ",
              connectedUsers.length === 2 &&
                "grid justify-center gap-2 md:grid-cols-2",
              connectedUsers.length === 3 &&
                "grid grid-cols-2 gap-2 md:grid-cols-3",
              connectedUsers.length >= 4 && "grid grid-cols-2 gap-2",
              connectedUsers.length >= 5 && "grid gap-2 md:grid-cols-3",
              connectedUsers.length >= 7 && "grid gap-2 md:grid-cols-4",
              connectedUsers.length >= 13 && "grid gap-2 md:grid-cols-5",
              connectedUsers.length >= 16 && "grid gap-2 md:grid-cols-6",
            )}
          >
            {connectedUsers.map((user, index) => (
              <SingleCameraComponent index={index} key={index} user={user} />
            ))}
          </div>
        )}

        {/* render screen sharing if screen sharing is open and whiteboard is closed */}
        {screenSharingStream && !isWhiteboardOpen && <ScreenSharingComponent />}

        {/* render whiteboard if whiteboard is open */}
        {isWhiteboardOpen && <WhiteboardComponent />}
        {/* {screenSharingStream && screenShareState && <ScreenSharingComponent />} */}
        <Websocket/>
        <KurentoAudio/>
      </div>
    </Authenticated>
  );
}

export default PostSignIn;
