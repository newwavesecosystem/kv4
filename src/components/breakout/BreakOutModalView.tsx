import React, { useState } from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, breakOutModalState, participantListState} from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import dayjs from "dayjs";

import duration from "dayjs/plugin/duration";
import SendIcon from "../icon/outline/SendIcon";
import { Separator } from "../ui/separator";
import {websocketRequest2JoinBreakoutRoom} from "~/server/Websocket";
import {IParticipant} from "~/types/index";
import {cn} from "~/lib/utils";
import stopScreenSharingStream from "~/lib/screenSharing/stopScreenSharingStream";
import {websocketKurentoScreenshareEndScreenshare} from "~/server/KurentoScreenshare";
import requestScreenSharingAccess from "~/lib/screenSharing/requestScreenSharingAccess";
import ShareScreenOnIcon from "~/components/icon/outline/ShareScreenOnIcon";
import ShareScreenOffIcon from "~/components/icon/outline/ShareScreenOffIcon";
import {ModeratorRole} from "~/lib/checkFunctions";
dayjs.extend(duration);
function BreakOutModalView() {
  const [breakOutRoomState, setBreakOutRoomState] =
    useRecoilState(breakOutModalState);
  const [participantList, setParticipantList] = useRecoilState(participantListState);
  const user = useRecoilValue(authUserState);

  const [time, setTime] = useState(0);
  const countDownDate = new Date(breakOutRoomState.endedAt as Date).getTime();
  const timeInterval = setInterval(function () {
    const now = new Date().getTime();

    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setTime(
      dayjs
        .duration({
          days,
          hours,
          minutes,
          seconds,
        })
        .asMilliseconds(),
    );

    if (distance < 0) {
      clearInterval(timeInterval);
      setTime(0);
    }
  }, 1000);

  return (
    <Dialog
      open={breakOutRoomState.step === 2}
      onOpenChange={() => {
        setBreakOutRoomState((prev) => ({
          ...prev,
          step: 0,
        }));
      }}
    >
      <DialogContent
        hideCloseButton={true}
        className=" max-h-[80vh] overflow-y-auto rounded-xl border-0 bg-primary text-a11y sm:max-w-[600px] md:rounded-xl xl:max-w-[800px]"
      >
        <div className="flex flex-col gap-4 py-3">
          <div className="text-center text-sm font-bold uppercase">
            Duration
          </div>
          <span className="rounded-md border border-a11y/20 py-6 text-center">
            {time > 0 ? dayjs(time).format("mm:ss") : "00:00"}
          </span>


          {participantList
              ?.filter(
                  (eachItem: IParticipant) =>
                      eachItem?.intId == user?.meetingDetails?.internalUserID,
              )
              .map(
                  (eachItem: IParticipant, index: number) =>
                      eachItem.role == ModeratorRole() && (
                          <div key={index} className=" flex w-full items-center rounded-md border border-a11y/20 bg-transparent py-3 pr-4 ">
                            <input
                                type="text"
                                name=""
                                className="w-full bg-transparent px-3 placeholder:text-a11y/80  focus:shadow-none focus:outline-none"
                                id=""
                                placeholder="Send a message to everyone"
                            />
                            <div className="flex items-center gap-4">
                              <SendIcon className="h-6 w-6" />
                            </div>
                          </div>

                      ),
              )}



          <span>Choose a breakout room to join</span>
          <div className="flex flex-col gap-5 py-2">
            {breakOutRoomState.rooms
              .filter((room) => room.id !== "users")
              .map((room) => (
                <div key={room.id} className="flex justify-between">
                  <div className="flex flex-col items-start">
                    <div>
                      <span className="font-bold">{room.title} </span>(
                      {
                        breakOutRoomState.users.filter(
                          (user) => user.columnId === room.id,
                        ).length
                      }
                      )
                    </div>
                    <button>View</button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <button onClick={()=>{
                      websocketRequest2JoinBreakoutRoom(room.breakoutId);
                    }} className="">Join Room</button>
                    {/*<Separator className="h-3" orientation="vertical" />*/}
                    {/*<button className="">Join Audio</button>*/}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BreakOutModalView;
