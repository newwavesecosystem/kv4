import React, { ChangeEventHandler, ChangeEvent, useEffect, useState } from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import useScreenSize from "~/lib/useScreenSize";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  authUserState,
  chatListState,
  chatModalState,
  chatTypingListState,
  participantsModalState,
} from "~/recoil/atom";
import PeoplesIcon from "../icon/outline/PeoplesIcon";
import HandOnIcon from "../icon/outline/HandOnIcon";
import CloseIcon from "../icon/outline/CloseIcon";
import InformationIcon from "../icon/outline/InformationIcon";
import SingleChat from "./SingleChat";
import DummyChat from "~/data/dummyChat";
import EmojiIcon from "../icon/outline/EmojiIcon";
import SendIcon from "../icon/outline/SendIcon";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ArrowChevronUpIcon from "../icon/outline/ArrowChevronUpIcon";
import ArrowChevronDownIcon from "../icon/outline/ArrowChevronDownIcon";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import TickIcon from "../icon/outline/TickIcon";
import { cn } from "~/lib/utils";
import { websocketSendMessage, websocketStartTyping } from "~/server/Websocket";
import { IChat, IEmojiMart } from "~/types";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";

const DummyMenu = [
  {
    id: 1,
    name: "Everyone",
    icon: <PeoplesIcon className="h-5 w-5" />,
  },
  {
    id: 2,
    name: "Raised Hands",
    icon: <HandOnIcon className="h-5 w-5" />,
  },
];

function ChatModal() {
  const [chatState, setChatState] = useRecoilState(chatModalState);
  const [chatList, setChatList] = useRecoilState(chatListState);
  const [chatTypingList, setChatTypingList] =
    useRecoilState(chatTypingListState);
  const [infoMessageStatus, setInfoMessageStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [usersTyping, setUsersTyping] = useState<number[]>([]);
  const user = useRecoilValue(authUserState);
  // const user = {
  //   id: 1,
  // };
  const [message, setMessage] = useState("");
  const isUserTyping = usersTyping.filter((typing) => typing === user.id);

  useEffect(() => {
    // Simulate users typing (replace with your actual implementation)
    const typingTimeout = setTimeout(() => {
      // check if user is in typing list if so remove the user
      if (isUserTyping) {
        setUsersTyping((prev) => prev.filter((typing) => typing !== user.id));
      }
    }, 2000);

    return () => clearTimeout(typingTimeout);
  }, [usersTyping]);

  const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
    if (user && !isUserTyping.length) {
      setUsersTyping((prev) => [...prev, user.id]);
    }
    setMessage(e.target.value);
  };

  const sendMsg = () => {
    let sender = user?.meetingDetails?.internalUserID;
    let message = value;
    let ishola = chatList;
    console.log("sendingMsg");
    console.log(ishola);

    if (message != "") {
      setValue("");
      console.log("sendingMsg : ", message);
      websocketSendMessage(
        sender,
        user?.meetingDetails?.confname,
        sender,
        message,
      );
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key !== "Enter") return;
    const value = e.target.value;
    console.log("Well");
    if (!value.trim()) return;
    sendMsg();
  };

  const handleTypingSamji = (e: any) => {
    websocketStartTyping();
    setValue(e.target.value);
  };

  const screenSize = useScreenSize();
  return (
    <Sheet open={chatState} onOpenChange={setChatState}>
      <SheetContent
        className="m-h-screen w-full border-0 bg-primary p-0 text-a11y lg:w-[900px] "
        side={"right"}
      >
        <div
          className={cn(
            "sticky top-0 flex max-h-32 flex-col gap-2 border-b border-a11y/20 px-4 pb-1 pt-4",
            infoMessageStatus && !usersTyping.length && "py-5",
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Chat</span>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  role="combobox"
                  aria-expanded={open}
                  className="flex items-center gap-2 rounded-md border border-a11y/20 px-3 py-1 text-sm"
                >
                  Everyone
                  {open ? (
                    <ArrowChevronUpIcon className="  h-4 w-4 shrink-0 opacity-50" />
                  ) : (
                    <ArrowChevronDownIcon className="  h-4 w-4 shrink-0 opacity-50" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] border-0 bg-primary p-0 text-a11y">
                <Command className="border-0 bg-primary text-a11y  ">
                  <CommandInput
                    className=""
                    placeholder="Search for participants..."
                  />
                  <CommandEmpty>No user found.</CommandEmpty>
                  <CommandGroup className=" ">
                    <CommandItem
                      className=""
                      value={"Everyone"}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <TickIcon className={cn("mr-2 h-4 w-4")} />
                      Everyone
                    </CommandItem>
                    {chatList.map((chat: IChat, index: number) => (
                      <CommandItem
                        className="text-a11y"
                        key={index}
                        value={chat.name}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setOpen(false);
                        }}
                      >
                        <TickIcon className={cn("mr-2 h-4 w-4")} />
                        {chat.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {usersTyping.length > 0 && (
            <p className="">
              {usersTyping.join(", ")} {usersTyping.length > 1 ? "are" : "is"}{" "}
              typing...
            </p>
          )}
          {!infoMessageStatus && !usersTyping.length && (
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
            infoMessageStatus && !usersTyping.length && "h-[calc(100vh-130px)]",
            usersTyping.length > 0 && "h-[calc(100vh-150px)]",
          )}
        >
          {chatList.map((chat: IChat, index: number) => (
            <SingleChat key={index} chat={chat} />
          ))}
        </div>

        {chatTypingList.map((text: any, index:number) => (
          <div key={index}>{text.name}, is typing</div>
        ))}
        <div className="sticky bottom-0 h-16 w-full border-t border-a11y/20 bg-primary/20 px-4 md:sticky">
          <div className=" flex w-full items-center rounded-xl bg-transparent py-4 ">
            <input
              type="text"
              value={message}
              className="w-full bg-transparent px-3 placeholder:text-a11y/80  focus:shadow-none focus:outline-none"
              onChange={handleTyping}
              placeholder="Send a message to everyone"
              value={value}
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
                      setValue(value + e.native);
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

export default ChatModal;
