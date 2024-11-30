import { useState, useEffect } from "react";
import FolderList from "./folder-list/FolderList";
import FileList from "./file-list/FileList";
import style from "./FolderFileContainer.module.css";

export default function FolderFileContainer({
  error,
  setError,
  setSuccessfulAction,
  statusChanged,
  setStatusChanged,
  parentFolderId,
  setParentFolderId,
}) {
  const [fileList, setFileList] = useState(null);
  const [folderList, setFolder] = useState(null);
  const [folderId, setFolderId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let fetchPath;
      if (folderId !== null) {
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
          setFileList(data.files);
          setFolder(data.folders);
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
        <h3>Loading folder and file...</h3>
      )}
      {!folderList && !fileList && (
        <h2>
          Use the buttons on the top bar to create a folder or save a file!
        </h2>
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
        />
      )}
      {fileList && (
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
