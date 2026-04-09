"use client";

import type { DirectConversationListItem } from "../../../services/dm-service";
import type { FriendCardItem } from "../../../types/friends";
import { chatTheme, chatUi } from "../../../lib/chat-theme";
import FriendAddCard from "./FriendAddCard";
import FriendListSection from "./FriendListSection";
import type { ProfileItem } from "../../../types/profile";
import Avatar from "../Avatar";

type OnlineUserItem = {
  profileId: string;
  username: string;
  displayName: string | null;
  onlineAt: string;
};

type FriendsHomeViewProps = {
  onlineUsers: OnlineUserItem[];
  conversations: DirectConversationListItem[];
  currentTab?: string;
  acceptedFriends: FriendCardItem[];
  incomingRequests: FriendCardItem[];
  outgoingRequests: FriendCardItem[];
  friendSearchValue: string;
  setFriendSearchValue: (value: string) => void;
  friendUserResults: ProfileItem[];
  searchingFriendUsers: boolean;
  onSearchFriendUsers: () => void;
  onAddFriend: (profileId: string) => void;
  onAcceptFriend: (friendshipId: string) => void;
  onRejectFriend: (friendshipId: string) => void;
  onRemoveFriend: (friendshipId: string) => void;
  onStartFriendDm: (profileId: string) => Promise<void>;
};

export default function FriendsHomeView({
  onlineUsers,
  conversations,
  currentTab = "online",
  acceptedFriends,
  incomingRequests,
  outgoingRequests,
  friendSearchValue,
  setFriendSearchValue,
  friendUserResults,
  searchingFriendUsers,
  onSearchFriendUsers,
  onAddFriend,
  onAcceptFriend,
  onRejectFriend,
  onRemoveFriend,
  onStartFriendDm,
}: FriendsHomeViewProps) {
  const recentConversations = conversations.slice(0, 5);

  const filteredFriends =
    currentTab === "online"
      ? acceptedFriends.filter((friend) =>
          onlineUsers.some((user) => user.profileId === friend.profile.id)
        )
      : acceptedFriends;

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
            SOCIAL HUB
          </p>
          <h1 style={{ margin: "8px 0 0 0", fontSize: 36 }}>Freunde</h1>
        </div>

        <span style={chatUi.pill}>{acceptedFriends.length} Freunde</span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <a
          href="/chat?view=friends&tab=online"
          style={{
            ...chatUi.ghostButton,
            textDecoration: "none",
            background:
              currentTab === "online" ? chatTheme.accentSoftStrong : chatTheme.panelAlt,
            border:
              currentTab === "online"
                ? `1px solid ${chatTheme.borderStrong}`
                : `1px solid ${chatTheme.border}`,
          }}
        >
          Online
        </a>

        <a
          href="/chat?view=friends&tab=all"
          style={{
            ...chatUi.ghostButton,
            textDecoration: "none",
            background:
              currentTab === "all" ? chatTheme.accentSoftStrong : chatTheme.panelAlt,
            border:
              currentTab === "all"
                ? `1px solid ${chatTheme.borderStrong}`
                : `1px solid ${chatTheme.border}`,
          }}
        >
          Alle
        </a>

        <a
          href="/chat?view=friends&tab=pending"
          style={{
            ...chatUi.ghostButton,
            textDecoration: "none",
            background:
              currentTab === "pending" ? chatTheme.accentSoftStrong : chatTheme.panelAlt,
            border:
              currentTab === "pending"
                ? `1px solid ${chatTheme.borderStrong}`
                : `1px solid ${chatTheme.border}`,
          }}
        >
          Ausstehend
        </a>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) 360px",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 18 }}>
          <FriendAddCard
            searchValue={friendSearchValue}
            setSearchValue={setFriendSearchValue}
            onSearch={onSearchFriendUsers}
            searchingUsers={searchingFriendUsers}
            userResults={friendUserResults}
            onAddFriend={onAddFriend}
          />

          {(currentTab === "online" || currentTab === "all") && (
            <FriendListSection
              title={currentTab === "online" ? "Freunde online" : "Alle Freunde"}
              items={filteredFriends}
              mode="friends"
              onRemove={onRemoveFriend}
              onStartDm={onStartFriendDm}
            />
          )}

          {(currentTab === "pending" || currentTab === "all") && (
            <FriendListSection
              title="Eingehende Anfragen"
              items={incomingRequests}
              mode="incoming"
              onAccept={onAcceptFriend}
              onReject={onRejectFriend}
            />
          )}

          {(currentTab === "pending" || currentTab === "all") && (
            <FriendListSection
              title="Ausgehende Anfragen"
              items={outgoingRequests}
              mode="outgoing"
              onRemove={onRemoveFriend}
            />
          )}
        </div>

        <aside
          style={{
            ...chatUi.panelCard,
            padding: 18,
            display: "grid",
            gap: 14,
          }}
        >
          <h3 style={{ margin: 0 }}>Letzte DMs</h3>

          {recentConversations.length === 0 ? (
            <div style={{ color: chatTheme.textMuted }}>Noch keine DMs vorhanden.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {recentConversations.map((item) => {
                const title =
                  item.conversation.is_applicant_thread
                    ? "Applicant Thread"
                    : item.otherProfiles.map((profile) => profile.display_name || profile.username).join(", ") ||
                      "Direct Conversation";

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
                      gridTemplateColumns: "42px minmax(0, 1fr)",
                      gap: 10,
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${chatTheme.border}`,
                      background: chatTheme.panelAlt,
                      color: chatTheme.text,
                      textDecoration: "none",
                    }}
                  >
                    <Avatar name={avatarName} size={42} />

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
                        {item.lastMessage?.content || "No messages yet"}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}