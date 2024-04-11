const requestScreenSharingAccess = async (): Promise<MediaStream | null> => {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
  } catch (error) {
    console.log("Screensharing with error");
    return null;
  }
};

export default requestScreenSharingAccess;
