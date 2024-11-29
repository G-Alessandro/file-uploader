import { useState } from "react";
import CancelSvg from "/assets/svg/cancel.svg";
import MissingFileSvg from "/assets/svg/missing-file.svg";
import SelectedFileSvg from "/assets/svg/selected-file.svg";
import style from "./AddFile.module.css";

export default function AddFile({
  setShowFileForm,
  setError,
  setSuccessfulAction,
  statusChanged,
  setStatusChanged,
  parentFolderId,
}) {
  const [previewFileImage, setPreviewFileImage] = useState(MissingFileSvg);
  const [showLoader, setShowLoader] = useState(false);

  const handleNewFileForm = async (event) => {
    event.preventDefault();
    setShowLoader(true);

    const formData = new FormData();
    formData.append("fileName", event.target.fileName.value);
    formData.append("folderId", parentFolderId);
    formData.append("category", event.target.category.value);
    formData.append("file", event.target.newFile.files[0]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/new-file`,
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError("Unable to save a new file");
        setShowLoader(false);
      } else {
        setSuccessfulAction(data.message);
        setShowFileForm(false);
        setShowLoader(false);
        setStatusChanged(!statusChanged);
      }
    } catch (error) {
      console.log("An error occurred while saving the new file:", error);
      setError("An error occurred while saving the new file.");
      setShowLoader(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewFileImage(imageUrl);
      return () => URL.revokeObjectURL(imageUrl);
    } else {
      setPreviewFileImage(SelectedFileSvg);
    }
  };

  const handleCancelFileImage = () => {
    const fileInput = document.getElementById("newFile");
    fileInput.value = "";
    setPreviewFileImage(MissingFileSvg);
  };

  return (
    <form onSubmit={handleNewFileForm} className={style.fileForm}>
      <button
        onClick={() => setShowFileForm(false)}
        className={style.fileFormCancelBtn}
        aria-label="close form"
      >
        <img src={CancelSvg} />
      </button>

      <div className={style.previewFileFormContainer}>
        <div className={style.previewFileImageContainer}>
          <img src={previewFileImage} />
        </div>

        <div className={style.fileDataContainer}>
          <label htmlFor="fileName">File name:</label>
          <input type="text" name="fileName" id="fileName" required />

          <div className={style.fileBtnContainer}>
            <input
              type="file"
              name="newFile"
              id="newFile"
              onChange={handleFileChange}
              required
            />
            <button type="button" onClick={handleCancelFileImage}>
              Cancel
            </button>
          </div>

          <label htmlFor="category">Category:</label>
          <select name="category" id="category">
            <option value="file">File</option>
            <option value="image">Image</option>
            <option value="music">Music</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
          </select>

          {!showLoader && (
            <button
              type="submit"
              className={style.fileFormSubmitBtn}
              aria-label="Create folder"
            >
              Save
            </button>
          )}
          {showLoader && <div className={style.loader}></div>}
        </div>
      </div>
    </form>
  );
}
