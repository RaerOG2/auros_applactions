"use client";

import { useMemo, useState } from "react";
import type { ChatMessage } from "../../types/chat";

type ChatSearchModalProps = {
  open: boolean;
  messages: ChatMessage[];
  onClose: () => void;
  onJumpToMessage?: (messageId: string) => void;
};

export default function ChatSearchModal({
  open,
  messages,
  onClose,
  onJumpToMessage,
}: ChatSearchModalProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return messages
      .filter((message) => message.content.toLowerCase().includes(q))
      .slice(0, 30);
  }, [query, messages]);

  if (!open) return null;

  return (
    <div className="aurosModalOverlay">
      <div className="aurosModalCard">
        <div className="aurosModalHeader">
          <div>
            <p className="aurosPanelOverline">MESSAGE SEARCH</p>
            <h3 className="aurosModalTitle">Search messages</h3>
          </div>

          <button type="button" className="aurosModalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <input
          className="aurosModalInput"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search loaded messages..."
          autoFocus
        />

        <div className="aurosSearchResults">
          {query.trim() && results.length === 0 && (
            <p className="aurosEmojiEmpty">No results in loaded messages.</p>
          )}

          {results.map((message) => (
            <button
              key={message.id}
              type="button"
              className="aurosSearchResult"
              onClick={() => {
                onJumpToMessage?.(message.id);
                onClose();
              }}
            >
              <strong>
                {message.author?.displayName ?? message.author?.username ?? "User"}
              </strong>
              <span>{message.content.slice(0, 160)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}