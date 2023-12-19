import React from "react";
import { useRecoilState } from "recoil";
import { eCinemaModalState } from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import {websocketSendExternalVideo} from "~/server/Websocket";

function ECinemaModal() {
  const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);
  return (
    <Dialog
      open={eCinemaModal.step === 1}
      onOpenChange={() => {
        setECinemaModal({
          ...eCinemaModal,
          step: 0,
        });
      }}
    >
      <DialogContent className="rounded-xl border-0 bg-primary text-a11y sm:max-w-[425px] md:rounded-xl">
        <span className="">Add link</span>
        <input
          type="url"
          onChange={(e) => {
            setECinemaModal({
              ...eCinemaModal,
              source: e.target.value,
            });
          }}
          placeholder="Paste link here"
          className="mt-3 w-full rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80 focus:shadow-none focus:outline-none md:w-full"
        />
        <div className="mt-20 flex items-center justify-center">
          <button
            disabled={!eCinemaModal.source}
            className="rounded-md bg-a11y/20 p-2 disabled:opacity-40"
            onClick={() => {
              setECinemaModal({
                ...eCinemaModal,
                isActive: true,
                step: 0,
              });

                websocketSendExternalVideo(eCinemaModal.source);
            }}
          >
            Broadcast
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ECinemaModal;
