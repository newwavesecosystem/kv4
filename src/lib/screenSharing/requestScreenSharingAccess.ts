const requestScreenSharingAccess = async (): Promise<MediaStream | null> => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    return stream;
  } catch (error) {
    return null;
  }
};

export default requestScreenSharingAccess;
