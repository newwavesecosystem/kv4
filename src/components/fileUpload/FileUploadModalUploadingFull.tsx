import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { fileUploadModalState } from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import { useDropzone } from "react-dropzone";
import UploadIcon from "../icon/outline/UploadIcon";
import CloseIcon from "../icon/outline/CloseIcon";
import MinimizeIcon from "../icon/outline/MinimizeIcon";
import FileIcon from "../icon/outline/FileIcon";
import { Progress } from "../ui/progress";

function FileUploadModalUploadingFull() {
  const [fileUploadModal, setFileUploadModal] =
    useRecoilState(fileUploadModalState);

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
  // console.log(fileUploadModal);
  // console.log(fileUploadModal.filesToUpload);

  return (
    <Dialog open={fileUploadModal.step === 2 && fileUploadModal.isFull}>
      <DialogContent
        hideCloseButton={true}
        className="max-h-[80vh] max-w-[400px] overflow-y-auto rounded-xl border-0 bg-primary text-a11y md:rounded-xl"
      >
        {" "}
        <div className=" flex flex-col gap-4">
          <div className="flex items-center gap-3 self-end">
            <button
              onClick={() => {
                setFileUploadModal((prev) => ({
                  ...prev,
                  isMinimized: true,
                  isFull: false,
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
                  isMinimized: true,
                  isFull: false,
                }));
              }}
              className=""
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex gap-1">
            <UploadIcon className="mr-2 h-6 w-6" />
            <p>Uploading</p>
            <span>
              {fileUploadModal.filesToUpload.length} item
              {fileUploadModal.filesToUpload.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex flex-col gap-2 pb-5">
            <ul className="flex flex-col gap-5 divide-y divide-a11y/10">
              {fileUploadModal.files.map((file, index) => (
                <li key={index} className="flex w-full flex-col gap-2 pt-2">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileIcon className="h-5 w-5" />

                      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {file.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress className="border border-a11y/20" value={33} />
                    <span className="shrink-0 text-xs">(33% / 100%)</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FileUploadModalUploadingFull;
