import React from "react";
import { useRecoilState } from "recoil";
import { connectedUsersState, pollModalState } from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import PlayIcon from "../icon/outline/PlayIcon";
import PauseIcon from "../icon/outline/PauseIcon";

function PollModalHostLiveView() {
  const [pollModal, setPollModal] = useRecoilState(pollModalState);
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);

  const percentage = pollModal.pollOptions.map((option) => {
    return {
      ...option,
      percentage: (option.votes / pollModal.totalVotes) * 100 || 0,
    };
  });

  return (
    <Dialog
      open={pollModal.step === 2}
      onOpenChange={() => {
        setPollModal((prev) => ({
          ...prev,
          step: 0,
        }));
      }}
    >
      <DialogContent className="rounded-xl border-0 bg-primary/90 text-a11y sm:max-w-[425px] md:rounded-xl">
        <div>
          <span className="font-bold">Polls</span>
          <p className="text-center">{pollModal.pollQuestion}</p>
        </div>
        <div className="flex flex-col gap-5">
          {pollModal.pollOptions.map((poll, index) => (
            <div
              style={{
                width: percentage ? `${percentage[index]?.percentage}%` : "0%",
              }}
              className="space-x-2 rounded-md bg-a11y/20 px-4 py-3"
              key={index}
            >
              <span>
                {percentage ? `${percentage[index]?.percentage ?? 0}%` : "0%"}
              </span>
              <span>{poll.option}</span>
            </div>
          ))}
        </div>
        <span className="mt-5">
          {pollModal.totalVotes} votes of {connectedUsers.length}
        </span>

        {/* disabled because of unheathly factors (updates can reset count etc)*/}
        {/* <div className="flex items-center gap-5">
          <button
            onClick={() => {
              setPollModal((prev) => ({
                ...prev,
                step: 3,
                isEdit: true,
              }));
            }}
            className="rounded-md border border-a11y/50 bg-a11y/20 px-8 py-2 text-sm"
          >
            Edit
          </button>

          <button className="flex items-center justify-center rounded-full border border-a11y/20 p-1">
            <PauseIcon className="h-6 w-6" />
          </button>
          <button className="flex items-center justify-center rounded-full border border-a11y/20 p-1">
            <PlayIcon className="h-6 w-6" />
          </button>
        </div> */}

        <div className="mt-5">
          <button
            onClick={() => {
              setPollModal((prev) => ({
                ...prev,
                isActive: false,
                isEnded: true,
                step: 0,
              }));
            }}
            className="rounded-md bg-a11y/20 px-4 py-2"
          >
            End Poll/Publish
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PollModalHostLiveView;
