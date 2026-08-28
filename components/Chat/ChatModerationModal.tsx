"use client";

import { useState } from "react";
import type { ChatUserProfile } from "../../types/chat";

type ModerationAction = "mute" | "kick" | "ban";

type ChatModerationModalProps = {
  open: boolean;
  members: ChatUserProfile[];
  onClose: () => void;
  onKickMember: (userId: string) => void | Promise<void>;
  onBanMember: (userId: string, reason?: string | null) => void | Promise<void>;
  onMuteMember: (userId: string, reason?: string | null) => void | Promise<void>;
};

function getName(user: ChatUserProfile) {
  return user.displayName || user.username || "User";
}

export default function ChatModerationModal({
  open,
  members,
  onClose,
  onKickMember,
  onBanMember,
  onMuteMember,
}: ChatModerationModalProps) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<ChatUserProfile | null>(null);
  const [action, setAction] = useState<ModerationAction | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const filteredMembers = members.filter((member) => {
    const query = search.toLowerCase();

    return (
      member.username?.toLowerCase().includes(query) ||
      member.displayName?.toLowerCase().includes(query)
    );
  });

  function openAction(member: ChatUserProfile, nextAction: ModerationAction) {
    setSelectedMember(member);
    setAction(nextAction);
    setReason("");
  }

  function closeAction() {
    setSelectedMember(null);
    setAction(null);
    setReason("");
    setSubmitting(false);
  }

  async function confirmAction() {
    if (!selectedMember || !action) return;

    try {
      setSubmitting(true);

      if (action === "kick") {
        await onKickMember(selectedMember.id);
      }

      if (action === "ban") {
        await onBanMember(selectedMember.id, reason.trim() || null);
      }

      if (action === "mute") {
        await onMuteMember(selectedMember.id, reason.trim() || null);
      }

      closeAction();
    } finally {
      setSubmitting(false);
    }
  }

  const selectedName = selectedMember ? getName(selectedMember) : "User";

  return (
    <>
      <div className="aurosModalOverlay">
        <div className="aurosModalCard" style={{ maxWidth: 760 }}>
          <div className="aurosModalHeader">
            <div>
              <p className="aurosPanelOverline">SERVER MODERATION</p>
              <h3 className="aurosModalTitle">Moderation</h3>
            </div>

            <button type="button" className="aurosModalClose" onClick={onClose}>
              ×
            </button>
          </div>

          <input
            className="aurosModalInput"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
          />

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {filteredMembers.length === 0 && (
              <p className="aurosProfileBio">No members found.</p>
            )}

            {filteredMembers.map((member) => {
              const name = getName(member);

              return (
                <div
                  key={member.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 16,
                    border: "1px solid rgba(212,175,55,0.12)",
                    background: "rgba(31,31,31,0.72)",
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="aurosMemberAvatar">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={name} />
                      ) : (
                        name.slice(0, 1).toUpperCase()
                      )}
                    </span>

                    <div>
                      <strong>{name}</strong>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#998f76",
                          fontSize: 13,
                        }}
                      >
                        @{member.username || "unknown"} ·{" "}
                        {member.status ?? "offline"}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="aurosModerationButton"
                      onClick={() => openAction(member, "mute")}
                    >
                      Mute
                    </button>

                    <button
                      type="button"
                      className="aurosModerationButton"
                      onClick={() => openAction(member, "kick")}
                    >
                      Kick
                    </button>

                    <button
                      type="button"
                      className="aurosModerationButton"
                      onClick={() => openAction(member, "ban")}
                    >
                      Ban
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedMember && action && (
        <div
          className="aurosModalOverlay"
          style={{
            zIndex: 10000,
            background: "rgba(0,0,0,0.76)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="aurosModalCard" style={{ maxWidth: 520 }}>
            <div className="aurosModalHeader">
              <div>
                <p className="aurosPanelOverline">CONFIRM ACTION</p>
                <h3 className="aurosModalTitle">
                  {action === "kick" && `Kick ${selectedName}?`}
                  {action === "ban" && `Ban ${selectedName}?`}
                  {action === "mute" && `Mute ${selectedName}?`}
                </h3>
              </div>

              <button type="button" className="aurosModalClose" onClick={closeAction}>
                ×
              </button>
            </div>

            <p className="aurosProfileBio">
              {action === "kick" &&
                "This member will be removed from the server."}
              {action === "ban" &&
                "This member will be banned and removed from the server."}
              {action === "mute" &&
                "This member will be muted in this server."}
            </p>

            {(action === "ban" || action === "mute") && (
              <label className="aurosModalField">
                <span>Reason</span>
                <textarea
                  className="aurosModalTextarea"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional reason..."
                  rows={4}
                />
              </label>
            )}

            <div className="aurosModalActions">
              <button
                type="button"
                className="aurosModalSecondary"
                onClick={closeAction}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="aurosModalPrimary"
                onClick={confirmAction}
                disabled={submitting}
              >
                {submitting
                  ? "Processing..."
                  : action === "kick"
                  ? "Kick Member"
                  : action === "ban"
                  ? "Ban Member"
                  : "Mute Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}