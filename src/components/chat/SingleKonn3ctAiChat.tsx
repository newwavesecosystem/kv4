import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useRecoilValue } from "recoil";
import { authUserState } from "~/recoil/atom";
import DummyKonn3ctAiChat from "~/data/dummyKonn3ctAiChat";
import ThumbsDownIcon from "../icon/outline/ThumbsDownIcon";
import ThumbsUpIcon from "../icon/outline/ThumbsUpIcon";
dayjs.extend(relativeTime);

function SingleKonn3ctAiChat({
  key,
  chat,
}: {
  key: number;
  chat: (typeof DummyKonn3ctAiChat)[0];
}) {
  const [open, setOpen] = useState(false);
  const user = useRecoilValue(authUserState);

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
        </div>
        <div dangerouslySetInnerHTML={{__html: chat.message}}/>
        {/*<span>{chat.message}</span>*/}
        {chat.from === "ai" && (
            <div className="flex w-16 my-1 items-center justify-center gap-2 rounded-2xl bg-a11y/20 py-1">
              <button>
                <ThumbsDownIcon className="h-5 w-5"/>
              </button>
              <button>
                <ThumbsUpIcon className="h-5 w-5"/>
              </button>
            </div>
        )}
      </div>
  );
}

export default SingleKonn3ctAiChat;
