"use client";

import { useEffect, useState } from "react";

type EpicLinkPanelProps = {
  verified: boolean;
  displayName: string;
};

const linkMessages: Record<string, string> = {
  linked: "Your Epic Games account is now securely linked to AUROS.",
  login_required: "Sign in to your AUROS account before connecting Epic.",
  not_configured: "Epic linking is not configured yet. Ask an AUROS administrator to finish the Epic Developer Portal setup.",
  invalid_state: "Linking expired or was interrupted. Please try again.",
  session_changed: "Your AUROS session changed during linking. Sign in and try again.",
  epic_rejected: "Epic could not confirm the connection. Please try again.",
  invalid_identity: "Epic account verification failed. No account was linked.",
  epic_in_use: "This Epic account is already linked to a different AUROS player.",
  already_linked: "Disconnect the current Epic account before switching accounts.",
  profile_error: "AUROS could not save the Epic link. Contact support if the problem continues.",
  failed: "Epic linking failed. Please try again.",
};

export default function EpicLinkPanel({ verified, displayName }: EpicLinkPanelProps) {
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    setResult(new URLSearchParams(window.location.search).get("epic"));
  }, []);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function unlink() {
    if (!window.confirm("Disconnect your Epic Games account from AUROS? Your Competitive ID, AP and results will remain.")) {
      return;
    }

    setWorking(true);
    setError("");

    try {
      const response = await fetch("/api/competitive/epic/unlink", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Could not disconnect Epic. Please try again.");
      }

      window.location.assign("/competitive/me?epic=disconnected");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Epic disconnect failed.");
      setWorking(false);
    }
  }

  return (
    <section className="competitivePanel compEpicPanel">
      <div className="competitivePanelHeader">
        <div>
          <span className="competitiveEyebrow gold">ACCOUNT CONNECTION</span>
          <h2>Epic Games Linking</h2>
        </div>
        <span>{verified ? "CONNECTED" : "NOT LINKED"}</span>
      </div>

      {verified ? (
        <>
          <div className="compEpicStatus is-linked">
            <strong>✓ EPIC VERIFIED</strong>
            <span>{displayName}</span>
          </div>
          <p className="compPlayerAsideNote">
            Your Epic display name is used on your Competitive Player Card.
            Your permanent AUROS Competitive ID and tournament history remain unchanged.
          </p>
          <button
            type="button"
            className="compSecondaryButton"
            disabled={working}
            onClick={unlink}
          >
            {working ? "DISCONNECTING…" : "DISCONNECT EPIC ACCOUNT"}
          </button>
        </>
      ) : (
        <>
          <p className="compPlayerAsideNote">
            Connect your real Epic Games account through the official Epic authorization page.
            AUROS never asks for your Epic password or stores Epic access tokens.
          </p>
          <a href="/api/competitive/epic/start" className="compPrimaryButton">
            LINK EPIC ACCOUNT →
          </a>
        </>
      )}

      {result === "disconnected" && (
        <div className="compSuccess compEpicMessage">Epic account disconnected.</div>
      )}
      {result && linkMessages[result] && (
        <div className={result === "linked" ? "compSuccess compEpicMessage" : "compError compEpicMessage"}>
          {linkMessages[result]}
        </div>
      )}
      {error && <div className="compError compEpicMessage">{error}</div>}
    </section>
  );
}
