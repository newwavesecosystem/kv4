import React, { useState } from "react";
import CloseIcon from "../icon/outline/CloseIcon";
import { AlertDialog, AlertDialogContent } from "../ui/alert-dialog";
import AlertTriangleIcon from "../icon/outline/AlertTriangleIcon";
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, eCinemaModalState, participantListState} from "~/recoil/atom";
import SpinnerIcon from "../icon/outline/SpinnerIcon";
import ReactPlayer from "react-player";
import {websocketStopExternalVideo} from "~/server/Websocket";
import {IParticipant} from "~/types";
import ExpandIcon from "~/components/icon/outline/ExpandIcon";
import {CurrentUserIsPresenter} from "~/lib/checkFunctions";

function ECinemaComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);
  const [isLoading, setIsLoading] = useState(false);

    const user = useRecoilValue(authUserState);
    const participantList = useRecoilValue(participantListState);

  return (
      <div className=" m-auto h-[calc(100vh-128px)] overflow-hidden rounded-lg p-4">
          {isLoading && (
              <div className="flex h-full w-full items-center justify-center">
                  <SpinnerIcon className="h-20 w-20 animate-spin"/>
              </div>
          )}
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
              <AlertDialogContent
                  className="rounded-xl border-0 bg-primary py-3 text-a11y sm:max-w-[425px] md:rounded-xl">
                  <div className="grid gap-3 py-4">
                      <div className="flex gap-2 text-2xl">
                          <AlertTriangleIcon className="h-8 w-8"/>
                          <span>End eCinema</span>
                      </div>
                      <p>
                          The session will end for everyone. You can't undo this action.
                      </p>
                      <div className="mt-7 flex w-full gap-6">
                          <button
                              className="w-full rounded-md border border-a11y/20 py-3"
                              onClick={() => {
                                  setIsOpen(false);
                              }}
                          >
                              Don't End
                          </button>
                          <button
                              className="w-full rounded-md bg-a11y/20 py-3"
                              onClick={() => {
                                  setIsOpen(false);
                                  setECinemaModal({
                                      ...eCinemaModal,
                                      isActive: false,
                                      source: "",
                                      step: 0,
                                  });
                                  websocketStopExternalVideo();
                              }}
                          >
                              End eCinema
                          </button>
                      </div>
                  </div>
              </AlertDialogContent>
          </AlertDialog>

          <ReactPlayer id="ecinema" url={eCinemaModal.source}
                       width="100%"
                       height="100%"
                       style={{marginTop: '3em'}}
                       playing={true}
                       controls={true}
                       pip={true}
          />

          {/*<video*/}
          {/*  autoPlay*/}
          {/*  playsInline*/}
          {/*  hidden={isLoading}*/}
          {/*  muted*/}
          {/*  className="h-full w-full flex-1 rounded-lg object-cover"*/}
          {/*  controls*/}
          {/*  controlsList="nodownload"*/}
          {/*  onCanPlay={() => {*/}
          {/*    setIsLoading(false);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <source src={eCinemaModal.source} />*/}
          {/*  Your browser does not support the video tag.*/}
          {/*</video>*/}
          <button
              onClick={() => {
                  document.getElementById("ecinema")?.requestFullscreen();
              }}
              className="absolute left-7 top-7 flex items-center gap-2 rounded-md border-2 border-a11y/20 bg-primary/20 px-3 py-2 text-sm backdrop-blur-3xl"
          >
              <ExpandIcon className="h-5 w-5"/>
              <span>Go Fullscreen</span>
          </button>
          {CurrentUserIsPresenter() &&
              (<button
                  onClick={() => {
                      setIsOpen(true);
                  }}
                  className="absolute right-7 top-7 flex items-center gap-2 rounded-md border-2 border-a11y/20 bg-primary/20 px-3 py-2 text-sm backdrop-blur-3xl"
              >
                  <CloseIcon className="h-5 w-5"/>
                  <span>Stop Broadcast</span>
              </button>)}

      </div>
  );
}

export default ECinemaComponent;
