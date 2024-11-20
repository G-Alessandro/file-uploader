import { useState, useEffect } from "react";
import FolderList from "./file-list/FolderList";
import FileList from "./file-list/FileList";

export default function FolderFileContainer() {
  const [error, setError] = useState(null);
  const [fileList, setFileList] = useState(null);
  const [folderList, setFolder] = useState(null);
  const [folderId, setFolderId] = useState(null);
  const [statusChanged, setStatusChanged] = useState(false);
  const [successfulAction, setSuccessfulAction] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let fetchPath;
      if (folderId !== null) {
        fetchPath = `get-folders/${folderId}`;
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
        const data = response.json();
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

  useEffect(() => {
    if (successfulAction !== null) {
      const timer = setTimeout(() => setSuccessfulAction(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [setSuccessfulAction]);

  return (
    <>
      {error === null && fileList === null && folderList === null && (
        <h3>Loading folder and file...</h3>
      )}
      {error && <h2>{error}</h2>}
      {successfulAction && <h2>{successfulAction}</h2>}
      <FolderList
        setError={setError}
        folderList={folderList}
        setFolderId={setFolderId}
        statusChanged={statusChanged}
        setStatusChanged={setStatusChanged}
      />
      <FileList
        setError={setError}
        fileList={fileList}
        statusChanged={statusChanged}
        setStatusChanged={setStatusChanged}
        setSuccessfulAction={setSuccessfulAction}
      />
    </>
  );
}
