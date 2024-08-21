import React, {useEffect, useRef, useState} from 'react';
import * as kurentoUtils from "kurento-utils";
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    authUserState,
    ccModalState,
    connectionStatusState,
    microphoneStreamState,
    selectedSpeakersState
} from "~/recoil/atom";
import {captionURL} from "./ServerInfo";
import {io, Socket} from 'socket.io-client';
// import socket from "~/server/socket";
import {IMeetingDetails} from "~/types";
import axios from "axios";

let socket: Socket = io(captionURL);

export function broadcastCaption(text: any, meetingDetails: IMeetingDetails | null | undefined) {
    console.log("send_captions", text); // world
    socket?.emit("send_captions", {
        "text": text,
        "user": meetingDetails?.fullname,
        "meetingID": meetingDetails?.meetingID,
        "date": new Date().toLocaleString()
    });
}


const SocketIOCaption = () => {

    const user = useRecoilValue(authUserState);
    const [ccModal, setCCModal] = useRecoilState(ccModalState);
    const ccModalLanguageRef = useRef(ccModal.language);

    async function translate(text:string,user:string) {
        console.log("cSocket Translate API - ",ccModalLanguageRef.current);
        // let data = JSON.stringify({
        //   message: transcript,
        //   target: ccModal.language,
        // });

        let data = JSON.stringify({
            "q": text,
            "source": "auto",
            "target": ccModalLanguageRef.current,
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

        let displayText=`${user}: ${responseData?.message}`;

        console.log("cSocket receive_captions with translation displayText", displayText); // world
        setCCModal((prev) => ({
            ...prev,
            caption: displayText,
        }));
    }


    useEffect(() => {
        // Define the socket variable with the Socket type

        window.onbeforeunload = function(e) {
            socket.disconnect();
        };

        // client-side
        socket.on("connect", () => {
            console.log("cSocket Connected",socket.id); // x8WIv7-mJelg7on_ALbx
            console.log("cSocket userD",user?.meetingDetails?.meetingID);

            // if(user?.meetingDetails?.meetingID != null){
            console.log("cSocket join_room",user?.meetingDetails?.meetingID);
            socket.emit("join_room", user?.meetingDetails?.meetingID);
            // }

        });

        socket.on("disconnect", ( ) => {
            console.log("cSocket disconnect");
        });

        socket.on("receive_captions", (arg) => {
            console.log("cSocket receive_captions", arg); // world
            console.log("cSocket receive_captions", arg.user); // world

            let displayText=`${arg.user}: ${arg.text}`;

            console.log("cSocket receive_captions displayText", displayText); // world

            console.log("cSocket caption language", ccModalLanguageRef.current);

            if (ccModalLanguageRef.current != "df") {
                translate(arg.text,arg.user).then();
            }else{
                setCCModal((prev) => ({
                    ...prev,
                    caption: displayText,
                }));
            }

        });

        // return () => {
        //   // Clean up socket connections when the component unmounts
        //   socket.disconnect();
        // };

    }, [socket]);

    // Update the ref whenever ccModal.language changes
    useEffect(() => {
        ccModalLanguageRef.current = ccModal.language;
    }, [ccModal.language]);




    return (
        <div style={{height: 1}}>

        </div>
    )

}

export default SocketIOCaption
