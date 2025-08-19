import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import DeleteIcon from "../icon/outline/DeleteIcon";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import InformationIcon from "../icon/outline/InformationIcon";
import DummyChat from "~/data/dummyChat";
import { useRecoilValue } from "recoil";
import { authUserState } from "~/recoil/atom";
import {IChat} from "~/types";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CopyIcon from "~/components/icon/outline/CopyIcon";

dayjs.extend(relativeTime);
function SingleChat({
  key,
  chat,
}: {
  key: number;
  chat: IChat;
}) {
  const [open, setOpen] = useState(false);
  const user = useRecoilValue(authUserState);
  const [copied, setCopied] = useState(false);

  // v-- Add this handler function
  const handleCopy = () => {
    navigator.clipboard.writeText(chat.message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
      <div className="m-4 flex flex-col py-4 text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
          <span className="font-bold">
            {user?.fullName === chat.name ? "You" : chat.name}
          </span>
            {/* <span>{dayjs().from(new Date())}</span> */}
            <span className="text-sm text-a11y/50">
            {dayjs(chat.time).fromNow()}
          </span>
          </div>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button>
                <EllipsisIcon className="h-5 w-5 rotate-90" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border border-a11y/20 bg-primary text-a11y shadow-lg"
            >
              <DropdownMenuItem onClick={handleCopy}>
                <CopyIcon className="mr-2 h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </DropdownMenuItem>
              {/*<DropdownMenuItem className="">*/}
              {/*  <InformationIcon className="mr-2 h-4 w-4" />*/}
              {/*  Info*/}
              {/*</DropdownMenuItem>*/}
              {/*<DropdownMenuItem className="">*/}
              {/*  <DeleteIcon className="mr-2 h-4 w-4" />*/}
              {/*  Delete*/}
              {/*</DropdownMenuItem>*/}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="prose">
          <ReactMarkdown skipHtml={true} remarkPlugins={[remarkGfm]}>{`${chat.message}`}</ReactMarkdown>
        </div>
        {/*<div dangerouslySetInnerHTML={{__html: chat.message}}/>*/}
      </div>
  );
}

export default SingleChat;
