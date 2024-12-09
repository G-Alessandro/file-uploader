import { useState } from "react";
import FileImage from "/assets/svg/file-image.svg";
import DeleteSvg from "/assets/svg/delete.svg";
import style from "./FileList.module.css";

export default function FileList({
  setError,
  userId,
  fileList,
  statusChanged,
  setStatusChanged,
  setSuccessfulAction,
}) {
  const [showDeleteLoader, setShowDeleteLoader] = useState(
    Array(fileList.length).fill(false)
  );
  const [showDownloadLoader, setShowDownloadLoader] = useState(
    Array(fileList.length).fill(false)
  );

  const handleShowLoader = (index, loaderElement) => {
    if (loaderElement === "download") {
      setShowDownloadLoader((prevLoader) =>
        prevLoader.map((loader, i) => (i === index ? !loader : loader))
      );
    } else {
      setShowDeleteLoader((prevLoader) =>
        prevLoader.map((loader, i) => (i === index ? !loader : loader))
      );
    }
  };

  const handleDownloadFile = async (index, fileId) => {
    handleShowLoader(index, "download");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/download-files/${fileId}`
      );
      const data = await response.json();

      if (data.downloadUrl) {
        window.location.href = data.downloadUrl;
        handleShowLoader(index, "download");
      } else {
        setError("Error starting download.");
        handleShowLoader(index, "download");
      }
    } catch (error) {
      console.error("Download error:", error);
      setError("An error occurred while downloading the file.");
    }
  };

  const handleDeleteFile = async (index, fileId) => {
    handleShowLoader(index, "delete");
    const body = JSON.stringify({ fileId: fileId });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/remove-file`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          credentials: "include",
          body: body,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError("Unable to delete file");
        handleShowLoader(index, "delete");
      } else {
        handleShowLoader(index, "delete");
        setSuccessfulAction(data.message);
        setStatusChanged(!statusChanged);
      }
    } catch (error) {
      console.log("Error while deleting file:", error);
      setError("An error occurred while deleting the file.");
    }
  };

  return (
    <div className={style.tableContainer}>
      <table className={style.fileListContainer}>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Category</th>
            <th>Uploaded</th>
            {fileList[0].author && <th>Author</th>}
            <th>Size</th>
            <th></th>
            {userId && <th></th>}
          </tr>
        </thead>
        <tbody>
          {fileList.map((file, index) => {
            return (
              <tr key={file.id} className={style.fileDataContainer}>
                <td>
                  <img
                    src={
                      /\.(jpg|jpeg|png)$/i.test(file.url) ? file.url : FileImage
                    }
                  />
                </td>
                <td>{file.name}</td>
                <td>{file.category}</td>
                <td>{file.createdAt}</td>
                {file.author && (
                  <td>{file.userId === userId ? "You" : file.author}</td>
                )}
                <td>{file.size}</td>
                <td className={style.tableDataDownloadContainer}>
                  {showDownloadLoader[index] && (
                    <div className={style.loader}></div>
                  )}
                  {!showDownloadLoader[index] && (
                    <button
                      className={style.fileDownloadBtn}
                      onClick={() => handleDownloadFile(index, file.id)}
                      aria-label={`Click to download the file ${file.name}`}
                    >
                      Download
                    </button>
                  )}
                </td>
                {userId && (
                  <td className={style.tableDataDeleteContainer}>
                    {showDeleteLoader[index] && (
                      <div className={style.loader}></div>
                    )}
                    {!showDeleteLoader[index] && file.userId === userId && (
                      <button
                        className={style.fileDeleteBtn}
                        onClick={() => handleDeleteFile(index, file.id)}
                        aria-label={`Delete file ${file.name}`}
                      >
                        <img src={DeleteSvg} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
