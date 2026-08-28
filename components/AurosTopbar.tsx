"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type PageKey =
  | "home"
  | "map"
  | "news"
  | "gallery"
  | "patchnotes"
  | "apply"
  | "status"
  | "faq"
  | "contact"
  | "admin"
  | "login";

export default function AurosTopbar({
  current,
}: {
  current?: PageKey;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!alive) {
        return;
      }

      setIsLoggedIn(!!data.user);

      if (!data.user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();

      if (alive) {
        setIsAdmin(!!profile?.is_admin);
      }
    }

    load();

    const { data: listener } =
      supabase.auth.onAuthStateChange(load);

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const nav = [
    ["Home", "/", "home"],
    ["Map", "/map", "map"],
    ["News", "/news", "news"],
    ["Patchnotes", "/patchnotes", "patchnotes"],
    ["Gallery", "/gallery", "gallery"],
  ] as const;

  return (
    <header
      style={{
        position: "sticky",
        top: 14,
        zIndex: 50,
        marginBottom: 32,
      }}
    >
      <div
        className="auros-card"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            gap: 11,
            alignItems: "center",
            textDecoration: "none",
            color: "white",
          }}
        >
          <img
            src="/auros_royale_pfp_draft_1.png"
            alt="Auros Royale"
            width={44}
            height={44}
            style={{
              borderRadius: 14,
              objectFit: "cover",
            }}
          />

          <div>
            <strong
              style={{
                fontSize: 17,
              }}
            >
              AUROS ROYALE
            </strong>

            <div
              style={{
                color: "#91a6c7",
                fontSize: 11,
                marginTop: 3,
                letterSpacing: ".08em",
              }}
            >
              OFFICIAL WEBSITE
            </div>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            gap: 7,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {nav.map(([label, href, key]) => (
            <NavLink
              key={href}
              label={label}
              href={href}
              active={current === key}
            />
          ))}

          <NavLink
            label="Apply"
            href="/apply"
            active={current === "apply"}
            subtle
          />

          <NavLink
            label="Status"
            href="/status"
            active={current === "status"}
            subtle
          />

          {isAdmin && (
            <NavLink
              label="Admin"
              href="/admin"
              active={current === "admin"}
            />
          )}

          {!isLoggedIn && (
            <NavLink
              label="Login"
              href="/login"
              active={current === "login"}
              subtle
            />
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  label,
  href,
  active,
  subtle = false,
}: {
  label: string;
  href: string;
  active?: boolean;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 13px",
        borderRadius: 12,
        textDecoration: "none",
        fontWeight: 750,
        fontSize: 13,

        color: active
          ? "white"
          : subtle
          ? "#9fb0cc"
          : "#dce8ff",

        border: active
          ? "1px solid rgba(99,221,255,.28)"
          : "1px solid transparent",

        background: active
          ? "rgba(99,221,255,.1)"
          : "transparent",
      }}
    >
      {label}
    </Link>
  );
}