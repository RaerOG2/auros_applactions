"use client";

import { useEffect, useRef } from "react";
import { setOfflinePresence, updatePresence } from "../services/profile.service";

const HEARTBEAT_MS = 30_000;
const IDLE_AFTER_MS = 5 * 60_000;

type PresenceStatus = "online" | "idle" | "offline";

export function usePresence(userId?: string | null) {
  const currentStatusRef = useRef<PresenceStatus>("offline");
  const idleTimerRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  async function setStatus(status: PresenceStatus) {
    if (!userId) return;
    if (currentStatusRef.current === status) return;

    currentStatusRef.current = status;

    if (status === "offline") {
      await setOfflinePresence().catch(() => {});
      return;
    }

    await updatePresence(status).catch(() => {});
  }

  function markOnlineAndResetIdle() {
    setStatus("online");

    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = window.setTimeout(() => {
      setStatus("idle");
    }, IDLE_AFTER_MS);
  }

  useEffect(() => {
    if (!userId) return;

    markOnlineAndResetIdle();

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    activityEvents.forEach((event) => {
      window.addEventListener(event, markOnlineAndResetIdle, { passive: true });
    });

    heartbeatRef.current = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        updatePresence(currentStatusRef.current === "idle" ? "idle" : "online").catch(
          () => {}
        );
      }
    }, HEARTBEAT_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        markOnlineAndResetIdle();
      } else {
        setStatus("idle");
      }
    }

    function handlePageHide() {
      setOfflinePresence().catch(() => {});
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current);

      activityEvents.forEach((event) => {
        window.removeEventListener(event, markOnlineAndResetIdle);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);

      setOfflinePresence().catch(() => {});
    };
  }, [userId]);
}