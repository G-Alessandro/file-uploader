import { useState, useEffect } from "react";
import FolderList from "./folder-list/FolderList";
import FileList from "./file-list/FileList";
import AddFolderSvg from "/assets/svg/add-folder.svg";
import AddFileSvg from "/assets/svg/add-file.svg";
import style from "./FolderFileContainer.module.css";

export default function FolderFileContainer({
  error,
  setError,
  setSuccessfulAction,
  statusChanged,
  setStatusChanged,
  parentFolderId,
  setParentFolderId,
  folderId,
  setFolderId,
  setFolderHistory,
}) {
  const [fileList, setFileList] = useState(null);
  const [folderList, setFolderList] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let fetchPath;
      if (folderId >= 0) {
        fetchPath = `get-folders/${folderId}`;
        setParentFolderId(folderId);
      } else if (folderId === "shared file") {
        fetchPath = "shared-files";
      } else {
        fetchPath = "all-folders-files";
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/${fetchPath}`,
          {
            method: "GET",
            credentials: "include",
            mode: "cors",
          }
        );
        const data = await response.json();
        if (!data) {
          setError(data.error);
        } else {
          if (data.files) {
            setFileList(data.files);
          }

          if (data.folders) {
            setFolderList(data.folders);
          }

          if (fetchPath === "shared-files") {
            setFolderList(null);
            setFileList(data.sharedFile);
          }
        }
      } catch (error) {
        console.log("An error occurred while finding data:", error);
        setError("An error occurred while finding data.");
      }
    };

    fetchData();
  }, [folderId, statusChanged]);

  return (
    <div className={style.folderFileContainer}>
      {error === null && fileList === null && folderList === null && (
        <h3>Loading...</h3>
      )}
      {folderList && fileList && (
        <div className={style.howToContainer}>
          {folderList && folderList.length === 0 && (
            <h2>
              Use the button
              <img src={AddFolderSvg} alt="click to add a folder" />
              on the top-bar to create a folder!
            </h2>
          )}
          {fileList && fileList.length === 0 && (
            <h2>
              Use the button
              <img src={AddFileSvg} alt="click to add a file" />
              on the top-bar to save a file!
            </h2>
          )}
        </div>
      )}
      {folderList && (
        <FolderList
          setError={setError}
          folderList={folderList}
          parentFolderId={parentFolderId}
          setFolderId={setFolderId}
          statusChanged={statusChanged}
          setStatusChanged={setStatusChanged}
          setSuccessfulAction={setSuccessfulAction}
          setFolderHistory={setFolderHistory}
        />
      )}
      {fileList && fileList.length > 0 && (
        <FileList
          setError={setError}
          fileList={fileList}
          statusChanged={statusChanged}
          setStatusChanged={setStatusChanged}
          setSuccessfulAction={setSuccessfulAction}
        />
      )}
    </div>
  );
}
