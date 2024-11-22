import { useState } from "react";
import CancelSvg from "/assets/svg/cancel.svg";

export default function AddFolder({
  setShowFileForm,
  setError,
  setSuccessfulAction,
  statusChanged,
  setStatusChanged,
  parentFolderId,
}) {
  const [showLoader, setShowLoader] = useState(false);

  const handleNewFolderForm = async (event) => {
    event.preventDefault();
    const bodyData = JSON.stringify({
      folderName: event.target.folderName.value,
      parentFolderId: parentFolderId,
      shareFolder: event.target.shareFolder.value === "true" ? true : false,
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
        setError("Unable to create a new folder");
      } else {
        setSuccessfulAction(data.message);
        setShowFileForm(false);
        setShowLoader(false);
        setStatusChanged(!statusChanged);
      }
    } catch (error) {
      console.log("An error occurred while creating a new folder", error);
      setError("An error occurred while creating a new folder.");
    }
  };

  return (
    <form onSubmit={handleNewFolderForm}>
      <button onClick={() => setShowFileForm(false)} aria-label="Close form">
        <img src={CancelSvg} />
      </button>
      <label htmlFor="folderName">Folder name:</label>
      <input type="text" name="folderName" id="folderName" required />

      <p>Is this a shared folder?</p>
      <label htmlFor="yes">yes</label>
      <input type="radio" id="yes" name="shareFolder" value="true" />
      <label htmlFor="no">no</label>
      <input
        type="radio"
        id="no"
        name="shareFolder"
        value="false"
        defaultChecked
      />

      {!showLoader && (
        <button
          type="submit"
          onClick={() => setShowLoader(true)}
          aria-label="Create fodler"
        >
          Create
        </button>
      )}
      {showLoader && <div></div>}
    </form>
  );
}
