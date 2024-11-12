import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import CloseIcon from "../icon/outline/CloseIcon";
import { AlertDialog, AlertDialogContent } from "../ui/alert-dialog";
import AlertTriangleIcon from "../icon/outline/AlertTriangleIcon";
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, eCinemaModalState, participantListState} from "~/recoil/atom";
import SpinnerIcon from "../icon/outline/SpinnerIcon";
import ReactPlayer from "react-player";
import {IParticipant} from "~/types";
import ExpandIcon from "~/components/icon/outline/ExpandIcon";
import {CurrentUserIsPresenter} from "~/lib/checkFunctions";
import {stopWatching, sendMessage} from "~/components/eCinema/EcinemaService";

function ECinemaComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [eCinemaModal, setECinemaModal] = useRecoilState(eCinemaModalState);
  const [isLoading, setIsLoading] = useState(false);
    const [playing, setPlaying] = useState(true);
  const [myState, setMyState] = useState({
      subtitlesOn: false,
      muted: false,
      playing: false,
      autoPlayBlocked: false,
      volume: 1,
      playbackRate: 1,
      key: 0,
      played:0,
      loaded:0,
      hasPlayedBefore: false,
      playerIsReady: false,
  });

    const user = useRecoilValue(authUserState);
    const participantList = useRecoilValue(participantListState);

    let isPresenter = CurrentUserIsPresenter(participantList,user);

    const player:MutableRefObject<ReactPlayer|null> = useRef(null);
    let syncInterval = null;
    let autoPlayTimeout:any = null;

    let lastMessage:any = null;
    let lastMessageTimestamp = Date.now();

    let throttleTimeout:any = null;

    const SYNC_INTERVAL_SECONDS = 5;
    const THROTTLE_INTERVAL_SECONDS = 0.5;
    const AUTO_PLAY_BLOCK_DETECTION_TIMEOUT_SECONDS = 5;
    const ALLOW_FULLSCREEN = true;
    const THROTTLE_RELOAD_INTERVAL = 5000;

   const opts :any = {
        // default option for all players, can be overwritten
        playerOptions: {
            autoplay: true,
            playsinline: true,
            controls: isPresenter,
        },
        file: {
            attributes: {
                controls: isPresenter ? 'controls' : '',
                autoplay: 'autoplay',
                playsinline: 'playsinline',
            },
        },
        facebook: {
            controls: isPresenter,
        },
        dailymotion: {
            params: {
                controls: isPresenter,
            },
        },
        youtube: {
            playerVars: {
                autoplay: 1,
                modestbranding: 1,
                autohide: 1,
                rel: 0,
                ecver: 2,
                controls: isPresenter ? 1 : 0,
                cc_lang_pref: null,
            },
        },
        peertube: {
            isPresenter,
        },
        twitch: {
            options: {
                controls: isPresenter,
            },
            playerId: 'externalVideoPlayerTwitch',
        },
        preload: true,
        showHoverToolBar: false,
    };

    const stopListener = (time:any) => {
        console.log("ecm performing stop function with:",time);
        const { hasPlayedBefore } = myState;

        // if (!player || !hasPlayedBefore) {
        //     console.log("ecm hasPlayedBefore stopped it");
        //     return;
        // }
        seekTo(time);
        setMyState((prevState)=>({...prevState, playing: false}));

        console.log({ logCode: 'external_video_client_stop' }, 'Stop external video');
    };

    const playListener = (time:any) => {
        console.log("ecm performing play function with:",time);
        const { hasPlayedBefore } = myState;

        // if (!player || !hasPlayedBefore) {
        //     return;
        // }
        seekTo(time);
        setMyState((prevState)=>({...prevState,playing: true}));

        console.log({ logCode: 'external_video_client_play' }, 'Play external video');
    };

    const presenterReadyListener = (time:any) => {
        console.log("ecm performing presenterReady function with:",time);

        const { hasPlayedBefore } = myState;

        console.log({ logCode: 'external_video_presenter_ready' }, 'Presenter is ready to sync');

        // if (!hasPlayedBefore) {
            setMyState((prevState)=>({...prevState,playing: true}));
        // }
    };

    const playerUpdateListener = (data:any) => {
        const { playing,hasPlayedBefore } = myState;
        const { time, rate, state } = data;

        console.log("ecm performing playerUpdate function with:",data);

        // if (!player || !hasPlayedBefore) {
        //     return;
        // }

        if (rate !== getCurrentPlaybackRate()) {
            setPlaybackRate(rate);
            console.log({
                logCode: 'external_video_client_update_rate',
                extraInfo: {
                    newRate: rate,
                },
            }, 'Change external video playback rate.');
        }

        seekTo(time);

        const playingState = state == 1;
        console.log("ecm performing playerUpdate function with: playingState ",playingState);
        console.log("ecm performing playerUpdate function with: playing ",playing);
        // if (playing !== playingState) {
            setMyState((prevState)=>({...prevState, playing: playingState}));
        // }
    };


    useEffect(() => {
        if(!isPresenter) {
            console.log("ecm performing update on eCinemaModal.eventName : ", eCinemaModal.eventName)
            if (eCinemaModal.eventName == "stop") {
                stopListener(eCinemaModal.eventData);
            }

            if (eCinemaModal.eventName == "play") {
                playListener(eCinemaModal.eventData);
            }

            if (eCinemaModal.eventName == "presenterReady") {
                presenterReadyListener(eCinemaModal.eventData);
            }

            if (eCinemaModal.eventName == "playerUpdate") {
                playerUpdateListener(eCinemaModal.eventData);
            }
        }

    }, [eCinemaModal.eventName, eCinemaModal.eventData]);

    useEffect(() => {
        registerVideoListeners();
    }, []);


    const getCurrentTime = () => {
        console.log("getCurrentTime:",player.current)
        if (player.current) {
            if (player && player.current?.getCurrentTime()) {
                return Math.round(player.current!.getCurrentTime());
            }
        }
        return 0;
    }

    const getCurrentPlaybackRate = () => {
        var rate =1;
        if (player.current) {
            const intPlayer = player.current && player.current?.getInternalPlayer();
            rate = (intPlayer && intPlayer.getPlaybackRate && intPlayer.getPlaybackRate());
        }

        return rate;
    }

    const setPlaybackRate = (rate:any) => {
        const intPlayer = player.current && player.current?.getInternalPlayer();
        const currentRate = getCurrentPlaybackRate();

        if (currentRate === rate) {
            return;
        }

        setMyState((prevState)=>({...prevState, playbackRate: rate}));

        if (intPlayer && intPlayer.setPlaybackRate) {
            intPlayer.setPlaybackRate(rate);
        }
    }

    const getCurrentVolume = () => {
        const { volume } = myState;
        const intPlayer = player.current && player.current?.getInternalPlayer();

        return (intPlayer && intPlayer.getVolume && intPlayer.getVolume() / 100.0) || volume;
    }

    const getMuted =()=> {
        const { muted } = myState;
        const intPlayer = player.current && player.current?.getInternalPlayer();

        return isPresenter ? intPlayer?.isMuted?.() : muted;
    }



    const sendSyncMessage=(msg:String, params:any) => {
        const timestamp = Date.now();

        // If message is just a quick pause/un-pause just send nothing
        const sinceLastMessage = (timestamp - lastMessageTimestamp) / 1000;
        if ((
                (msg === 'play' && lastMessage === 'stop')
                || (msg === 'stop' && lastMessage === 'play'))
            && sinceLastMessage < THROTTLE_INTERVAL_SECONDS) {
            return clearTimeout(throttleTimeout);
        }

        // Ignore repeat presenter ready messages
        if (lastMessage === msg && msg === 'presenterReady') {
            console.log('Ignoring a repeated presenterReady message');
        } else {
            // Play/pause messages are sent with a delay, to permit cancelling it in case of
            // quick sucessive play/pauses
            const messageDelay = (msg === 'play' || msg === 'stop') ? THROTTLE_INTERVAL_SECONDS : 0;

            throttleTimeout = setTimeout(() => {
                sendMessage(msg, { ...params });
            }, messageDelay * 1000);

            lastMessage = msg;
            lastMessageTimestamp = timestamp;
        }
        return true;
    }

    const registerVideoListeners=() =>{
        const { hasPlayedBefore } = myState;

        if (isPresenter) {
            syncInterval = setInterval(() => {
                const { playing } = myState;
                const curTime = getCurrentTime();
                const rate = getCurrentPlaybackRate();

                // Always pause video if presenter is has not started sharing, e.g., blocked by autoplay
                const playingState = player.current?.props?.playing;

                console.log("registerVideoListeners:",{ rate, time: curTime, state: playingState })

                sendSyncMessage('playerUpdate', { rate, time: curTime, state: playingState });
            }, SYNC_INTERVAL_SECONDS * 1000);
        }
    }

    const seekTo = (time:any) => {

        if (!player) {
            return console.error('ecm No player on seek');
        }

        // Seek if viewer has drifted too far away from presenter
        if (Math.abs(getCurrentTime() - time) > SYNC_INTERVAL_SECONDS * 0.75) {
            player.current?.seekTo(time, "seconds");
            console.log({
                logCode: 'external_video_client_update_seek',
                extraInfo: { time },
            }, `Seek external video to: ${time}`);
        }
        return true;
    }


    const toggleSubtitle =()=> {
        // this.setState((state) => {
        //     return { subtitlesOn: !state.subtitlesOn };
        // }, () => {
        //     const { subtitlesOn } = this.state;
        //     const { isPresenter } = this.props;
        //     if (!isPresenter && subtitlesOn) {
        //         this?.player?.getInternalPlayer()?.setOption('captions', 'reload', true);
        //     } else {
        //         this?.player?.getInternalPlayer()?.unloadModule('captions');
        //     }
        // });
    }

    const autoPlayBlockDetected = () => {
        setMyState((prevState)=>({...prevState,autoPlayBlocked: true}));
    }


    const handleOnReady =()=> {
        const { hasPlayedBefore,playerIsReady } = myState;

        console.log("ecm handleOnReady:",hasPlayedBefore)
        // if (hasPlayedBefore || playerIsReady) {
        //     return;
        // }

        setMyState((prevState)=>({...prevState,playerIsReady: true}));

        autoPlayTimeout = setTimeout(
            autoPlayBlockDetected,
            AUTO_PLAY_BLOCK_DETECTION_TIMEOUT_SECONDS * 1000,
        );
    }

    const handleFirstPlay = () => {
        const { hasPlayedBefore,playerIsReady } = myState;

        console.log("ecm handleFirstPlay:",hasPlayedBefore)
        // if (!hasPlayedBefore) {

            setMyState((prevState)=>({...prevState,autoPlayBlocked: false, hasPlayedBefore:true}));

            console.log("ecm handleFirstPlay:",hasPlayedBefore)

            clearTimeout(autoPlayTimeout);

            if (isPresenter) {
                sendSyncMessage('presenterReady',{});
            }
        // }
    }

    const handleOnPlay = () => {
        const { playing } = myState;

        const curTime = getCurrentTime();

        if (isPresenter && !playing) {
            sendSyncMessage('play', { time: curTime });
        }

        setMyState((prevState)=>({...prevState,playing: true}));

        handleFirstPlay();

        if (!isPresenter && !playing) {
            setMyState((prevState)=>({...prevState,playing: false}));
        }
    }

    const handleOnPause = () => {
        const { playing } = myState;

        console.log("handleOnPause playing:",playing)
        console.log("handleOnPause isPresenter:",playing)

        const curTime = getCurrentTime();

        if (isPresenter && playing) {
            sendSyncMessage('stop', { time: curTime });
            setMyState((prevState)=>({...prevState, playing: false}));
        }

        handleFirstPlay();

        if (!isPresenter && playing) {
            setMyState((prevState)=>({...prevState, playing: true}));
        }
    }

    const handleOnProgress = (data:any) => {
        // const { mutedByEchoTest } = myState;

        console.log("handleOnProgress: ",data);

        const volume = getCurrentVolume();
        const muted = getMuted();

        const { played, loaded } = data;

        setMyState((prevState)=>({...prevState, played, loaded}));

        // if (!mutedByEchoTest) {
        //     setMyState((prevState)=>({...prevState, volume, muted}));
        // }

    }

    const handleVolumeChanged = (volume:any) =>{
        setMyState((prevState)=>({...prevState, volume}));
    }

    const handleOnMuted =(muted:boolean) =>{
        // const { mutedByEchoTest } = myState;
        //
        // if (!mutedByEchoTest) {
        //     setMyState((prevState)=>({...prevState, muted}));
        // }
    }

    const handleReload =()=> {
        const { key } = myState;
        // increment key and force a re-render of the video component
        setMyState((prevState)=>({...prevState, key: key + 1}));
    }

    const onBeforeUnload =()=> {
        if (isPresenter) {
            sendSyncMessage('stop',{});
        }
    }


    return (
      <div className=" m-auto h-[calc(100vh-128px)] overflow-hidden rounded-lg p-4">
          {isLoading && (
              <div className="flex h-full w-full items-center justify-center">
                  <SpinnerIcon className="h-20 w-20 animate-spin"/>
              </div>
          )}
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
              <AlertDialogContent
                  className="rounded-xl border-0 bg-primary py-3 text-a11y sm:max-w-[425px] md:rounded-xl">
                  <div className="grid gap-3 py-4">
                      <div className="flex gap-2 text-2xl">
                          <AlertTriangleIcon className="h-8 w-8"/>
                          <span>End eCinema</span>
                      </div>
                      <p>
                          The session will end for everyone. You can't undo this action.
                      </p>
                      <div className="mt-7 flex w-full gap-6">
                          <button
                              className="w-full rounded-md border border-a11y/20 py-3"
                              onClick={() => {
                                  setIsOpen(false);
                              }}
                          >
                              Don't End
                          </button>
                          <button
                              className="w-full rounded-md bg-a11y/20 py-3"
                              onClick={() => {
                                  setIsOpen(false);
                                  setECinemaModal({
                                      ...eCinemaModal,
                                      isActive: false,
                                      source: "",
                                      step: 0,
                                  });
                                  stopWatching();
                              }}
                          >
                              End eCinema
                          </button>
                      </div>
                  </div>
              </AlertDialogContent>
          </AlertDialog>

          <ReactPlayer id="ecinema" url={eCinemaModal.source}
                       width="100%"
                       height="85%"
                       style={{marginTop: '3em'}}
                       pip={true}
                       config={opts}
                       volume={myState.muted ? 0 : myState.volume}
                       muted={myState.muted}
                       playing={myState.playing}
                       playbackRate={myState.playbackRate}
                       onProgress={handleOnProgress}
                       onReady={handleOnReady}
                       onPlay={handleOnPlay}
                       onPause={handleOnPause}
                       controls={isPresenter}
                       key={`react-player${myState.key}`}
                       ref={player}
          />

          {/*<video*/}
          {/*  autoPlay*/}
          {/*  playsInline*/}
          {/*  hidden={isLoading}*/}
          {/*  muted*/}
          {/*  className="h-full w-full flex-1 rounded-lg object-cover"*/}
          {/*  controls*/}
          {/*  controlsList="nodownload"*/}
          {/*  onCanPlay={() => {*/}
          {/*    setIsLoading(false);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <source src={eCinemaModal.source} />*/}
          {/*  Your browser does not support the video tag.*/}
          {/*</video>*/}
          <button
              onClick={() => {
                  document.getElementById("ecinema")?.requestFullscreen();
              }}
              className="absolute left-7 top-7 flex items-center gap-2 rounded-md border-2 border-a11y/20 bg-primary/20 px-3 py-2 text-sm backdrop-blur-3xl"
          >
              <ExpandIcon className="h-5 w-5"/>
              <span>Go Fullscreen</span>
          </button>
          {CurrentUserIsPresenter(participantList, user) &&
              (<button
                  onClick={() => {
                      setIsOpen(true);
                  }}
                  className="absolute right-7 top-7 flex items-center gap-2 rounded-md border-2 border-a11y/20 bg-primary/20 px-3 py-2 text-sm backdrop-blur-3xl"
              >
                  <CloseIcon className="h-5 w-5"/>
                  <span>Stop Broadcast</span>
              </button>)}

      </div>
  );
}

export default ECinemaComponent;
