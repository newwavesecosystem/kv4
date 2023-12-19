import React, { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { recordingModalState } from "~/recoil/atom";
import { useRecoilState } from "recoil";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import recordingResolutionsData from "~/data/recordingResolutionsData";
import { useToast } from "../ui/use-toast";
import {websocketRecord} from "~/server/Websocket";

function ResolutionModal() {
  const [recordingState, setRecordingState] =
    useRecoilState(recordingModalState);
  const { toast } = useToast();

  return (
    <Dialog
      open={recordingState.step === 1}
      onOpenChange={() => {
        setRecordingState({
          ...recordingState,
          step: 0,
        });
      }}
    >
      <DialogContent className="text-a11y rounded-xl border-0 bg-primary sm:max-w-[425px] md:rounded-xl">
        <span className=" text-xl font-bold">Resolution</span>
        <div className="grid gap-6 py-4">
          <Select
            value={recordingState.id.toString()}
            onValueChange={(value) => {
              setRecordingState((prev) => ({
                ...prev,
                ...recordingResolutionsData.find(
                  (item) => item.id.toString() === value,
                ),
              }));
            }}
          >
            <SelectTrigger className="bg-a11y/20">
              {recordingState.name || "Kindly pick a resolution"}
            </SelectTrigger>
            <SelectContent className="text-a11y bg-primary">
              {recordingResolutionsData.map((item, index) => (
                <SelectItem key={index} className="" value={item.id.toString()}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-4">
            <div className="flex w-full flex-col">
              <span>Width</span>
              <span className="bg-a11y/20 rounded-md p-2">
                {recordingState.width}
              </span>
            </div>
            <div className="flex w-full flex-col">
              <span>Height</span>
              <span className="bg-a11y/20 rounded-md p-2">
                {recordingState.height}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (recordingState.width === 0 || recordingState.height === 0) {
                return toast({
                  variant: "destructive",
                  title: "Uh oh! Something went wrong.",
                  description: "Kindly pick a resolution",
                });
              }
              setRecordingState((prev) => ({
                ...prev,
                isActive: true,
                step: 0,
              }));
              websocketRecord();
            }}
            className="bg-a11y/20 ml-auto rounded-md px-4 py-2"
          >
            Start
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ResolutionModal;
