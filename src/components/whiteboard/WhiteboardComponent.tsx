import React, { useState } from "react";
import { getAssetUrls } from "@tldraw/assets/selfHosted";

import { Tldraw, useEditor, LoadingScreen } from "@tldraw/tldraw";
import SpinnerIcon from "../icon/outline/SpinnerIcon";
import { useRecoilState } from "recoil";
import { connectedUsersState } from "~/recoil/atom";
import { cn } from "~/lib/utils";

function WhiteboardComponent() {
  const assetUrls = getAssetUrls();
  const [isLoading, setIsLoading] = useState(true);
  // const editor = useEditor()
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);
  return (
    <div
      className={cn(
        " max-w-2xl p-4 xl:max-w-6xl h-[calc(100vh-128px)] m-auto",
        connectedUsers.filter((user) => user.isMicOpen === true)?.length > 0 &&
          "h-[calc(100vh-150px)] mt-6",
      )}
    >
      {isLoading && (
        <div className="bg-a11y/20 flex items-center justify-center h-full flex-col rounded-xl">
          <SpinnerIcon className="h-16 w-16 animate-spin" />
        </div>
      )}
      <Tldraw
        onMount={() => {
          setIsLoading(false);
        }}
        assetUrls={assetUrls}
      />
    </div>
  );
}

export default WhiteboardComponent;
