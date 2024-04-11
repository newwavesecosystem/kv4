import React from "react";
import { useRecoilState } from "recoil";
import { fileUploadModalState } from "~/recoil/atom";
import FileUploadModalUpload from "./FileUploadModalUpload";
import FileUploadModalUploadingFull from "./FileUploadModalUploadingFull";
import FileUploadModalUploadingMin from "./FileUploadModalUploadingMin";

function FileUploadModal() {
  const [fileUploadModal, setFileUploadModal] =
    useRecoilState(fileUploadModalState);
  return (
    <>
      {fileUploadModal.step === 1 && <FileUploadModalUpload />}
      {fileUploadModal.step === 2 && fileUploadModal.isFull && (
        <FileUploadModalUploadingFull />
      )}
      {fileUploadModal.step === 2 && fileUploadModal.isMinimized && (
        <FileUploadModalUploadingMin />
      )}
    </>
  );
}

export default FileUploadModal;
