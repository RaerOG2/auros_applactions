"use client";

import { useEffect, useState } from "react";
import type { ChatUserProfile } from "../../types/chat";
import { searchUsersForDirectMessage } from "../../services/dm.service";

type ChatNewDMModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void | Promise<void>;
};

export default function ChatNewDMModal({
  open,
  onClose,
  onSelectUser,
}: ChatNewDMModalProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ChatUserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectingUserId, setSelectingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setUsers([]);
      setLoading(false);
      setSelectingUserId(null);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    async function searchUsers() {
      if (query.trim().length < 2) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);

        const results = await searchUsersForDirectMessage(query);

        if (!isMounted) return;

        setUsers(results);
      } catch (error) {
        console.warn("[ChatNewDMModal] Failed to search users:", error);

        if (isMounted) {
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const timeout = window.setTimeout(searchUsers, 250);

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
    };
  }, [open, query]);

  if (!open) return null;

  async function handleSelectUser(userId: string) {
    try {
      setSelectingUserId(userId);
      await onSelectUser(userId);
      onClose();
    } finally {
      setSelectingUserId(null);
    }
  }

  return (
    <div className="aurosModalOverlay">
      <div className="aurosModalCard" style={{ maxWidth: 560 }}>
        <div className="aurosModalHeader">
          <div>
            <p className="aurosPanelOverline">DIRECT MESSAGE</p>
            <h3 className="aurosModalTitle">Start a DM</h3>
          </div>

          <button type="button" className="aurosModalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="aurosModalForm">
          <label className="aurosModalField">
            <span>Search User</span>
            <input
              className="aurosModalInput"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or display name..."
              autoFocus
            />
          </label>

          <div style={{ display: "grid", gap: 10 }}>
            {query.trim().length < 2 && (
              <p className="aurosProfileBio">
                Type at least 2 characters to search for users.
              </p>
            )}

            {loading && <p className="aurosProfileBio">Searching users...</p>}

            {!loading && query.trim().length >= 2 && users.length === 0 && (
              <p className="aurosProfileBio">No users found.</p>
            )}

            {users.map((user) => {
              const name = user.displayName || user.username || "User";

              return (
                <button
                  key={user.id}
                  type="button"
                  className="aurosSidebarRow"
                  onClick={() => handleSelectUser(user.id)}
                  disabled={selectingUserId === user.id}
                  style={{
                    padding: 12,
                    borderRadius: 16,
                    border: "1px solid rgba(212,175,55,0.14)",
                    background: "rgba(31,31,31,0.72)",
                  }}
                >
                  <span className="aurosSidebarRowLeft">
                    <span className="aurosDmAvatarMini">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "inherit",
                          }}
                        />
                      ) : (
                        name.slice(0, 1).toUpperCase()
                      )}
                    </span>

                    <span style={{ display: "grid", gap: 2 }}>
                      <strong>{name}</strong>
                      <span style={{ fontSize: 12, color: "#998f76" }}>
                        @{user.username || "unknown"}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}