import Image from "next/image";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {authUserState, microphoneStreamState, postLeaveMeetingState, screenSharingStreamState} from "~/recoil/atom";
import HandOnIcon from "./icon/outline/HandOnIcon";
import ExitIcon from "./icon/outline/ExitIcon";
import {kurentoAudioEndStream} from "~/server/KurentoAudio";
import {websocketEnd} from "~/server/Websocket";
import stopMicrophoneStream from "~/lib/microphone/stopMicrophoneStream";
import {kurentoVideoEndStream} from "~/server/KurentoVideo";
import {websocketKurentoScreenshareEndScreenshare} from "~/server/KurentoScreenshare";

function PostLeave() {
  const user = useRecoilValue(authUserState);
  const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(
    postLeaveMeetingState,
  );
  const [microphoneStream, setMicrophoneStream] = useRecoilState(
      microphoneStreamState,
  );
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
      screenSharingStreamState,
  );


  React.useEffect(() => {
    console.log("running post leave")
    stopMicrophoneStream(microphoneStream);
    kurentoAudioEndStream();
    kurentoVideoEndStream();
    if(screenSharingStream != null){
      websocketKurentoScreenshareEndScreenshare(screenSharingStream);
    }
    websocketEnd();
  }, [postLeaveMeeting]);

  return (
    <div className="text-a11y mt-5">
      <div className="flex items-center gap-2 ml-5">
        <Image src="/conference_logo.png" alt="logo" width={53} height={53}/>
        <span className="font-semibold text-base font-['Raleway']">Conference</span>
      </div>
      <div className="flex h-[calc(100svh-64px)] flex-col items-center justify-center bg-primary/80 ">
        <Image src="/bye.png" alt="logo" width={82} height={80}/>
        <span className="text-4xl font-bold text-black">
          Oops! {" "}
          {postLeaveMeeting.isLeave && "You left the session"}
          {postLeaveMeeting.isLeaveRoomCall && "You left the session"}
          {postLeaveMeeting.isEndCall && "Session has Ended"}
          {postLeaveMeeting.isKicked && "You were kicked from the session"}
          {postLeaveMeeting.isSessionExpired && "Session expired"}
          {postLeaveMeeting.isOthers && "Invalid Meeting Link"}
        </span>
        <p className=" mt-2 text-sm text-black">Have a nice day, {user?.fullName}</p>
        <div className="mt-10 flex items-center gap-2">
          {/*<span className="text-sm text-a11y/40">Left by mistake?</span>*/}
          {/*{!postLeaveMeeting.isKicked && (*/}
          {/*  <button*/}
          {/*    onClick={() => {*/}
          {/*      if (postLeaveMeeting.isKicked) return;*/}
          {/*      setPostLeaveMeeting({*/}
          {/*        isLeave: false,*/}
          {/*        isLeaveRoomCall: false,*/}
          {/*        isEndCall: false,*/}
          {/*        isKicked: false,*/}
          {/*        isSessionExpired: false,*/}
          {/*        isOthers: false,*/}
          {/*      });*/}
          {/*    }}*/}
          {/*    className="flex items-center gap-2 rounded-md bg-primary px-4 py-1"*/}
          {/*  >*/}
          {/*    <ExitIcon className="h-4 w-4" />*/}
          {/*    <span>Rejoin</span>*/}
          {/*  </button>*/}
          {/*    user?.meetingDetails?.customdata[0]?.meetingLink !== "" && (<a*/}
          {/*    href={user?.meetingDetails?.customdata[0]?.meetingLink}*/}
          {/*    className="flex items-center gap-2 rounded-md bg-primary px-4 py-1"*/}
          {/*  >*/}
          {/*    <ExitIcon className="h-4 w-4" />*/}
          {/*    <span>Rejoin</span>*/}
          {/*  </a>)*/}
          {/*)}*/}
        </div>
        <div className="fixed bottom-5">
          <button className="rounded-md border border-onegov px-4 py-1 text-sm text-onegov">
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostLeave;
