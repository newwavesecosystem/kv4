import React, { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { screenSharingStreamState } from "~/recoil/atom";

function ScreenSharingComponent() {
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // if (videoRef.current) {
    //   videoRef.current.srcObject = screenSharingStream;
    // }
    // Clean up when the component unmounts
    return () => {
      const tracks = screenSharingStream?.getTracks();
      tracks?.forEach((track) => track.stop());
    };
  }, []);
  return (
    <div>
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
