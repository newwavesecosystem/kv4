import React, {useEffect, useState} from "react";
import {useRecoilState, useSetRecoilState} from "recoil";
import Authenticated from "~/layouts/Authenticated";
import {authUserState, screenSharingStreamState} from "~/recoil/atom";
import ScreenSharingComponent from "./screenSharing/ScreenSharingComponent";
import Websocket from "~/server/Websocket";
import KurentoAudio from "~/server/KurentoAudio";
import axios from "axios";
import * as ServerInfo from "~/server/ServerInfo";
import {toast} from "~/components/ui/use-toast";

function PostSignIn() {
  const [screenShareState, setScreenShareState] = useState(true);
  const [screenSharingStream, setScreenSharingStream] = useRecoilState(
    screenSharingStreamState,
  );

  const setUser = useSetRecoilState(authUserState);

  const validateToken=(token)=>{
    axios.get(`${ServerInfo.tokenValidationURL}?sessionToken=${token}`)
        .then(function (response) {
          const responseData = response.data;

          console.log(responseData)
          console.log(response);

            if (responseData?.response?.returncode === 'SUCCESS') {

                setUser({
                    meetingDetails: responseData?.response,
                    sessiontoken: token
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: 'Invalid Session Token',
                });
            }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .finally(function () {
          // always executed
        })

  }

    useEffect(() => {

      // Get the URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      console.log("urlParams")
      console.log(urlParams)
      const token = urlParams.get('sessionToken');
      console.log("token")
      console.log(token)

        validateToken(token);
    }, ['']);



    return (
    <Authenticated>
      <div className="flex h-[80vh] items-center justify-center bg-konn3ct-gray-light md:h-full md:flex-1">
        PostSignIn
        {screenSharingStream && screenShareState && <ScreenSharingComponent />}
        <Websocket/>
        <KurentoAudio/>
      </div>
    </Authenticated>
  );
}

export default PostSignIn;
