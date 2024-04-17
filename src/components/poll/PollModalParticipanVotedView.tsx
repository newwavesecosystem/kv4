import React from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {connectedUsersState, participantListState, pollModalState} from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import { cn } from "~/lib/utils";

function PollModalParticipanVotedView() {
  const [pollModal, setPollModal] = useRecoilState(pollModalState);
  const participantList = useRecoilValue(participantListState);
  const hasVoted = pollModal.usersVoted.find((user) => user.id === user?.id);

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
          isActive: false,
          isEnded: false,
          isEdit: false,
          isUserHost: false,
          pollQuestion: "",
          pollCreatorName: "",
          pollCreatorId: "0",
          pollCreatedAt: new Date(),
          pollOptions: [],
          totalVotes: 0,
          usersVoted: [],
        }));
      }}
    >
      <DialogContent className="rounded-xl border-0 bg-primary/90 text-a11y sm:max-w-[425px] md:rounded-xl">
        <div>
          <div className="flex flex-col">
            <span className="font-bold">Polls</span>
            <span className="text-xs">
              Result of Poll Conducted
            </span>
          </div>
          <p className="my-2 text-center capitalize">
            {pollModal.pollQuestion}
          </p>
        </div>
        <div className="flex flex-col gap-5">
          {pollModal.pollOptions.map((poll, index) => (
            <div
              className={cn(
                "space-x-2 rounded-md bg-a11y/20 px-4 py-3 capitalize",
                index === hasVoted?.votedOptionId && "bg-a11y/60 ",
              )}
              style={{
                width: percentage ? `${percentage[index]?.percentage}%` : "0%",
              }}
              key={index}
            >
              {" "}
              <span>
                {percentage ? `${percentage[index]?.percentage}%` : "0%"}
              </span>
              <span>{poll.option}</span>
            </div>
          ))}
        </div>
        <span className="my-5">
          {pollModal.totalVotes} votes of {participantList.length - 1}
        </span>
      </DialogContent>
    </Dialog>
  );
}

export default PollModalParticipanVotedView;
