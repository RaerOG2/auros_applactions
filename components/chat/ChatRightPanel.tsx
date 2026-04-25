"use client";

import { useState } from "react";
import type {
  ApplicationChat,
  ChatChannel,
  ChatServer,
  ChatUserProfile,
  ChatView,
  DirectConversation,
} from "../../types/chat";

type ServerRole = "owner" | "admin" | "moderator" | "member" | null;

type ChatRightPanelProps = {
  currentUser: ChatUserProfile | null;
  activeView: ChatView;
  activeServer: ChatServer | null;
  activeServerRole: ServerRole;
  serverInviteLink: string | null;
  activeChannel: ChatChannel | null;
  activeDM: DirectConversation | null;
  activeDirectUser?: ChatUserProfile | null;
  activeApplicationChat: ApplicationChat | null;
  onOpenProfileEditor: () => void;
  onOpenServerSettings: () => void;
  onDeleteServer: () => void | Promise<void>;
  onCreateInvite: () => void | Promise<void>;
  onJoinInvite: (tokenOrLink: string) => void | Promise<void>;
};

function formatLastSeen(lastSeen: string | null) {
  if (!lastSeen) return "Unknown";

  try {
    return new Date(lastSeen).toLocaleString();
  } catch {
    return lastSeen;
  }
}

function getStatusColor(status?: string | null) {
  if (status === "online") return "#4ade80";
  if (status === "idle") return "#facc15";
  if (status === "dnd") return "#f87171";
  return "#9ca3af";
}

function getProfileName(user: ChatUserProfile | null | undefined) {
  return user?.displayName || user?.username || "User";
}

function getProfileInitial(user: ChatUserProfile | null | undefined) {
  return getProfileName(user).slice(0, 1).toUpperCase();
}

function canCreateInvite(role: ServerRole) {
  return role === "owner" || role === "admin" || role === "moderator";
}

