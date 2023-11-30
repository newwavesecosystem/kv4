import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Authenticated from "~/layouts/Authenticated";
import {
  connectedUsersState,
  currentColorTheme,
  eCinemaModalState,
  pollModalState,
  screenSharingStreamState,
  whiteBoardOpenState,
} from "~/recoil/atom";
import Image from "next/image";
import MicOnIcon from "./icon/outline/MicOnIcon";
import SingleCameraComponent from "./camera/SingleCameraComponent";
import { cn } from "~/lib/utils";

// import "~/styles/tldraw.css";
import dynamic from "next/dynamic";
import ScreenSharingComponent from "./screenSharing/ScreenSharingComponent";
import ArrowChevronDownIcon from "./icon/outline/ArrowChevronDownIcon";
import ECinemaComponent from "./eCinema/ECinemaComponent";
// import WhiteboardComponent from "./whiteboard/WhiteboardComponent";
const WhiteboardComponent = dynamic(
  () => import("~/components/whiteboard/WhiteboardComponent"),
  { ssr: false },
);

function PostSignIn() {
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);

  const [isWhiteboardOpen, setIsWhiteboardOpen] =
    useRecoilState(whiteBoardOpenState);

  const [pollModal, setPollModal] = useRecoilState(pollModalState);
  const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);

  return (
    <Authenticated>
      <div className="relative h-[calc(100vh-128px)] bg-primary/60 ">
        {/* polls */}
        {(pollModal.isActive || pollModal.isEnded) && pollModal.step === 0 && (
          <button
            onClick={() => {
              setPollModal((prev) => ({
                ...prev,
                step: 2,
              }));
            }}
            className="fixed bottom-20 left-5 z-10 flex items-center gap-2 rounded-md bg-primary px-4 py-3"
          >
            <span>View Polls</span>
            <ArrowChevronDownIcon className="h-6 w-6" />
          </button>
        )}
        {/* temp button to stimulate ppl joining */}
        {/* <div className={"fixed right-[50%] top-0 z-[999] flex gap-2 "}>
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
        </div> */}

        {/* show active people talking */}
        {(isWhiteboardOpen || screenSharingStream) &&
          connectedUsers.filter((user) => user.isMicOpen === true)?.length >
            0 && (
            <div className="no-scrollbar absolute top-2 flex h-6 w-full justify-center gap-3 overflow-x-scroll text-xs antialiased">
              {connectedUsers
                .filter((user) => user.isMicOpen === true)
                .map((user, index) => (
                  <div
                    key={index}
                    className="flex max-w-[100px] items-center justify-center gap-1 rounded-3xl border border-a11y/20 p-1"
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
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-a11y/20">
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
        {!isWhiteboardOpen &&
          !screenSharingStream &&
          !eCinemaModal.isActive && (
            <div
              className={cn(
                " m-auto h-[calc(100vh-128px)] p-4 ",
                (isWhiteboardOpen || screenSharingStream) &&
                  connectedUsers.filter((user) => user.isMicOpen === true)
                    ?.length > 0 &&
                  "mt-6 h-[calc(100vh-150px)]",
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

        {(!isWhiteboardOpen || !screenSharingStream) &&
          eCinemaModal.isActive && <ECinemaComponent />}

        {/* {screenSharingStream && screenShareState && <ScreenSharingComponent />} */}
      </div>
    </Authenticated>
  );
}

export default PostSignIn;
