import React, { ChangeEvent, useState } from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import useScreenSize from "~/lib/useScreenSize";
import { useRecoilState, useRecoilValue } from "recoil";
import { participantListState, participantsModalState } from "~/recoil/atom";
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
import SingleParticipant from "./SingleParticipant";
import {IParticipant} from "~/types";
import ArrowChevronDownIcon from "~/components/icon/outline/ArrowChevronDownIcon";

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

function ParticipantsModal() {
  const [participantState, setParticipantState] = useRecoilState(
    participantsModalState,
  );
  const [selectedMenu, setSelectedMenu] = useState(DummyMenu[0]);

  const participantList = useRecoilValue(participantListState);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTags, setFilterTags] = useState(
    DummyMenu[0]?.name || "Everyone",
  );

  // const filteredParticipants = participantList.filter((item) =>
  const filteredParticipants =
    filterTags === "Everyone"
      ? participantList.filter((item:IParticipant) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : participantList.filter(
          (item:IParticipant) =>
            item.raiseHand &&
            item.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const screenSize = useScreenSize();
  return (
    <Sheet open={participantState} onOpenChange={setParticipantState}>
      <SheetContent
        className="h-full w-full border-0 bg-primary text-a11y lg:w-[900px] "
        side={screenSize.id <= 3 ? "bottom" : "right"}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Participants</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="items-center rounded-lg border border-a11y/20 p-2 text-sm flex">
                {filterTags}
                <ArrowChevronDownIcon className=" ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" mt-1 w-52  border-0 bg-primary text-a11y ">
              <DropdownMenuGroup className=" divide-y divide-a11y/20">
                {DummyMenu.map((menu, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="flex items-center gap-2 rounded-none py-4"
                    onClick={() => {
                      setFilterTags(menu.name)
                    }}
                  >
                    {menu.icon}
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
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-md border-transparent bg-transparent pl-3 placeholder:text-a11y/60 focus:shadow-none focus:outline-none"
            placeholder="Find the person"
          />
        </div>
        <div className="no-scrollbar h-full overflow-y-scroll pb-20">
          {filteredParticipants.map(
            (participant: IParticipant, index: number) => (
              <SingleParticipant key={index} participant={participant} />
            ),
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ParticipantsModal;
