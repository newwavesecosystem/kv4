import * as ServerInfo from "~/server/ServerInfo";
import {generateRandomId, generatesSmallId} from "~/server/ServerInfo";
import {IAuthUser} from "~/types/index";
import {websocketSend} from "~/server/WebsocketActions";

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

    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'startWatchingExternalVideo',
        params: [
            url
        ]
    };

    websocketSend(msg);

};

export const stopWatching = () => {

    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'stopWatchingExternalVideo',
        params: []
    };
    websocketSend(msg);
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

    const msg = {
        msg: 'method',
        id: generatesSmallId(),
        method: 'emitExternalVideoEvent',
        params: [
            {
                status: event,
                playerStatus: JSON.stringify(data)
            }
        ]
    };

    websocketSend(msg);
};


//Processing Events
export const receiveVideoLinkFromWebsocket =(link:any, eCinemaModal:any, setECinemaModal:any, user:IAuthUser)=>{
    console.log('receive Link', link)
    setECinemaModal({
        ...eCinemaModal,
        source: link,
        isActive:true
    });


    const msg = {
        msg: 'sub',
        id: generateRandomId(17),
        method: `stream-external-videos-${user.meetingDetails?.meetingID}`,
        params: [
            "play",
            {
                useCollection: false,
                args: []
            }
        ]
    };

    websocketSend(msg);


    const msg1 = {
        msg: 'sub',
        id: generateRandomId(17),
        method: `stream-external-videos-${user.meetingDetails?.meetingID}`,
        params: [
            "stop",
            {
                useCollection: false,
                args: []
            }
        ]
    };

    websocketSend(msg1);


    const msg2 = {
        msg: 'sub',
        id: generateRandomId(17),
        method: `stream-external-videos-${user.meetingDetails?.meetingID}`,
        params: [
            "presenterReady",
            {
                useCollection: false,
                args: []
            }
        ]
    };

    websocketSend(msg2);


    const msg3 = {
        msg: 'sub',
        id: generateRandomId(17),
        method: `stream-external-videos-${user.meetingDetails?.meetingID}`,
        params: [
            "playerUpdate",
            {
                useCollection: false,
                args: []
            }
        ]
    };

    websocketSend(msg3);
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




