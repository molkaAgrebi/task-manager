import { useState } from "react";
import { api } from "../api";
import ThemeToggle from "../components/ThemeToggle";
import Logo from "../components/Logo";

// One page for both "Log in" and "Create account": `mode` switches between them.
export default function AuthPage({ onLogin, notify }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState(null); // "email", "password" or "both"
  const [loading, setLoading] = useState(false);

  function showError(message, field) {
    setError(message);
    setErrorField(field);
  }

  const isRegister = mode === "register";

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    showError("", null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    showError("", null);

    // Quick checks in the browser (the server checks again).
    const cleanEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return showError("Please enter a valid email address.", "email");
    }
    if (isRegister && password.length < 8) {
      return showError("Your password needs at least 8 characters.", "password");
    }
    if (!password) {
      return showError("Please enter your password.", "password");
    }

    setLoading(true);
    try {
      if (isRegister) {
        await api.register(cleanEmail, password);
      }
      // After registering, we log in directly so the user doesn't type twice.
      const { token } = await api.login(cleanEmail, password);
      notify(isRegister ? "Account created — welcome!" : "Welcome back!");
      onLogin(token, cleanEmail);
    } catch (err) {
      showError(err.message, "both");
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      {/* Left column: animated gradient + pitch */}
      <aside className="auth__visual" aria-hidden="true">
        <div className="blob blob--1" />
        <div className="blob blob--2" />
        <div className="blob blob--3" />
        <div className="auth__pitch">
          <Logo />
          <h2>Clear your mind.<br />Ship your day.</h2>
          <p>A calm place for everything you need to get done.</p>
        </div>
      </aside>

      {/* Right column: form */}
      <main className="auth__panel">
        <div className="auth__top">
          <span className="auth__mobile-logo"><Logo /></span>
          <ThemeToggle />
        </div>

        <div className="auth__card glass">
          <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p className="muted">
            {isRegister
              ? "Start organising your tasks in seconds."
              : "Log in to see your tasks."}
          </p>

          <form onSubmit={handleSubmit} noValidate aria-describedby={error ? "auth-error" : undefined}>
            {/* Floating labels: placeholder=" " lets CSS know when the field is empty */}
            <div className="field">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errorField === "email" || errorField === "both"}
                required
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="field">
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={errorField === "password" || errorField === "both"}
                aria-describedby={isRegister ? "password-hint" : undefined}
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            {isRegister && (
              <p id="password-hint" className="hint">At least 8 characters.</p>
            )}

            {error && (
              <p id="auth-error" className="form-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn--primary btn--block" disabled={loading} aria-busy={loading}>
              {loading && <span className="spinner" aria-hidden="true" />}
              {loading
                ? isRegister ? "Creating account…" : "Logging in…"
                : isRegister ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="auth__switch">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <button type="button" className="link-btn" onClick={switchMode}>
              {isRegister ? "Log in" : "Create an account"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
