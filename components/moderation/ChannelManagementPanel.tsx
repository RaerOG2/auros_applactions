"use client";

import { useChannelManagement } from "../../hooks/useChannelManagement";
import ChannelMembershipPanel from "./ChannelMembershipPanel";

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const panelStyle: React.CSSProperties = {
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
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

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "#9fb0d0",
  marginBottom: 8,
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

const ghostButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #5b2333",
  background: "#1d1220",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(76, 201, 240, 0.18)",
  background: "rgba(76, 201, 240, 0.10)",
  color: "#95ecff",
  fontSize: "13px",
  fontWeight: 700,
};

export default function ChannelManagementPanel() {
  const channel = useChannelManagement();

  if (channel.loading) {
    return <section style={glassCardStyle}>Loading channel management...</section>;
  }

  if (!channel.authorized) {
    return (
      <section style={glassCardStyle}>
        <h1 style={{ marginTop: 0 }}>No channel management access</h1>
        <p style={{ color: "#9fb0d0", lineHeight: 1.7 }}>
          You must be an admin or moderator to manage channels.
        </p>
      </section>
    );
  }

  return (
    <>
      <style jsx>{`
        .channelGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        @media (max-width: 980px) {
          .channelGrid {
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
            CHANNEL MANAGEMENT
          </p>

          <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: "40px" }}>
            Channel Creation & Management
          </h1>

          <p style={{ color: "#9fb0d0", lineHeight: 1.7 }}>
            Create new channels, edit existing ones, manage visibility and memberships.
          </p>
        </section>

        <div className="channelGrid">
          <section style={panelStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <h3 style={{ margin: 0 }}>
                {channel.editingChannelId ? "Edit Channel" : "Create Channel"}
              </h3>

              <button onClick={channel.startCreate} style={ghostButtonStyle}>
                New Channel
              </button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>Channel Name</label>
                <input
                  value={channel.name}
                  onChange={(e) => channel.setName(e.target.value)}
                  style={inputStyle}
                  placeholder="general"
                />
              </div>

              <div>
                <label style={labelStyle}>Slug</label>
                <input
                  value={channel.slug}
                  onChange={(e) => channel.setSlug(e.target.value)}
                  style={inputStyle}
                  placeholder="general"
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={channel.description}
                  onChange={(e) => channel.setDescription(e.target.value)}
                  style={textareaStyle}
                  placeholder="Main public discussion channel"
                />
              </div>

              <div>
                <label style={labelStyle}>Visibility</label>
                <select
                  value={channel.isPublic ? "public" : "private"}
                  onChange={(e) => channel.setIsPublic(e.target.value === "public")}
                  style={inputStyle}
                >
                  <option value="public" style={{ background: "#0b152b" }}>
                    Public
                  </option>
                  <option value="private" style={{ background: "#0b152b" }}>
                    Private
                  </option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={channel.saveChannel}
                  disabled={channel.submitting}
                  style={primaryButtonStyle}
                >
                  {channel.submitting
                    ? "Saving..."
                    : channel.editingChannelId
                    ? "Save Channel"
                    : "Create Channel"}
                </button>

                <button onClick={channel.resetForm} style={ghostButtonStyle}>
                  Reset
                </button>
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Existing Channels</h3>

            {channel.channels.length === 0 ? (
              <div style={{ color: "#9fb0d0" }}>No channels found.</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {channel.channels.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "14px",
                      borderRadius: "14px",
                      border: "1px solid #22304d",
                      background: "#081225",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ color: "#dbe7ff", fontWeight: 700 }}>
                          {item.is_public ? "# " : "🔒 "}
                          {item.name}
                        </div>
                        <div style={{ color: "#9fb0d0", fontSize: 13, marginTop: 4 }}>
                          /chat?channel={item.slug}
                        </div>
                        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={pillStyle}>{item.is_public ? "Public" : "Private"}</span>
                          <span style={pillStyle}>{item.slug}</span>
                        </div>
                        {item.description ? (
                          <div
                            style={{
                              marginTop: 10,
                              color: "#dbe7ff",
                              lineHeight: 1.6,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {item.description}
                          </div>
                        ) : null}
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => channel.startEdit(item)}
                          style={ghostButtonStyle}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => channel.removeChannel(item)}
                          style={dangerButtonStyle}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <ChannelMembershipPanel channelId={channel.editingChannelId} />
      </div>
    </>
  );
}