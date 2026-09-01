"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  getDevAccess,
} from "../../services/access.service";

type Status =
  | "loading"
  | "dev"
  | "logged-out"
  | "forbidden";

export default function DevPageGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    status,
    setStatus,
  ] =
    useState<Status>(
      "loading"
    );

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const access =
          await getDevAccess();

        if (!alive) {
          return;
        }

        if (!access.user) {
          setStatus(
            "logged-out"
          );

          return;
        }

        if (
          !access.hasDevAccess
        ) {
          setStatus(
            "forbidden"
          );

          return;
        }

        setStatus(
          "dev"
        );
      } catch (
        error
      ) {
        console.error(
          "DEV access lookup failed:",
          error
        );

        if (alive) {
          setStatus(
            "forbidden"
          );
        }
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  if (
    status ===
    "loading"
  ) {
    return (
      <>
        <div className="devGuardCard">
          <div className="devGuardEyebrow">
            AUROS DEVELOPMENT
          </div>

          <h1>
            Checking DEV
            access...
          </h1>

          <p>
            Your development
            permissions are
            being verified.
          </p>
        </div>

        <GuardStyles />
      </>
    );
  }

  if (
    status ===
    "logged-out"
  ) {
    return (
      <>
        <div className="devGuardCard">
          <div className="devGuardEyebrow">
            AUROS DEVELOPMENT
          </div>

          <h1>
            Login required
          </h1>

          <p>
            Sign in with an
            Auros account that
            has developer access
            before opening the
            Development Hub.
          </p>

          <Link
            href="/login"
            className="devGuardButton"
          >
            Go to Login
          </Link>
        </div>

        <GuardStyles />
      </>
    );
  }

  if (
    status ===
    "forbidden"
  ) {
    return (
      <>
        <div className="devGuardCard">
          <div className="devGuardEyebrow">
            AUROS DEVELOPMENT
          </div>

          <h1>
            DEV access required
          </h1>

          <p>
            Your account is
            signed in, but it
            does not currently
            have developer
            permissions.
          </p>

          <Link
            href="/"
            className="devGuardButton"
          >
            Back to Auros
          </Link>
        </div>

        <GuardStyles />
      </>
    );
  }

  return (
    <>
      {children}

      <GuardStyles />
    </>
  );
}

function GuardStyles() {
  return (
    <style jsx global>{`
      .devGuardCard {
        width:
          min(
            650px,
            calc(
              100% - 32px
            )
          );

        margin:
          72px
          auto;

        padding:
          36px;

        border:
          1px solid
          rgba(
            174,
            104,
            255,
            0.24
          );

        border-radius:
          26px;

        background:
          linear-gradient(
            145deg,
            rgba(
              30,
              16,
              48,
              0.97
            ),
            rgba(
              9,
              18,
              36,
              0.96
            )
          );

        box-shadow:
          0
          24px
          80px
          rgba(
            0,
            0,
            0,
            0.32
          ),
          inset
          0
          1px
          0
          rgba(
            255,
            255,
            255,
            0.04
          );

        color: white;
      }

      .devGuardEyebrow {
        margin-bottom:
          12px;

        color:
          #c79bff;

        font-size:
          11px;

        font-weight:
          850;

        letter-spacing:
          0.14em;
      }

      .devGuardCard h1 {
        margin: 0;

        font-size:
          clamp(
            26px,
            5vw,
            38px
          );
      }

      .devGuardCard p {
        margin:
          15px
          0
          0;

        color:
          #a7b7d3;

        line-height:
          1.7;
      }

      .devGuardButton {
        display:
          inline-flex;

        align-items:
          center;

        justify-content:
          center;

        min-height:
          42px;

        margin-top:
          24px;

        padding:
          10px
          17px;

        border:
          1px solid
          rgba(
            199,
            155,
            255,
            0.35
          );

        border-radius:
          12px;

        background:
          rgba(
            174,
            104,
            255,
            0.12
          );

        color:
          #f6efff;

        text-decoration:
          none;

        font-size:
          13px;

        font-weight:
          800;

        transition:
          transform
            140ms
            ease,
          background
            140ms
            ease,
          border-color
            140ms
            ease;
      }

      @media (
        hover: hover
      ) and (
        pointer: fine
      ) {
        .devGuardButton:hover {
          transform:
            translateY(
              -1px
            );

          background:
            rgba(
              174,
              104,
              255,
              0.18
            );

          border-color:
            rgba(
              199,
              155,
              255,
              0.55
            );
        }
      }

      .devGuardButton:focus-visible {
        outline:
          2px solid
          rgba(
            199,
            155,
            255,
            0.9
          );

        outline-offset:
          3px;
      }

      @media (
        max-width:
          700px
      ) {
        .devGuardCard {
          margin:
            42px
            auto;

          padding:
            26px
            22px;

          border-radius:
            22px;
        }
      }

      @media (
        prefers-reduced-motion:
          reduce
      ) {
        .devGuardButton {
          transition:
            none;
        }
      }
    `}</style>
  );
}