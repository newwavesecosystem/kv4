import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import Authenticated from "~/layouts/Authenticated";
import {
  connectedUsersState,
  currentColorTheme,
  eCinemaModalState,
  pollModalState,
  screenSharingStreamState,
  whiteBoardOpenState,
  authUserState,
  participantListState,
  participantTalkingListState,
  participantCameraListState,
  viewerScreenSharingState,
  screenSharingState,
  connectionStatusState,
  cameraOpenState,
  postLeaveMeetingState,
  donationModalState,
  pinnedUsersState,
  LayoutSettingsState, presentationSlideState,
} from "~/recoil/atom";
import Image from "next/image";
import MicOnIcon from "./icon/outline/MicOnIcon";
import SingleCameraComponent from "./camera/SingleCameraComponent";
import { cn } from "~/lib/utils";
import { useRouter } from 'next/router';


// import "~/styles/tldraw.css";
import dynamic from "next/dynamic";
import ScreenSharingComponent from "./screenSharing/ScreenSharingComponent";
import ArrowChevronDownIcon from "./icon/outline/ArrowChevronDownIcon";
import ECinemaComponent from "./eCinema/ECinemaComponent";
import Websocket from "~/server/Websocket";
import KurentoAudio from "~/server/KurentoAudio";
import axios from "axios";
import * as ServerInfo from "~/server/ServerInfo";
import { toast } from "~/components/ui/use-toast";
import MicOffIcon from "~/components/icon/outline/MicOffIcon";
import { IParticipant, IParticipantCamera } from "~/types";
import KurentoVideo from "~/server/KurentoVideo";
import KurentoVideoViewer from "~/server/KurentoVideoViewer";
import KurentoScreenShare from "~/server/KurentoScreenshare";
import KurentoScreenShareViewer from "~/server/KurentoScreenshareViewer";
import Draggable from "react-draggable";
import CCModal from "~/components/cc/CCModal";
import SocketIOCaption from "~/server/SocketIOCaption";
import PinIcon from "~/components/icon/outline/PinIcon";
import MinimizeIcon from "~/components/icon/outline/MinimizeIcon";
import {FindAvatarfromUserId, FindUserNamefromUserId} from "~/lib/checkFunctions";
import {GetCurrentSessionEjected, GetCurrentSessionToken, SetCurrentSessionToken} from "~/lib/localStorageFunctions";
import {getMyCookies} from "~/lib/cookiesFunctions";

// import WhiteboardComponent from "./whiteboard/WhiteboardComponent";
const WhiteboardComponent = dynamic(
  () => import("~/components/whiteboard/WhiteboardComponent"),
  { ssr: false },
);

