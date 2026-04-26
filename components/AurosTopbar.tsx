"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AurosTopbarProps = {
  current?:
    | "home"
    | "apply"
    | "status"
    | "patchnotes"
    | "faq"
    | "contact"
    | "admin"
    | "chat"
    | "login";
};

export default function AurosTopbar({ current }: AurosTopbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAuthState() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!mounted) return;

      setIsLoggedIn(!!user);

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      setIsAdmin(!!profile?.is_admin);
    }

    loadAuthState();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadAuthState();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const wrapperStyle: React.CSSProperties = {
    position: "sticky",
    top: 16,
    zIndex: 50,
    marginBottom: 28,
  };

  const barStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 18px",
    borderRadius: "24px",
    background:
      "linear-gradient(180deg, rgba(12, 22, 45, 0.88) 0%, rgba(8, 18, 37, 0.82) 100%)",
    border: "1px solid rgba(76, 201, 240, 0.12)",
    backdropFilter: "blur(18px)",
    boxShadow:
      "0 14px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
    flexWrap: "wrap",
  };

  const brandStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
  };

  const logoBoxStyle: React.CSSProperties = {
    width: 46,
    height: 46,
    borderRadius: 16,
    background: "linear-gradient(135deg, #4cc9f0 0%, #7b61ff 100%)",
    overflow: "hidden",
    flexShrink: 0,
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  };

  function linkStyle(active: boolean): React.CSSProperties {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "11px 15px",
      borderRadius: "14px",
      textDecoration: "none",
      fontWeight: 800,
      fontSize: 14,
      color: "white",
      border: active
        ? "1px solid rgba(212, 175, 55, 0.38)"
        : "1px solid rgba(56, 74, 108, 0.85)",
      background: active
        ? "linear-gradient(90deg, rgba(212,175,55,0.20), rgba(142,105,19,0.18))"
        : "linear-gradient(180deg, rgba(14, 25, 48, 0.95) 0%, rgba(10, 20, 40, 0.92) 100%)",
      cursor: "pointer",
    };
  }

  return (
    <>
      <div style={wrapperStyle}>
        <div style={barStyle}>
          <Link href="/" style={brandStyle}>
            <div style={logoBoxStyle}>
              <img
                src="/auros_royale_pfp_draft_1.png"
                alt="Auros"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "white" }}>
                Auros
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#9fb0d0" }}>
                Applications System
              </p>
            </div>
          </Link>

          <nav style={navStyle}>
            <Link href="/apply" style={linkStyle(current === "apply")}>
              Apply
            </Link>

            <Link href="/status" style={linkStyle(current === "status")}>
              Status
            </Link>

            <Link href="/patchnotes" style={linkStyle(current === "patchnotes")}>
              Patchnotes
            </Link>

            <Link href="/chat" style={linkStyle(current === "chat")}>
              Chat
            </Link>

            <Link href="/faq" style={linkStyle(current === "faq")}>
              FAQ
            </Link>

            <Link href="/contact" style={linkStyle(current === "contact")}>
              Contact
            </Link>

            {!isLoggedIn && (
              <Link href="/login" style={linkStyle(current === "login")}>
                Login
              </Link>
            )}

            {isAdmin && (
              <Link href="/admin" style={linkStyle(current === "admin")}>
                Admin
              </Link>
            )}

            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                style={linkStyle(false)}
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>

      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.68)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(100%, 430px)",
              borderRadius: 24,
              background:
                "linear-gradient(180deg, rgba(22,22,22,0.98), rgba(10,10,10,0.98))",
              border: "1px solid rgba(212,175,55,0.18)",
              padding: 24,
              boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                color: "#d4af37",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
            >
              LOGOUT CONFIRMATION
            </p>

            <h3 style={{ margin: "0 0 10px", fontSize: 26, color: "white" }}>
              Do you really want to log out?
            </h3>

            <p style={{ margin: 0, color: "#bfb59b", lineHeight: 1.6 }}>
              You will need to sign in again to access protected areas like
              AUROSCHANNEL and Admin tools.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 22,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 14,
                  border: "1px solid rgba(212,175,55,0.12)",
                  background: "rgba(31,31,31,0.94)",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={logout}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 14,
                  border: "1px solid rgba(212,175,55,0.24)",
                  background:
                    "linear-gradient(180deg, rgba(212,175,55,0.28), rgba(142,105,19,0.24))",
                  color: "#fff2c0",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}