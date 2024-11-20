export default function FileList({
  setError,
  fileList,
  statusChanged,
  setStatusChanged,
  setSuccessfulAction,
}) {
  const handleDownloadFile = async (fileId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/download-files/${fileId}`
      );
      const data = await response.json();

      if (data.downloadUrl) {
        window.location.href = data.downloadUrl;
      } else {
        setError("Error starting download.");
      }
    } catch (error) {
      console.error("Download error:", error);
      setError("An error occurred while downloading the file.");
    }
  };

  const handleDeleteFile = async (fileId) => {
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
      } else {
        setSuccessfulAction(data.message);
        setStatusChanged(!statusChanged);
      }
    } catch (error) {
      console.log("Error while deleting file:", error);
      setError("An error occurred while deleting the file.");
    }
  };

  return (
    <div>
      {fileList.map((file) => {
        return (
          <div key={file.id}>
            <img src="" />
            <h3>{file.name}</h3>
            <p>{file.category}</p>
            <p>{file.createdAt}</p>
            <p>{file.size}</p>
            <button
              onClick={() => handleDownloadFile(file.id)}
              aria-label={`Click to download the file ${file.name}`}
            >
              Download
            </button>

            <button
              onClick={() => handleDeleteFile(file.id)}
              aria-label={`Delete file ${file.name}`}
            >
              <img />
            </button>
          </div>
        );
      })}
    </div>
  );
}
