const requestCameraAccess = async (desiredCamera: MediaDeviceInfo|undefined): Promise<MediaStream | null> => {
  try {
    // return await navigator.mediaDevices.getUserMedia({ video: true });

    return await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: {exact: desiredCamera?.deviceId},
        width: {min: 640, ideal: 1280},
        height: {min: 480, ideal: 720},
        advanced: [{width: 1920, height: 1280}, {aspectRatio: 1.333}],
        frameRate: 15,
      },
    });
  } catch (error) {
    return null;
  }
};

export default requestCameraAccess;
