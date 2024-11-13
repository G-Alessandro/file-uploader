import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import LogoutSvg from "/assets/svg/logout.svg";

export default function TopBar() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
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
      {error && <h1>{error}</h1>}
      {userData && (
        <div>
          <h2>
            {userData.userData.firstName + " " + userData.userData.lastName}
          </h2>
          {/* {showLoader && <div className={style.loader}></div>} */}
          {showLoader === false && (
            <button onClick={handleLogout} aria-label="Log out of the site">
              <img src="" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
