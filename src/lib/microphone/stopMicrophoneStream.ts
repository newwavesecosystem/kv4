const stopMicrophoneStream = (microphoneStream: MediaStream|null) => {
  console.log("Stopping mic stream",microphoneStream);
  const audioTracks = microphoneStream?.getAudioTracks();

  audioTracks?.forEach((track) => {
    console.log("Stopping mic stream track");
    track.stop();
  });
};

export default stopMicrophoneStream;
