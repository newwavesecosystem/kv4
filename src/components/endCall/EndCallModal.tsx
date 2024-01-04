import React from "react";
import { AlertDialog, AlertDialogContent } from "../ui/alert-dialog";
import { useRecoilState } from "recoil";
import { endCallModalState, postLeaveMeetingState } from "~/recoil/atom";
import AlertTriangleIcon from "../icon/outline/AlertTriangleIcon";
import { websocketEndMeeting } from "~/server/Websocket";

function EndCallModal() {
  const [endCallModal, setEndCallModal] = useRecoilState(endCallModalState);
  const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(
    postLeaveMeetingState,
  );

  return (
    <AlertDialog open={endCallModal} onOpenChange={setEndCallModal}>
      <AlertDialogContent className="rounded-xl border-0 bg-primary py-3 text-a11y sm:max-w-[425px] md:rounded-xl">
        <div className="grid gap-3 py-4">
          <div className="flex gap-2 text-2xl">
            <AlertTriangleIcon className="h-8 w-8" />
            <span>End Session</span>
          </div>
          <p>
            The session will end for everyone and all the activities will stop.
            You can't undo this action.{" "}
          </p>
          <div className="mt-7 flex w-full gap-6">
            <button
              className="w-full rounded-md border border-a11y/20 py-3"
              onClick={() => {
                setEndCallModal(false);
              }}
            >
              Don't End
            </button>
            <button
              className="w-full rounded-md bg-a11y/20 py-3"
              onClick={() => {
                setEndCallModal(false);
                setPostLeaveMeeting({
                  ...postLeaveMeeting,
                  isEndCall: true,
                });
                websocketEndMeeting();
              }}
            >
              End Session
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EndCallModal;
