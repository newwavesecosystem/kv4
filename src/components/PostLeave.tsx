import Image from "next/image";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authUserState, postLeaveMeetingState } from "~/recoil/atom";
import HandOnIcon from "./icon/outline/HandOnIcon";
import ExitIcon from "./icon/outline/ExitIcon";

function PostLeave() {
  const user = useRecoilValue(authUserState);
  const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(
    postLeaveMeetingState,
  );
  return (
    <div className="text-a11y">
      <div className="flex h-16 items-center justify-center bg-primary">
        <Image
          src="/logo.png"
          alt="logo"
          width={145}
          height={48}
          className=""
        />
      </div>
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center bg-primary/80 ">
        <HandOnIcon className="h-20 w-20 rotate-45" />
        <span className="text-2xl font-bold">You left the session</span>
        <p className=" mt-2 text-sm">Have a nice day, {user?.fullName}</p>
        <div className="mt-10 flex items-center gap-2">
          <span className="text-sm text-a11y/40">Left by mistake?</span>
          <button
            onClick={() => {
              setPostLeaveMeeting(false);
            }}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-1"
          >
            <ExitIcon className="h-4 w-4" />
            <span>Rejoin</span>
          </button>
        </div>
        <div className="fixed bottom-5">
          <button className="rounded-md border border-a11y px-4 py-1 text-sm">
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostLeave;