export default function ChatRightPanel({
  currentUser,
  activeView,
  activeServer,
  activeServerRole,
  serverInviteLink,
  activeChannel,
  activeDM,
  activeDirectUser,
  activeApplicationChat,
  onOpenProfileEditor,
  onOpenServerSettings,
  onDeleteServer,
  onCreateInvite,
  onJoinInvite,
}: ChatRightPanelProps) {
  const [inviteInput, setInviteInput] = useState("");
  const isAurosCommunity = activeServer?.slug === "auros-community";
  const canDeleteServer =
    activeView.type === "server" &&
    activeServerRole === "owner" &&
    !isAurosCommunity;

  return (
    <aside className="aurosRightPanel">
      <section className="aurosPanelCard">
        <p className="aurosPanelOverline">PROFILE</p>

        {currentUser ? (
          <>
            {currentUser.bannerUrl && (
              <div
                style={{
                  height: 84,
                  borderRadius: 18,
                  overflow: "hidden",
                  marginBottom: 14,
                  border: "1px solid rgba(212,175,55,0.16)",
                }}
              >
                <img
                  src={currentUser.bannerUrl}
                  alt="Profile banner"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            <div className="aurosProfileHero">
              <div className="aurosProfileAvatar">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={getProfileName(currentUser)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "inherit",
                    }}
                  />
                ) : (
                  getProfileInitial(currentUser)
                )}
              </div>

              <div>
                <h3 className="aurosProfileName">{getProfileName(currentUser)}</h3>
                <p className="aurosProfileTag">@{currentUser.username || "user"}</p>
              </div>
            </div>

            <p className="aurosProfileBio">
              {currentUser.bio ?? "No bio has been added yet."}
            </p>

            <div className="aurosRoleList">
              <span className="aurosRoleBadge">
                {currentUser.isAdmin ? "Admin" : "Member"}
              </span>

              <span className="aurosRoleBadge">
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: getStatusColor(currentUser.status),
                    marginRight: 8,
                  }}
                />
                {currentUser.status ?? "offline"}
              </span>
            </div>

            <div style={{ marginTop: 14, color: "#bfb59b", fontSize: 13 }}>
              Last seen: {formatLastSeen(currentUser.lastSeen)}
            </div>

            <div className="aurosModerationList" style={{ marginTop: 14 }}>
              <button
                className="aurosModerationButton"
                type="button"
                onClick={onOpenProfileEditor}
              >
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <p className="aurosProfileBio">No signed-in profile was found.</p>
        )}
      </section>

      <section className="aurosPanelCard">
        <p className="aurosPanelOverline">CONTEXT</p>

        {activeView.type === "server" && activeServer && (
          <div className="aurosContextBlock">
            <h4>{activeServer.name}</h4>
            <p>Your role: {activeServerRole ?? "member"}</p>
            <p>{activeServer.description ?? "No server description."}</p>
          </div>
        )}

        {activeView.type === "server" && activeChannel && (
          <div className="aurosContextBlock">
            <h4>Channel</h4>
            <p>#{activeChannel.name}</p>
            <p>{activeChannel.topic ?? "No topic has been added yet."}</p>
          </div>
        )}

        {activeView.type === "dm" && activeDM && (
          <div className="aurosContextBlock">
            <h4>{getProfileName(activeDirectUser)}</h4>
            {activeDirectUser?.username && <p>@{activeDirectUser.username}</p>}
            <p>Last seen: {formatLastSeen(activeDirectUser?.lastSeen ?? null)}</p>
          </div>
        )}

        {activeView.type === "application" && activeApplicationChat && (
          <div className="aurosContextBlock">
            <h4>{activeApplicationChat.applicantName}</h4>
            <p>Chat ID: {activeApplicationChat.chatId}</p>
            <p>Status: {activeApplicationChat.status}</p>
          </div>
        )}

        {activeView.type === "home" && (
          <div className="aurosContextBlock">
            <h4>Quick Access</h4>
            <p>Use this panel for account, moderation, and chat information.</p>
          </div>
        )}
      </section>

      <section className="aurosPanelCard">
        <p className="aurosPanelOverline">SERVER INVITES</p>

        <div className="aurosModerationList">
          {activeView.type === "server" && canCreateInvite(activeServerRole) && (
            <button
              className="aurosModerationButton"
              type="button"
              onClick={onCreateInvite}
            >
              Create Invite Link
            </button>
          )}

          {serverInviteLink && (
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(212,175,55,0.16)",
                background: "rgba(31,31,31,0.8)",
                color: "#f6f2e8",
                fontSize: 13,
                lineHeight: 1.5,
                wordBreak: "break-all",
              }}
            >
              {serverInviteLink}
            </div>
          )}

          {serverInviteLink && (
            <button
              className="aurosModerationButton"
              type="button"
              onClick={() => navigator.clipboard.writeText(serverInviteLink)}
            >
              Copy Invite Link
            </button>
          )}

          <input
            className="aurosModalInput"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder="Paste invite link or token"
          />

          <button
            className="aurosModerationButton"
            type="button"
            onClick={() => {
              onJoinInvite(inviteInput);
              setInviteInput("");
            }}
          >
            Join Server
          </button>
        </div>
      </section>

      <section className="aurosPanelCard">
        <p className="aurosPanelOverline">SERVER TOOLS</p>

        <div className="aurosModerationList">
          {activeView.type === "server" &&
            (activeServerRole === "owner" ||
              activeServerRole === "admin" ||
              activeServerRole === "moderator") && (
              <button
                className="aurosModerationButton"
                type="button"
                onClick={onOpenServerSettings}
              >
                Edit Server
              </button>
            )}

          {canDeleteServer && (
            <button
              className="aurosModerationButton"
              type="button"
              onClick={() => onDeleteServer()}
            >
              Delete Server
            </button>
          )}

          {isAurosCommunity && (
            <div style={{ color: "#bfb59b", fontSize: 13, lineHeight: 1.5 }}>
              The Auros Community server cannot be deleted.
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}