"use client";

import { useState } from "react";
import { useApplicantThread } from "../../hooks/useApplicantThread";
import ApplicantThreadShell from "../../components/chat/ApplicantThreadShell";

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "15px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#dbe7ff",
  marginBottom: "8px",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

export default function ApplicantThreadPage() {
  const [chatCodeInput, setChatCodeInput] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const thread = useApplicantThread({
    chatIdentityCode: submittedCode,
  });

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={glassCardStyle}>
        <h1 style={{ marginTop: 0 }}>Applicant Thread Access</h1>
        <p style={{ color: "#9fb0d0", lineHeight: 1.7 }}>
          Enter your applicant chat code to access your private application thread.
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <div>
            <label style={labelStyle}>Applicant Chat Code</label>
            <input
              value={chatCodeInput}
              onChange={(e) => setChatCodeInput(e.target.value)}
              style={inputStyle}
              placeholder="CHAT-XXXXXX-XXXXXX"
            />
          </div>

          <div>
            <button
              onClick={() => setSubmittedCode(chatCodeInput.trim())}
              style={primaryButtonStyle}
            >
              Open Thread
            </button>
          </div>
        </div>
      </section>

      {submittedCode ? (
        <ApplicantThreadShell
          account={thread.account}
          conversation={thread.conversation}
          messages={thread.messages}
          loading={thread.loading}
          messageInput={thread.messageInput}
          setMessageInput={thread.setMessageInput}
          sendMessage={thread.sendApplicantMessage}
          sending={thread.sending}
          reactionsMap={thread.reactionsMap}
          onToggleReaction={thread.toggleReaction}
          customEmojis={thread.customEmojis}
          customEmojiMap={thread.customEmojiMap}
        />
      ) : null}
    </div>
  );
}