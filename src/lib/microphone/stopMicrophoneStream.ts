const stopMicrophoneStream = (microphoneStream: MediaStream|null) => {
  const audioTracks = microphoneStream?.getAudioTracks();

  audioTracks?.forEach((track) => {
    track.stop();
  });
};

export default stopMicrophoneStream;
