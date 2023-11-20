const stopScreenSharingStream = (screenSharingStream: MediaStream) => {
  const tracks = screenSharingStream.getTracks();

  tracks.forEach((track) => {
    track.stop();
  });
};

export default stopScreenSharingStream;
