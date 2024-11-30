import { useState, useEffect } from "react";
import TopBar from "./top-bar/TopBar";
import FolderFileContainer from "./folder-file-container/FolderFileContainer";

export default function HomePage() {
  const [error, setError] = useState(null);
  const [successfulAction, setSuccessfulAction] = useState(null);
  const [statusChanged, setStatusChanged] = useState(false);
  const [parentFolderId, setParentFolderId] = useState(null);

  useEffect(() => {
    if (error !== null) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successfulAction !== null) {
      const timer = setTimeout(() => setSuccessfulAction(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [successfulAction]);

  return (
    <div>
      <TopBar
        error={error}
        setError={setError}
        successfulAction={successfulAction}
        setSuccessfulAction={setSuccessfulAction}
        statusChanged={statusChanged}
        setStatusChanged={setStatusChanged}
        parentFolderId={parentFolderId}
      />
      <FolderFileContainer
        error={error}
        setError={setError}
        setSuccessfulAction={setSuccessfulAction}
        statusChanged={statusChanged}
        setStatusChanged={setStatusChanged}
        parentFolderId={parentFolderId}
        setParentFolderId={setParentFolderId}
      />
    </div>
  );
}
