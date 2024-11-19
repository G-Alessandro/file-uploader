import { useState } from "react";
import Login from "./log-in/Login";
import CreateAccount from "./create-account/CreateAccount";
// import style from "./AuthenticationPage.module.css";

export default function LoginPage() {
  const [createAccount, setCreateAccount] = useState(false);

  return (
    <div >
      {!createAccount && <Login setCreateAccount={setCreateAccount} />}
      {createAccount && <CreateAccount setCreateAccount={setCreateAccount} />}
    </div>
  );
}
