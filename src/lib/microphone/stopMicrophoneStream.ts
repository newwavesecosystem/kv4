const stopMicrophoneStream = (microphoneStream: MediaStream) => {
  const audioTracks = microphoneStream.getAudioTracks();

  audioTracks.forEach((track) => {
    track.stop();
  });
};

export default stopMicrophoneStream;
