const stopCameraStream = (cameraStream: MediaStream|null) => {
  console.log("stopCameraStream cameraStream",cameraStream)
  const videoTracks = cameraStream?.getVideoTracks();

  videoTracks?.forEach((track) => {
    console.log("stopCameraStream track",track)
    track.stop();
  });
};

export default stopCameraStream;
