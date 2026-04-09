"use client";

import { useChannelMembers } from "../../hooks/useChannelMembers";

type ChannelMembershipPanelProps = {
  channelId: string | null;
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
  padding: "8px 12px",
  borderRadius: "12px",
  border: "1px solid #5b2333",
  background: "#1d1220",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

export default function ChannelMembershipPanel({
  channelId,
}: ChannelMembershipPanelProps) {
  const members = useChannelMembers(channelId, !!channelId);

  if (!channelId) {
    return (
      <section style={panelStyle}>
        <h3 style={{ marginTop: 0 }}>Private Channel Members</h3>
        <div style={{ color: "#9fb0d0" }}>Select a channel first.</div>
      </section>
    );
  }

  return (
    <section style={panelStyle}>
      <h3 style={{ marginTop: 0 }}>Private Channel Members</h3>

      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={members.searchValue}
            onChange={(e) => members.setSearchValue(e.target.value)}
            style={inputStyle}
            placeholder="Search users to add"
          />
          <button onClick={members.searchUsers} style={ghostButtonStyle}>
            {members.searchingUsers ? "..." : "Search"}
          </button>
        </div>

        {members.userResults.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            {members.userResults.map((user) => (
              <button
                key={user.id}
                onClick={() => members.addMember(user)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1px solid #22304d",
                  background: "rgba(15, 27, 52, 0.9)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <strong>@{user.username}</strong>
                {user.display_name ? (
                  <span style={{ color: "#9fb0d0", marginLeft: 8 }}>
                    {user.display_name}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}

        {members.loading ? (
          <div style={{ color: "#9fb0d0" }}>Loading members...</div>
        ) : members.members.length === 0 ? (
          <div style={{ color: "#9fb0d0" }}>No channel members found.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {members.members.map((member) => (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1px solid #22304d",
                  background: "#081225",
                }}
              >
                <div>
                  <strong style={{ color: "#dbe7ff" }}>
                    @{member.profile?.username || "unknown"}
                  </strong>
                  {member.profile?.display_name ? (
                    <span style={{ color: "#9fb0d0", marginLeft: 8 }}>
                      {member.profile.display_name}
                    </span>
                  ) : null}
                </div>

                <button
                  onClick={() => members.removeMember(member.profile_id)}
                  style={dangerButtonStyle}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}