import * as ServerInfo from "~/server/ServerInfo";
import {websocketSend} from "~/server/Websocket";
import {generateRandomId} from "~/server/ServerInfo";
import {IAuthUser} from "~/types/index";

export const startWatching = (url:any) => {
    // let externalVideoUrl = url;
    //
    // if (YOUTUBE_SHORTS_REGEX.test(url)) {
    //     const shortsUrl = url.replace('shorts/', 'watch?v=');
    //     externalVideoUrl = shortsUrl;
    // } else if (Panopto.canPlay(url)) {
    //     externalVideoUrl = Panopto.getSocialUrl(url);
    // }
    //
    // // Close Shared Notes if open.
    // NotesService.pinSharedNotes(false);

    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"startWatchingExternalVideo","params":["${url}"]}`]);

};

export const stopWatching = () => {
    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"stopWatchingExternalVideo","params":[]}`]);
};

let lastMessage:any = null;

export const sendMessage = (event:any, data:any) => {

    // don't re-send repeated update messages
    if (lastMessage && lastMessage.event === event
        && event === 'playerUpdate' && lastMessage.time === data.time) {
        return;
    }

    // don't register to redis a viewer joined message
    if (event === 'viewerJoined') {
        return;
    }

    lastMessage = { ...data, event };

    // Use an integer for playing state
    // 0: stopped 1: playing
    // We might use more states in the future
    data.state =  data.state ? 1 : 0;

    websocketSend([`{"msg":"method","id":"${ServerInfo.generateSmallId()}","method":"emitExternalVideoEvent","params":[{"status":"${event}","playerStatus":${JSON.stringify(data)}}]}`]);
};


//Processing Events
export const receiveVideoLinkFromWebsocket =(link:any, eCinemaModal:any, setECinemaModal:any, user:IAuthUser)=>{
    console.log('receive Link', link)
    setECinemaModal({
        ...eCinemaModal,
        source: link,
        isActive:true
    });

    websocketSend([`{"msg":"sub","id":"${generateRandomId(17)}","name":"stream-external-videos-${user.meetingDetails?.meetingID}","params":["play",{"useCollection":false,"args":[]}]}`]);
    websocketSend([`{"msg":"sub","id":"${generateRandomId(17)}","name":"stream-external-videos-${user.meetingDetails?.meetingID}","params":["stop",{"useCollection":false,"args":[]}]}`]);
    websocketSend([`{"msg":"sub","id":"${generateRandomId(17)}","name":"stream-external-videos-${user.meetingDetails?.meetingID}","params":["presenterReady",{"useCollection":false,"args":[]}]}`]);
    websocketSend([`{"msg":"sub","id":"${generateRandomId(17)}","name":"stream-external-videos-${user.meetingDetails?.meetingID}","params":["playerUpdate",{"useCollection":false,"args":[]}]}`]);

}


export const stopVideoLinkFromWebsocket =(link:any, eCinemaModal:any, setECinemaModal:any)=>{
    console.log('receive Link', link)
    setECinemaModal({
        ...eCinemaModal,
        source: link,
        isActive:false
    });
}

export const receivedPlay =(time:any, setECinemaModal:any)=>{
    console.log('receive play');
    setECinemaModal((prev:any)=>({
        ...prev,
        eventName: "play",
        eventData: time,
    }));
}

export const receivedStop =(time:any, setECinemaModal:any)=>{
    console.log('ecm receive stop');

    setECinemaModal((prev:any)=>({
        ...prev,
        eventName: "stop",
        eventData: time,
    }));
}


export const receivedPresenterReady =(time:any, setECinemaModal:any)=>{
    console.log('receive PresenterReady');
    setECinemaModal((prev:any)=>({
        ...prev,
        eventName: "presenterReady",
        eventData: time,
    }));
}

export const receivedPlayerUpdate =(data:any, setECinemaModal:any)=>{
    console.log('receive playerUpdate ',data);
    setECinemaModal((prev:any)=>({
        ...prev,
        eventName: "playerUpdate",
        eventData: data,
    }));
}


// onMessage('playerUpdate', (data) => {
//     const { hasPlayedBefore, player } = this;
//     const { playing } = this.state;
//     const { time, rate, state } = data;
//
//     if (!player || !hasPlayedBefore) {
//         return;
//     }
//
//     if (rate !== this.getCurrentPlaybackRate()) {
//         this.setPlaybackRate(rate);
//         console.log({
//             logCode: 'external_video_client_update_rate',
//             extraInfo: {
//                 newRate: rate,
//             },
//         }, 'Change external video playback rate.');
//     }
//
//     this.seekTo(time);
//
//     const playingState = getPlayingState(state);
//     if (playing !== playingState) {
//         this.setState({ playing: playingState });
//     }
// });




