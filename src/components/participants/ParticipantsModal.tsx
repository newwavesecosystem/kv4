import React, { useState } from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import useScreenSize from "~/lib/useScreenSize";
import { useRecoilState } from "recoil";
import { participantsModalState } from "~/recoil/atom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import PeoplesIcon from "../icon/outline/PeoplesIcon";
import HandOnIcon from "../icon/outline/HandOnIcon";
import SearchIcon from "../icon/outline/SearchIcon";
import DummyChat from "~/data/dummyChat";
import SingleParticipant from "./SingleParticipant";

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
const DummyMenu2 = [
  {
    id: 3,
    name: "Akanji Joseph (Host)",
  },
  {
    id: 4,
    name: "John Doe",
  },
  {
    id: 5,
    name: "Jane Doe",
  },
];

function ParticipantsModal() {
  const [participantState, setParticipantState] = useRecoilState(
    participantsModalState,
  );
  const [selectedMenu, setSelectedMenu] = useState(DummyMenu[0]);

  const screenSize = useScreenSize();
  return (
    <Sheet open={participantState} onOpenChange={setParticipantState}>
      <SheetContent
        className="h-screen w-full border-0 bg-primary text-a11y lg:w-[900px] "
        side={screenSize.id <= 3 ? "bottom" : "right"}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Participants</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="items-center rounded-lg border border-a11y/20 p-2 text-sm">
                {selectedMenu?.name}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" mt-1 w-52  border-0 bg-primary text-a11y ">
              <DropdownMenuGroup className="py-2 ">
                {DummyMenu.map((menu, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="flex items-center gap-2 py-2"
                    // onClick={() => {
                    //   setRecordingState((prev) => ({
                    //     ...prev,
                    //     step: 1,
                    //   }));
                    // }}
                  >
                    {menu.icon}
                    {menu.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-a11y/20" />
              <DropdownMenuGroup className="py-2 ">
                {DummyMenu2.map((menu, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="py-2"
                    // onClick={() => {
                    //   setRecordingState((prev) => ({
                    //     ...prev,
                    //     step: 1,
                    //   }));
                    // }}
                  >
                    {menu.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-6 flex w-full items-center rounded-lg bg-a11y/20 px-3 py-2">
          <SearchIcon className="h-6 w-6" />
          <input
            type="search"
            name=""
            id=""
            className="w-full rounded-md border-transparent bg-transparent pl-3 placeholder:text-a11y/60 focus:shadow-none focus:outline-none"
            placeholder="Find the person"
          />
        </div>
        <div className="no-scrollbar h-full overflow-y-scroll pb-20">
          {DummyChat.map((participant, index) => (
            <SingleParticipant key={index} participant={participant} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ParticipantsModal;
