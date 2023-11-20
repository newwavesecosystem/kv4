import React, { useState } from "react";
import DummyChat from "~/data/dummyChat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import { authUserState } from "~/recoil/atom";
import { useRecoilValue } from "recoil";
import InformationIcon from "../icon/outline/InformationIcon";
import VolumeOnIcon from "../icon/outline/VolumeOnIcon";
import ChatIcon from "../icon/outline/ChatIcon";
import MicOffIcon from "../icon/outline/MicOffIcon";
import PeopleRemove from "../icon/outline/PeopleRemove";
import RepeatIcon from "../icon/outline/RepeatIcon";

function SingleParticipant({
  key,
  participant,
}: {
  key: number;
  participant: (typeof DummyChat)[0];
}) {
  const [open, setOpen] = useState(false);
  const user = useRecoilValue(authUserState);
  return (
    <div className="flex justify-between border-b border-b-white/20 py-4 text-sm">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-konn3ct-green"></div>
        <div className="flex flex-col">
          <span className="font-bold">
            {participant.name}
            {user?.fullName === participant.name && " (You)"}
          </span>
          <span className="text-xs">host</span>
        </div>
      </div>
      <div className=" flex items-center gap-2">
        <button>
          <MicOffIcon className="h-6 w-6" />
        </button>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button>
              <EllipsisIcon className="h-6 w-6 " />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-0 bg-konn3ct-active text-white"
          >
            <DropdownMenuItem className="py-2">
              <RepeatIcon className="mr-2 h-5 w-5" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2">
              <VolumeOnIcon volume={1} className="mr-2 h-5 w-5" />
              Mute User
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2">
              <ChatIcon className="mr-2 h-5 w-5" />
              private chat
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2">
              <PeopleRemove className="mr-2 h-5 w-5" />
              Remove User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default SingleParticipant;
