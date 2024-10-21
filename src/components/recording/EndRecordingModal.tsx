import React from "react";
import { useRecoilState } from "recoil";
import { recordingModalState } from "~/recoil/atom";
import { useToast } from "../ui/use-toast";
import AlertTriangleIcon from "../icon/outline/AlertTriangleIcon";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {websocketRecord} from "~/server/Websocket";

function EndRecordingModal() {
  const [recordingState, setRecordingState] =
    useRecoilState(recordingModalState);
  const { toast } = useToast();

  return (
    <AlertDialog
      open={recordingState.step === 2}
      onOpenChange={() => {
        setRecordingState({
          ...recordingState,
          step: 0,
        });
      }}
    >
      <AlertDialogContent className="text-a11y rounded-xl border-0 bg-primary py-3 sm:max-w-[425px] md:rounded-xl">
        <div className="grid gap-3 py-4">
          <div className="flex gap-2 text-2xl">
            <AlertTriangleIcon className="h-8 w-8 " />
            <span>End Recording</span>
          </div>
          <p>
            Are you sure you want to End Recording?
          </p>
          <div className="mt-7 flex w-full gap-6">
            <button
              className="border-a11y/20 w-full rounded-md border py-3"
              onClick={() => {
                setRecordingState((prev) => ({
                  ...prev,
                  step: 0,
                }));
              }}
            >
              Dismiss
            </button>
            <button
              className="bg-a11y/20 w-full rounded-md py-3"
              onClick={() => {
                setRecordingState((prev) => ({
                  ...prev,
                  isActive: false,
                  step: 0,
                }));
                websocketRecord();
              }}
            >
              End Recording
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EndRecordingModal;
