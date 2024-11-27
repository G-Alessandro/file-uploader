import { useState } from "react";
import Checkmark from "/assets/svg/checkmark.svg";
import DeleteSvg from "/assets/svg/delete.svg";
import EditSvg from "/assets/svg/edit.svg";
import CancelSvg from "/assets/svg/cancel.svg";
import FolderSvg from "/assets/svg/folder.svg";
import style from "./FolderList.module.css";

export default function FolderList({
  setError,
  folderList,
  setFolderId,
  setSuccessfulAction,
  statusChanged,
  setStatusChanged,
}) {
  const [foldersEditName, setFoldersEditName] = useState(folderList);
  const [showFolderOptions, setShowFolderOptions] = useState(
    Array(folderList.length).fill(false)
  );

  const handleToggleOption = (index, basicName) => {
    setShowFolderOptions((prevOptions) =>
      prevOptions.map((option, i) => (i === index ? !option : false))
    );
    setFoldersEditName((prevFolders) =>
      prevFolders.map((folder, i) =>
        i === index ? { ...folder, name: basicName } : folder
      )
    );
  };

  const handleFolderDelete = async (id) => {
    const bodyData = JSON.stringify({
      folderId: id,
    });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/remove-folder`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          mode: "cors",
          body: bodyData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError("An error occurred while deleting the folder.");
      } else {
        setStatusChanged(!statusChanged);
        setSuccessfulAction(data.message);
      }
    } catch (error) {
      console.log("Error :", error);
      setError("An error occurred while deleting the folder.");
    }
  };

  const handleFolderEdit = async (event, index, id) => {
    event.preventDefault();
    const bodyData = JSON.stringify({
      folderName: event.target.folderName.value,
      folderId: id,
    });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/change-name-folder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          mode: "cors",
          body: bodyData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError("An error occurred while changing the folder name.");
      } else {
        handleToggleOption(index);
        setStatusChanged(!statusChanged);
        setSuccessfulAction(data.message);
      }
    } catch (error) {
      console.log("Error :", error);
      setError("An error occurred while changing the folder name.");
    }
  };

  const handleInputChange = (e, id) => {
    const { value } = e.target;
    setFoldersEditName((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === id ? { ...folder, name: value } : folder
      )
    );
  };

  return (
    <div className={style.foldersList}>
      {folderList.map((folder, index) => {
        return (
          <div key={folder.id} className={style.folderContainer}>
            <div className={style.folderEditDataContainer}>
              {!showFolderOptions[index] && (
                <div className={style.deleteFolderSpace}></div>
              )}
              {showFolderOptions[index] && (
                <button
                  className={style.deleteFolder}
                  onClick={() => handleFolderDelete(folder.id)}
                  aria-label={`Click to delete the folder ${folder.name}`}
                >
                  <img src={DeleteSvg} />
                </button>
              )}

              <button
                className={style.folderBtn}
                onClick={() => setFolderId(folder.id)}
                aria-label={`Click to view the file inside the folder ${folder.name}`}
              >
                <img src={FolderSvg} />

                {!showFolderOptions[index] && <p>{folder.name}</p>}
              </button>

              <button
                className={style.folderEditBtn}
                onClick={() => handleToggleOption(index, folder.name)}
                aria-label={
                  showFolderOptions[index]
                    ? `Click to cancel folder ${folder.name} edit`
                    : `Click to edit the folder ${folder.name}`
                }
              >
                {showFolderOptions[index] ? (
                  <img src={CancelSvg} />
                ) : (
                  <img src={EditSvg} />
                )}
              </button>
            </div>

            {showFolderOptions[index] && (
              <form
                onSubmit={(event) => handleFolderEdit(event, index, folder.id)}
                className={style.folderEditForm}
              >
                <input
                  type="text"
                  name="folderName"
                  id="folderName"
                  value={foldersEditName[index].name}
                  onChange={(e) => handleInputChange(e, folder.id)}
                />
                <button
                  type="submit"
                  aria-label={`Click to save the new folder name`}
                >
                  <img src={Checkmark} />
                </button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
