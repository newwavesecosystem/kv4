import React from "react";
import { useRecoilState } from "recoil";
import { recordingModalState } from "~/recoil/atom";
import { useToast } from "../ui/use-toast";
import { Dialog, DialogContent } from "../ui/dialog";
import AlertTriangleIcon from "../icon/outline/AlertTriangleIcon";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

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
      <AlertDialogContent className="rounded-xl border-0 bg-konn3ct-active py-3 text-white sm:max-w-[425px] md:rounded-xl">
        <div className="grid gap-3 py-4">
          <div className="flex gap-2 text-2xl text-[#FD7482]">
            <AlertTriangleIcon className="h-8 w-8 fill-[#FD7482]" />
            <span>End Recording</span>
          </div>
          <p>
            Are you sure you want to end recording? You can't undo this action.
          </p>
          <div className="mt-7 flex w-full gap-6">
            <button
              className="w-full rounded-md border border-white/20 py-3"
              onClick={() => {
                setRecordingState((prev) => ({
                  ...prev,
                  step: 0,
                }));
              }}
            >
              Don't End
            </button>
            <button
              className="w-full rounded-md bg-konn3ct-red py-3"
              onClick={() => {
                setRecordingState((prev) => ({
                  ...prev,
                  isActive: false,
                  step: 0,
                }));
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
