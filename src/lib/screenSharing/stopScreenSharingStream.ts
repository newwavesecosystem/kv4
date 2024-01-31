const stopScreenSharingStream = (screenSharingStream: MediaStream|null) => {
  const tracks = screenSharingStream?.getTracks();

  tracks?.forEach((track) => {
    track.stop();
  });
};

export default stopScreenSharingStream;
