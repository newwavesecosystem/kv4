import React, {useEffect, useState} from "react";
import { Dialog, DialogClose, DialogContent } from "../ui/dialog";
import {authUserState, breakOutModalState, participantListState} from "~/recoil/atom";
import {useRecoilState, useRecoilValue} from "recoil";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import RoomBoard from "./RoomBoard";
import InformationIcon from "../icon/outline/InformationIcon";
import dayjs from "dayjs";
import {websocketCreateBreakoutRoom} from "~/server/Websocket";
import {IParticipant, IUserBreakOutRoom} from "~/types";

function BreakOutModalCreate() {
  const [breakOutRoomState, setBreakOutRoomState] = useRecoilState(breakOutModalState);

  const [participantList, setParticipantList] = useRecoilState(participantListState);
  const [user, setUser] = useRecoilState(authUserState);

  const maxRooms = 16;
  const minRooms = 2;
  const rooms = Array.from(
    { length: maxRooms - minRooms + 1 },
    (_, i) => i + minRooms,
  );

  const [selectedRoom, setSelectedRoom] = useState("2");

  useEffect(()=>{
    console.log("IUserBreakOutRoom");
    const defaultUsers: IUserBreakOutRoom[] = [
    ...participantList.map((user:IParticipant, index:number) => ({
        id: "1",
        columnId: "users",
        name: user.name,
        userId: user.userId,
      }))
    ];

    console.log("IUserBreakOutRoom 2",defaultUsers);

    setBreakOutRoomState((prev) => ({
      ...prev,
      users: defaultUsers,
      rooms:[
        {
          id: "users",
          title: "Not Assigned",
          users: [],
          breakoutId: "",
        },
        {
          users: [],
          id: "room1",
          title: "Room 1",
          breakoutId: "",
        },
        {
          users: [],
          id: "room2",
          title: "Room 2",
          breakoutId: "",
        },
      ]
    }));

  },[""]);

  return (
    <Dialog
      open={breakOutRoomState.step === 1}
      onOpenChange={() => {
        setBreakOutRoomState((prev) => ({
          ...prev,
          step: 0,
        }));
      }}
    >
      <DialogContent
        hideCloseButton={true}
        className="h-[80vh] overflow-y-auto rounded-xl border-0 bg-primary text-a11y sm:max-w-[600px] md:rounded-xl xl:max-w-[800px]"
      >
        <div className="flex flex-col gap-4 divide-y divide-a11y/20 py-3">
          <div className="items-centerS flex justify-between">
            <span className="font-bold">BreakOut Room</span>
            <div className="flex items-center gap-2 text-sm">
              <DialogClose className="rounded-md border px-4 py-1 md:px-6">
                Cancel
              </DialogClose>
              <button
                disabled={
                  //  ensure that there is at least one user in all rooms
                  // breakOutRoomState.rooms
                  //   .filter((room) => room.id !== "users")
                  //   .every((room) =>
                  //     breakOutRoomState.users.find(
                  //       (user) => user.columnId === room.id,
                  //     ),
                  //   ) === false || breakOutRoomState.duration < 15

                    //Allow users to choose rooms must be enabled & time is >=15

                    !breakOutRoomState.isAllowUsersToChooseRooms || breakOutRoomState.duration < 15
                }
                onClick={() => {
                  setBreakOutRoomState((prev) => ({
                    ...prev,
                    step: 2,
                    activatedAt: new Date(),
                    createdAt: new Date(),
                    isActive: true,
                    endedAt: dayjs()
                      .add(breakOutRoomState.duration, "minute")
                      .toDate(),
                  }));

                  websocketCreateBreakoutRoom({
                    rooms: breakOutRoomState.rooms,
                    time: breakOutRoomState.duration,
                    freeRoom: breakOutRoomState.isAllowUsersToChooseRooms,
                    saveWhiteBoard: breakOutRoomState.isSaveWhiteBoard,
                    saveSharedNote: breakOutRoomState.isSaveSharedNotes,
                    sendInvite: breakOutRoomState.isSendInvitationToAssignedModerators,
                    roomName: user?.meetingDetails?.confname
                  });
                }}
                className="rounded-md bg-a11y/20 px-4 py-1 disabled:opacity-50 md:px-6"
              >
                Create
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-5 py-2">
            <span className="text-xs">
              Complete the steps below to create breakout rooms in your session.
              To add participants to a room, simply drag their name to the
              desired room.
            </span>
            <div className="flex flex-col items-start gap-6 text-sm md:flex-row">
              <div className="flex  flex-row items-center gap-4">
                <div className="flex w-28 flex-col gap-3">
                  <span>No. of rooms</span>
                  <Select
                    value={selectedRoom.toString()}
                    onValueChange={(value) => {
                      setSelectedRoom(value);
                      // create rooms based on value
                      const rooms = Array.from(
                        { length: parseInt(value) },
                        (_, i) => `room${i + 1}`,
                      );

                      if (breakOutRoomState.rooms.length > parseInt(value)) {
                        // remove rooms
                        const newRooms = breakOutRoomState.rooms.filter(
                          (room) =>
                            rooms.includes(room.id) || room.id === "users",
                        );
                        setBreakOutRoomState((prev) => ({
                          ...prev,
                          rooms: newRooms,
                        }));
                        return;
                      }

                      // spread old rooms and add new rooms if needed
                      setBreakOutRoomState((prev) => ({
                        ...prev,
                        rooms: [
                          ...prev.rooms,
                          ...rooms
                            .filter(
                              (room) =>
                                !prev.rooms.find(
                                  (r) =>
                                    r.id === room.toString() &&
                                    r.id !== "users",
                                ),
                            )
                            .map((room) => ({
                              id: room,
                              title: `Room ${room.split("room")[1]}`,
                              users: [],
                              breakoutId: "",
                            })),
                        ],
                      }));
                    }}
                  >
                    <SelectTrigger className="bg-a11y/20">
                      <div className="flex items-center gap-4">
                        {selectedRoom || "Kindly pick a room"}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-48 w-full border border-a11y/40 bg-primary text-white">
                      {rooms.map((room, index) => (
                        <SelectItem
                          className=""
                          key={index}
                          value={room.toString()}
                        >
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-3">
                  <span>Duration (minutes)</span>
                  <input
                    type="text"
                    name="duration"
                    placeholder="duration"
                    value={breakOutRoomState.duration}
                    onChange={(e) => {
                      setBreakOutRoomState((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 0,
                      }));
                    }}
                    className="w-full truncate rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80  focus:shadow-none focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    onCheckedChange={(checked) => {
                      setBreakOutRoomState((prev) => ({
                        ...prev,
                        isAllowUsersToChooseRooms: checked as boolean,
                      }));
                    }}
                    checked={breakOutRoomState.isAllowUsersToChooseRooms}
                    id="isAllowUsersToChooseRooms"
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor="isAllowUsersToChooseRooms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Allow users to choose rooms
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    onCheckedChange={(checked) => {
                      setBreakOutRoomState((prev) => ({
                        ...prev,
                        isSaveWhiteBoard: checked as boolean,
                      }));
                    }}
                    checked={breakOutRoomState.isSaveWhiteBoard}
                    id="isSaveWhiteBoard"
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor="isSaveWhiteBoard"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Save whiteboard
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    onCheckedChange={(checked) => {
                      setBreakOutRoomState((prev) => ({
                        ...prev,
                        isSaveSharedNotes: checked as boolean,
                      }));
                    }}
                    checked={breakOutRoomState.isSaveSharedNotes}
                    id="isSaveSharedNotes"
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor="isSaveSharedNotes"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Save shared notes
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    onCheckedChange={(checked) => {
                      setBreakOutRoomState((prev) => ({
                        ...prev,
                        isSendInvitationToAssignedModerators:
                          checked as boolean,
                      }));
                    }}
                    checked={
                      breakOutRoomState.isSendInvitationToAssignedModerators
                    }
                    id="isSendInvitationToAssignedModerators"
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor="isSendInvitationToAssignedModerators"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send invitation to assigned moderators
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-5">
              <span className="font-bold">Manage Rooms</span>
              <button
                onClick={() => {
                  // randomly assign users to room1 to roomN
                  const rooms = breakOutRoomState.rooms.filter(
                    (room) => room.id !== "users",
                  );
                  const users = breakOutRoomState.users;

                  let usersIndex = 0;
                  let roomsIndex = 0;
                  let newUsers = users;
                  // while (usersIndex < users.length) {
                  //   if (roomsIndex === rooms.length) {
                  //     roomsIndex = 0;
                  //   }
                  //   const room = rooms[roomsIndex];
                  //   newUsers = [
                  //     ...newUsers.slice(0, usersIndex),
                  //     {
                  //       ...newUsers[usersIndex],
                  //       columnId: room?.id ?? "users",
                  //     },
                  //     ...newUsers.slice(usersIndex + 1),
                  //   ] as any
                  //   usersIndex++;
                  //   roomsIndex++;
                  // }
                  // setBreakOutRoomState((prev) => ({
                  //   ...prev,
                  //   users: newUsers,
                  // }));
                }}
                className="rounded-md bg-a11y/20 px-4 py-1 text-sm"
              >
                Randomly assign
              </button>
            </div>

            <div className="mx-auto">
              <RoomBoard />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <InformationIcon className="h-4 w-4" />
            <span>You must place at least one user in a breakout room.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BreakOutModalCreate;
