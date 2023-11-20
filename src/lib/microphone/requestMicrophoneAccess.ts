const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
  try {
    const microphone = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    return microphone;
  } catch (error) {
    return null;
  }
};

export default requestMicrophoneAccess;
