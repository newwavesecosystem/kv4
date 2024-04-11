import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authUserState, fileUploadModalState } from "~/recoil/atom";
import { useDropzone } from "react-dropzone";
import UploadIcon from "../icon/outline/UploadIcon";
import MinimizeIcon from "../icon/outline/MinimizeIcon";
import CloseIcon from "../icon/outline/CloseIcon";

function FileUploadModalUploadingMin() {
  const [fileUploadModal, setFileUploadModal] =
    useRecoilState(fileUploadModalState);

  const user = useRecoilValue(authUserState);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      // ensure that the file is not already in the list
      if (
        fileUploadModal.files.some((file) =>
          acceptedFiles.some((acceptedFile) => acceptedFile.name === file.name),
        )
      ) {
        return;
      }
      setFileUploadModal((prev) => ({
        ...prev,
        files: [...prev.files, ...acceptedFiles],
      }));
    },
  });

  return (
    <div className="fixed bottom-20 z-10 mx-auto ml-4 flex gap-2 rounded-md bg-primary p-2 ">
      <UploadIcon className="mr-2 h-6 w-6" />
      <div className="ml-2 mr-4 flex flex-col">
        <div className="flex gap-1">
          <p>Uploading</p>
          <span>
            {fileUploadModal.filesToUpload.length} item
            {fileUploadModal.filesToUpload.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* <Progress value={33} /> */}
          <span className="shrink-0 text-xs">Uploading (75%)</span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-start">
        <button
          onClick={() => {
            setFileUploadModal((prev) => ({
              ...prev,
              isMinimized: false,
              isFull: true,
            }));
          }}
          className=""
        >
          <MinimizeIcon className="h-6 w-6" />
        </button>
        <button
          onClick={() => {
            setFileUploadModal((prev) => ({
              ...prev,
              isMinimized: false,
              isFull: true,
            }));
          }}
          className=""
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export default FileUploadModalUploadingMin;
