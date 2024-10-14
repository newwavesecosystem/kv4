import React, { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { cn } from "~/lib/utils";
import { connectedUsersState, screenSharingStreamState } from "~/recoil/atom";
import SpinnerIcon from "../icon/outline/SpinnerIcon";
import {websocketStopExternalVideo} from "~/server/Websocket";
import ExpandIcon from "~/components/icon/outline/ExpandIcon";

function ScreenSharingComponent() {
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    if (videoRef.current) {
      videoRef.current.srcObject = screenSharingStream;
    }
  }, []);


  return (
    <div
      className={cn(
        " m-auto h-[calc(100vh-128px)] max-w-2xl p-4 xl:max-w-6xl 2xl:max-w-none",
        connectedUsers.filter((user) => user.isMicOpen === true)?.length > 0 &&
          "mt-6 h-[calc(100vh-150px)]",
      )}
    >
      <button
          onClick={() => {
            document.getElementById("screenSharePlay")?.requestFullscreen();
          }}
          className="absolute right-7 top-7 flex items-center gap-2 rounded-md border-2 border-a11y/20 bg-primary/20 px-3 py-2 text-sm backdrop-blur-3xl"
      >
        <ExpandIcon className="h-5 w-5"/>
        <span>Go Fullscreen</span>
      </button>
      {isLoading && (
        <div className="flex h-full flex-col items-center justify-center rounded-xl bg-a11y/20">
          <SpinnerIcon className="h-16 w-16 animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        id="screenSharePlay"
        autoPlay
        playsInline
        // muted
        className="h-full w-full"
      >
        Your browser does not support video tag
      </video>
    </div>
  );
}

export default ScreenSharingComponent;
