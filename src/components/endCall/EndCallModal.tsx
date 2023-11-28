import React from "react";
import { AlertDialog, AlertDialogContent } from "../ui/alert-dialog";
import { useRecoilState } from "recoil";
import { endCallModalState } from "~/recoil/atom";
import AlertTriangleIcon from "../icon/outline/AlertTriangleIcon";

function EndCallModal() {
  const [endCallModal, setEndCallModal] = useRecoilState(endCallModalState);
  return (
    <AlertDialog open={endCallModal} onOpenChange={setEndCallModal}>
      <AlertDialogContent className="text-a11y rounded-xl border-0 bg-primary py-3 sm:max-w-[425px] md:rounded-xl">
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
              className="border-a11y/20 w-full rounded-md border py-3"
              onClick={() => {
                setEndCallModal(false);
              }}
            >
              Don't End
            </button>
            <button
              className="bg-a11y/20 w-full rounded-md py-3"
              onClick={() => {
                setEndCallModal(false);
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
