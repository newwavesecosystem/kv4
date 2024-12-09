import {websocketSend} from "~/server/Websocket";
import * as ServerInfo from "~/server/ServerInfo";
import dayjs from "dayjs";


//Processing Events
export const receiveFreeJoinRoom =(fields:any, id:any, breakOutRoomState:any, setBreakOutRoomState:any)=>{
    console.log('receiveFreeJoinRoom', fields)

    const {breakoutId,joinedUsers,shortName,name,sendInviteToModerators,sequence} = fields;

    setBreakOutRoomState((prev:any) => ({
        ...prev,
        rooms: [
            ...prev.rooms,
            {
                id: id,
                breakoutId: breakoutId,
                title: shortName,
                users: joinedUsers,
            }
        ],
    }));


    setBreakOutRoomState((prev:any) => ({
        ...prev,
        step: 2,
        activatedAt: new Date(),
        createdAt: new Date(),
        isActive: true,
        endedAt: dayjs()
            .add(breakOutRoomState.duration, "minute")
            .toDate(),
    }));

}
export const receiveForceJoinRoom =(fields:any, id:any, breakOutRoomState:any, setBreakOutRoomState:any)=>{
    console.log('receiveForceJoinRoom', fields)

    const {breakoutId,joinedUsers,shortName,name,sendInviteToModerators,sequence} = fields;

    setBreakOutRoomState((prev:any) => ({
        ...prev,
        rooms: [
            ...prev.rooms,
            {
                id: id,
                breakoutId: breakoutId,
                title: shortName,
                users: joinedUsers,
            }
        ],
    }));


    setBreakOutRoomState((prev:any) => ({
        ...prev,
        step: 2,
        activatedAt: new Date(),
        createdAt: new Date(),
        isActive: true,
        endedAt: dayjs()
            .add(breakOutRoomState.duration, "minute")
            .toDate(),
    }));

}

export const receiveStopBreakoutRoom =(fields:any, id:any, breakOutRoomState:any, setBreakOutRoomState:any)=>{
    console.log('receiveStopBreakoutRoom', fields)
    setBreakOutRoomState((prev:any) => ({
        ...prev,
        rooms: [
            ...prev.rooms.filter((item:any)=>item.id != id),
        ],
    }));

    setBreakOutRoomState({
        step: 0,
        isActive: false,
        rooms: [],
        users: [],
        isAllowUsersToChooseRooms: true,
        isSendInvitationToAssignedModerators: false,
        duration: 15,
        isSaveWhiteBoard: false,
        isSaveSharedNotes: false,
        createdAt: null,
        creatorName: "",
        creatorId: 0,
        isEnded: false,
        activatedAt: null,
        endedAt: null,
    });
}