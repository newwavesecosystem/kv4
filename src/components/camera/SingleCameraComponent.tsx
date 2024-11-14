import React, { useEffect, useRef, useState } from "react";
import {
  authUserState,
  connectedUsersState,
  participantCameraListState,
  participantListState,
  participantTalkingListState,
  pinnedUsersState,
} from "~/recoil/atom";
import { IAuthUser, IConnectedUser, IParticipant, IParticipantCamera } from "~/types";
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
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import PinIcon from "../icon/outline/PinIcon";
import VideoConfOffIcon from "../icon/outline/VideoConfOffIcon";
import HandOnIcon from "../icon/outline/HandOnIcon";
import WifiOnIcon from "../icon/outline/WifiOnIcon";
import VolumeOffIcon from "~/components/icon/outline/VolumeOffIcon";

function SingleCameraComponent({
  participant, userCamera,
  key,
  index,
}: {
  participant: IParticipant;
  userCamera: IParticipantCamera | null;
  key: number;
  index: number;
}) {
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);
  // const user = useRecoilValue(authUserState);
  const participantList = useRecoilValue(participantListState);
  const participantTalkingList = useRecoilValue(participantTalkingListState);
  const participantCameraList = useRecoilValue(participantCameraListState);
  const [pinnedParticipant, setPinnedParticipant] =
    useRecoilState(pinnedUsersState);
  const [camOn, setCamOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Attach the new stream to the video element

    console.log("userCamera", userCamera);
    console.log("userCamera camOn", camOn);
    if (userCamera != null) {
      console.log("userCamera is not null", userCamera.stream)
      // if (videoRef.current && !camOn) {
      console.log("userCamera videoRef.current > 0", userCamera.stream)
      videoRef.current!.srcObject = userCamera.stream;
      setCamOn(true);
      console.log("userCamera is null")
      // }
    } else {
      setCamOn(false);
    }
  }, [userCamera]);

  return (
    <div
      key={key}
      className={cn(
        "relative overflow-y-auto mx-auto rounded-lg bg-a11y/20",
        participantList.length === 1 &&
        "h-[40svh] w-[40svh] md:h-[40svw] md:w-[40svw] xl:h-[35svw] xl:w-[35svw] 2xl:h-[35svw] 2xl:w-[35svw]",
        participantList.length === 2 &&
        "h-[32svh] w-[32svh] md:h-[31svw] md:w-[31svw]",
        participantList.length === 3 &&
        "h-[20svh] w-[20svh] md:h-[31svw] md:w-[31svw]",
        (index === 2 && participantList.length === 3) && "col-span-2 md:col-span-1 h-[40svh] w-[40svh] md:h-[31svw] md:w-[31svw] ",
        participantList.length === 4 &&
        "h-[20svh] w-[20svh] md:h-[23svw] md:w-[23svw]",
        // participantList.length === 3 &&
        //   pinnedParticipant.length < 1 &&
        //   "lg:h-auto lg:w-auto",
        // participantList.length >= 3 &&
        //   participant.intId === pinnedParticipant[0]?.intId
        //   ? "md:col-span-2 md:row-span-2"
        //   : " ",
        // (participantList.length === 3 || participantList.length === 5) &&
        //   index === 0 &&
        //   pinnedParticipant.length < 1 &&
        //   "col-span-2 md:col-auto",
        // participantTalkingList
        //   .filter((eachItem: any) => eachItem?.intId == participant.intId)
        //   .map(
        //     (eachItem: any) =>
        //       eachItem?.joined &&
        //       !eachItem?.muted &&
        //       "ring-2 ring-primary ring-offset-2 ring-offset-primary",
        //   ),
      )}
    >
      <div className=" absolute right-3 top-3 flex items-center gap-1">
        {pinnedParticipant.filter(
          (eachItem: any) => eachItem?.intId == participant.intId,
        ).length > 0 && (
            <button
              onClick={() => {
                // remove selected participant from pinned list
                setPinnedParticipant(
                  pinnedParticipant.filter(
                    (eachItem: any) => eachItem?.intId != participant.intId,
                  ),
                );
              }}
              className="rounded-full bg-primary/80 p-1 "
            >
              <PinIcon className=" h-5 w-5" />
            </button>
          )}
        <button
          className={cn(
            "p-1 ",
            participantTalkingList
              .filter((eachItem: any) => eachItem?.intId == participant.intId)
              .map((eachItem: any) =>
                eachItem?.joined && eachItem?.muted
                  ? "rounded-full border border-a11y/20 bg-konn3ct-red"
                  : "rounded-full bg-primary/80",
              ),
          )}
        >
          {participantTalkingList
            .filter((eachItem: any, index: number) => eachItem?.intId == participant.intId)
            .map((eachItem: any) =>
              !eachItem?.joined ? (
                <VolumeOffIcon key={index} className="h-5 w-5 " />
              ) : eachItem?.joined && !eachItem?.muted ? (
                <MicOnIcon key={index} className="h-5 w-5 " />
              ) : (
                <MicOffIcon key={index} className="h-5 w-5 " />
              ),
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
            <DropdownMenuItem
              onClick={() => {
                if (pinnedParticipant.length > 0) {
                  setPinnedParticipant(
                    pinnedParticipant.filter(
                      (eachItem: any) => eachItem?.intId != participant.intId,
                    ),
                  );
                } else {
                  setPinnedParticipant([participant]);
                }
              }}
              className="py-2"
            >
              <PinIcon className="mr-2 h-5 w-5" />
              {pinnedParticipant.filter(
                (eachItem: any) => eachItem?.intId == participant.intId,
              ).length > 0
                ? "Unpin to screen"
                : "Pin to screen"}
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
        <div className="animate-wave absolute left-3 top-3 flex items-center gap-1">
          <HandOnIcon className="h-8 w-8" />
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        hidden={userCamera == null}
        className="h-full w-full flex-1 object-cover"
      >
        Your browser does not support video tag
      </video>
      {userCamera != null && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg  bg-primary/60 px-2 py-1 text-sm">
          <span className=" max-w-[150px] truncate ">{participant?.name}</span>
          {/*<span className=" max-w-[150px] truncate ">{participant?.intId}</span>*/}
          <WifiOnIcon signal={participant.connection_status == "critical" ? 1 : participant.connection_status == "danger" ? 2 : participant.connection_status == "warning" ? 3 : 4} className="hidden h-6 w-6 md:block" color={participant.connection_status == "critical" ? '#ff0000' : participant.connection_status == "danger" ? '#f68322' : participant.connection_status == "warning" ? '#fcd104' : '#004800'} />
        </div>
      )}
      {userCamera == null && (
        <div
          className={cn(
            " flex h-full w-full flex-col items-center justify-center bg-a11y/20 ",
            // participantList.length === 2 && "w-screen md:w-full",
          )}
        >
          <div className="flex aspect-square items-center justify-center rounded-full bg-primary/80 p-4 text-3xl font-semibold uppercase lg:p-8">
            {participant?.name?.split(" ")[0]?.slice(0, 1)}
            {participant?.name?.split(" ")[1]?.slice(0, 1)}
          </div>
          <span className="capitalize">{participant?.name}</span>
        </div>
      )}
    </div>
  );
}

export default SingleCameraComponent;
