"use client";

import { useState } from "react";
import type { StatusResult } from "../types/status";

export function useApplicationStatus() {
  const [trackingCode, setTrackingCode] = useState("");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  async function checkStatus() {
    const normalizedTrackingCode = trackingCode.trim().toUpperCase();

    if (!normalizedTrackingCode) {
      alert("Please enter your tracking code.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);

    try {
      const response = await fetch("/api/check-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingCode: normalizedTrackingCode,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        alert(payload?.error || "Error");
        return;
      }

      setResult(payload?.result ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function copyTrackingCode() {
    if (!result?.tracking_code) return;

    await navigator.clipboard.writeText(result.tracking_code);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setTrackingCode("");
    setResult(null);
    setSearched(false);
    setCopied(false);
    setLoading(false);
  }

  return {
    trackingCode,
    setTrackingCode,
    result,
    loading,
    searched,
    copied,
    checkStatus,
    copyTrackingCode,
    reset,
  };
}