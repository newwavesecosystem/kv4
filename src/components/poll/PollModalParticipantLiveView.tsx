import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authUserState, pollModalState } from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import { cn } from "~/lib/utils";
import {websocketVotePoll} from "~/server/Websocket";

function PollModalParticipantLiveView() {
  const [pollModal, setPollModal] = useRecoilState(pollModalState);
  const [data, setData] = useState<{
    id: number;
    option: string;
    votes: number;
  }>();

  const user = useRecoilValue(authUserState);

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
          <div className="flex flex-col">
            <span className="font-bold">Polls</span>
            <span className="text-xs">
              Created by {pollModal.pollCreatorName}
            </span>
          </div>
          <p className="my-2 text-center capitalize">
            {pollModal.pollQuestion}
          </p>
        </div>
        <div className="flex flex-col gap-5">
          {pollModal.pollOptions.map((poll, index) => (
            <button
              onClick={() => {
                setData(poll);
                websocketVotePoll(pollModal.pollCreatorId,poll.id);
              }}
              className={cn(
                "rounded-md bg-a11y/20 px-4 py-3 capitalize",
                index === data?.id && "border border-a11y/50",
              )}
              key={index}
            >
              {poll.option}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center">
          <button
            disabled={!data}
            onClick={() => {
              if (!data || !user) return;
              setPollModal((prev) => ({
                ...prev,
                totalVotes: prev.totalVotes + 1,
                step: 0,
                usersVoted: [
                  ...prev.usersVoted,
                  {
                    email: user.email,
                    fullName: user.fullName,
                    id: user.id,
                    votedOption: data.option,
                    votedOptionId: data.id,
                  },
                ],

                pollOptions: prev.pollOptions.map((option, index) => {
                  if (index === data.id) {
                    return {
                      ...option,
                      votes: option.votes + 1,
                    };
                  }
                  return option;
                }),
              }));
            }}
            className="rounded-md border border-a11y/50 bg-a11y/20 px-10 py-2 disabled:opacity-40"
          >
            Vote
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PollModalParticipantLiveView;
