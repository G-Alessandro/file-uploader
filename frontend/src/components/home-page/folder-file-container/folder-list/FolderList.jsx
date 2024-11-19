import { useState } from "react";
import Checkmark from "/assets/svg/checkmark.svg";
import DeleteSvg from "/assets/svg/delete.svg";
import EditSvg from "/assets/svg/edit.svg";
import CancelSvg from "/assets/svg/cancel.svg";

export default function FolderList({
  setError,
  folderList,
  setFolderId,
  setSuccessfulAction,
  statusChanged,
  setStatusChanged,
}) {
  const [showFolderOptions, setShowFolderOptions] = useState(
    Array(folderList.length).fill(false)
  );

  const handleToggleOption = (index) => {
    setShowFolderOptions((prevOptions) =>
      prevOptions.map((option, i) => (i === index ? !option : option))
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

  const handleFolderEdit = async (event, id) => {
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
        setStatusChanged(!statusChanged);
        setSuccessfulAction(data.message);
      }
    } catch (error) {
      console.log("Error :", error);
      setError("An error occurred while changing the folder name.");
    }
  };

  return (
    <div>
      {folderList.map((index, folder) => {
        return (
          <div key={folder.id}>
            {showFolderOptions[index] && (
              <button
                onClick={() => handleFolderDelete(folder.id)}
                aria-label={`Click to delete the folder ${folder.name}`}
              >
                <img src={DeleteSvg} />
              </button>
            )}

            <button
              onClick={() => handleToggleOption(index)}
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

            <button
              onClick={() => setFolderId(folder.id)}
              aria-label={`Click to view the file inside the folder ${folder.name}`}
            >
              <img src="" alt="" />

              {!showFolderOptions[index] && <p>{folder.name}</p>}

              {showFolderOptions[index] && (
                <form onSubmit={(event) => handleFolderEdit(event, folder.id)}>
                  <label htmlFor="folderName"></label>
                  <input
                    type="text"
                    name="folderName"
                    id="folderName"
                    placeholder={folder.name}
                  />
                  <button
                    type="submit"
                    onClick={() => handleToggleOption(index)}
                    aria-label={`Click to save the new folder name`}
                  >
                    <img src={Checkmark} />
                  </button>
                </form>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
