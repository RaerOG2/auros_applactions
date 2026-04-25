"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatShell from "./ChatShell";
import GuestApplicationChat from "./GuestApplicationChat";
import {
  getCurrentSessionUser,
  validateAuId,
  type PublicApplicationChatAccess,
} from "../../services/chat-access.service";

const STORAGE_KEY = "auros_guest_au_id";

export default function ChatAccessGate() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [auId, setAuId] = useState("");
  const [guestAccess, setGuestAccess] = useState<PublicApplicationChatAccess | null>(null);
  const [authAllowed, setAuthAllowed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const user = await getCurrentSessionUser();

        if (user) {
          if (mounted) setAuthAllowed(true);
          return;
        }

        const storedAuId = window.localStorage.getItem(STORAGE_KEY);

        if (storedAuId) {
          const access = await validateAuId(storedAuId);
          if (mounted && access) {
            setGuestAccess(access);
            setAuId(access.chatId);
            return;
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleAuIdAccess(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const access = await validateAuId(auId);

      if (!access) {
        setError("Invalid or expired AU-ID.");
        return;
      }

      window.localStorage.setItem(STORAGE_KEY, access.chatId);
      setGuestAccess(access);
    } catch (err: any) {
      setError(err?.message || "AU-ID access failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function goToLogin() {
    router.push("/login?redirect=/chat");
  }

  function exitGuestMode() {
    setGuestAccess(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  if (loading) {
    return (
      <section className="aurosAccessPage">
        <div className="aurosAccessCard">
          <p className="aurosWelcomeOverline">AUROSCHANNEL ACCESS</p>
          <h2 className="aurosWelcomeTitle">Checking access...</h2>
        </div>
      </section>
    );
  }

  if (authAllowed) return <ChatShell />;

  if (guestAccess) {
    return <GuestApplicationChat access={guestAccess} onExit={exitGuestMode} />;
  }

  return (
    <section className="aurosAccessPage">
      <div className="aurosAccessCard">
        <p className="aurosWelcomeOverline">AUROSCHANNEL ACCESS</p>
        <h2 className="aurosWelcomeTitle">Login required</h2>
        <p className="aurosWelcomeText">
          Sign in or create an account to use AUROSCHANNEL. Applicants can use their
          AU-ID for temporary application chat access.
        </p>

        {error && <div className="aurosAccessError">{error}</div>}

        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <button className="aurosAccessPrimary" type="button" onClick={goToLogin}>
            Login or Create Account
          </button>

          <form onSubmit={handleAuIdAccess} style={{ display: "grid", gap: 12 }}>
            <input
              className="aurosAccessInput"
              value={auId}
              onChange={(e) => setAuId(e.target.value.toUpperCase())}
              placeholder="Enter AU-ID"
            />

            <button className="aurosAccessButton" type="submit" disabled={submitting}>
              {submitting ? "Checking..." : "Open Application Chat"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}