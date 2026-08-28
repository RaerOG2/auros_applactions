"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  signInToChat,
  signUpForChat,
} from "../../services/chat-access.service";

type Mode = "login" | "register";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget =
    searchParams.get("redirect") || "/";

  const [mode, setMode] =
    useState<Mode>("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [registerEmail, setRegisterEmail] =
    useState("");

  const [registerUsername, setRegisterUsername] =
    useState("");

  const [
    registerDisplayName,
    setRegisterDisplayName,
  ] = useState("");

  const [registerPassword, setRegisterPassword] =
    useState("");

  const [registerConfirm, setRegisterConfirm] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function handleLogin(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      await signInToChat({
        email,
        password,
      });

      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      setError(
        err?.message ||
          "Login failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      registerPassword !==
      registerConfirm
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const result =
        await signUpForChat({
          email: registerEmail,
          password: registerPassword,
          username: registerUsername,
          displayName:
            registerDisplayName,
        });

      if (result.session) {
        router.push(
          redirectTarget
        );

        router.refresh();

        return;
      }

      setMessage(
        "Account created. Please confirm your email if required, then sign in."
      );

      setMode("login");

      setEmail(
        registerEmail
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(
    nextMode: Mode
  ) {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  }

  return (
    <>
      <section className="accountPage">
        <div className="accountWrapper">
          {/* ==================================================
              LEFT
          ================================================== */}

          <aside className="accountIntro">
            <Link
              href="/"
              className="accountBrand"
            >
              <img
                src="/auros_royale_pfp_draft_1.png"
                alt="Auros Royale"
              />

              <div>
                <strong>
                  AUROS ROYALE
                </strong>

                <span>
                  OFFICIAL WEBSITE
                </span>
              </div>
            </Link>

            <div className="introMain">
              <div className="accountEyebrow">
                AUROS ACCOUNT
              </div>

              <h1>
                Your gateway
                <br />
                to Auros.
              </h1>

              <p>
                One account for the
                Auros community and
                future community
                features.
              </p>

              <div className="featureList">
                <Feature
                  number="01"
                  title="Community"
                  text="Connect with the world around Auros."
                />

                <Feature
                  number="02"
                  title="One Account"
                  text="Your identity across future Auros systems."
                />

                <Feature
                  number="03"
                  title="More to come"
                  text="New community features will expand over time."
                />
              </div>
            </div>

            <div className="introFooter">
              AUROS WEBSITE 1.2.0
              <span />
              COMMUNITY UPDATE
            </div>
          </aside>

          {/* ==================================================
              RIGHT
          ================================================== */}

          <main className="accountPanel">
            <div className="panelInner">
              <div className="mobileBrand">
                <Link href="/">
                  <img
                    src="/auros_royale_pfp_draft_1.png"
                    alt="Auros Royale"
                  />

                  <strong>
                    AUROS ROYALE
                  </strong>
                </Link>
              </div>

              <div className="accountHeader">
                <div className="accountEyebrow">
                  {mode === "login"
                    ? "WELCOME BACK"
                    : "JOIN AUROS"}
                </div>

                <h2>
                  {mode === "login"
                    ? "Sign in"
                    : "Create account"}
                </h2>

                <p>
                  {mode === "login"
                    ? "Enter your details to access your Auros account."
                    : "Create your Auros account and become part of the community."}
                </p>
              </div>

              {/* ==================================================
                  TABS
              ================================================== */}

              <div className="accountTabs">
                <button
                  type="button"
                  className={
                    mode === "login"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    switchMode(
                      "login"
                    )
                  }
                >
                  Sign In
                </button>

                <button
                  type="button"
                  className={
                    mode === "register"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    switchMode(
                      "register"
                    )
                  }
                >
                  Register
                </button>
              </div>

              {error && (
                <div className="accountMessage error">
                  {error}
                </div>
              )}

              {message && (
                <div className="accountMessage success">
                  {message}
                </div>
              )}

              {/* ==================================================
                  LOGIN
              ================================================== */}

              {mode === "login" ? (
                <form
                  className="accountForm"
                  onSubmit={
                    handleLogin
                  }
                >
                  <Field
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                  />

                  <Field
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                  />

                  <button
                    className="primaryButton"
                    type="submit"
                    disabled={
                      submitting
                    }
                  >
                    <span>
                      {submitting
                        ? "Signing in..."
                        : "Sign In"}
                    </span>

                    {!submitting && (
                      <span>
                        →
                      </span>
                    )}
                  </button>
                </form>
              ) : (
                <form
                  className="accountForm"
                  onSubmit={
                    handleRegister
                  }
                >
                  <div className="formGrid">
                    <Field
                      label="Display name"
                      placeholder="Your name"
                      value={
                        registerDisplayName
                      }
                      onChange={
                        setRegisterDisplayName
                      }
                      autoComplete="name"
                    />

                    <Field
                      label="Username"
                      placeholder="username"
                      value={
                        registerUsername
                      }
                      onChange={
                        setRegisterUsername
                      }
                      autoComplete="username"
                    />
                  </div>

                  <Field
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    value={
                      registerEmail
                    }
                    onChange={
                      setRegisterEmail
                    }
                    autoComplete="email"
                  />

                  <div className="formGrid">
                    <Field
                      label="Password"
                      type="password"
                      placeholder="Password"
                      value={
                        registerPassword
                      }
                      onChange={
                        setRegisterPassword
                      }
                      autoComplete="new-password"
                    />

                    <Field
                      label="Confirm password"
                      type="password"
                      placeholder="Repeat password"
                      value={
                        registerConfirm
                      }
                      onChange={
                        setRegisterConfirm
                      }
                      autoComplete="new-password"
                    />
                  </div>

                  <button
                    className="primaryButton"
                    type="submit"
                    disabled={
                      submitting
                    }
                  >
                    <span>
                      {submitting
                        ? "Creating account..."
                        : "Create Account"}
                    </span>

                    {!submitting && (
                      <span>
                        →
                      </span>
                    )}
                  </button>
                </form>
              )}

              <div className="accountBottom">
                <Link href="/">
                  ← Back to Auros
                </Link>

                <span>
                  Secure Auros Account
                </span>
              </div>
            </div>
          </main>
        </div>
      </section>

      <style jsx global>{`
        /* =====================================================
           PAGE
        ===================================================== */

        .accountPage {
          width: 100%;

          display: flex;
          justify-content: center;
          align-items: center;

          padding:
            18px
            0
            35px;
        }

        .accountWrapper {
          width: 100%;
          max-width: 1050px;

          display: grid;

          grid-template-columns:
            minmax(300px, 0.8fr)
            minmax(390px, 1.2fr);

          overflow: hidden;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.16
            );

          border-radius: 24px;

          background:
            rgba(
              7,
              14,
              29,
              0.96
            );

          box-shadow:
            0 25px 80px
            rgba(
              0,
              0,
              0,
              0.3
            );
        }

        /* =====================================================
           LEFT
        ===================================================== */

        .accountIntro {
          position: relative;

          min-width: 0;

          display: flex;
          flex-direction: column;

          padding:
            24px
            26px;

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(
                99,
                221,
                255,
                0.12
              ),
              transparent 40%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(
                139,
                114,
                255,
                0.14
              ),
              transparent 44%
            ),
            #07111f;

          border-right:
            1px solid
            rgba(
              118,
              153,
              214,
              0.1
            );
        }

        .accountBrand {
          display: flex;
          align-items: center;
          gap: 10px;

          width: fit-content;

          color: white;

          text-decoration: none;
        }

        .accountBrand img {
          width: 38px;
          height: 38px;

          object-fit: cover;

          border-radius: 11px;
        }

        .accountBrand strong {
          display: block;

          font-size: 11px;
        }

        .accountBrand span {
          display: block;

          margin-top: 2px;

          color: #607594;

          font-size: 7px;

          letter-spacing:
            0.13em;
        }

        .introMain {
          margin:
            45px
            0
            35px;
        }

        .accountEyebrow {
          color: #63ddff;

          font-size: 12px;
          font-weight: 900;

          letter-spacing:
            0.13em;
        }

        .accountIntro h1 {
          margin:
            12px
            0;

          color: white;

          font-size:
            clamp(
              38px,
              4vw,
              51px
            );

          line-height: 0.95;

          letter-spacing:
            -0.05em;
        }

        .introMain > p {
          max-width: 330px;

          margin:
            0
            0
            24px;

          color: #8ea3c3;

          font-size: 12px;

          line-height: 1.65;
        }

        .featureList {
          display: grid;
          gap: 7px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 9px;

          padding: 9px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.1
            );

          border-radius: 11px;

          background:
            rgba(
              8,
              18,
              36,
              0.48
            );
        }

        .featureNumber {
          width: 27px;
          height: 27px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 8px;

          background:
            rgba(
              99,
              221,
              255,
              0.07
            );

          color: #63ddff;

          font-size: 7px;
          font-weight: 900;
        }

        .feature strong {
          display: block;

          font-size: 9px;
        }

        .feature small {
          display: block;

          margin-top: 1px;

          color: #607594;

          font-size: 7px;
        }

        .introFooter {
          margin-top: auto;

          display: flex;
          align-items: center;
          gap: 7px;

          color: #506683;

          font-size: 7px;

          letter-spacing:
            0.08em;
        }

        .introFooter span {
          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #63ddff;
        }

        /* =====================================================
           RIGHT
        ===================================================== */

        .accountPanel {
          min-width: 0;

          display: flex;
          align-items: center;

          padding:
            40px
            45px;

          background:
            rgba(
              7,
              14,
              29,
              0.97
            );
        }

        .panelInner {
          width: 100%;
          max-width: 450px;

          margin: 0 auto;
        }

        .mobileBrand {
          display: none;
        }

        .accountHeader {
          margin-bottom: 18px;
        }

        .accountHeader h2 {
          margin:
            6px
            0;

          font-size: 36px;

          line-height: 1;

          letter-spacing:
            -0.04em;
        }

        .accountHeader p {
          margin: 0;

          color: #8498b8;

          font-size: 14px;

          line-height: 1.55;
        }

        /* =====================================================
           TABS
        ===================================================== */

        .accountTabs {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 4px;

          padding: 4px;

          margin-bottom: 18px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.13
            );

          border-radius: 11px;

          background:
            rgba(
              9,
              19,
              38,
              0.74
            );
        }

        .accountTabs button {
          min-height: 35px;

          border: 0;

          border-radius: 8px;

          background:
            transparent;

          color: #7186a6;

          font-size: 12px;
          font-weight: 850;

          cursor: pointer;
        }

        .accountTabs button.active {
          color: white;

          background:
            linear-gradient(
              100deg,
              rgba(
                99,
                221,
                255,
                0.12
              ),
              rgba(
                139,
                114,
                255,
                0.12
              )
            );

          box-shadow:
            inset 0 0 0 1px
            rgba(
              99,
              221,
              255,
              0.12
            );
        }

        /* =====================================================
           FORM
        ===================================================== */

        .accountForm {
          display: grid;
          gap: 12px;
        }

        .formGrid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 10px;
        }

        .field {
          min-width: 0;

          display: grid;

          gap: 5px;
        }

        .field label {
          color: #a3b3ca;

          font-size: 11px;
          font-weight: 850;
        }

        .field input {
          width: 100%;
          height: 48px;

          padding:
            0
            12px;

          outline: none;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          border-radius: 10px;

          background:
            rgba(
              5,
              13,
              27,
              0.86
            );

          color: white;

          font-size: 14px;
        }

        .field input::placeholder {
          color: #506683;
        }

        .field input:focus {
          border-color:
            rgba(
              99,
              221,
              255,
              0.5
            );

          box-shadow:
            0 0 0 3px
            rgba(
              99,
              221,
              255,
              0.05
            );
        }

        /* =====================================================
           BUTTON
        ===================================================== */

        .primaryButton {
          width: 100%;
          min-height: 48px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          margin-top: 2px;

          padding:
            0
            14px;

          border: 0;

          border-radius: 11px;

          background:
            linear-gradient(
              100deg,
              #63ddff,
              #8b81ff
            );

          color: #04101a;

          font-size: 13px;
          font-weight: 950;

          cursor: pointer;
        }

        .primaryButton:disabled {
          opacity: 0.55;

          cursor: not-allowed;
        }

        /* =====================================================
           MESSAGE
        ===================================================== */

        .accountMessage {
          margin-bottom: 12px;

          padding: 9px 11px;

          border-radius: 9px;

          font-size: 12px;

          line-height: 1.5;
        }

        .accountMessage.error {
          color: #ffb2bd;

          background:
            rgba(
              255,
              70,
              90,
              0.06
            );

          border:
            1px solid
            rgba(
              255,
              80,
              100,
              0.15
            );
        }

        .accountMessage.success {
          color: #a7f2ce;

          background:
            rgba(
              50,
              210,
              145,
              0.06
            );

          border:
            1px solid
            rgba(
              65,
              220,
              150,
              0.15
            );
        }

        /* =====================================================
           BOTTOM
        ===================================================== */

        .accountBottom {
          display: flex;

          justify-content: space-between;
          align-items: center;

          gap: 12px;

          margin-top: 16px;

          padding-top: 13px;

          border-top:
            1px solid
            rgba(
              118,
              153,
              214,
              0.08
            );

          color: #4f6685;

          font-size: 10px;
        }

        .accountBottom a {
          color: #7187a8;

          text-decoration: none;
        }

        .accountBottom a:hover {
          color: #63ddff;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 900px) {
          .accountWrapper {
            max-width: 600px;

            grid-template-columns:
              1fr;
          }

          .accountIntro {
            display: none;
          }

          .accountPanel {
            padding:
              30px
              26px;
          }

          .mobileBrand {
            display: block;

            margin-bottom: 28px;
          }

          .mobileBrand a {
            width: fit-content;

            display: flex;

            align-items: center;

            gap: 9px;

            color: white;

            text-decoration: none;
          }

          .mobileBrand img {
            width: 36px;
            height: 36px;

            border-radius: 10px;
          }

          .mobileBrand strong {
            font-size: 10px;
          }
        }

        @media (max-width: 540px) {
          .accountPage {
            padding:
              8px
              0
              25px;
          }

          .accountWrapper {
            border-radius: 18px;
          }

          .accountPanel {
            padding:
              24px
              18px;
          }

          .formGrid {
            grid-template-columns:
              1fr;
          }

          .accountHeader h2 {
            font-size: 27px;
          }

          .accountBottom {
            align-items:
              flex-start;

            flex-direction:
              column;
          }
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  autoComplete?: string;
}) {
  return (
    <div className="field">
      <label>
        {label}
      </label>

      <input
        type={type}
        placeholder={
          placeholder
        }
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        autoComplete={
          autoComplete
        }
        required
      />
    </div>
  );
}

function Feature({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="feature">
      <div className="featureNumber">
        {number}
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <small>
          {text}
        </small>
      </div>
    </div>
  );
}