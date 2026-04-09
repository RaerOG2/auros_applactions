"use client";

import MessageModerationTable from "./MessageModerationTable";
import ModerationLogList from "./ModerationLogList";
import UserModerationCard from "./UserModerationCard";
import { useModerationPanel } from "../../hooks/useModerationPanel";

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
  padding: "12px 13px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "14px",
};

export default function ModerationPanel() {
  const moderation = useModerationPanel();

  if (moderation.loading) {
    return <section style={glassCardStyle}>Loading moderation panel...</section>;
  }

  if (!moderation.authorized) {
    return (
      <section style={glassCardStyle}>
        <h1 style={{ marginTop: 0 }}>No moderation access</h1>
        <p style={{ color: "#9fb0d0", lineHeight: 1.7 }}>
          You must be an admin or moderator to access this panel.
        </p>
      </section>
    );
  }

  return (
    <>
      <style jsx>{`
        .modGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        @media (max-width: 980px) {
          .modGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ display: "grid", gap: 18 }}>
        <section style={glassCardStyle}>
          <p
            style={{
              color: "#4cc9f0",
              fontWeight: 800,
              marginBottom: 10,
              fontSize: "13px",
              letterSpacing: "0.08em",
            }}
          >
            CHAT MODERATION
          </p>

          <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: "40px" }}>
            Moderation Panel
          </h1>

          <p style={{ color: "#9fb0d0", lineHeight: 1.7 }}>
            Delete chat messages, apply moderation actions, and review moderation logs.
          </p>

          <div style={{ marginTop: 16, maxWidth: 320 }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                color: "#9fb0d0",
                marginBottom: 8,
              }}
            >
              Select Channel
            </label>
            <select
              value={moderation.channelId}
              onChange={(e) => moderation.setChannelId(e.target.value)}
              style={inputStyle}
            >
              {moderation.channels.map((channel) => (
                <option
                  key={channel.id}
                  value={channel.id}
                  style={{ background: "#0b152b" }}
                >
                  #{channel.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="modGrid">
          <UserModerationCard
            userSearch={moderation.userSearch}
            setUserSearch={moderation.setUserSearch}
            onSearch={moderation.searchUsers}
            userResults={moderation.userResults}
            selectedUser={moderation.selectedUser}
            setSelectedUser={moderation.setSelectedUser}
            actionType={moderation.actionType}
            setActionType={moderation.setActionType}
            reason={moderation.reason}
            setReason={moderation.setReason}
            expiresAt={moderation.expiresAt}
            setExpiresAt={moderation.setExpiresAt}
            onSubmit={moderation.submitModerationAction}
            submitting={moderation.submittingModeration}
          />

          <ModerationLogList logs={moderation.logs} />
        </div>

        <MessageModerationTable
          messages={moderation.messages}
          onDeleteMessage={moderation.deleteMessage}
        />
      </div>
    </>
  );
}