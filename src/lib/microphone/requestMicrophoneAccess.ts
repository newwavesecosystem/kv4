const requestMicrophoneAccess = async (desiredMic: MediaDeviceInfo|undefined): Promise<MediaStream | null> => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
          deviceId: {exact: desiredMic?.deviceId},
          autoGainControl: false,
          noiseSuppression: true,
          echoCancellation: true
        },
    });
  } catch (error) {
    return null;
  }
};

export default requestMicrophoneAccess;
