"use client";

import type { ProfileItem } from "../../../types/profile";
import { chatTheme, chatUi } from "../../../lib/chat-theme";
import Avatar from "../Avatar";

type FriendAddCardProps = {
  searchValue: string;
  setSearchValue: (value: string) => void;
  onSearch: () => void;
  searchingUsers: boolean;
  userResults: ProfileItem[];
  onAddFriend: (profileId: string) => void;
};

export default function FriendAddCard({
  searchValue,
  setSearchValue,
  onSearch,
  searchingUsers,
  userResults,
  onAddFriend,
}: FriendAddCardProps) {
  return (
    <section
      style={{
        ...chatUi.panelCard,
        padding: 18,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Freund hinzufügen</h3>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Name oder Username suchen"
            style={chatUi.input}
          />
          <button onClick={onSearch} style={chatUi.accentButton}>
            {searchingUsers ? "..." : "Suchen"}
          </button>
        </div>

        {userResults.length === 0 ? (
          <div style={{ color: chatTheme.textMuted }}>
            Suche nach Nutzern, um eine Freundschaftsanfrage zu senden.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {userResults.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "42px minmax(0, 1fr) auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: `1px solid ${chatTheme.border}`,
                  background: chatTheme.panelAlt,
                }}
              >
                <Avatar
                  name={user.display_name || user.username}
                  avatarUrl={user.avatar_url || null}
                  size={42}
                />

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      color: chatTheme.text,
                      fontWeight: 800,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.display_name || user.username}
                  </div>
                  <div
                    style={{
                      color: chatTheme.textMuted,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    @{user.username}
                  </div>
                </div>

                <button
                  onClick={() => onAddFriend(user.id)}
                  style={chatUi.accentButton}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}