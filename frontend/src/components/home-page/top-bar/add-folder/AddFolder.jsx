import { useState } from "react";
import CancelSvg from "/assets/svg/cancel.svg";
import style from "./AddFolder.module.css";

export default function AddFolder({
  setShowFolderForm,
  setError,
  setSuccessfulAction,
  statusChanged,
  setStatusChanged,
  parentFolderId,
}) {
  const [showLoader, setShowLoader] = useState(false);

  const handleNewFolderForm = async (event) => {
    event.preventDefault();
    setShowLoader(true);
    const bodyData = JSON.stringify({
      folderName: event.target.folderName.value,
      parentFolderId: parentFolderId,
      shareFolder: event.target.shareFolder.value,
    });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/new-folder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          credentials: "include",
          body: bodyData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setShowLoader(false);
        setError("Unable to create a new folder");
      } else {
        setSuccessfulAction(data.message);
        setShowFolderForm(false);
        setShowLoader(false);
        setStatusChanged(!statusChanged);
      }
    } catch (error) {
      console.log("An error occurred while creating a new folder", error);
      setError("An error occurred while creating a new folder.");
      setShowLoader(false);
    }
  };

  return (
    <form onSubmit={handleNewFolderForm} className={style.folderForm}>
      <button
        onClick={() => setShowFolderForm(false)}
        className={style.folderFormCancelBtn}
        aria-label="Close form"
      >
        <img src={CancelSvg} />
      </button>
      <label htmlFor="folderName">Folder name:</label>
      <input
        type="text"
        minLength="1"
        maxLength="40"
        name="folderName"
        id="folderName"
        required
      />

      <p>Is this a shared folder?</p>
      <div className={style.inputRadioContainer}>
        <label htmlFor="yes">Yes</label>
        <input type="radio" id="yes" name="shareFolder" value="true" />
        <label htmlFor="no">No</label>
        <input
          type="radio"
          id="no"
          name="shareFolder"
          value="false"
          defaultChecked
        />
      </div>

      {!showLoader && (
        <button
          type="submit"
          className={style.folderFormSubmitBtn}
          aria-label="Create folder"
        >
          Save
        </button>
      )}
      {showLoader && <div className={style.loader}></div>}
    </form>
  );
}
