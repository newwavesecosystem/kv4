import React, { useState } from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import useScreenSize from "~/lib/useScreenSize";
import {useRecoilState, useRecoilValue} from "recoil";
import {participantListState, participantsModalState} from "~/recoil/atom";
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
import HandOnIcon from "../icon/outline/Hand/HandOnIcon";
import SearchIcon from "../icon/outline/SearchIcon";
import DummyChat from "~/data/dummyChat";
import SingleParticipant from "./SingleParticipant";

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
  const [selectedParticipant, setSelectedParticipant] = useState();
  const [selectedMenu, setSelectedMenu] = useState(DummyMenu[0]);

  const participantList = useRecoilValue(participantListState);

  const screenSize = useScreenSize();
  return (
    <Sheet open={participantState} onOpenChange={setParticipantState}>
      <SheetContent
        className="h-screen w-full border-0 bg-konn3ct-active text-white lg:w-[900px] "
        side={screenSize.id <= 3 ? "bottom" : "right"}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Participants</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="items-center rounded-lg border p-2 text-sm">
                {selectedMenu?.name}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" mt-1 w-52  border-0 bg-konn3ct-active text-white ">
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
              <DropdownMenuSeparator className="bg-konn3ct-green" />
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
        <div className="mt-6 flex w-full items-center rounded-lg bg-[#5D957E] px-3 py-2">
          <SearchIcon className="h-6 w-6" />
          <input
            type="search"
            name=""
            id=""
            className="w-full rounded-md border-transparent bg-transparent pl-3 placeholder:text-[#E0ECFF]  focus:shadow-none focus:outline-none"
            placeholder="Find the person"
          />
        </div>
        <div>
          {participantList.map((participant, index) => (
            <SingleParticipant key={index} participant={participant} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ParticipantsModal;
