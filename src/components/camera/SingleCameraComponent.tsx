import React, { useRef, useState } from "react";
import {
  authUserState,
  connectedUsersState,
  participantCameraListState,
  participantListState,
  participantTalkingListState
} from "~/recoil/atom";
import {IAuthUser, IConnectedUser, IParticipant} from "~/types";
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
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import PinIcon from "../icon/outline/PinIcon";
import VideoConfOffIcon from "../icon/outline/VideoConfOffIcon";
import HandOnIcon from "../icon/outline/HandOnIcon";

function SingleCameraComponent({
  participant,
  key,
  index,
}: {
  participant: IParticipant;
  key: number;
  index: number;
}) {
  const [connectedUsers, setConnectedUsers] = useRecoilState(connectedUsersState);
  // const user = useRecoilValue(authUserState);
  const participantList = useRecoilValue(participantListState);
  const participantTalkingList = useRecoilValue(participantTalkingListState);
  const participantCameraList = useRecoilValue(participantCameraListState);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  let userCamera=participantCameraList.filter((cItem:any) => cItem?.intId == participant.intId);
  // Attach the new stream to the video element
  if(userCamera.length>0){
    if (videoRef.current) {
      videoRef.current.srcObject = userCamera.stream;
    }
  }


  return (
    <div
        key={key}
      className={cn(
        "bg-a11y/20 relative aspect-square h-full w-full overflow-hidden rounded-lg",
        (participantList.length === 3 || participantList.length === 5) &&
          index === 0 &&
          "col-span-2 md:col-auto",
      )}
    >
      <div className=" absolute right-3 top-3 flex items-center gap-1">
        <button
          className={cn(
            "p-1 ",
              participantTalkingList.filter((eachItem:any) => eachItem?.intId == participant.intId).map((eachItem:any) => (
                  eachItem?.joined && eachItem?.muted
              ? "border-a11y/20 rounded-full border bg-primary/40"
              : "rounded-full bg-primary/80"
          )))}
        >
          {participantTalkingList.filter((eachItem:any) => eachItem?.intId == participant.intId).map((eachItem:any) => (
               eachItem?.joined && !eachItem?.muted  ? (
            <MicOnIcon className="h-5 w-5 " />
          ) : (
            <MicOffIcon className="h-5 w-5 " />
          )))}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="rounded-full bg-primary/80 p-1">
              <EllipsisIcon className="h-5 w-5 " />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="text-a11y border-0 bg-primary"
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
      {participant?.raiseHand && (
        <div className="absolute left-3 top-3 flex items-center gap-1">
          <HandOnIcon className="h-8 w-8 " />
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        hidden={userCamera.length == 0}
        className="h-full w-full flex-1 object-cover"
      >
        Your browser does not support video tag
      </video>
      {userCamera.length == 0 && (
        <div
          className={cn(
            " bg-a11y/20 flex h-full w-full flex-col items-center justify-center ",
            connectedUsers.length === 2 && "w-screen md:w-full",
          )}
        >
          <div className="flex aspect-square h-32 items-center justify-center rounded-full bg-primary/80 text-3xl font-extrabold uppercase">
            {participant?.name.split(" ")[0]?.slice(0, 1)}
            {participant?.name.split(" ")[1]?.slice(0, 1)}
          </div>
          <span className="capitalize">{participant?.name}</span>
        </div>
      )}
    </div>
  );
}

export default SingleCameraComponent;
