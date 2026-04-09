"use client";

import type { DirectConversationListItem } from "../../../services/dm-service";
import type { FriendCardItem } from "../../../types/friends";
import { chatTheme, chatUi } from "../../../lib/chat-theme";
import Avatar from "../Avatar";

type DmHomeViewProps = {
  conversations: DirectConversationListItem[];
  acceptedFriends: FriendCardItem[];
  totalDmUnread?: number;
  onOpenStartChat: () => void;
};

function getConversationTitle(item: DirectConversationListItem) {
  if (item.conversation.is_applicant_thread) return "Applicant Thread";
  if (item.otherProfiles.length === 0) return "Direct Conversation";

  return item.otherProfiles
    .map((profile) => profile.display_name || `@${profile.username}`)
    .join(", ");
}

function getConversationPreview(item: DirectConversationListItem) {
  if (item.lastMessage?.content) {
    return item.lastMessage.content.length > 72
      ? `${item.lastMessage.content.slice(0, 72)}...`
      : item.lastMessage.content;
  }

  return "No messages yet";
}

export default function DmHomeView({
  conversations,
  acceptedFriends,
  totalDmUnread = 0,
  onOpenStartChat,
}: DmHomeViewProps) {
  const recentConversations = conversations.slice(0, 8);
  const favoriteFriends = acceptedFriends.slice(0, 6);

  return (
    <section
      style={{
        ...chatUi.shellCard,
        minHeight: "calc(100vh - 140px)",
        padding: 24,
        display: "grid",
        alignContent: "start",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: chatTheme.accentStrong,
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: "0.08em",
            }}
          >
            DIRECT MESSAGE HUB
          </p>
          <h1 style={{ margin: "8px 0 0 0", fontSize: 36 }}>Nachrichten</h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={chatUi.pill}>{totalDmUnread} unread</span>
          <button onClick={onOpenStartChat} style={chatUi.accentButton}>
            Chat starten
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.55fr) 340px",
          gap: 20,
          alignItems: "start",
        }}
      >
        <section
          style={{
            ...chatUi.panelCard,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <h3 style={{ margin: 0 }}>Letzte Unterhaltungen</h3>
            <span style={chatUi.pill}>{recentConversations.length}</span>
          </div>

          {recentConversations.length === 0 ? (
            <div style={{ color: chatTheme.textMuted }}>
              Noch keine Gespräche vorhanden. Starte deinen ersten DM.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {recentConversations.map((item) => {
                const title = getConversationTitle(item);
                const avatarName =
                  item.otherProfiles[0]?.display_name ||
                  item.otherProfiles[0]?.username ||
                  title;

                return (
                  <a
                    key={item.conversation.id}
                    href={`/chat?dm=${item.conversation.id}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px minmax(0, 1fr)",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: 16,
                      border: `1px solid ${chatTheme.border}`,
                      background: chatTheme.panelAlt,
                      color: chatTheme.text,
                      textDecoration: "none",
                    }}
                  >
                    <Avatar name={avatarName} size={48} />

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {title}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          color: chatTheme.textMuted,
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getConversationPreview(item)}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        <aside
          style={{
            ...chatUi.panelCard,
            padding: 18,
            display: "grid",
            gap: 14,
          }}
        >
          <h3 style={{ margin: 0 }}>Freunde</h3>

          {favoriteFriends.length === 0 ? (
            <div style={{ color: chatTheme.textMuted }}>
              Keine Freunde vorhanden.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {favoriteFriends.map((friend) => (
                <button
                  key={friend.friendshipId}
                  onClick={onOpenStartChat}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "42px minmax(0, 1fr)",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: `1px solid ${chatTheme.border}`,
                    background: chatTheme.panelAlt,
                    color: chatTheme.text,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Avatar
                    name={friend.profile.display_name || friend.profile.username}
                    avatarUrl={friend.profile.avatar_url || null}
                    size={42}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {friend.profile.display_name || friend.profile.username}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        color: chatTheme.textMuted,
                        fontSize: 13,
                      }}
                    >
                      @{friend.profile.username}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}