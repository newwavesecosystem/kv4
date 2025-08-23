import React, {useEffect, useRef, useState} from 'react';
import * as ServerInfo from './ServerInfo';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    authUserState,
    ccModalState
} from "~/recoil/atom";
import {captionURL} from "./ServerInfo";
import {io, Socket} from 'socket.io-client';
import {IMeetingDetails} from "~/types";
import axios from "axios";

// Remove global socket instance
let socket: Socket | null = null;

export function broadcastCaption(text: any, meetingDetails: IMeetingDetails | null | undefined) {
    console.log("send_captions", text);
    // Add validation before emitting
    if (socket && socket.connected && meetingDetails?.meetingID) {
        socket.emit("send_captions", {
            "text": text,
            "user": meetingDetails?.fullname,
            "meetingID": meetingDetails?.meetingID,
            "date": new Date().toLocaleString()
        });
    } else {
        console.warn("Cannot broadcast caption: socket not connected or missing meeting details");
    }
}
export function transcribeAudio(audio: any, meetingDetails: IMeetingDetails | null | undefined) {
    console.log("send audio");
    // Add validation before emitting
    if (socket && socket.connected && meetingDetails?.meetingID) {
        socket.emit("transcribe_audio", {
            "audio": audio,
            "user": meetingDetails?.fullname,
            "meetingID": meetingDetails?.meetingID,
            "date": new Date().toLocaleString()
        });
    } else {
        console.warn("Cannot broadcast transcribeAudio: socket not connected or missing meeting details");
    }
}

export function translateCaption(text: any, target:string, user: string, meetingDetails: IMeetingDetails | null | undefined) {
    console.log("send for translation", text);
    // Add validation before emitting
    if (socket && socket.connected && meetingDetails?.meetingID) {
        socket.emit("translation", {
            "text": text,
            "target": text,
            "user": user,
            "meetingID": meetingDetails?.meetingID,
            "date": new Date().toLocaleString()
        });
    } else {
        console.warn("Cannot broadcast caption: socket not connected or missing meeting details");
    }
}

const SocketIOCaption = () => {
    const user = useRecoilValue(authUserState);
    const [ccModal, setCCModal] = useRecoilState(ccModalState);
    const ccModalLanguageRef = useRef(ccModal.language);
    const [socketConnected, setSocketConnected] = useState(false);
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const joinRoom = (meetingID: string) => {
        if (socket && socket.connected && meetingID && !hasJoinedRoom) {
            console.log("cSocket join_room", meetingID);
            socket.emit("join_room", meetingID);
            setHasJoinedRoom(true);
        }
    };

    const initializeSocket = () => {
        if (socket) {
            socket.disconnect();
        }

        socket = io(captionURL, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            console.log("cSocket Connected", socket?.id);
            setSocketConnected(true);
            setHasJoinedRoom(false);
            
            // Clear any pending reconnection timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            // Join room if user data is available
            if (user?.meetingDetails?.meetingID) {
                joinRoom(user.meetingDetails.meetingID);
            }
        });

        socket.on("connect_error", (error) => {
            console.error("cSocket connection error:", error);
            setSocketConnected(false);
        });

        socket.on("disconnect", (reason) => {
            console.log("cSocket disconnect:", reason);
            setSocketConnected(false);
            setHasJoinedRoom(false);
            
            // Attempt to reconnect after a delay if disconnection was unexpected
            if (reason === "io server disconnect") {
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (socket && !socket.connected) {
                        socket.connect();
                    }
                }, 3000);
            }
        });

        socket.on("receive_captions", (arg) => {
            console.log("cSocket receive_captions", arg);
            console.log("cSocket receive_captions user", arg.user);

            if (!arg || !arg.text || !arg.user) {
                console.warn("Invalid caption data received:", arg);
                return;
            }

            let displayText = `${arg.user}: ${arg.text}break--line`;
            console.log("cSocket receive_captions displayText", displayText);
            console.log("cSocket caption language", ccModalLanguageRef.current);

            if (ccModalLanguageRef.current !== "df") {
                translateCaption(arg.text,ccModalLanguageRef.current,arg.user,user.meetingDetails);
            } else {
                setCCModal((prev) => ({
                    ...prev,
                    caption: prev.caption + displayText,
                }));
            }
        });

        socket.on("translation", (arg) => {
            console.log("cSocket receive translation", arg);
            console.log("cSocket receive translation user", arg.user);

            if (!arg || !arg.text) {
                console.warn("Invalid translation data received:", arg);
                return;
            }

            let displayText = `${arg.user}: ${arg.text}break--line`;
            console.log("cSocket receive_captions displayText", displayText);

            setCCModal((prev) => ({
                ...prev,
                caption: prev.caption + displayText,
            }));
        });

        socket.on("transcribe_audio", (arg) => {
            console.log("cSocket transcribe_audio", arg);

            if (!arg || !arg.text) {
                console.warn("Invalid translation data received:", arg);
                return;
            }

            let displayText = `Me: ${arg.text}break--line`;
            setCCModal((prev) => ({
                ...prev,
                caption: prev.caption + displayText,
            }));
        });

        // Handle room join confirmation (if server sends it)
        socket.on("joined_room", (data) => {
            console.log("Successfully joined room:", data);
            setHasJoinedRoom(true);
        });

        // Handle room join errors (if server sends them)
        socket.on("join_room_error", (error) => {
            console.error("Failed to join room:", error);
            setHasJoinedRoom(false);
        });
    };

    useEffect(() => {
        initializeSocket();

        // Cleanup function
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, []); // Remove socket dependency

    // Handle user changes and room joining
    useEffect(() => {
        if (socketConnected && user?.meetingDetails?.meetingID && !hasJoinedRoom) {
            joinRoom(user.meetingDetails.meetingID);
        }
    }, [socketConnected, user?.meetingDetails?.meetingID, hasJoinedRoom]);

    // Update the ref whenever ccModal.language changes
    useEffect(() => {
        ccModalLanguageRef.current = ccModal.language;
    }, [ccModal.language]);

    // Handle page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (socket) {
                socket.disconnect();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div style={{height: 1}}>
            {/* Optional: Add connection status indicator for debugging */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'fixed',
                    top: 10,
                    right: 10,
                    padding: '5px 10px',
                    backgroundColor: socketConnected ? 'green' : 'red',
                    color: 'white',
                    fontSize: '12px',
                    borderRadius: '4px',
                    zIndex: 9999
                }}>
                    Caption Socket: {socketConnected ? 'Connected' : 'Disconnected'}
                    {hasJoinedRoom && ' | Room Joined'}
                </div>
            )}
        </div>
    );
};

export default SocketIOCaption;
