"use client";

import Link from "next/link";
import type { ChatChannelItem } from "../../../types/chat";
import type { DirectConversationListItem } from "../../../services/dm-service";
import { chatTheme, chatUi } from "../../../lib/chat-theme";
import Avatar from "../Avatar";

type ChatSidebarListProps = {
  mode: "friends" | "dm" | "channel";
  channels: ChatChannelItem[];
  currentChannelSlug?: string;
  channelUnreadMap?: Record<string, number>;
  conversations: DirectConversationListItem[];
  currentConversationId?: string | null;
  dmUnreadMap?: Record<string, number>;
};

function getConversationTitle(item: DirectConversationListItem) {
  if (item.conversation.is_applicant_thread) return "Applicant Thread";
  if (item.otherProfiles.length === 0) return "Direct Conversation";

  return item.otherProfiles
    .map((profile) => profile.display_name || `@${profile.username}`)
    .join(", ");
}

function getConversationSubtitle(item: DirectConversationListItem) {
  if (item.lastMessage?.content) {
    return item.lastMessage.content.length > 36
      ? `${item.lastMessage.content.slice(0, 36)}...`
      : item.lastMessage.content;
  }

  return item.otherProfiles.map((profile) => `@${profile.username}`).join(", ");
}

function badge(count: number) {
  if (count <= 0) return null;

  return (
    <span
      style={{
        minWidth: 20,
        height: 20,
        padding: "0 6px",
        borderRadius: 999,
        background: "#ef4444",
        color: "white",
        fontSize: 12,
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function ChatSidebarList({
  mode,
  channels,
  currentChannelSlug,
  channelUnreadMap = {},
  conversations,
  currentConversationId,
  dmUnreadMap = {},
}: ChatSidebarListProps) {
  return (
    <aside
      style={{
        ...chatUi.shellCard,
        padding: 14,
        display: "grid",
        gap: 12,
        alignContent: "start",
        minHeight: "calc(100vh - 140px)",
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
          {mode === "friends"
            ? "FRIENDS"
            : mode === "dm"
            ? "DIRECT MESSAGES"
            : "CHANNELS"}
        </p>
      </div>

      {mode === "friends" && (
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { label: "Online", href: "/chat?view=friends&tab=online" },
            { label: "Alle", href: "/chat?view=friends&tab=all" },
            { label: "Ausstehend", href: "/chat?view=friends&tab=pending" },
          ].map((item) => {
            const active =
              (item.href.includes("tab=online") && !item.href.includes("all") && !item.href.includes("pending")) ||
              false;

            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: `1px solid ${chatTheme.border}`,
                  background: chatTheme.panelAlt,
                  color: chatTheme.text,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {mode === "channel" && (
        <div style={{ display: "grid", gap: 8 }}>
          {channels.map((channel) => {
            const active = currentChannelSlug === channel.slug;
            const unread = channelUnreadMap[channel.slug] || 0;

            return (
              <Link
                key={channel.id}
                href={`/chat?channel=${encodeURIComponent(channel.slug)}`}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: active
                    ? `1px solid ${chatTheme.borderStrong}`
                    : `1px solid ${chatTheme.border}`,
                  background: active
                    ? "linear-gradient(180deg, rgba(212,175,55,0.16) 0%, rgba(240,204,103,0.08) 100%)"
                    : chatTheme.panelAlt,
                  color: chatTheme.text,
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>
                    {channel.is_public ? "# " : "🔒 "}
                    {channel.name}
                  </div>
                  {badge(unread)}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: chatTheme.textMuted,
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {channel.description || "No description"}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {mode === "dm" && (
        <div style={{ display: "grid", gap: 8 }}>
          {conversations.length === 0 ? (
            <div style={{ color: chatTheme.textMuted }}>No DMs yet.</div>
          ) : (
            conversations.map((item) => {
              const active = currentConversationId === item.conversation.id;
              const title = getConversationTitle(item);
              const unread = dmUnreadMap[item.conversation.id] || 0;
              const avatarName =
                item.otherProfiles[0]?.display_name ||
                item.otherProfiles[0]?.username ||
                title;

              return (
                <Link
                  key={item.conversation.id}
                  href={`/chat?dm=${item.conversation.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px minmax(0, 1fr) auto",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: active
                      ? `1px solid ${chatTheme.borderStrong}`
                      : `1px solid ${chatTheme.border}`,
                    background: active
                      ? "linear-gradient(180deg, rgba(212,175,55,0.16) 0%, rgba(240,204,103,0.08) 100%)"
                      : chatTheme.panelAlt,
                    color: chatTheme.text,
                    textDecoration: "none",
                  }}
                >
                  <Avatar name={avatarName} size={40} />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: active ? 800 : 700,
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
                      {getConversationSubtitle(item)}
                    </div>
                  </div>

                  {badge(unread)}
                </Link>
              );
            })
          )}
        </div>
      )}
    </aside>
  );
}