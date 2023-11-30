import React, {useEffect, useState} from "react";
import {useRecoilState, useSetRecoilState, useRecoilValue} from "recoil";
import Authenticated from "~/layouts/Authenticated";
import {
    connectedUsersState,
    currentColorTheme,
    screenSharingStreamState,
    whiteBoardOpenState, authUserState, participantListState, participantTalkingListState, participantCameraListState,
} from "~/recoil/atom";
import Image from "next/image";
import MicOnIcon from "./icon/outline/MicOnIcon";
import SingleCameraComponent from "./camera/SingleCameraComponent";
import { cn } from "~/lib/utils";

// import "~/styles/tldraw.css";
import dynamic from "next/dynamic";
import ScreenSharingComponent from "./screenSharing/ScreenSharingComponent";
import Websocket from "~/server/Websocket";
import KurentoAudio from "~/server/KurentoAudio";
import axios from "axios";
import * as ServerInfo from "~/server/ServerInfo";
import {toast} from "~/components/ui/use-toast";
import MicOffIcon from "~/components/icon/outline/MicOffIcon";
import {IParticipant, IParticipantCamera} from "~/types";
import KurentoVideo from "~/server/KurentoVideo";
import KurentoVideoViewer from "~/server/KurentoVideoViewer";
// import WhiteboardComponent from "./whiteboard/WhiteboardComponent";
const WhiteboardComponent = dynamic(
  () => import("~/components/whiteboard/WhiteboardComponent"),
  { ssr: false },
);

