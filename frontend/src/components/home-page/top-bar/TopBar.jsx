import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutSvg from "/assets/svg/logout.svg";
import AddFolderSvg from "/assets/svg/add-folder.svg";
import AddFileSvg from "/assets/svg/add-file.svg";
import AddFile from "./add-file/AddFile";
import AddFolder from "./add-folder/AddFolder";

export default function TopBar({
  error,
  setError,
  successfulAction,
  setSuccessfulAction,
  statusChanged,
  setStatusChanged,
  parentFolderId,
}) {
  const [userData, setUserData] = useState(null);
  const [showFileForm, setShowFileForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const authenticationCheck = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/authentication-check`,
          {
            method: "GET",
            credentials: "include",
            mode: "cors",
          }
        );

        const data = await response.json();
        if (!data.authenticated) {
          navigate("/authentication-page");
        }
      } catch (error) {
        console.log("Error checking authentication:", error);
        navigate("/authentication-page");
      }
    };

    authenticationCheck();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/user-data`,
          {
            method: "GET",
            credentials: "include",
            mode: "cors",
          }
        );

        const data = await response.json();
        if (!response.ok) {
          setError(data.error);
        } else {
          setUserData(data);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
        setError("Error fetching user data");
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async (event) => {
    event.preventDefault();
    setShowLoader(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/logout`,
        {
          method: "GET",
          credentials: "include",
          mode: "cors",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowLoader(false);
        navigate("/authentication-page");
      } else {
        console.error("Logout error:", data);
      }
    } catch (error) {
      console.log("Error requesting registration:", error);
    }
  };

  return (
    <>
      {error === null && userData === null && <h3>Loading...</h3>}
      {userData && (
        <div>
          <button>
            <img src={AddFolderSvg} />
          </button>
          <button>
            <img src={AddFileSvg} />
          </button>
          <h2>
            {userData.userData.firstName + " " + userData.userData.lastName}
          </h2>
          {showLoader && <div></div>}
          {showLoader === false && (
            <button onClick={handleLogout} aria-label="Log out of the site">
              <img src={LogoutSvg} />
            </button>
          )}
          {showFileForm && (
            <AddFile
              setError={setError}
              setSuccessfulAction={setSuccessfulAction}
              setShowFileForm={setShowFileForm}
              statusChanged={statusChanged}
              setStatusChanged={setStatusChanged}
              parentFolderId={parentFolderId}
            />
          )}
          {showFolderForm && (
            <AddFolder
              setError={setError}
              setSuccessfulAction={setSuccessfulAction}
              setShowFolderForm={setShowFolderForm}
              statusChanged={statusChanged}
              setStatusChanged={setStatusChanged}
              parentFolderId={parentFolderId}
            />
          )}
        </div>
      )}
      {successfulAction && <h2>{successfulAction}</h2>}
      {error && <h2>{error}</h2>}
    </>
  );
}
