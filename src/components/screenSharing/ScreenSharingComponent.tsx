import React, { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { cn } from "~/lib/utils";
import { connectedUsersState, screenSharingStreamState } from "~/recoil/atom";
import SpinnerIcon from "../icon/outline/SpinnerIcon";

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
    // if (videoRef.current) {
    //   videoRef.current.srcObject = screenSharingStream;
    // }
    // Clean up when the component unmounts
    return () => {
      const tracks = screenSharingStream?.getTracks();
      tracks?.forEach((track) => track.stop());
    };
  }, []);

  if (videoRef.current) {
    // get the user from the connected users state and attach the stream to the video element
    const user = connectedUsers.find((user) => user.isScreenSharing === true);
    if (!user) return null;
    console.log(user);

    videoRef.current.srcObject = user.screenSharingFeed;
  }

  return (
    <div
      className={cn(
        " m-auto h-[calc(100vh-128px)] max-w-2xl p-4 xl:max-w-6xl",
        connectedUsers.filter((user) => user.isMicOpen === true)?.length > 0 &&
          "mt-6 h-[calc(100vh-150px)]",
      )}
    >
      {isLoading && (
        <div className="bg-a11y/20 flex h-full flex-col items-center justify-center rounded-xl">
          <SpinnerIcon className="h-16 w-16 animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full flex-1 object-cover"
      >
        Your browser does not support video tag
      </video>
    </div>
  );
}

export default ScreenSharingComponent;