function PostSignIn() {
  const [screenShareState, setScreenShareState] = useState(true);
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(screenSharingStreamState,);
  const [connectedUsers, setConnectedUsers] = useRecoilState(connectedUsersState);

  const [isWhiteboardOpen, setIsWhiteboardOpen] = useRecoilState(whiteBoardOpenState);
  const setUser = useSetRecoilState(authUserState);
    const participantList = useRecoilValue(participantListState);
    const participantTalkingList = useRecoilValue(participantTalkingListState);
    const participantCameraList = useRecoilValue(participantCameraListState);

  const validateToken= (token: string | null)=>{
        axios.get(`${ServerInfo.tokenValidationURL}?sessionToken=${token}`)
            .then(function (response) {
                const responseData = response.data;

                console.log(responseData)
                console.log(response);

                if (responseData?.response?.returncode === 'SUCCESS') {

                    setUser({
                        email: "", fullName: "", id: 0,
                        meetingDetails: responseData?.response,
                        sessiontoken: token ?? ' '
                    })
                } else {
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: 'Invalid Session Token',
                    });
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .finally(function () {
                // always executed
            })

    }

    useEffect(() => {
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        console.log("urlParams")
        console.log(urlParams)
        const token = urlParams.get('sessionToken');
        console.log("token")
        console.log(token)

        validateToken(token);
    }, ['']);

    const findUserNamefromUserId = (userId:string) => {
        let ishola = participantList
        let damola = ishola.filter((item:any) => item?.userId == userId)
        console.log('damola')
        console.log(damola)
        if (damola.length > 0) {
            return damola[0]?.name
        } else {
            return 'unknown'
        }
    }

    const findAvatarfromUserId = (userId:string) => {
        let ishola = participantList
        let damola = ishola.filter((item:any) => item?.userId == userId)
        console.log('damola')
        console.log(damola)
        if (damola.length > 0) {
            return damola[0]?.avatar
        } else {
            return ''
        }
    }


    return (
    <Authenticated>
      <div className="relative h-[calc(100vh-128px)] bg-primary/60 ">
        {/* temp button to stimulate ppl joining */}
        {/*<div className={"fixed right-[50%] top-0 z-[999] flex gap-2 "}>*/}
        {/*  <button*/}
        {/*    className="  rounded-md bg-orange-400 p-1"*/}
        {/*    onClick={() => {*/}
        {/*      const newUser = connectedUsers[0];*/}
        {/*      if (!newUser) return;*/}
        {/*      setConnectedUsers((prev) => [*/}
        {/*        ...prev,*/}
        {/*        {*/}
        {/*          ...newUser,*/}
        {/*          id: Math.floor(Math.random() * 100),*/}
        {/*        },*/}
        {/*      ]);*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    add*/}
        {/*  </button>*/}
        {/*  <button*/}
        {/*    className="  rounded-md bg-orange-400 p-1"*/}
        {/*    onClick={() => {*/}
        {/*      if (connectedUsers.length === 1) return;*/}
        {/*      setConnectedUsers((prev) => prev.slice(0, prev.length - 1));*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    remove*/}
        {/*  </button>*/}
        {/*</div>*/}

        {/* show active people talking */}
{/*        {connectedUsers.filter((user) => user.isMicOpen === true)?.length >
          0 && (
          <div className="no-scrollbar absolute top-2 flex h-6 w-full justify-center gap-3 overflow-x-scroll text-xs antialiased">
            {connectedUsers
              .filter((user) => user.isMicOpen === true)
              .map((user, index) => (
                <div
                  key={index}
                  className="border-a11y/20 flex max-w-[100px] items-center justify-center gap-1 rounded-3xl border p-1"
                >
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      width={20}
                      height={20}
                      className="rounded-full"
                      alt="profile picture"
                    />
                  ) : (
                    <div className="bg-a11y/20 flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                      {" "}
                      {user.fullName.split(" ")[0]?.slice(0, 1)}
                      {user.fullName.split(" ")[1]?.slice(0, 1)}
                    </div>
                  )}
                  <span className="truncate">{user.fullName}</span>
                  <MicOnIcon className="h-4 w-4 shrink-0" />
                </div>
              ))}
          </div>
        )}*/}


        {/* show active people talking */}
        {participantTalkingList.filter((eachItem:any) => eachItem.talking)?.length >
          0 && (
          <div className="no-scrollbar absolute top-2 flex h-6 w-full justify-center gap-3 overflow-x-scroll text-xs antialiased">
            {participantTalkingList
              .filter((eachItem:any) => eachItem.talking )
              .map((eachItem:any, index:number) => (
                <div
                  key={index}
                  className="border-a11y/20 flex max-w-[100px] items-center justify-center gap-1 rounded-3xl border p-1"
                >
                  {findAvatarfromUserId(eachItem.intId) ? (
                    <Image
                      src={findAvatarfromUserId(eachItem.intId)}
                      width={20}
                      height={20}
                      className="rounded-full"
                      alt="profile picture"
                    />
                  ) : (
                    <div className="bg-a11y/20 flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                      {" "}
                      {findUserNamefromUserId(eachItem.intId).split(" ")[0]?.slice(0, 1)}
                      {findUserNamefromUserId(eachItem.intId).split(" ")[1]?.slice(0, 1)}
                    </div>
                  )}
                  <span className="truncate">{findUserNamefromUserId(eachItem.intId)}</span>
                  <MicOnIcon className="h-4 w-4 shrink-0" />
                </div>
              ))}
          </div>
        )}

        {/* render camera feed if not whiteboard or screensharing */}
        {!isWhiteboardOpen && !screenSharingStream && (
          <div
            className={cn(
              " m-auto h-[calc(100vh-128px)] p-4 ",
                participantTalkingList.filter((eachItem:any) => !eachItem.muted)?.length >
                0 && "mt-6 h-[calc(100vh-150px)]",
                participantList.length === 1 &&
                " flex items-center justify-center md:aspect-square  ",
                participantList.length === 2 &&
                "grid justify-center gap-2 md:grid-cols-2",
                participantList.length === 3 &&
                "grid grid-cols-2 gap-2 md:grid-cols-3",
                participantList.length >= 4 && "grid grid-cols-2 gap-2",
                participantList.length >= 5 && "grid gap-2 md:grid-cols-3",
                participantList.length >= 7 && "grid gap-2 md:grid-cols-4",
                participantList.length >= 13 && "grid gap-2 md:grid-cols-5",
                participantList.length >= 16 && "grid gap-2 md:grid-cols-6",
            )}
          >
            {participantList.map((participant:IParticipant, index:number) => (
              <SingleCameraComponent index={index} key={index} participant={participant}/>
            ))}
          </div>
        )}

        {/* render screen sharing if screen sharing is open and whiteboard is closed */}
        {screenSharingStream && !isWhiteboardOpen && <ScreenSharingComponent />}

        {/* render whiteboard if whiteboard is open */}
        {isWhiteboardOpen && <WhiteboardComponent />}
        {/* {screenSharingStream && screenShareState && <ScreenSharingComponent />} */}
        <Websocket/>
        <KurentoAudio/>
        <KurentoVideo/>
          {participantCameraList.map((cItem:IParticipantCamera,index:number)=>{
              return <KurentoVideoViewer streamID={cItem.streamID}/>
          })}

      </div>
    </Authenticated>
  );
}

export default PostSignIn;
