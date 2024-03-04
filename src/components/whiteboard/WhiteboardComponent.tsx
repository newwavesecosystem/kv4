import React, { useState } from "react";
import { getAssetUrls } from "@tldraw/assets/selfHosted";

import { Tldraw, useEditor, LoadingScreen, createShapeId } from "@tldraw/tldraw";
import SpinnerIcon from "../icon/outline/SpinnerIcon";
import { useRecoilState } from "recoil";
import { connectedUsersState } from "~/recoil/atom";
import { cn } from "~/lib/utils";
import {Editor} from "@tldraw/editor";

function WhiteboardComponent() {
  const assetUrls = getAssetUrls();
  const [isLoading, setIsLoading] = useState(true);
  // const editor = useEditor()
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);

  function handleEvent(name:any, data:any) {
    // do something with the event
    console.log("whiteboard",name,data)
  }

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
          persistenceKey="my-persistence-key"
        onMount={(editor: Editor) => {
          setIsLoading(false);

          editor.createShapes([
            {
              id: createShapeId('kyle'),
              type: 'geo',
              x: 150,
              y: 100,
              props: {
                geo: 'rectangle',
                w: 100,
                h: 100,
                dash: 'draw',
                color: 'blue',
                size: 'm',
              },
            },
          ])
          // editor.createShapes([
          //   {
          //     parentId: "page:somePage",
          //     id: 'shape:someId',
          //     typeName: "shape",
          //     type: 'geo',
          //     x: 106,
          //     y: 294,
          //     rotation: 0,
          //     index: "a28",
          //     opacity: 1,
          //     isLocked: false,
          //     props: {
          //       w: 200,
          //       h: 200,
          //       geo: "rectangle",
          //       color: "black",
          //       labelColor: "black",
          //       fill: "none",
          //       dash: "draw",
          //       size: "m",
          //       font: "draw",
          //       text: "diagram",
          //       align: "middle",
          //       verticalAlign: "middle",
          //       growY: 0,
          //       url: ""
          //     },
          //     meta: {},
          //   },
          // ])

          console.log(editor.getSelectedShapeIds());

        }}
        onUiEvent={handleEvent}
        assetUrls={assetUrls}
      />
    </div>
  );
}

export default WhiteboardComponent;
