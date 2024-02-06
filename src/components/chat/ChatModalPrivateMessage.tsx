import React, { useState } from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import { useRecoilState } from "recoil";
import { privateChatModalState } from "~/recoil/atom";
import CloseIcon from "../icon/outline/CloseIcon";
import InformationIcon from "../icon/outline/InformationIcon";
import SingleChat from "./SingleChat";
import DummyChat from "~/data/dummyChat";
import EmojiIcon from "../icon/outline/EmojiIcon";
import SendIcon from "../icon/outline/SendIcon";
import { cn } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import { IEmojiMart } from "~/types";

function ChatModalPrivateMessage() {
  const [chatState, setChatState] = useRecoilState(privateChatModalState);
  const [infoMessageStatus, setInfoMessageStatus] = useState(false);
  return (
    <Sheet
      open={chatState.isActive}
      onOpenChange={() => {
        setChatState({
          ...chatState,
          isActive: false,
          id: 0,
          users: [],
        });
      }}
    >
      <SheetContent
        className="m-h-screen w-full border-0 bg-primary p-0 text-a11y lg:w-[900px] "
        side={"right"}
      >
        <div className="sticky top-0 flex max-h-32 flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Private Chat</span>
          </div>
          {!infoMessageStatus && (
            <div className=" mt-5 flex items-center gap-2 rounded-lg border border-a11y/20 bg-primary p-2 text-xs shadow-sm">
              <InformationIcon className="h-5 w-5" />
              <span className="w-full">
                Messages can only be seen by people in the call and are deleted
                when the call ends.
              </span>
              <button
                onClick={() => setInfoMessageStatus(!infoMessageStatus)}
                className=""
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div
          className={cn(
            " no-scrollbar h-[calc(100vh-192px)] overflow-y-auto",
            infoMessageStatus && "h-[calc(100vh-130px)]",
          )}
        >
          {DummyChat.map((chat, index) => (
            <SingleChat key={index} chat={chat} />
          ))}
        </div>
        <div className="sticky bottom-0 h-16 w-full border-t border-a11y/20 bg-primary/20 px-4 md:sticky">
          <div className=" flex w-full items-center rounded-xl bg-transparent py-4 ">
            <input
              type="text"
              name=""
              className="w-full bg-transparent pl-3  focus:shadow-none focus:outline-none"
              id=""
              placeholder="Send a message to everyone"
            />
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger>
                  <EmojiIcon className="h-6 w-6" />
                </PopoverTrigger>
                <PopoverContent
                  className="mb-5 mr-3 w-full border-none bg-transparent p-0 md:mr-4"
                  side="bottom"
                >
                  <Picker
                    data={emojiData}
                    onEmojiSelect={(e: IEmojiMart) => {
                      // setValue(value + e.native);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <SendIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ChatModalPrivateMessage;
