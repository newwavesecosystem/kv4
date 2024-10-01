const requestMicrophoneAccess = async (desiredMic: MediaDeviceInfo|undefined,autoGainControl:boolean, noiseSuppression : boolean, echoCancellation : boolean): Promise<MediaStream | null> => {
  try {
    // return await navigator.mediaDevices.getUserMedia({
    //   audio: true,
    // });
    return await navigator.mediaDevices.getUserMedia({
      audio: {
          deviceId: {exact: desiredMic?.deviceId},
          autoGainControl: autoGainControl,
          noiseSuppression: noiseSuppression,
          echoCancellation: echoCancellation
        },
    });
  } catch (error) {
    return null;
  }
};

export default requestMicrophoneAccess;
