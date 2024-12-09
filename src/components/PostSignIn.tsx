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
  LayoutSettingsState, presentationSlideState, manageUserSettingsState, cameraStreamState,
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
import Websocket, {websocketLeaveMeeting} from "~/server/Websocket";
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
import SocketIOCaption from "~/server/SocketIOCaption";
import PinIcon from "~/components/icon/outline/PinIcon";
import MinimizeIcon from "~/components/icon/outline/MinimizeIcon";
import {
  CurrentUserRoleIsModerator,
  FindAvatarfromUserId,
  FindUserNamefromUserId,
  ModeratorRole
} from "~/lib/checkFunctions";
import PresentationSlide from "./presentationSlide/PresentationSlide";
import {GetCurrentSessionEjected, GetCurrentSessionToken, SetCurrentSessionToken} from "~/lib/localStorageFunctions";
import {getMyCookies} from "~/lib/cookiesFunctions";
import KurentoVideoSingleStick from "~/server/KurentoVideoSingleStick";
import ParticipantsCameraComponent from "~/components/camera/ParticipantsCameraComponent";
import ArrowChevronUpIcon from "./icon/outline/ArrowChevronUpIcon";

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
  const [manageUserSettings, setManageUserSettings] = useRecoilState(manageUserSettingsState);

  const participantsPerPage:number = layoutSettings.maxTiles[0] ?? 4;

  const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);

  const [participantCameraList, setParticipantCameraList] = useRecoilState(
      participantCameraListState,
  );



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

            if(cameraStream){
              // if the user enable camera from prejoin, connect to camera
              let newRecord:IParticipantCamera={
                intId:user?.meetingDetails?.internalUserID,
                streamID:`${user?.meetingDetails?.internalUserID}${user?.meetingDetails?.authToken}default`,
                id:"default",
                deviceID: "default",
                stream:cameraStream
              }
              setParticipantCameraList([...participantCameraList,newRecord])
            }
            getTurnServers(token);

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

  const tokenExtraction = async (token:string) =>{

    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    console.log("urlParams");
    console.log(urlParams);
    // extract the value from the query params
    const urltoken = urlParams.get("sessionToken");

    if (token) {
      // do something with the extract query param
      console.log("token");
      console.log(token);

      validateToken(token);

      // update the URL, without re-triggering data fetching
      // router.push(newPathObject, undefined, { shallow: true });

      // delete router.query.paramName;
      // router.push(router);

      // setTimeout(()=>{ history.replaceState(null, "", location.pathname) }, 0)

    }else if(urltoken){
      // create an updated router path object
      const newPathObject = {
        pathname: router.pathname,
        query: ""
      }

      validateToken(urltoken);

      router.push(newPathObject, undefined, { shallow: true });
    }else if(await GetCurrentSessionToken() != ""){
      validateToken(await GetCurrentSessionToken());
    }else{
      setPostLeaveMeeting({
        ...postLeaveMeeting,
        isSessionExpired: true,
      });
    }

  }

  const handleBeforeUnload = (event:any) => {
    event.preventDefault();
    event.returnValue = ''; // Or any custom message
  };



  useEffect(() => {
    console.log(`utk ${user?.sessiontoken}`);
    tokenExtraction(user?.sessiontoken!);
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    //
    // };
  });

  useEffect(() => {
    if(!postLeaveMeeting.isLeave || !postLeaveMeeting.isLeaveRoomCall || !postLeaveMeeting.isEndCall || !postLeaveMeeting.isOthers || !postLeaveMeeting.isSessionExpired || !postLeaveMeeting.isKicked) {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      removeWakeLock();
    }
  }, [postLeaveMeeting]);

  const [pollModal, setPollModal] = useRecoilState(pollModalState);
  const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);

  // start pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; //don't change

  // Pagination logic
  const totalPages = Math.ceil((participantList.length - pinnedParticipant.length) / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedParticipants = [...pinnedParticipant, ...participantList.filter((p: IParticipant) => !pinnedParticipant.includes(p))].slice(startIndex, endIndex);

  // Pinning logic
  const handlePin = (participant: IParticipant) => {
    setPinnedParticipant([participant, ...pinnedParticipant]);
  };

  const handleUnpin = (participant: IParticipant) => {
    setPinnedParticipant(pinnedParticipant.filter((p) => p.intId !== participant.intId));
  };
  // end pagination logic

  return (
      <Authenticated>
        {!connectionStatus?.websocket_connection ?
            <span className="flex absolute top-16w-full items-center justify-between px-4"
                  style={{
                    color: 'white',
                    backgroundColor: 'red',
                    textAlign: 'center'
                  }}>{connectionStatus.websocket_connection_reconnect ? "Network issues detected. Trying to reconnect automatically" : "Connecting..."}{connectionStatus.websocket_connection_reconnect && <button className="bg-a11y/20" style={{backgroundColor:"#227451", padding: 10, borderRadius:15, margin:5, borderColor:"white", borderStyle: "solid", borderWidth: 2}} onClick={async () => {
                // window.location.reload();
                setUser({
                  connectionAuthTime: 0, connectionID: "",
                  meetingId: "",
                  passCode: "",
                  email: "",
                  fullName: "",
                  id: 0,
                  meetingDetails: null,
                  sessiontoken: ""
                });
                validateToken(await GetCurrentSessionToken());
                toast({
                  title: "Reconnecting",
                  description: "Reconnecting... Please wait for few moment",
                });
              }}>Reconnect Now</button>}<br /></span> : ''}
        {connectionStatus?.websocket_connection && !connectionStatus?.audio_connection ?
            <span className="flex absolute top-16w-full items-center justify-between px-4"
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

          <div className="mb-5" />

          {/*@Solomon help me implement component for presentation*/}
          {/*{presentationSlide.show &&*/}
          {/*<PresentationSlide*/}
          {/*    slides={presentationSlide.presentations.filter((item) => item.id == presentationSlide.currentPresentationID)[0]}*/}
          {/*/>*/}
          {/*}*/}


          {/* render camera feed if not whiteboard or screensharing */}
          {/*and hideUserList is not true; render all cams*/}
        {/*and pagination has been added*/}
        {!isWhiteboardOpen &&
              (!screenSharingStream ||
                  (screenSharingStream && layoutSettings.layout === "2")) &&
              !eCinemaModal.isActive && (CurrentUserRoleIsModerator(participantList, user) || !manageUserSettings.hideUserList) && (
                  <div>
                      <ParticipantsCameraComponent participantList={participantList} pinnedParticipant={pinnedParticipant} paginateParticipants={participantList.slice(
                          (currentPage - 1) * participantsPerPage,
                          currentPage * participantsPerPage
                          )} />

                          {/* Pagination controls */}
                          <div className="pagination-controls flex justify-center gap-4 mt-2">
                          {/* Previous Button */}
                          {currentPage > 1 && (
                          <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className="bg-a11y/20 w-10 h-10 rounded-md"
                      >
                  &lt;
                    </button>
                        )}

                            {/* Pagination Dots */}
                              <div className="flex items-center gap-2">

                              {/* Current Page Dot */}
                                {Array.from({length: totalPages}, (_, index) => <button key={index} onClick={() => setCurrentPage(index+1)} className={`${(currentPage - 1) == index ? 'bg-green-900': 'bg-white outline-green-900 border-8'} w-3 h-3 rounded-full`}/>)}

                            </div>

                        {/* Next Button */}
                            {currentPage < totalPages && (
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className="bg-a11y/20 w-10 h-10 rounded-md"
                                    >
                                    &gt;
                                </button>
                            )}
                        </div>
                  </div>
              )}

        {/* render camera feed if not whiteboard or screensharing */}
        {/*and hideUserList is true; render all moderator cams*/}
        {!isWhiteboardOpen &&
          (!screenSharingStream ||
            (screenSharingStream && layoutSettings.layout === "2")) &&
          !eCinemaModal.isActive && !CurrentUserRoleIsModerator(participantList, user) && manageUserSettings.hideUserList && (
            <div
              className={cn(
                " m-auto h-[calc(100vh-158px)] items-center justify-center p-4",
                (isWhiteboardOpen || screenSharingStream) &&
                participantTalkingList.filter(
                  (eachItem: any) => !eachItem.muted,
                )?.length > 0 &&
                "mt-6 h-[calc(100vh-150px)]",
                participantList.filter((eachItem: IParticipant) => eachItem.role == ModeratorRole()).length === 1 &&
                " grid justify-center gap-2 md:grid-cols-2 mt-5  ",
                participantList.filter((eachItem: IParticipant) => eachItem.role == ModeratorRole()).length === 2 &&
                "grid justify-center gap-2 md:grid-cols-2 mt-5",
                participantList.filter((eachItem: IParticipant) => eachItem.role == ModeratorRole()).length === 3 &&
                "grid grid-cols-2 gap-2 lg:grid-cols-3 ",
                participantList.filter((eachItem: IParticipant) => eachItem.role == ModeratorRole()).length >= 4 && "grid grid-cols-2 gap-2",
                participantList.filter((eachItem: IParticipant) => eachItem.role == ModeratorRole()).length >= 5 && "grid gap-2 md:grid-cols-3",
                participantList.filter((eachItem: IParticipant) => eachItem.role == ModeratorRole()).length >= 7 && "grid gap-2 md:grid-cols-4",
                participantList.filter((eachItem: IParticipant) => eachItem.role == ModeratorRole()).length >= 13 && "grid gap-2 md:grid-cols-5",
                participantList.filter((eachItem: IParticipant) => eachItem.role == ModeratorRole()).length >= 3 && pinnedParticipant.length > 0 && "md:!grid-cols-4",
              )} style={{ paddingTop: "1.5rem" }}
            >
              {participantList
                  .filter((eachItem: IParticipant) => eachItem.role == ModeratorRole())
                // pick only 5 participant
                // .filter(
                //   (participant: IParticipant, index: number) => {
                //     if (pinnedParticipant.length > 0) {
                //       return index < 5
                //     } else {
                //       return participant
                //     }
                //   },
                // )
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

              {/* pagination button */}
              <div className="fixed bottom-16 right-0 md:top-16">
                <div className="flex items-center gap-2 flex-row md:flex-col">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ArrowChevronUpIcon className="-rotate-90 md:rotate-0" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <span key={i} className={cn("w-4 h-4 rounded-full flex", currentPage === i + 1 ? "bg-primary" : "bg-secondary")}></span>
                  )

                  )}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <ArrowChevronDownIcon className="-rotate-90 md:rotate-0"/>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Smart Layout */}
          {screenSharingStream && layoutSettings.layout === "1" && (
              <Draggable
                  defaultClassName="cursor-grab hidden xl:block"
                  bounds="parent"
                  defaultClassNameDragging="cursor-grabbing"
              >
                <div className="absolute top-0 z-50 m-2 backdrop-blur-3xlright-0">
                  <div className="flex flex-row px-2 py-2 justify-between">
              Participant List ({participantList.length})
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
      {/* Adjusted scrollable grid container */}
            <div className="h-[30rem] overflow-y-auto"> {/* Ensure proper height */}
                     <div className="grid grid-cols-2 gap-4 m-3"
                  >
                    {participantList
                        .map
                            ((participant: IParticipant, index: number) => (
                        <div className="w-36 h-36" key={index}>
                            <SingleCameraComponent
                                index={index}

                                participant={participant}
                                userCamera={participantCameraList.find(
                                (cItem: IParticipantCamera) => cItem?.intId == participant.intId)
                          }
                      />
                    </div>
                            ))}
                        </div>
                  </div>
                </div>
              </Draggable>)}


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
          {participantCameraList.length > 0 && <KurentoVideoSingleStick/>}
          {/*{participantCameraList.filter((eachItem: any) => eachItem?.intId != user?.meetingDetails?.internalUserID).map((cItem: IParticipantCamera, index: number) => {*/}
          {/*    return <KurentoVideoViewer key={index} streamID={cItem?.streamID}/>*/}
        {/*})}*/}

        {screenShareState && <KurentoScreenShare />}
        {viewerscreenShareState && !screenShareState && <KurentoScreenShareViewer />}

        </div>
      </Authenticated>
  );
}

export default PostSignIn;