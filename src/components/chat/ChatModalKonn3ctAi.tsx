import React, { useState } from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import { useRecoilState } from "recoil";
import { chatModalKonn3ctAiState } from "~/recoil/atom";
import InformationIcon from "../icon/outline/InformationIcon";
import SendIcon from "../icon/outline/SendIcon";
import { cn } from "~/lib/utils";
import DummyKonn3ctAiChat from "~/data/dummyKonn3ctAiChat";
import SingleKonn3ctAiChat from "./SingleKonn3ctAiChat";
import ShieldFilledIcon from "../icon/outline/ShieldFilledIcon";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";

const ChatTypesData = [
  {
    id: 1,
    name: "Highlights",
  },
  {
    id: 2,
    name: "Meeting Summary",
  },
  {
    id: 3,
    name: "Create/Send Messages",
  },
];

function ChatModalKonn3ctAi() {
  const [konn3ctAiChatState, setKonn3ctAiChatState] = useRecoilState(
    chatModalKonn3ctAiState,
  );
  const [chatType, setChatType] = useState("Highlights");

  return (
    <Sheet open={konn3ctAiChatState} onOpenChange={setKonn3ctAiChatState}>
      <SheetContent
        className="m-h-screen w-full border-0 bg-primary p-0 text-a11y lg:w-[900px] "
        side={"right"}
      >
        <div className="sticky top-0 flex max-h-32 flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Konn3ct Ai</span>
          </div>
          <div className=" mt-5 flex items-center gap-2 rounded-lg border border-a11y/20 bg-primary p-2 text-xs shadow-sm">
            <ShieldFilledIcon className="h-5 w-5" />
            <span className="w-full">
              No other participants can see this conversation
            </span>
          </div>
        </div>

        <div
          className={cn(" no-scrollbar h-[calc(100vh-192px)] overflow-y-auto")}
        >
          {DummyKonn3ctAiChat.map((chat, index) => (
            <SingleKonn3ctAiChat key={index} chat={chat} />
          ))}
          {DummyKonn3ctAiChat.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-10">
              <div className="h-20 w-20 rounded-xl bg-a11y/60"></div>
              <div className="flex flex-col gap-2 text-center">
                <span>Welcome to Konn3ct Ai</span>
                <p>Here are some things you can try...</p>
              </div>
              <div className="flex flex-col gap-4">
                <button className="rounded-md border border-a11y px-4 py-2 ">
                  Highlights
                </button>
                <button className="rounded-md border border-a11y px-4 py-2 ">
                  Meeting Summary
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 h-16 w-full border-t border-a11y/20 bg-primary/20 px-4 md:sticky">
          {DummyKonn3ctAiChat.length > 0 && (
            <div className="absolute -top-12 flex w-full items-center justify-center gap-4 text-sm">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center rounded-md border border-a11y bg-primary px-4 py-2">
                    {chatType}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="mb-3 divide-y divide-a11y/20 rounded-lg border border-a11y/20 bg-primary text-a11y shadow-xl"
                >
                  {ChatTypesData.map((chatType, index) => (
                    <DropdownMenuItem
                      onClick={() => setChatType(chatType.name)}
                      className="rounded-none py-4"
                      key={index}
                    >
                      {chatType.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-10 justify-center rounded-md border border-a11y bg-primary py-2 ">
                    <EllipsisIcon className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="mb-3 divide-y divide-a11y/20 rounded-lg border border-a11y/20 bg-primary text-a11y shadow-xl"
                >
                  <DropdownMenuItem className="py-3">
                    <ArrowChevronLeftIcon className="h-5 w-5" />
                    <span className="ml-2">Back</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3">
                    Appreciation
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3">Minutes</DropdownMenuItem>
                  <DropdownMenuItem className="py-3">
                    General notes
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3">
                    Technical notes
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3">
                    Sales notes
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3">
                    Transcript
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <div className=" flex w-full items-center rounded-xl bg-transparent py-4 ">
            <input
              type="text"
              name=""
              className="w-full bg-transparent pl-3 placeholder:text-a11y/80  focus:shadow-none focus:outline-none"
              id=""
              placeholder="Ask anything about the meeting..."
            />
            <div className="flex items-center gap-4">
              <SendIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ChatModalKonn3ctAi;
