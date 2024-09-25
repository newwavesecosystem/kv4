import React, { use, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {authUserState, pollModalState, presentationSlideState} from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import AddIcon from "../icon/outline/AddIcon";
import MinusIcon from "../icon/outline/MinusIcon";
import { cn } from "~/lib/utils";
import {websocketStartPoll} from "~/server/Websocket";
import {randomInt} from "crypto";
import {generateSmallId} from "~/server/ServerInfo";

function PollModalCreate() {
  const [pollModal, setPollModal] = useRecoilState(pollModalState);
  const [presentationSlide, setPresentationSlide] = useRecoilState(presentationSlideState);

  const [data, setData] = useState({
    pollQuestion: "",
  });
  const [options, setOptions] = useState([
    {
      option: "",
    },
  ]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const user = useRecoilValue(authUserState);

  return (
    <Dialog
      open={pollModal.step === 1}
      onOpenChange={() => {
        setPollModal((prev) => ({
          ...prev,
          step: 0,
        }));
      }}
    >
      <DialogContent className="rounded-xl border-0 bg-primary text-a11y sm:max-w-[425px] md:rounded-xl">
        <div className="grid gap-6 pb-4">
          <span className="font-bold">Polls</span>
          <input
            name="pollQuestion"
            onChange={handleChange}
            value={data.pollQuestion}
            type="text"
            placeholder="Poll Question"
            className="mt-3 w-full rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80 focus:shadow-none focus:outline-none md:w-full"
          />
          <div>
            <div className="mt-1 flex flex-col gap-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    onChange={(e) => {
                      if (options.length < 1) return;
                      const { value } = e.target;
                      setOptions((prev) => {
                        const newOptions = [...prev];
                        newOptions[index]!.option = value;
                        return newOptions;
                      });
                    }}
                    value={option.option}
                    type="text"
                    placeholder={`Answer ${index + 1}`}
                    className="w-full rounded-md border border-a11y/30 bg-a11y/20 px-2 py-2 placeholder:text-a11y/80 focus:shadow-none focus:outline-none md:w-full"
                  />
                  <button
                    className={cn(
                      "flex items-center justify-center",
                      index === 0 && "hidden",
                    )}
                    onClick={() => {
                      if (index === 0) return;
                      setOptions((prev) => {
                        const newOptions = [...prev];
                        newOptions.splice(index, 1);
                        return newOptions;
                      });
                    }}
                  >
                    <MinusIcon className="h-6 w-6" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            disabled={options.length === 5}
            onClick={() => {
              if (options.length >= 5) return;
              setOptions((prev) => [
                ...prev,
                {
                  option: "",
                },
              ]);
              setPollModal((prev) => ({
                ...prev,
                pollOption: "",
              }));
            }}
            className="flex w-40 flex-grow-0 items-center justify-center gap-2 rounded-lg border border-a11y/50 bg-a11y/20 py-2 text-sm disabled:opacity-40"
          >
            <div className="flex items-center justify-center rounded-full border border-a11y/20 p-1">
              <AddIcon className="h-4 w-4" />
            </div>
            <span>Add answers</span>
          </button>
          <div className="mt-5 flex w-full justify-center">
            <button
              disabled={
                options.filter((option) => option.option === "").length > 0
              }
              className=" rounded-md bg-a11y/20 px-6 py-3 disabled:opacity-30"
              onClick={() => {
                setPollModal((prev) => ({
                  ...prev,
                  isActive: true,
                  isUserHost: true,
                  step: 0,
                  pollQuestion: data.pollQuestion,
                  pollOptions: options.map((option, index) => {
                    return {
                      id: index,
                      option: option.option,
                      votes: 0,
                    };
                  }),
                  pollCreatedAt: new Date(),
                  pollCreatorId: `${user?.meetingDetails?.internalUserID}/1`,
                  pollCreatorName: user?.fullName as string,
                }));

                websocketStartPoll(`${user?.meetingDetails?.internalUserID}/1`,data.pollQuestion,JSON.stringify(options.map(item => item.option)));
              }}
            >
              Publish Polls
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PollModalCreate;
