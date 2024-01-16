import React, {useEffect, useState} from "react";
import { useRecoilState } from "recoil";
import { ccModalState } from "~/recoil/atom";
import CloseIcon from "../icon/outline/CloseIcon";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import SearchIcon from "../icon/outline/SearchIcon";
import CCLanguageData from "~/data/ccLanguageData";
import { cn } from "~/lib/utils";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from "axios";
import * as ServerInfo from "~/server/ServerInfo";
// import io from 'socket.io-client';
import socket from '../../server/socket';

function CCModal() {
  const [ccModal, setCCModal] = useRecoilState(ccModalState);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();


  const [transcriptTranslated, setTranscriptTranslated] = useState("");

  const broadcastCaption=(text:any)=>{
    console.log("send_captions", text); // world
    socket.emit("send_captions", {
      "text": text,
      "user": "samdo",
      "meetingID": "535353",
      "date": "2024-01-13"
    });
  }


  useEffect(() => {
    // client-side
    socket.on("connect", () => {
      console.log("Socket Connected"); // x8WIv7-mJelg7on_ALbx
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx

      socket.emit("join_room", "535353");
    });

    socket.on("disconnect", () => {
      console.log(socket.id); // undefined
    });

    socket.on("receive_captions", (arg) => {
      console.log("receive_captions", arg); // world
      console.log("receive_captions", arg.user); // world

      let displayText=`${arg.user}: ${arg.text}`;

      console.log("receive_captions displayText", displayText); // world
      setTranscriptTranslated(`${transcriptTranslated} <br /> ${displayText}`);
    });

    // return () => {
    //   // Clean up socket connections when the component unmounts
    //   socket.disconnect();
    // };

  }, []);


  // When a new transcript is received, add it to the lines array
  useEffect(() => {
    SpeechRecognition.startListening({ continuous: true });

    if (transcript) {
      broadcastCaption(transcript);
      if(ccModal.language != "en" ) {
        console.log("working on translation")
        translate().then();
      }else {
        setTranscriptTranslated(transcript);
      }
    }
  }, [transcript]);


  async function translate() {
    console.log("Translate API")
    let data = JSON.stringify({
      "message": transcript,
      "target": ccModal.language
    });

    const response = await axios({
      method: 'post',
      maxBodyLength: Infinity,
      url: `${ServerInfo.extRegisterURL}/translator/w_wuwuuww`,
      headers: {
        'apikey': 'AJSAel5d4cSwAqopPs19LEIqZ42kX1TEnnUJRpb6',
        'Content-Type': 'application/json'
      },
      data: data
    });

    const responseData = response.data;

    console.log("response", responseData);

    setTranscriptTranslated(responseData?.data)

    setTimeout(resetTranscript,30000)
  }


  return (
    <>
      {ccModal.isActive && (
        <div className="fixed bottom-20 z-10 mx-auto flex w-full justify-center px-4">
          <div className="flex h-20 w-full items-center rounded-md bg-primary md:max-w-xl ">
            <span className="truncate px-4">
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
              <button
                onClick={() => {
                  setCCModal((prev) => ({
                    ...prev,
                    step: 2,
                  }));
                }}
                className="h-full px-2"
              >
                <EllipsisIcon className="h-5 w-5 rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}
      {ccModal.step === 2 && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-10 bg-a11y/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"></div>

          {/* main modal */}
          <div className="fixed bottom-20 z-20 mx-auto flex w-full justify-center px-4">
            <div className="flex min-h-[320px] w-full flex-col items-center rounded-md border border-a11y/50 bg-primary shadow-xl md:max-w-sm ">
              <div className="w-full  border-b border-a11y/20 bg-a11y/10">
                <div className="flex w-full items-center gap-5 px-4 py-4 ">
                  <button
                    className="rounded-full bg-a11y/20 p-2 "
                    onClick={() => {
                      setCCModal((prev) => ({
                        ...prev,
                        step: 1,
                      }));
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
                      name=""
                      id=""
                      className="w-full rounded-md border-transparent bg-transparent pl-3 placeholder:text-a11y/60 focus:shadow-none focus:outline-none"
                      placeholder="Search"
                    />
                  </div>
                </div>
              </div>

              <div className="flex max-h-[50vh] w-full flex-col gap-2 overflow-y-auto py-4">
                {CCLanguageData.map((language, index) => (
                  <button
                    onClick={() => {
                      setCCModal((prev) => ({
                        ...prev,
                        language: language.shortCode,
                      }));
                    }}
                    key={index}
                    className={cn(
                      "w-full px-4 py-2 text-left",
                      language.name === ccModal.language
                        ? "bg-a11y/20"
                        : "hover:bg-a11y/20",
                    )}
                  >
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default CCModal;
