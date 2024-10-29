import React from "react";
import { AlertDialog, AlertDialogContent } from "../ui/alert-dialog";
import { useRecoilState } from "recoil";
import { leaveRoomCallModalState, postLeaveMeetingState } from "~/recoil/atom";
import AlertTriangleIcon from "../icon/outline/AlertTriangleIcon";
import { websocketLeaveMeeting } from "~/server/Websocket";

function LeaveRoomCallModal() {
  const [leaveRoomCallModal, setRoomCallModal] = useRecoilState(
    leaveRoomCallModalState,
  );
  const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(
    postLeaveMeetingState,
  );
  return (
    <AlertDialog open={leaveRoomCallModal} onOpenChange={setRoomCallModal}>
      <AlertDialogContent className="rounded-xl border-0 bg-primary py-3 text-a11y sm:max-w-[425px] md:rounded-xl">
        <div className="grid gap-3 py-4">
          <div className="flex gap-2 text-2xl">
            <AlertTriangleIcon className="h-8 w-8" />
            <span>Leave Session</span>
          </div>
          <p>
            Others will continue after you leave. You can join the session
            again.
          </p>
          <div className="mt-7 flex w-full gap-6">
            <button
              className="w-full rounded-md border border-a11y/20 py-3"
              onClick={() => {
                setRoomCallModal(false);
              }}
            >
              Don't Leave
            </button>
            <button
              className="w-full rounded-md bg-a11y/20 py-3"
              onClick={() => {
                setRoomCallModal(false);
                // setPostLeaveMeeting({
                //   ...postLeaveMeeting,
                //   isLeaveRoomCall: true,
                // });
                websocketLeaveMeeting();
              }}
            >
              Leave Session
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LeaveRoomCallModal;
