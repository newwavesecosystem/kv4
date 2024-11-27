import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import {
  availableCamerasState,
  availableMicrophonesState,
  availableSpeakersState, cameraStreamState,
  selectedCameraState,
  selectedMicrophoneState,
  selectedSpeakersState,
} from "~/recoil/atom";
import SpinnerIcon from "../icon/outline/SpinnerIcon";

const CameraComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [availableCameras, setAvailableCameras] = useRecoilState(
    availableCamerasState,
  );

  const [availableMicrophones, setAvailableMicrophones] = useRecoilState(
    availableMicrophonesState,
  );

  const [availableSpeakers, setAvailableSpeakers] = useRecoilState(
    availableSpeakersState,
  );

  const [selectedCamera, setSelectedCamera] =
    useRecoilState(selectedCameraState);

  const [selectedMicrophone, setSelectedMicrophone] = useRecoilState(
    selectedMicrophoneState,
  );

  const [selectedSpeaker, setSelectedSpeaker] = useRecoilState(
    selectedSpeakersState,
  );
  const [cameraStream, setCameraSteam] = useRecoilState(cameraStreamState);

  const [loadingCamera, setLoadingCamera] = useState(false);
  const [loadingMicrophone, setLoadingMicrophone] = useState(true);
  const [loadingSpeaker, setLoadingSpeaker] = useState(true);

  useEffect(() => {
    if(cameraStream){
      videoRef.current!.srcObject = cameraStream;
    }

    // Function to handle camera switching
    // const switchCamera = async (deviceId: string) => {
    //   try {
    //     setLoadingCamera(true);
    //     const stream = await navigator.mediaDevices.getUserMedia({
    //       video: { deviceId: { exact: deviceId } },
    //       audio: true,
    //     });
    //
    //     // Stop the current stream
    //     const currentStream = videoRef.current?.srcObject as MediaStream | null;
    //     if (currentStream) {
    //       const tracks = currentStream.getTracks();
    //       tracks.forEach((track) => track.stop());
    //     }
    //
    //     // Attach the new stream to the video element
    //     if (videoRef.current) {
    //       videoRef.current.srcObject = stream;
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   } finally {
    //     setLoadingCamera(false);
    //   }
    // };

    // Function to get the list of available cameras and microphones
    // const getDevices = async () => {
    //   try {
    //     const devices = await navigator.mediaDevices.enumerateDevices();
    //     const cameras = devices.filter(
    //       (device) => device.kind === "videoinput",
    //     );
    //     const microphones = devices.filter(
    //       (device) => device.kind === "audioinput",
    //     );
    //     const speakers = devices.filter(
    //       (device) => device.kind === "audiooutput",
    //     );
    //     setAvailableSpeakers(speakers);
    //     setAvailableCameras(cameras);
    //     setAvailableMicrophones(microphones);
    //
    //     setSelectedCamera(cameras[0]?.deviceId || "");
    //     switchCamera(cameras[0]?.deviceId || "");
    //
    //     // set microphone
    //     setSelectedMicrophone(microphones[0]?.deviceId || "");
    //
    //     // set speaker
    //     setSelectedSpeaker(speakers[0]?.deviceId || "");
    //   } catch (error) {
    //     console.error("Error enumerating devices:", error);
    //   }
    // };

    // Request camera and microphone access and enumerate available devices
    // const initCamera = async () => {
    //   try {
    //     setLoadingCamera(true);
    //     const stream = await navigator.mediaDevices.getUserMedia({
    //       video: true,
    //       audio: true,
    //     });
    //     if (videoRef.current) {
    //       videoRef.current.srcObject = stream;
    //     }
    //     getDevices();
    //   } catch (error) {
    //     console.error("Error accessing camera:", error);
    //   } finally {
    //     setLoadingCamera(false);
    //   }
    // };

    // Initialize camera on component mount
    // initCamera();

    // Cleanup on component unmount
    // return () => {
    //   const stream = videoRef.current?.srcObject as MediaStream | null;
    //   if (stream) {
    //     const tracks = stream.getTracks();
    //     tracks.forEach((track) => track.stop());
    //   }
    // };
  }, [cameraStream]);

  return (
    <>
      {loadingCamera && (
        <div className="flex h-svh w-full items-center justify-center">
          <SpinnerIcon className="h-20 w-20 animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full flex-1 object-cover"
      >
        Your browser does not support video tag
      </video>
    </>
    //   <div>
    //     {/* <button onClick={()=>{getDevices()}}>Refresh Devices</button> */}
    //     <button onClick={requestMicrophoneAccess}>Request Microphone Access</button>
    //     <div>
    //       <span>Cameras:</span>
    //       {availableCameras.map((camera) => (
    //         <button
    //           key={camera.deviceId}
    //           onClick={() => {
    //             setSelectedCamera(camera.deviceId);
    //             switchCamera(camera.deviceId);
    //           }}
    //           style={{ marginRight: '10px' }}
    //         >
    //           {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
    //         </button>
    //       ))}
    //     </div>
    //     <div>
    //       <span>Microphones:</span>
    //       {availableMicrophones.map((microphone) => (
    //         <button
    //         className=' border'
    //           key={microphone.deviceId}
    //           onClick={() => setSelectedMicrophone(microphone.deviceId)}
    //           style={{ marginRight: '10px' }}
    //         >
    //           {microphone.label || `Microphone ${availableMicrophones.indexOf(microphone) + 1}`}
    //         </button>
    //       ))}
    //     </div>
    //   </div>
  );
};

export default CameraComponent;
