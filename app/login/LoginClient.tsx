"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { signInToChat, signUpForChat } from "../../services/chat-access.service";

type Mode = "login" | "register";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerDisplayName, setRegisterDisplayName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      await signInToChat({ email, password });

      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (registerPassword !== registerConfirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const result = await signUpForChat({
        email: registerEmail,
        password: registerPassword,
        username: registerUsername,
        displayName: registerDisplayName,
      });

      if (result.session) {
        router.push(redirectTarget);
        router.refresh();
        return;
      }

      setMessage("Account created. Please confirm your email if required, then sign in.");
      setMode("login");
      setEmail(registerEmail);
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="aurosAccessPage">
      <div className="aurosAccessCard">
        <p className="aurosWelcomeOverline">AUROS ACCOUNT</p>
        <h1 className="aurosWelcomeTitle">
          {mode === "login" ? "Login" : "Create Account"}
        </h1>

        <p className="aurosWelcomeText">
          {redirectTarget === "/chat"
            ? "Sign in or register to continue to AUROSCHANNEL."
            : "Sign in or create your Auros account."}
        </p>

        <div className="aurosAccessTabs">
          <button
            type="button"
            className={`aurosAccessButton ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={`aurosAccessButton ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError(null);
              setMessage(null);
            }}
          >
            Register
          </button>
        </div>

        {error && <div className="aurosAccessError">{error}</div>}
        {message && <div className="aurosAccessSuccess">{message}</div>}

        {mode === "login" ? (
          <form className="aurosAccessForm" onSubmit={handleLogin}>
            <input
              className="aurosAccessInput"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="aurosAccessInput"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="aurosAccessPrimary" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form className="aurosAccessForm" onSubmit={handleRegister}>
            <div className="aurosAccessGrid">
              <input
                className="aurosAccessInput"
                placeholder="Display name"
                value={registerDisplayName}
                onChange={(e) => setRegisterDisplayName(e.target.value)}
              />

              <input
                className="aurosAccessInput"
                placeholder="Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
            </div>

            <input
              className="aurosAccessInput"
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />

            <div className="aurosAccessGrid">
              <input
                className="aurosAccessInput"
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />

              <input
                className="aurosAccessInput"
                type="password"
                placeholder="Confirm password"
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
              />
            </div>

            <button className="aurosAccessPrimary" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}