"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInToChat, signUpForChat } from "../../services/chat-access.service";

type Mode = "login" | "register";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget = searchParams.get("redirect") || "/";
  const isChatLogin = redirectTarget === "/chat";

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

  const pageClass = isChatLogin ? "aurosAccessPage" : "aurosMainAuthPage";
  const cardClass = isChatLogin ? "aurosAccessCard" : "aurosMainAuthCard";
  const overlineClass = isChatLogin ? "aurosWelcomeOverline" : "aurosMainOverline";
  const titleClass = isChatLogin ? "aurosWelcomeTitle" : "aurosMainTitle";
  const textClass = isChatLogin ? "aurosWelcomeText" : "aurosMainText";
  const tabsClass = isChatLogin ? "aurosAccessTabs" : "aurosMainTabs";
  const tabClass = isChatLogin ? "aurosAccessButton" : "aurosMainTab";
  const formClass = isChatLogin ? "aurosAccessForm" : "aurosMainForm";
  const gridClass = isChatLogin ? "aurosAccessGrid" : "aurosMainGrid";
  const inputClass = isChatLogin ? "aurosAccessInput" : "aurosMainInput";
  const primaryClass = isChatLogin ? "aurosAccessPrimary" : "aurosMainPrimary";
  const errorClass = isChatLogin ? "aurosAccessError" : "aurosMainNoticeError";
  const successClass = isChatLogin ? "aurosAccessSuccess" : "aurosMainNoticeSuccess";

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
    <section className={pageClass}>
      <div className={cardClass}>
        {!isChatLogin && <div className="aurosMainAuthGlow" />}

        <p className={overlineClass}>
          {isChatLogin ? "AUROSCHANNEL ACCESS" : "AUROS ACCOUNT"}
        </p>

        <h1 className={titleClass}>
          {mode === "login" ? "Login" : "Create Account"}
        </h1>

        <p className={textClass}>
          {isChatLogin
            ? "Sign in or register to continue to AUROSCHANNEL."
            : "Sign in or create your Auros account for community features, profiles, and protected areas."}
        </p>

        <div className={tabsClass}>
          <button
            type="button"
            className={`${tabClass} ${mode === "login" ? "active" : ""}`}
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
            className={`${tabClass} ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError(null);
              setMessage(null);
            }}
          >
            Register
          </button>
        </div>

        {error && <div className={errorClass}>{error}</div>}
        {message && <div className={successClass}>{message}</div>}

        {mode === "login" ? (
          <form className={formClass} onSubmit={handleLogin}>
            <input
              className={inputClass}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className={inputClass}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className={primaryClass} type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form className={formClass} onSubmit={handleRegister}>
            <div className={gridClass}>
              <input
                className={inputClass}
                placeholder="Display name"
                value={registerDisplayName}
                onChange={(e) => setRegisterDisplayName(e.target.value)}
              />

              <input
                className={inputClass}
                placeholder="Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
            </div>

            <input
              className={inputClass}
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />

            <div className={gridClass}>
              <input
                className={inputClass}
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />

              <input
                className={inputClass}
                type="password"
                placeholder="Confirm password"
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
              />
            </div>

            <button className={primaryClass} type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="aurosMainAuthPage">
          <div className="aurosMainAuthCard">
            <p className="aurosMainOverline">AUROS ACCOUNT</p>
            <h1 className="aurosMainTitle">Loading...</h1>
          </div>
        </section>
      }
    >
      <LoginContent />
    </Suspense>
  );
}