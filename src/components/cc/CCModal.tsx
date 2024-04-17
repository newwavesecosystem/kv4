import React, { useEffect, useState } from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, ccModalState} from "~/recoil/atom";
import CloseIcon from "../icon/outline/CloseIcon";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import SearchIcon from "../icon/outline/SearchIcon";
import CCLanguageData from "~/data/ccLanguageData";
import { cn } from "~/lib/utils";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import * as ServerInfo from "~/server/ServerInfo";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import socket from '../../server/socket';
import {io, Socket} from 'socket.io-client';
import {captionURL} from "~/server/ServerInfo";

function CCModal() {
  const [ccModal, setCCModal] = useRecoilState(ccModalState);
  const [ccLanguages, setCCLanguages] = useState(CCLanguageData);
  const [ccLanguageSearch, setCCLanguageSearch] = useState("");
  const [isCCLanguageModalOpen, setIsCCLanguageModalOpen] = useState(false);
  const [transcriptTranslated, setTranscriptTranslated] = useState("");
  const user = useRecoilValue(authUserState);

  // Define the socket variable with the Socket type
  var socket : any = null;

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();


  const broadcastCaption=(text:any)=>{
    console.log("send_captions", text); // world
    socket?.emit("send_captions", {
      "text": text,
      "user": user?.meetingDetails?.fullname,
      "meetingID": user?.meetingDetails?.meetingID,
      "date": new Date().toLocaleString()
    });
  }


  useEffect(() => {
    // Define the socket variable with the Socket type
    var socket: Socket = io(captionURL);

    window.onbeforeunload = function(e) {
      socket.disconnect();
    };

    // client-side
    socket.on("connect", () => {
      console.log("cSocket Connected",socket.id); // x8WIv7-mJelg7on_ALbx

      if(user?.meetingDetails?.meetingID != null){
        console.log("cSocket join_room",user?.meetingDetails?.meetingID);
        socket.emit("join_room", user?.meetingDetails?.meetingID);
      }

    });

    socket.on("disconnect", ( ) => {
      console.log("cSocket disconnect",socket.id); // undefined
    });

    socket.on("receive_captions", (arg) => {
      console.log("cSocket receive_captions", arg); // world
      console.log("cSocket receive_captions", arg.user); // world

      let displayText=`${arg.user}: ${arg.text}`;

      console.log("cSocket receive_captions displayText", displayText); // world
      console.log("cSocket translation ",ccModal.language);

      if (ccModal.language != "en") {
        console.log("cSocket working on translation ",ccModal.language);
        translate(arg.text,arg.user).then();
      }else{
        setTranscriptTranslated(`${transcriptTranslated} \n ${displayText}`);
      }

    });

    // return () => {
    //   // Clean up socket connections when the component unmounts
    //   socket.disconnect();
    // };

  }, [ccModal.language]);

  // When a new transcript is received, add it to the lines array
  useEffect(() => {
    console.log("cSocket transcript useEffect ");
    SpeechRecognition.startListening({ continuous: true });

    if (transcript) {
      setTimeout(resetTranscript,30000)
      broadcastCaption(transcript);
      setTranscriptTranslated(`Me: ${transcript}`);
    }
  }, [transcript]);

  async function translate(text:string,user:string) {
    console.log("cSocket Translate API - ",ccModal.language);
    // let data = JSON.stringify({
    //   message: transcript,
    //   target: ccModal.language,
    // });

    let data = JSON.stringify({
      "q": text,
      "source": "auto",
      "target": ccModal.language,
      "format": "text"
    });

    const response = await axios({
      method: "post",
      maxBodyLength: Infinity,
      url: `${ServerInfo.translateURL}/translator`,
      headers: {
        apikey: "AJSAel5d4cSwAqopPs19LEIqZ42kX1TEnnUJRpb6",
        "Content-Type": "application/json",
      },
      data: data,
    });

    const responseData = response.data;

    console.log("response", responseData);

    // setTranscriptTranslated(responseData?.data);

    let displayText=`${user}: ${responseData?.message}`;

    console.log("cSocket receive_captions with translation displayText", displayText); // world

    setTranscriptTranslated(displayText);

    setTimeout(resetTranscript, 30000);
  }

  return (
    <>
      {ccModal.isActive && (
        <div className="fixed bottom-20 z-10 mx-auto flex w-full justify-center px-4">
          <div className="flex h-20 w-full items-center justify-between rounded-md bg-primary md:max-w-xl ">
            <span className="px-4">
            {/*<span className="truncate px-4">*/}
              {transcriptTranslated}
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

                    <div className="flex max-h-[50vh] w-full flex-col gap-2 overflow-y-auto py-4">
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
                              socket?.disconnect();
                              socket?.close();
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
      )}
    </>
  );
}

export default CCModal;
