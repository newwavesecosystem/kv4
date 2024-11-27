import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authUserState, fileUploadModalState } from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import { useDropzone } from "react-dropzone";
import UploadIcon from "../icon/outline/UploadIcon";
import DeleteIcon from "../icon/outline/DeleteIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EllipsisIcon from "../icon/outline/EllipsisIcon";
import InformationIcon from "../icon/outline/InformationIcon";
import { Checkbox } from "../ui/checkbox";
import { cn } from "~/lib/utils";
import * as ServerInfo from "~/server/ServerInfo";
import {handleRequestPresentationUploadToken} from "~/server/Websocket";

function FileUploadModalUpload() {
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
    <Dialog
      open={fileUploadModal.step === 1}
    >
      <DialogContent
        hideCloseButton={true}
        className="h-[80svh] overflow-y-auto rounded-xl border-0 bg-primary text-a11y sm:max-w-[600px] md:rounded-xl xl:max-w-[800px]"
      >
        {" "}
        <div className=" flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-a11y/10 pb-5">
            <span className="font-bold">Presentation</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFileUploadModal((prev) => ({
                    ...prev,
                    step: 0,
                  }));
                }}
                className="rounded-lg border border-a11y/20 px-6 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {

                  fileUploadModal.files.map((file, index) => {
                    if (fileUploadModal.filesToUpload?.includes(file.name)) {

                      var id =ServerInfo.generateRandomId(24);

                      var fil={
                        id,
                        file,
                      }

                      console.log("settingfunction: saving file to upload ",fil)

                      setFileUploadModal((prev) => ({
                        ...prev,
                        filesUploadInProgress: [...prev.filesUploadInProgress, fil],
                      }));

                      handleRequestPresentationUploadToken(id,file);

                    }

                  })

                  setFileUploadModal((prev) => ({
                    ...prev,
                    step: 2,
                    isFull: true,
                  }));


                }}
                className="rounded-lg bg-a11y/20 px-6 py-2 text-xs disabled:opacity-30"
                disabled={fileUploadModal.filesToUpload.length === 0}
              >
                Upload
              </button>
            </div>
          </div>
          <p className="text-xs">
            As a presenter you have the ability to upload any office document or
            PDF file. We recommend PDF file for best results. Please ensure that
            a presentation is selected using the circle checkbox on the left
            hand side.
          </p>
          <div className="flex flex-col gap-2 border-b border-a11y/10 py-5">
            <div className="flex justify-between">
              <span>Current presentation</span>
              <span>Actions</span>
            </div>
            <ul className="flex flex-col gap-3">
              {fileUploadModal.files.map((file, index) => (
                <li key={index}>
                  <div
                    className={cn(
                      "flex items-center justify-between w-full",
                      fileUploadModal.filesToUpload?.includes(file.name)
                        ? "rounded-lg bg-a11y/10 p-2"
                        : "p-2",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            return setFileUploadModal((prev) => ({
                              ...prev,
                              filesToUpload: prev.filesToUpload.filter(
                                (name) => name !== file.name,
                              ),
                            }));
                          }
                          setFileUploadModal((prev) => ({
                            ...prev,
                            filesToUpload: [...prev.filesToUpload, file.name],
                          }));
                        }}
                        checked={fileUploadModal.filesToUpload?.includes(
                          file.name,
                        )}
                        id={`${file.name}`}
                        className="h-5 w-5 rounded-full"
                      />

                      <label
                        htmlFor={`${file.name}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {file.name}

                      </label>
                    </div>
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="">
                            <EllipsisIcon className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="left"
                          className="mb-2 w-32 rounded border-0 bg-primary text-a11y "
                        >
                          <DropdownMenuItem
                            onClick={() => {}}
                            className="py-2 "
                          >
                            <InformationIcon className="mr-2 h-5 w-5" />
                            <span>info</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <button
                        onClick={() => {
                          setFileUploadModal((prev) => ({
                            ...prev,
                            files: prev.files.filter(
                              (f) => f.name !== file.name,
                            ),
                          }));

                          setFileUploadModal((prev) => ({
                            ...prev,
                            filesToUpload: prev.filesToUpload.filter(
                              (name) => name !== file.name,
                            ),
                          }));
                        }}
                        className="text-xs"
                      >
                        <DeleteIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-xs">
              In the "Export options" menu you have the option to enable
              download of the original presentation and to provide users with a
              downloadable link with annotations in public chat.
            </p>
            <div className="md:px-10">
              <button
                className="flex w-full flex-col items-center rounded-lg border border-dashed border-a11y pb-10 pt-16"
                {...getRootProps()}
              >
                <input {...getInputProps()} />

                <UploadIcon className="h-6 w-6" />
                <span>Drag files here to upload</span>
                <span className="underline">or browse for files</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FileUploadModalUpload;
