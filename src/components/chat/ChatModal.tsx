import React, { useState } from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import useScreenSize from "~/lib/useScreenSize";
import { useRecoilState } from "recoil";
import { chatModalState, participantsModalState } from "~/recoil/atom";
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

const DummyParticipants = [
  {
    id: 1,
    name: "katy Perry",
    role: "Host",
  },
  {
    id: 2,
    name: "John Doe",
    role: "Guest",
  },
  {
    id: 3,
    name: "Jane Doe",
    role: "Guest",
  },
  {
    id: 4,
    name: "michael Jackson",
    role: "Guest",
  },
];
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
  const [infoMessageStatus, setInfoMessageStatus] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState();
  const [selectedMenu, setSelectedMenu] = useState(DummyMenu[0]);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const screenSize = useScreenSize();
  return (
    <Sheet open={chatState} onOpenChange={setChatState}>
      <SheetContent
        className="m-h-screen text-a11y w-full border-0 bg-primary p-0 lg:w-[900px] "
        side={"right"}
      >
        <div className="sticky top-0 flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Chat</span>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  // variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="border-a11y/20 flex items-center gap-2 rounded-md border px-3 py-1 text-sm"
                >
                  {/* {value
                  ? frameworks.find((framework) => framework.value === value)
                      ?.label
                  : "Select framework..."} */}
                  {/* {DummyChat[0]?.name} */}
                  Everyone
                  {open ? (
                    <ArrowChevronUpIcon className="  h-4 w-4 shrink-0 opacity-50" />
                  ) : (
                    <ArrowChevronDownIcon className="  h-4 w-4 shrink-0 opacity-50" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="text-a11y w-[200px] border-0 bg-primary p-0">
                <Command className="border-0 bg-primary  ">
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
                      <TickIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          // value === framework.value
                          //   ? "opacity-100"
                          //   : "opacity-0",
                        )}
                      />
                      Everyone
                    </CommandItem>
                    {DummyChat.map((user, index) => (
                      <CommandItem
                        key={index}
                        value={user.name}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setOpen(false);
                        }}
                      >
                        <TickIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            // value === framework.value
                            //   ? "opacity-100"
                            //   : "opacity-0",
                          )}
                        />
                        {user.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          {!infoMessageStatus && (
            <div className=" border-a11y/20 mt-5 flex items-center gap-2 rounded-lg border bg-primary p-2 text-xs shadow-sm">
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

        <div className="h-screen overflow-y-auto">
          {DummyChat.map((chat, index) => (
            <SingleChat key={index} chat={chat} />
          ))}
        </div>
        <div className="border-a11y/20 fixed bottom-0 w-full border-t bg-primary px-4 py-10 md:sticky">
          <div className=" flex w-full items-center rounded-xl bg-primary px-4 py-4 ">
            <input
              type="text"
              name=""
              className="w-full bg-transparent pl-3  focus:shadow-none focus:outline-none"
              id=""
              placeholder="Send a message to everyone"
            />
            <div className="flex items-center gap-2">
              <EmojiIcon className="h-6 w-6" />
              <SendIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ChatModal;
