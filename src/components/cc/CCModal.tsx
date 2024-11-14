import React, { useEffect, useState } from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, ccModalState, micOpenState} from "~/recoil/atom";
import CloseIcon from "../icon/outline/CloseIcon";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import SearchIcon from "../icon/outline/SearchIcon";
import CCLanguageData from "~/data/ccLanguageData";
import { cn } from "~/lib/utils";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {broadcastCaption} from "~/server/SocketIOCaption";

function CCModal() {
  const [ccModal, setCCModal] = useRecoilState(ccModalState);
  const [ccLanguages, setCCLanguages] = useState(CCLanguageData);
  const [ccLanguageSearch, setCCLanguageSearch] = useState("");
  const [isCCLanguageModalOpen, setIsCCLanguageModalOpen] = useState(false);
  const [transcriptTranslated, setTranscriptTranslated] = useState("");
  const user = useRecoilValue(authUserState);
  const [micState, setMicState] = useRecoilState(micOpenState);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();


  // When a new transcript is received, add it to the lines array
  useEffect(() => {
    console.log("cSocket transcript useEffect ");
    SpeechRecognition.startListening({ continuous: true });

    if (transcript && !micState) {
      setTimeout(resetTranscript,30000)
      broadcastCaption(transcript, user?.meetingDetails);
      setTranscriptTranslated(`Me: ${transcript}`);
    }

  }, [transcript]);

  return (
    <>
      {ccModal.isActive && (
          <div>
            <div>
              {!browserSupportsSpeechRecognition ? <span className="flex w-full items-center justify-between rounded-md px-4" style={{ color: 'white', backgroundColor: 'red', textAlign: 'center' }}>Your browser doesn't support speech recognition, others wont see what you are saying. Kindly make use of latest Chrome Browser to enjoy this feature. <br/></span> : ''}
            </div>
            <div className="fixed bottom-20 z-10 mx-auto flex w-full justify-center px-4">
              <div className="flex h-20 w-full items-center justify-between rounded-md bg-primary md:max-w-xl ">
            <span className="px-4">
            {/*<span className="truncate px-4">*/}
              {transcriptTranslated}
              <br />
              {ccModal.caption}
            </span>
                <div className="flex h-full flex-col items-center divide-y divide-a11y border-l-2 border-a11y/70">
                  <button
                      onClick={() => {
                        setCCModal((prev) => ({
                          ...prev,
                          step: 0,
                          isActive: false,
                        }));
                      }}
                      className="h-full px-2"
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                  <Popover
                      open={isCCLanguageModalOpen}
                      onOpenChange={(isOpen) => setIsCCLanguageModalOpen(isOpen)}
                  >
                    <PopoverTrigger className="h-full px-2">
                      <EllipsisIcon className="h-5 w-5 rotate-90" />
                    </PopoverTrigger>
                    <PopoverContent
                        className=" mr-5 w-72 border-none bg-transparent p-0 text-a11y md:w-full"
                        side="bottom"
                    >
                      <div className="flex min-h-[320px] w-full flex-col items-center rounded-md border border-a11y/50 bg-primary shadow-xl md:max-w-sm ">
                        <div className="w-full  border-b border-a11y/20 bg-a11y/10">
                          <div className="flex w-full items-center gap-5 px-4 py-4 ">
                            <button
                                className="rounded-full bg-a11y/20 p-2 "
                                onClick={() => {
                                  setIsCCLanguageModalOpen(false);
                                }}
                            >
                              <ArrowChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <span className=" ">Caption Language</span>
                          </div>
                          <div className="w-full px-2 py-4">
                            <div className=" flex w-full items-center rounded-lg border border-a11y/20  px-3 py-2">
                              <SearchIcon className="h-6 w-6" />
                              <input
                                  type="search"
                                  onChange={(e) =>
                                      setCCLanguageSearch(e.target.value)
                                  }
                                  className="w-full rounded-md border-transparent bg-transparent pl-3 placeholder:text-a11y/60 focus:shadow-none focus:outline-none"
                                  placeholder="Search"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex max-h-[50svh] w-full flex-col gap-2 overflow-y-auto py-4">
                          {ccLanguages
                              .filter((language) =>
                                  language.name
                                      .toLowerCase()
                                      .includes(ccLanguageSearch.toLowerCase()),
                              )
                              .map((language, index) => (
                                  <button
                                      onClick={() => {
                                        console.log("cSocket language",language.shortCode)
                                        // socket?.disconnect();
                                        // socket?.close();
                                        setCCModal((prev) => ({
                                          ...prev,
                                          language: language.shortCode,
                                        }));
                                        console.log("cSocket ccModal ",ccModal.language)
                                        setIsCCLanguageModalOpen(false);
                                      }}
                                      key={index}
                                      className={cn(
                                          "w-full px-4 py-2 text-left",
                                          language.shortCode.toLowerCase() ===
                                          ccModal.language.toLowerCase()
                                              ? "bg-a11y/20"
                                              : "hover:bg-a11y/20",
                                      )}
                                  >
                                    <span>{language.name}</span>
                                  </button>
                              ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

      )}
    </>
  );
}

export default CCModal;
