const requestCameraAccess = async (): Promise<MediaStream | null> => {
  try {
    const camera = await navigator.mediaDevices.getUserMedia({ video: true });
    return camera;
  } catch (error) {
    return null;
  }
};

export default requestCameraAccess;
