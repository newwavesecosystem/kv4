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

const SocketIOCaption = () => {
    const user = useRecoilValue(authUserState);
    const [ccModal, setCCModal] = useRecoilState(ccModalState);
    const ccModalLanguageRef = useRef(ccModal.language);
    const [socketConnected, setSocketConnected] = useState(false);
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    async function translate(text: string, user: string) {
        console.log("cSocket Translate API - ", ccModalLanguageRef.current);
        
        try {
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

            let displayText = `${user}: ${responseData?.message}`;
            console.log("cSocket receive_captions with translation displayText", displayText);
            
            setCCModal((prev) => ({
                ...prev,
                caption: displayText,
            }));
        } catch (error) {
            console.error("Translation error:", error);
            // Fallback to original text if translation fails
            let displayText = `${user}: ${text}`;
            setCCModal((prev) => ({
                ...prev,
                caption: displayText,
            }));
        }
    }

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

            let displayText = `${arg.user}: ${arg.text}`;
            console.log("cSocket receive_captions displayText", displayText);
            console.log("cSocket caption language", ccModalLanguageRef.current);

            if (ccModalLanguageRef.current !== "df") {
                translate(arg.text, arg.user);
            } else {
                setCCModal((prev) => ({
                    ...prev,
                    caption: displayText,
                }));
            }
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
