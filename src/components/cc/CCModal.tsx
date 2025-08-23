import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {authUserState, ccModalState, micOpenState, participantTalkingListState} from "~/recoil/atom";
import CloseIcon from "../icon/outline/CloseIcon";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import SearchIcon from "../icon/outline/SearchIcon";
import CCLanguageData from "~/data/ccLanguageData";
import { cn } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { broadcastCaption, transcribeAudio } from "~/server/SocketIOCaption";
import { ScrollArea } from "../ui/scroll-area";

import * as process from "process";

function CCModal() {
  const [ccModal, setCCModal] = useRecoilState(ccModalState);
  const [ccLanguages, setCCLanguages] = useState(CCLanguageData);
  const [ccLanguageSearch, setCCLanguageSearch] = useState("");
  const [isCCLanguageModalOpen, setIsCCLanguageModalOpen] = useState(false);
  const [transcriptTranslated, setTranscriptTranslated] = useState("");
  const user = useRecoilValue(authUserState);
  const [micState, setMicState] = useRecoilState(micOpenState);

  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const CCRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    CCRef.current?.scrollIntoView(false)
  }

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  useEffect(() => {
    scrollToBottom() //auto scroll down while streaming cc
  }, [transcriptTranslated, ccModal.caption,transcription])


  const handleBeforeUnload = (event:any) => {
    stopRecording();
  };

  const handleAudioData = async (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result;
      transcribeAudio(base64Audio,user?.meetingDetails);
    };
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Stopping recorder");
      mediaRecorderRef.current.stop();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Pausing recorder");
      mediaRecorderRef.current.pause();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      console.log("Resuming recorder");
      mediaRecorderRef.current.stop();
      startRecording();
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      console.log("Starting recorder");
      audioChunksRef.current = []; // Clear previous chunks
      mediaRecorderRef.current.start();
      // Stop recording after 5 seconds
      setTimeout(stopRecording, 5000);
    }
  };

  // Effect to initialize and clean up MediaRecorder
  useEffect(() => {

    let stream: MediaStream | null = null;

    const setupMediaRecorder = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          console.log("recorder.ondataavailable");
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          console.log("recorder.onstop");
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          console.log("recorder.size",audioBlob.size);
          if (audioBlob.size > 0) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const reader = new FileReader();

            reader.onload = async (event:any) => {
              try {
                const arrayBuffer = event.target.result as ArrayBuffer;
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                // Simple VAD: check if the audio is loud enough
                const pcmData = audioBuffer.getChannelData(0);
                const sum = pcmData.reduce((acc, val) => acc + Math.abs(val), 0);
                const avg = sum / pcmData.length;

                // Adjust this threshold based on testing
                const threshold = 0.019;
                console.log("recorder VAD average:", avg);

                if (avg > threshold) {
                  console.log("recorder Speech detected, sending for transcription.");
                  handleAudioData(audioBlob);
                } else {
                  console.log("recorder Silence detected, not sending.");
                }
              } catch (e) {
                console.error("recorder Error processing audio for VAD:", e);
              }
            };

            reader.readAsArrayBuffer(audioBlob);
          }
        };

      } catch (err) {
        console.error("recorder Error setting up media recorder:", err);
      }
    };

    setupMediaRecorder();

    return () => {
      console.log("recorder Cleaning up media recorder");
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      stopRecording();
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Effect to control the recording loop
  useEffect(() => {
    console.log("recorder micState:",!micState)
    // if (ccModal.isActive && !micState) {
    if (!micState) {
      // Start or resume the recording loop
      console.log("Starting or resuming recording loop");
      if (mediaRecorderRef.current?.state === 'paused') {
        resumeRecording();
      } else {
        startRecording(); // Start immediately if not already started
      }
      if (!recordingIntervalRef.current) {
        recordingIntervalRef.current = setInterval(startRecording, 5500); // Loop every 5.5 seconds
      }
    } else {
      // Pause recording when mic is off
      console.log("Pausing recording loop");
      pauseRecording();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [ccModal.isActive, micState]);



  return (
    <>
      {ccModal.isActive && (
        <div>
          <div className="fixed bottom-20 z-10 mx-auto flex w-full justify-center px-4">
            <div className="flex h-40 w-full items-center justify-between rounded-md bg-primary md:max-w-xl ">
              <ScrollArea className="h-full px-4">
                <div ref={CCRef}>
                  {ccModal.caption.split("break--line").map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              </ScrollArea>

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
                                console.log("cSocket language", language.shortCode)
                                // socket?.disconnect();
                                // socket?.close();
                                setCCModal((prev) => ({
                                  ...prev,
                                  language: language.shortCode,
                                }));
                                console.log("cSocket ccModal ", ccModal.language)
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
