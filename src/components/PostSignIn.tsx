import React, { useState } from "react";
import { useRecoilState } from "recoil";
import Authenticated from "~/layouts/Authenticated";
import { screenSharingStreamState } from "~/recoil/atom";
import ScreenSharingComponent from "./screenSharing/ScreenSharingComponent";
import Websocket from "~/server/Websocket";
import KurentoAudio from "~/server/KurentoAudio";

function PostSignIn() {
  const [screenShareState, setScreenShareState] = useState(true);
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );
  return (
    <Authenticated>
      <div className="flex h-[80vh] items-center justify-center bg-konn3ct-gray-light md:h-full md:flex-1">
        PostSignIn
        {screenSharingStream && screenShareState && <ScreenSharingComponent />}
        <Websocket/>
        <KurentoAudio/>
      </div>
    </Authenticated>
  );
}

export default PostSignIn;
