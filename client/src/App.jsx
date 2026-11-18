import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import { Toasts, useToasts } from "./components/Toasts";
import { load, save } from "./storage";

// App decides which page to show: no token -> AuthPage, token -> Dashboard.
export default function App() {
  const [token, setToken] = useState(() => load("token"));
  const [email, setEmail] = useState(() => load("email"));
  const { toasts, notify, dismiss } = useToasts();

  function handleLogin(newToken, userEmail) {
    save("token", newToken);
    save("email", userEmail);
    setToken(newToken);
    setEmail(userEmail);
  }

  function handleLogout(message = "You are logged out") {
    save("token", null);
    save("email", null);
    setToken(null);
    setEmail(null);
    notify(message);
  }

  return (
    <>
      {token ? (
        <Dashboard token={token} email={email} onLogout={handleLogout} notify={notify} />
      ) : (
        <AuthPage onLogin={handleLogin} notify={notify} />
      )}
      <Toasts toasts={toasts} dismiss={dismiss} />
    </>
  );
}
