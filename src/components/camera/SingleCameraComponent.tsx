import React, { useRef, useState } from "react";
import { connectedUsersState } from "~/recoil/atom";
import { IConnectedUser } from "~/types";
import MicOnIcon from "../icon/outline/MicOnIcon";
import MicOffIcon from "../icon/outline/MicOffIcon";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { useRecoilState } from "recoil";
import PinIcon from "../icon/outline/PinIcon";
import VideoConfOffIcon from "../icon/outline/VideoConfOffIcon";
import HandOnIcon from "../icon/outline/HandOnIcon";
import WifiOnIcon from "../icon/outline/WifiOnIcon";

function SingleCameraComponent({
  user,
  key,
  index,
}: {
  user: IConnectedUser;
  key: number;
  index: number;
}) {
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Attach the new stream to the video element
  if (videoRef.current) {
    videoRef.current.srcObject = user.cameraFeed;
  }

  return (
    <div
      className={cn(
        "relative aspect-square h-full w-full overflow-hidden rounded-lg bg-a11y/20",
        (connectedUsers.length === 3 || connectedUsers.length === 5) &&
          index === 0 &&
          "col-span-2 md:col-auto",
        user.isMicOpen &&
          "ring-2 ring-primary ring-offset-2 ring-offset-primary",
      )}
    >
      <div className=" absolute right-3 top-3 flex items-center gap-1">
        <button
          className={cn(
            "p-1 ",
            user.isMicOpen
              ? "rounded-full border border-a11y/20 bg-primary/40"
              : "rounded-full bg-primary/80",
          )}
        >
          {user.isMicOpen ? (
            <MicOnIcon className="h-5 w-5 " />
          ) : (
            <MicOffIcon className="h-5 w-5 " />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="rounded-full bg-primary/80 p-1">
              <EllipsisIcon className="h-5 w-5 " />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-0 bg-primary text-a11y"
          >
            <DropdownMenuItem className="py-2">
              <PinIcon className="mr-2 h-5 w-5" />
              Pin to screen
            </DropdownMenuItem>
            <DropdownMenuSeparator className="h-0.5" />
            <DropdownMenuItem className="py-2">
              <VideoConfOffIcon className="mr-2 h-5 w-5" />
              Mirror
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {user.isHandRaised && (
        <div className="absolute left-3 top-3 flex items-center gap-1">
          <HandOnIcon className="h-8 w-8 " />
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        hidden={!user.isCameraOpen}
        className="h-full w-full flex-1 object-cover"
      >
        Your browser does not support video tag
      </video>
      {user.isCameraOpen && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg  bg-primary/60 px-2 py-1 text-sm">
          <span className=" max-w-[150px] truncate ">{user.fullName}</span>
          <WifiOnIcon className="hidden h-6 w-6 md:block" />
        </div>
      )}
      {!user.isCameraOpen && (
        <div
          className={cn(
            " flex h-full w-full flex-col items-center justify-center bg-a11y/20 ",
            connectedUsers.length === 2 && "w-screen md:w-full",
          )}
        >
          <div className="flex aspect-square h-32 items-center justify-center rounded-full bg-primary/80 text-3xl font-extrabold uppercase">
            {user.fullName.split(" ")[0]?.slice(0, 1)}
            {user.fullName.split(" ")[1]?.slice(0, 1)}
          </div>
          <span className="capitalize">{user.fullName}</span>
        </div>
      )}
    </div>
  );
}

export default SingleCameraComponent;
