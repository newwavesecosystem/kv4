import React, {ChangeEvent, useState} from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, chatTypingListState, privateChatModalState} from "~/recoil/atom";
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
import {websocketSendPrivateMessage, websocketStartTyping} from "~/server/WebsocketActions";

function ChatModalPrivateMessage() {
  const [privateChatState, setPrivateChatState] = useRecoilState(privateChatModalState);
  const [infoMessageStatus, setInfoMessageStatus] = useState(false);
  const [message, setMessage] = useState("");
  const user = useRecoilValue(authUserState);
  const [chatTypingList, setChatTypingList] = useRecoilState(chatTypingListState);

  const sendMsg = () => {
    let sender = user?.meetingDetails?.internalUserID;
    // let ishola = chatList;
    console.log("sendingMsg");
    // console.log(ishola);

    if (message != "") {
      console.log("sendingMsg : ", message);
      websocketSendPrivateMessage(
          sender,
          message,
          privateChatState.id
      );
      setMessage("");
    }
  };


  const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
    websocketStartTyping(privateChatState.id);
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: any) => {
    if (e.key !== "Enter") return;
    const value = e.target.value;
    console.log("Well");
    if (!message.trim()) return;
    sendMsg();
  };


  return (
    <Sheet
      open={privateChatState.isActive}
      onOpenChange={() => {
        setPrivateChatState({
          ...privateChatState,
          isActive: false,
        });
      }}
    >
      <SheetContent
        className="m-h-svh w-full border-0 bg-primary p-0 text-a11y lg:w-[900px] "
        side="right"
      >
        <div className="sticky top-0 flex max-h-32 flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Private Chat</span>
          </div>

          {chatTypingList.filter((item: any) => item.type == privateChatState.id).length > 0 && (
              <p className="">
                {chatTypingList.filter((item: any) => item.type == privateChatState.id).map((text: any, index:number) => (
                    <span key={index}>{text.name}, </span>
                ))} {chatTypingList.length > 1 ? "are" : "is"}{" "}
                typing...
              </p>
          )}

          {!infoMessageStatus && (
            <div className=" mt-5 flex items-center gap-2 rounded-lg border border-a11y/20 bg-primary p-2 text-xs shadow-sm">
              <InformationIcon className="h-5 w-5" />
              <span className="w-full">
                Messages can only be seen by {privateChatState.chatRooms.filter((item) => item.chatId == privateChatState.id)[0]?.participants.map((part,index)=>(<span key={index}>{index != 0 ? " and " : " " }  {part.name} </span>))}
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
            " no-scrollbar h-[calc(100svh-192px)] overflow-y-auto",
            infoMessageStatus && "h-[calc(100svh-130px)]",
          )}
        >
          {privateChatState.chatMessages.filter((chat)=> chat.chatId == privateChatState.id).map((chat, index) => (
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
              placeholder="Send a private message"
              value={message}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
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
                      setMessage(message + e.native);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <SendIcon onClick={sendMsg} className="h-6 w-6" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ChatModalPrivateMessage;
