"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  getAdminAccess,
} from "../../services/admin-service";

type Status =
  | "loading"
  | "admin"
  | "logged-out"
  | "forbidden";

export default function AdminPageGuard({
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
          await getAdminAccess();

        if (!alive) {
          return;
        }

        if (
          !access.user
        ) {
          setStatus(
            "logged-out"
          );

          return;
        }

        if (
          !access.isAdmin
        ) {
          setStatus(
            "forbidden"
          );

          return;
        }

        setStatus(
          "admin"
        );
      } catch (
        error
      ) {
        console.error(
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
      <div className="adminGuardCard">
        Loading admin
        access...
      </div>
    );
  }

  if (
    status ===
    "logged-out"
  ) {
    return (
      <div className="adminGuardCard">
        <h1>
          Admin Login
          Required
        </h1>

        <p>
          Sign in before
          opening the Auros
          administration.
        </p>

        <Link
          href="/admin"
          className="adminGuardButton"
        >
          Go to Admin Login
        </Link>

        <GuardStyles />
      </div>
    );
  }

  if (
    status ===
    "forbidden"
  ) {
    return (
      <div className="adminGuardCard">
        <h1>
          Access denied
        </h1>

        <p>
          Your account does
          not have admin
          permissions.
        </p>

        <Link
          href="/"
          className="adminGuardButton"
        >
          Back to Auros
        </Link>

        <GuardStyles />
      </div>
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
      .adminGuardCard {
        max-width: 650px;
        margin: 70px auto;

        padding: 36px;

        border:
          1px solid
          rgba(
            118,
            153,
            214,
            0.18
          );

        border-radius:
          24px;

        background:
          rgba(
            10,
            19,
            38,
            0.94
          );

        color: white;
      }

      .adminGuardCard p {
        color:
          #98aac7;

        line-height: 1.7;
      }

      .adminGuardButton {
        display:
          inline-flex;

        padding:
          11px 16px;

        margin-top:
          10px;

        color:
          #05101c;

        border-radius:
          12px;

        background:
          linear-gradient(
            90deg,
            #63ddff,
            #8b72ff
          );

        font-weight:
          900;

        text-decoration:
          none;
      }
    `}</style>
  );
}