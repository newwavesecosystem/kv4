const stopCameraStream = (cameraStream: MediaStream) => {
  const videoTracks = cameraStream.getVideoTracks();

  videoTracks.forEach((track) => {
    track.stop();
  });
};

export default stopCameraStream;