function PostSignIn() {
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);

  const [isWhiteboardOpen, setIsWhiteboardOpen] =
    useRecoilState(whiteBoardOpenState);
  const [user, setUser] = useRecoilState(authUserState);
  const [participantList, setParticipantList] =
    useRecoilState(participantListState);
  const participantTalkingList = useRecoilValue(participantTalkingListState);
  const participantCameraList = useRecoilValue(participantCameraListState);
  const viewerscreenShareState = useRecoilValue(viewerScreenSharingState);
  const screenShareState = useRecoilValue(screenSharingState);
  const [connectionStatus, setConnection] = useRecoilState(
    connectionStatusState,
  );
  const [layoutSettings, setlayoutSettings] =
    useRecoilState(LayoutSettingsState);
  const [videoState, setVideoState] = useRecoilState(cameraOpenState);
  const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(
    postLeaveMeetingState,
  );
  const [donationState, setDonationState] = useRecoilState(donationModalState);
  const [pinnedParticipant, setPinnedParticipant] =
    useRecoilState(pinnedUsersState);
  const [presentationSlide, setPresentationSlide] = useRecoilState(presentationSlideState);
  const [wakeLock, setWakeLock] = useState(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const router = useRouter();

  let lock:WakeLockSentinel;

  const checkDonation = (id: any) => {
    axios
      .get(`${ServerInfo.laravelAppURL}/api/k4/donation/${id}`)
      .then(function (response) {
        const responseData = response.data;

        if (responseData?.success) {
          console.log("checkDonation data length");
          if (responseData?.data.length > 0) {
            console.log("checkDonation data length");
            setDonationState({
              donationAmount: responseData.data[0].amount,
              donationAmountType: responseData.data[0].type,
              donationName: responseData.data[0].name,
              enableFlashNotification: false,
              totalAmountDonatated: 0,
              usersDonated: [],
              step: 0,
              isActive: true,
              donationCreatedAt: responseData.data[0].created_at,
              donationCreatorId: responseData.data[0].id as number,
              donationCreatorName: user?.fullName as string,
            });
          }
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  };

  const validateToken = async (token: string | null) => {

    var gste = await GetCurrentSessionEjected();

    console.log("gste: ",gste);

    if (token == gste) {
      setPostLeaveMeeting({
        ...postLeaveMeeting,
        isSessionExpired: true,
      });
      return;
    }

    axios
        .get(`${ServerInfo.tokenValidationURL}?sessionToken=${token}`)
        .then(function (response) {
          const responseData = response.data;

          if (responseData?.response?.returncode === "SUCCESS") {
            setUser({
              connectionAuthTime: 0, connectionID: "",
              meetingId: "",
              passCode: "",
              email: "",
              fullName: "",
              id: 0,
              meetingDetails: responseData?.response,
              sessiontoken: token!
            });
            SetCurrentSessionToken(token!);
            getTurnServers(token);
            checkDonation(responseData?.response?.externMeetingID);
            requestWakeLock();
          } else {
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "Invalid Session Token",
            });
            setPostLeaveMeeting({
              ...postLeaveMeeting,
              isSessionExpired: true,
            });
          }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .finally(function () {
          // always executed
        });
  };

  const getTurnServers = async (token: string | null) => {

    axios
        .get(`${ServerInfo.turnStunApiURL}?sessionToken=${token}`)
        .then(function (response) {
          const responseData = response.data;

          if (responseData?.turnServers.length > 1) {
            var turnReply:any = [];

            responseData?.turnServers.forEach((turnEntry:any) => {
              const { password, url, username } = turnEntry;
              turnReply.push({
                urls: url,
                credential:password,
                username,
              });
            });

            setConnection((prev)=>({
              ...prev,
                  iceServers:turnReply
            }));
            console.log("iceServers gotten: ",turnReply)
          } else {
            console.log("Unable to get iceServers")
          }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .finally(function () {
          // always executed
        });
  };

  // Function to request wake lock
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        lock = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
        console.log('Wake lock is active');

        // Listen for visibility change to re-activate the wake lock if needed
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }
    } catch (error) {
      console.error(`Wake lock request failed: ${error}`);
    }
  };

  const removeWakeLock = async () => {
      lock?.release().then(() => {
        setWakeLockActive(false);
        console.log('Wake lock has been released');
      });
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  // Handle when user switches tabs and the wake lock gets released
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && !wakeLockActive) {
      requestWakeLock();
    }
  };

  const tokenExtraction = async () =>{

    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    console.log("urlParams");
    console.log(urlParams);
    // extract the value from the query params
    const token = urlParams.get("sessionToken");

    if (token) {
      // do something with the extract query param
      console.log("token");
      console.log(token);

      // create an updated router path object
      const newPathObject = {
        pathname: router.pathname,
        query: ""
      }

      validateToken(token);

      // update the URL, without re-triggering data fetching
      router.push(newPathObject, undefined, { shallow: true });

      // delete router.query.paramName;
      // router.push(router);

      // setTimeout(()=>{ history.replaceState(null, "", location.pathname) }, 0)

    }else if(await GetCurrentSessionToken() != ""){
      validateToken(await GetCurrentSessionToken());
    }else{
      setPostLeaveMeeting({
        ...postLeaveMeeting,
        isSessionExpired: true,
      });
    }

  }


  useEffect(() => {
    tokenExtraction();
  }, [""]);

  useEffect(() => {
    console.log("setting up disabling back");
    const disableBackButton = (event: any) => {
      console.log("trying to disable back");
      // Prevent navigating back using the browser's back button
      event.preventDefault();
    };

    // Listen for the 'popstate' event (back/forward button navigation)
    window.addEventListener("popstate", disableBackButton);

    document.addEventListener("gesturestart", function (e) {
      e.preventDefault();
    });

    // Clean up the event listener when the component is unmounted
    return () => {
      removeWakeLock();
        window.removeEventListener('popstate', disableBackButton);
    };
  }, []); // Run the effect only once during component mount


  const [pollModal, setPollModal] = useRecoilState(pollModalState);
  const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);

  return (
      <Authenticated>
        {!connectionStatus?.websocket_connection ?
            <span className="flex w-full items-center justify-between px-4"
                  style={{
                    color: 'white',
                    backgroundColor: 'red',
                    textAlign: 'center'
                  }}>{connectionStatus.websocket_connection_reconnect ? "Network issues detected. Trying to reconnecting automatically" : "Connecting..."}<br/></span> : ''}
        {connectionStatus?.websocket_connection && !connectionStatus?.audio_connection ?
            <span className="flex w-full items-center justify-between px-4"
                  style={{color: 'white', backgroundColor: 'black', textAlign: 'center'}}>Your audio is not connected. You will not hear the conversation in the meeting.<br/></span> : ''}
        <div className="relative h-[calc(100vh-128px)] bg-primary/60 ">
          {/* polls */}
          {(pollModal.isActive || pollModal.isEnded) && pollModal.step === 0 && (
              <button
                  onClick={() => {
                    setPollModal((prev) => ({
                      ...prev,
                      step: 2,
                    }));
                  }}
                  className="fixed bottom-20 left-5 z-10 flex items-center gap-2 rounded-md bg-primary px-4 py-3"
              >
                <span>View Polls</span>
                <ArrowChevronDownIcon className="h-6 w-6"/>
              </button>
          )}
          {/* temp button to stimulate ppl joining */}
          {/*<div className={"fixed right-[50%] top-0 z-[999] flex gap-2 "}>*/}
          {/*  <button*/}
          {/*    className="  rounded-md bg-orange-400 p-1"*/}
          {/*    onClick={() => {*/}
          {/*      setParticipantList((prev: any) => [*/}
          {/*        ...prev,*/}
          {/*        {*/}
          {/*          id: prev[0].id + `${Math.floor(Math.random() * 100)}`,*/}
          {/*          intId: prev[0].id + `${Math.floor(Math.random() * 100)}`,*/}
          {/*        },*/}
          {/*      ]);*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    add*/}
          {/*  </button>*/}
          {/*  <button*/}
          {/*    className="  rounded-md bg-orange-400 p-1"*/}
          {/*    onClick={() => {*/}
          {/*      if (participantList.length === 1) return;*/}
          {/*      setParticipantList((prev: any) => prev.slice(0, -1));*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    remove*/}
          {/*  </button>*/}
          {/*  {participantList.length}*/}
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
          {participantTalkingList.filter((eachItem: any) => eachItem.talking)
              ?.length > 0 && (
              <div
                  className="no-scrollbar absolute top-2 flex h-6 w-full justify-center gap-3 overflow-x-scroll text-xs antialiased">
                {participantTalkingList
                    .filter((eachItem: any) => eachItem.talking)
                    .map((eachItem: any, index: number) => (
                        <div
                            key={index}
                            className="flex max-w-[100px] items-center justify-center gap-1 rounded-3xl border border-a11y/20 p-1"
                        >
                          {FindAvatarfromUserId(eachItem.intId, participantList) ? (
                              <Image
                                  src={FindAvatarfromUserId(eachItem.intId, participantList)}
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                  alt="profile picture"
                              />
                          ) : (
                              <div
                                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-a11y/20">
                                {" "}
                                {FindUserNamefromUserId(eachItem.intId, participantList)
                                    .split(" ")[0]
                                    ?.slice(0, 1)}
                                {FindUserNamefromUserId(eachItem.intId, participantList)
                                    .split(" ")[1]
                                    ?.slice(0, 1)}
                              </div>
                          )}
                          <span className="truncate">
                    {FindUserNamefromUserId(eachItem.intId, participantList)}
                  </span>
                          <MicOnIcon className="h-4 w-4 shrink-0"/>
                        </div>
                    ))}
              </div>
          )}
          {/*{(isWhiteboardOpen || screenSharingStream) &&*/}
          {/*  connectedUsers.filter((user) => user.isMicOpen === true)?.length >*/}
          {/*    0 && (*/}
          {/*    <div className="no-scrollbar absolute top-2 flex h-6 w-full justify-center gap-3 overflow-x-scroll text-xs antialiased">*/}
          {/*      {connectedUsers*/}
          {/*        .filter((user) => user.isMicOpen === true)*/}
          {/*        .map((user, index) => (*/}
          {/*          <div*/}
          {/*            key={index}*/}
          {/*            className="flex max-w-[100px] items-center justify-center gap-1 rounded-3xl border border-a11y/20 p-1"*/}
          {/*          >*/}
          {/*            {user.profilePicture ? (*/}
          {/*              <Image*/}
          {/*                src={user.profilePicture}*/}
          {/*                width={20}*/}
          {/*                height={20}*/}
          {/*                className="rounded-full"*/}
          {/*                alt="profile picture"*/}
          {/*              />*/}
          {/*            ) : (*/}
          {/*              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-a11y/20">*/}
          {/*                {" "}*/}
          {/*                {user.fullName.split(" ")[0]?.slice(0, 1)}*/}
          {/*                {user.fullName.split(" ")[1]?.slice(0, 1)}*/}
          {/*              </div>*/}
          {/*            )}*/}
          {/*            <span className="truncate">{user.fullName}</span>*/}
          {/*            <MicOnIcon className="h-4 w-4 shrink-0" />*/}
          {/*          </div>*/}
          {/*        ))}*/}
          {/*    </div>*/}
          {/*  )}*/}

          <div className="mb-5"/>

          {/*@Solomon help me implement component for presentation*/}
          {/*{presentationSlide.show &&*/}
          {/*<img*/}
          {/*    src={presentationSlide.presentations[0]?.pages[0]?.svgUri ?? ''}*/}
          {/*    width={544}*/}
          {/*    height={544}*/}
          {/*    alt="profile picture"*/}
          {/*/>*/}
          {/*}*/}


          {/* render camera feed if not whiteboard or screensharing */}
          {!isWhiteboardOpen &&
              (!screenSharingStream ||
                  (screenSharingStream && layoutSettings.layout === "2")) &&
              !eCinemaModal.isActive && (
                  <div
                      className={cn(
                          " m-auto h-[calc(100vh-158px)] items-center justify-center p-4",
                          (isWhiteboardOpen || screenSharingStream) &&
                          participantTalkingList.filter(
                              (eachItem: any) => !eachItem.muted,
                          )?.length > 0 &&
                          "mt-6 h-[calc(100vh-150px)]",
                          participantList.length === 1 &&
                          " flex items-center justify-center md:aspect-square  ",
                          participantList.length === 2 &&
                          "grid justify-center gap-2 md:grid-cols-2 mt-5",
                          participantList.length === 3 &&
                          "grid grid-cols-2 gap-2 lg:grid-cols-3 ",
                          participantList.length >= 4 && "grid grid-cols-2 gap-2",
                          participantList.length >= 5 && "grid gap-2 md:grid-cols-3",
                          participantList.length >= 7 && "grid gap-2 md:grid-cols-4",
                          participantList.length >= 13 && "grid gap-2 md:grid-cols-5",
                          participantList.length >= 3 && pinnedParticipant.length > 0 && "md:!grid-cols-4",
                      )} style={{paddingTop: "1.5rem"}}
                  >
                    {participantList
                        // pick only 5 participant
                        .filter(
                            (participant: IParticipant, index: number) => {
                              if (pinnedParticipant.length > 0) {
                                return index < 5
                              } else {
                                return participant
                              }
                            },
                        )
                        .map(
                            (participant: IParticipant, index: number) => (
                                <SingleCameraComponent
                                    index={index}
                                    key={index}
                                    participant={participant}
                                    userCamera={participantCameraList.filter((cItem: IParticipantCamera) => cItem?.intId == participant.intId)[0]}
                                />
                            ),
                        )}
                  </div>
              )}

          {/* Smart Layout */}
          {screenSharingStream && layoutSettings.layout === "1" && (
              <Draggable
                  defaultClassName="cursor-grab hidden xl:block"
                  bounds="parent"
                  defaultClassNameDragging="cursor-grabbing"
              >
                <div className="absolute top-0 z-50 m-2 backdrop-blur-3xl">
                  <div className="flex flex-row-reverse px-2 py-2">
                    <button
                        onClick={() => {
                          setlayoutSettings({
                            ...layoutSettings,
                            layout: "4",
                            layoutName: "Focus on presenter",
                          });
                        }}
                        className="rounded-full bg-primary/80 p-1 "
                    >
                      <MinimizeIcon className=" h-5 w-5"/>
                    </button>
                  </div>
                  <div
                      className={cn(
                          " m-auto flex h-40 items-center justify-center gap-2 ",
                      )}
                  >
                    {participantList
                        // pick only 6 participants
                        .filter(
                            (participant: IParticipant, index: number) => index < 6,
                        )
                        .map((participant: IParticipant, index: number) => (
                            <SingleCameraComponent
                                index={index}
                                key={index}
                                participant={participant}
                                userCamera={participantCameraList.filter((cItem: IParticipantCamera) => cItem?.intId == participant.intId)[0]}
                            />
                        ))}
                  </div>
                </div>
              </Draggable>
          )}

          {/* Focus on Video */}
          {screenSharingStream && layoutSettings.layout === "2" && (
              <Draggable
                  defaultClassName="cursor-grab hidden xl:block"
                  bounds="parent"
                  defaultClassNameDragging="cursor-grabbing"
              >
                <div className="absolute top-0 z-50 ">
                  <div
                      className={cn(
                          " m-auto flex h-40 items-center justify-center gap-2 ",
                      )}
                  >
                    <ScreenSharingComponent/>
                  </div>
                </div>
              </Draggable>
          )}

          {/* Focus on Presenter */}
          {screenSharingStream && layoutSettings.layout === "4" && (
              <Draggable
                  defaultClassName="cursor-grab hidden xl:block"
                  bounds="parent"
                  defaultClassNameDragging="cursor-grabbing"
              >
                <div className="absolute top-0 z-50 m-2 backdrop-blur-3xl">
                  <div
                      className={cn(
                          " m-auto flex h-40 items-center justify-center gap-2 ",
                      )}
                  >
                    {participantList
                        .filter(
                            (participant: IParticipant, index: number) =>
                                participant.presenter,
                        )
                        .map((participant: IParticipant, index: number) => (
                            <div className="h-40 w-40" key={index}>
                              <SingleCameraComponent
                                  index={index}
                                  key={index}
                                  participant={participant}
                                  userCamera={participantCameraList.filter((cItem: IParticipantCamera) => cItem?.intId == participant.intId)[0]}
                              />
                            </div>
                        ))}
                  </div>
                </div>
              </Draggable>
          )}

          {/* render screen sharing if screen sharing is open and whiteboard is closed */}
          {screenSharingStream &&
              !isWhiteboardOpen &&
              layoutSettings.layout !== "2" && <ScreenSharingComponent/>}

          {/* render whiteboard if whiteboard is open */}
          {isWhiteboardOpen && <WhiteboardComponent/>}

          {(!isWhiteboardOpen || !screenSharingStream) &&
              eCinemaModal.isActive && <ECinemaComponent/>}

          {/* {screenSharingStream && screenShareState && <ScreenSharingComponent />} */}
          {user?.sessiontoken != '' && <Websocket/>}
          <KurentoAudio/>
          <KurentoVideo/>
          {user?.meetingDetails?.meetingID != null && <SocketIOCaption/>}
          {participantCameraList.filter((eachItem: any) => eachItem?.intId != user?.meetingDetails?.internalUserID).map((cItem: IParticipantCamera, index: number) => {
            return <KurentoVideoViewer key={index} streamID={cItem?.streamID}/>
          })}

          {screenShareState && <KurentoScreenShare/>}
          {viewerscreenShareState && !screenShareState && <KurentoScreenShareViewer/>}

        </div>
      </Authenticated>
  );
}

export default PostSignIn;