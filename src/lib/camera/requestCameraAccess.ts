const requestCameraAccess = async (desiredCamera: MediaDeviceInfo|undefined): Promise<MediaStream | null> => {
  try {
    return await navigator.mediaDevices.getUserMedia({ video: true });

    // return await navigator.mediaDevices.getUserMedia({
    //   video: {deviceId: {exact: desiredCamera?.deviceId}},
    // });
  } catch (error) {
    return null;
  }
};

export default requestCameraAccess;
