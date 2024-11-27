import React, { useEffect, useRef, useState } from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import { cn } from "~/lib/utils";
import {
    authUserState,
    connectedUsersState,
    participantListState,
    screenSharingState,
    screenSharingStreamState
} from "~/recoil/atom";
import SpinnerIcon from "../icon/outline/SpinnerIcon";
import ExpandIcon from "~/components/icon/outline/ExpandIcon";
import ShareScreenOffIcon from "~/components/icon/outline/ShareScreenOffIcon";
import {websocketKurentoScreenshareEndScreenshare} from "~/server/KurentoScreenshare";
import {CurrentUserIsPresenter} from "~/lib/checkFunctions";
import playAndRetry from "~/lib/mediaElementPlayRetry";

function ScreenSharingComponent() {
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);
  const [isLoading, setIsLoading] = useState(true);

  const [screenShareState, setScreenShareState] = useRecoilState(screenSharingState);

    const user = useRecoilValue(authUserState);
    const [participantList, setParticipantList] = useRecoilState(participantListState);

  useEffect(() => {
    setIsLoading(false);
    if (videoRef.current) {
      videoRef.current.srcObject = screenSharingStream;

        playAndRetry(document.getElementById("screenSharePlay"),CurrentUserIsPresenter(participantList,user)).then(r=>console.log("screenSharePlay playAndRetry ",r));
    }
  }, []);


  return (
      <div
          className={cn(
              " m-auto h-[calc(100svh-128px)] max-w-2xl p-4 xl:max-w-6xl 2xl:max-w-none",
              connectedUsers.filter((user) => user.isMicOpen === true)?.length > 0 &&
              "mt-6 h-[calc(100svh-150px)]",
          )}
      >

          {isLoading && (
              <div className="flex h-full flex-col items-center justify-center rounded-xl bg-a11y/20">
                  <SpinnerIcon className="h-16 w-16 animate-spin"/>
              </div>
          )}
          {CurrentUserIsPresenter(participantList, user) && (
              <div className="grid h-full w-full bg-black/20 justify-items-center content-center" style={{justifyContent: 'center'}}>
                  <video
                      ref={videoRef}
                      id="screenSharePlay"
                      autoPlay
                      playsInline
                      muted
                      className="h-3/4 w-3/4"
                  >
                      Your browser does not support video tag
                  </video>
                  <span>You are sharing your screen</span>
                  <button
                      onClick={() => {
                          websocketKurentoScreenshareEndScreenshare(screenSharingStream!);

                          setScreenSharingStream(null);
                          setScreenShareState(false);
                      }}
                      className="mt-3 flex items-center gap-2 rounded-md border-2 border-a11y/20 bg-red-700/80 px-3 py-2 text-sm backdrop-blur-3xl"
                  >
                      <ShareScreenOffIcon className="h-5 w-5 "/>
                      <span>Stop Screen Sharing</span>
                  </button>
              </div>)}

          {!CurrentUserIsPresenter(participantList, user) && (
              <div className="h-full w-full">
                  <video
                      ref={videoRef}
                      id="screenSharePlay"
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full"
                  >
                      Your browser does not support video tag
                  </video>

                  <div className="absolute right-7 top-7 ">
                      <button
                          onClick={() => {
                              document.getElementById("screenSharePlay")?.requestFullscreen();
                          }}
                          className="flex items-center gap-2 rounded-md border-2 border-a11y/20 bg-primary/20 px-3 py-2 text-sm backdrop-blur-3xl"
                      >
                          <ExpandIcon className="h-5 w-5"/>
                          <span>Go Fullscreen</span>
                      </button>
                  </div>
              </div>)
          }


      </div>
  );
}

export default ScreenSharingComponent;
