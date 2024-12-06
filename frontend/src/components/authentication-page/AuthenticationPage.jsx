import { useState, useEffect } from "react";
import Login from "./log-in/Login";
import CreateAccount from "./create-account/CreateAccount";
import FileList from "../home-page/folder-file-container/file-list/FileList";
import style from "./AuthenticationPage.module.css";

export default function LoginPage() {
  const [error, setError] = useState(null);
  const [latestSharedFiles, setLatestSharedFiles] = useState(null);
  const [createAccount, setCreateAccount] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/shared-files`,
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
          setLatestSharedFiles(data.files);
        }
      } catch (error) {
        console.log("An error occurred while finding data:", error);
        setError("An error occurred while finding data.");
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    console.log(latestSharedFiles);
  }, [latestSharedFiles]);
  return (
    <div className={style.authenticationPageContainer}>
      <div>
        {!createAccount && <Login setCreateAccount={setCreateAccount} />}
        {createAccount && <CreateAccount setCreateAccount={setCreateAccount} />}
      </div>
      {error && <h2>{error}</h2>}
      {latestSharedFiles && latestSharedFiles.length > 0 && (
        <div className={style.latestSharedFiles}>
          <h2>Latest Shared Files</h2>
          <FileList setError={setError} fileList={latestSharedFiles} />
        </div>
      )}
    </div>
  );
}
