import React, {useEffect, useState} from "react";
import { getAssetUrls } from "@tldraw/assets/selfHosted";

// import { Tldraw, LoadingScreen, createShapeId } from "@tldraw/tldraw";
import {
  Tldraw,
  LoadingScreen,
  DefaultColorStyle,
  Editor,
  TLGeoShape,
  TLShapePartial,
  createShapeId,
  useEditor,
} from '@tldraw/tldraw'
import SpinnerIcon from "../icon/outline/SpinnerIcon";
import { useRecoilState } from "recoil";
import { connectedUsersState } from "~/recoil/atom";
import { cn } from "~/lib/utils";

function WhiteboardComponent() {
  const assetUrls = getAssetUrls();
  const [isLoading, setIsLoading] = useState(false);
  const [connectedUsers, setConnectedUsers] =
    useRecoilState(connectedUsersState);

  function handleEvent(name:any, data:any) {
    // do something with the event
    console.log("whiteboard",name,data)
  }

  const handleMount = (editor: Editor) => {
    setIsLoading(false);
    // // Create a shape id
    // const id = createShapeId('hello')
    //
    // // Create a shape
    // editor.createShapes<TLGeoShape>([
    //   {
    //     id,
    //     type: 'geo',
    //     x: 128 + Math.random() * 500,
    //     y: 128 + Math.random() * 500,
    //     props: {
    //       geo: 'rectangle',
    //       w: 100,
    //       h: 100,
    //       dash: 'draw',
    //       color: 'blue',
    //       size: 'm',
    //     },
    //   },
    // ])
    //
    // // Get the created shape
    // const shape = editor.getShape<TLGeoShape>(id)!
    //
    // const shapeUpdate: TLShapePartial<TLGeoShape> = {
    //   id,
    //   type: 'geo',
    //   props: {
    //     h: shape.props.h * 3,
    //     text: 'hello world!',
    //   },
    // }
    //
    // // Update the shape
    // editor.updateShapes([shapeUpdate])
    //
    // // Select the shape
    // editor.select(id)
    //
    // // Rotate the shape around its center
    // editor.rotateShapesBy([id], Math.PI / 8)
    //
    // // Clear the selection
    // editor.selectNone()
    //
    // // Zoom the camera to fit both shapes
    // editor.zoomToFit()
  }


  const InsideOfEditorContext = () => {
    const editor = useEditor()

    useEffect(() => {

    }, [])

    return null
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
          onMount={handleMount}
        // onMount={(editor: Editor) => {
        //   setIsLoading(false);
        //
        //   editor.createShapes([
        //     {
        //       id: createShapeId('kyle'),
        //       type: 'geo',
        //       x: 150,
        //       y: 100,
        //       props: {
        //         geo: 'rectangle',
        //         w: 100,
        //         h: 100,
        //         dash: 'draw',
        //         color: 'blue',
        //         size: 'm',
        //       },
        //     },
        //   ])
        //   // editor.createShapes([
        //   //   {
        //   //     parentId: "page:somePage",
        //   //     id: 'shape:someId',
        //   //     typeName: "shape",
        //   //     type: 'geo',
        //   //     x: 106,
        //   //     y: 294,
        //   //     rotation: 0,
        //   //     index: "a28",
        //   //     opacity: 1,
        //   //     isLocked: false,
        //   //     props: {
        //   //       w: 200,
        //   //       h: 200,
        //   //       geo: "rectangle",
        //   //       color: "black",
        //   //       labelColor: "black",
        //   //       fill: "none",
        //   //       dash: "draw",
        //   //       size: "m",
        //   //       font: "draw",
        //   //       text: "diagram",
        //   //       align: "middle",
        //   //       verticalAlign: "middle",
        //   //       growY: 0,
        //   //       url: ""
        //   //     },
        //   //     meta: {},
        //   //   },
        //   // ])
        //
        //   console.log(editor.getSelectedShapeIds());
        //
        // }}
        onUiEvent={handleEvent}
        assetUrls={assetUrls}
      >
        <InsideOfEditorContext />
      </Tldraw>
    </div>
  );
}

export default WhiteboardComponent;
