import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useScreenSize from "~/lib/useScreenSize";
import { cn } from "~/lib/utils";
import {authUserState, currentTabState, participantListState, settingsModalMetaState} from "~/recoil/atom";
import { SettingsSheetClose } from "../ui/settingsSheet";
import CloseIcon from "../icon/outline/CloseIcon";
import ArrowChevronLeftIcon from "../icon/outline/ArrowChevronLeftIcon";
import {IParticipant} from "~/types";
import {websocketAllowAllWaitingUser} from "~/server/Websocket";
import TickIcon from "~/components/icon/outline/TickIcon";
import ArrowChevronDownIcon from "~/components/icon/outline/ArrowChevronDownIcon";

function TakeSpotAttendanceSettings() {
  const currentTab = useRecoilValue(currentTabState);
  const [settingsMeta, setSettingsMeta] = useRecoilState(
    settingsModalMetaState,
  );
  const participantList= useRecoilValue(participantListState);
  const user = useRecoilValue(authUserState);

  const screenSize = useScreenSize();


  const getDateTime = () => {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    return date + ' ' + time;
  }



  const takeAttendanceTxt = () => {
    let docTitle = `Attendance for the meeting, ${user?.meetingDetails?.confname} @ ${getDateTime()}`
    let allNames = ''

    participantList.map((user:IParticipant, index:number) => {
      if (allNames == '') {
        allNames = user.name
      } else {
        allNames = `${allNames}, ${user.name}`
      }
      return console.log(user.name)

    })
    let total = allNames.split(',').length
    console.log(total)


    console.log(allNames)
    const mimeType = 'text/plain';
    const content = `${docTitle}\r\n\r\n ${allNames.replaceAll(',', '\n')}\n\n\n Auto-Generated from ${process.env.NEXT_PUBLIC_PLATFORM_NAME}\n\n\n Total Number of Attendees: ${total}`
    const link = document.createElement('a');
    link.setAttribute('download', `attendance_${user?.meetingDetails?.confname}_${Date.now()}.txt`);
    link.setAttribute(
        'href',
        `data: ${mimeType};charset=utf-16,${encodeURIComponent(content)}`)
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  const takeAttendanceCsv = () => {
    let docTitle = `Attendance for the meeting, ${user?.meetingDetails?.confname} @ ${getDateTime()}`;

    // CSV header with S/N and Name columns
    let csvContent = `S/N,Name\n`;

    participantList.map((user: IParticipant, index: number) => {
      // Adding S/N and each name to the new row
      csvContent += `${index + 1},${user.name}\n`;
    });

    let total = participantList.length;

    // Adding footer information for total attendees and auto-generated note
    csvContent += `\nAuto-Generated from ${process.env.NEXT_PUBLIC_PLATFORM_NAME}\nTotal Number of Attendees: ${total}`;

    const mimeType = 'text/csv';
    const link = document.createElement('a');
    link.setAttribute('download', `attendance_${user?.meetingDetails?.confname}_${Date.now()}.csv`);
    link.setAttribute(
        'href',
        `data: ${mimeType};charset=utf-8,${encodeURIComponent(csvContent)}`
    );
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }



  return (
    <div
      className={cn(
        "hidden w-full rounded-t-2xl bg-primary px-5 lg:block lg:rounded-t-none ",
        currentTab.clickSourceId <= 3 && settingsMeta.isFoward && "block",
      )}
    >
      <div className="border-a11y/20 flex items-center justify-between border-b-2 py-6 ">
        <button
          className="bg-a11y/20 mr-auto rounded-full p-2 lg:hidden"
          onClick={() => {
            if (screenSize.id <= 3) {
              setSettingsMeta({
                isFoward: false,
                sourceId: screenSize.id,
              });
            }
          }}
        >
          <ArrowChevronLeftIcon className="h-5 w-5" />
        </button>
        <span className="mr-auto text-lg font-semibold lg:text-xl ">
          {currentTab.name}
        </span>
        <SettingsSheetClose className="">
          <CloseIcon className="h-6 w-6 " />
          <span className="sr-only">Close</span>
        </SettingsSheetClose>
      </div>
      <div className="py-6">

        <div className="flex items-center gap-2 mb-4">
          <span> Total Number of Spot Attendees: {participantList.length}</span>
        </div>

        <button className="bg-a11y/40 flex items-center rounded-lg p-2"  onClick={()=>{
          takeAttendanceTxt()
        }}>
          <ArrowChevronDownIcon className="h-6 w-6" />
          <span className="ml-2">Download (TXT)</span>
        </button>

        <button className="bg-a11y/40 flex items-center rounded-lg p-2 mt-5"  onClick={()=>{
          takeAttendanceCsv()
        }}>
          <ArrowChevronDownIcon className="h-6 w-6" />
          <span className="ml-2">Download (CSV)</span>
        </button>
      </div>
    </div>
  );
}

export default TakeSpotAttendanceSettings;
