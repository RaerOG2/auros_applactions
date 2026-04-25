"use client";

import type { ChatMessage } from "../../types/chat";

type ChatMessageListProps = {
  messages: ChatMessage[];
  onToggleReaction?: (messageId: string, emoji: string) => void | Promise<void>;
  currentUserId?: string | null;
  onDeleteMessage?: (messageId: string) => void | Promise<void>;
};

function getAuthorName(message: ChatMessage) {
  return message.author?.displayName ?? message.author?.username ?? "Unknown User";
}

function getMessageTime(message: ChatMessage) {
  try {
    return new Date(message.createdAt).toLocaleString();
  } catch {
    return message.createdAt;
  }
}

function groupReactions(message: ChatMessage) {
  const grouped = new Map<string, number>();

  for (const reaction of message.reactions ?? []) {
    grouped.set(reaction.emoji, (grouped.get(reaction.emoji) ?? 0) + 1);
  }

  return Array.from(grouped.entries()).map(([emoji, count]) => ({
    emoji,
    count,
  }));
}

export default function ChatMessageList({
  messages,
  currentUserId,
  onToggleReaction,
  onDeleteMessage,
}: ChatMessageListProps) {
  if (!messages.length) {
    return (
      <div className="aurosChatEmptyMessages">
        <p>No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="aurosChatMessageList">
      {messages.map((message) => {
        const authorName = getAuthorName(message);
        const isOwnMessage = !!currentUserId && message.authorId === currentUserId;

        return (
          <article key={message.id} className="aurosMessageCard">
            <div className="aurosMessageAvatar">
              {message.author?.avatarUrl ? (
                <img
                  src={message.author.avatarUrl}
                  alt={authorName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "inherit",
                  }}
                />
              ) : (
                authorName.slice(0, 1).toUpperCase()
              )}
            </div>

            <div className="aurosMessageContent">
              <div className="aurosMessageMeta">
                <strong>{authorName}</strong>
                <span>{getMessageTime(message)}</span>
                {message.editedAt && <span>Edited</span>}
                {message.author?.status && (
                  <span
                    style={{
                      color:
                        message.author.status === "online"
                          ? "#4ade80"
                          : message.author.status === "idle"
                          ? "#facc15"
                          : message.author.status === "dnd"
                          ? "#f87171"
                          : "#9ca3af",
                    }}
                  >
                    {message.author.status}
                  </span>
                )}
              </div>

              <p className="aurosMessageText">{message.content}</p>

              <div className="aurosReactionRow">
                {groupReactions(message).map((reaction) => (
                  <button
                    key={`${message.id}-${reaction.emoji}`}
                    type="button"
                    className="aurosReactionButton"
                    onClick={() => onToggleReaction?.(message.id, reaction.emoji)}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}

                <button
                  type="button"
                  className="aurosReactionAddButton"
                  onClick={() => onToggleReaction?.(message.id, "🔥")}
                >
                  🔥
                </button>

                <button
                  type="button"
                  className="aurosReactionAddButton"
                  onClick={() => onToggleReaction?.(message.id, "❤️")}
                >
                  ❤️
                </button>

                <button
                  type="button"
                  className="aurosReactionAddButton"
                  onClick={() => onToggleReaction?.(message.id, "😂")}
                >
                  😂
                </button>

                {isOwnMessage && (
                  <button
                    type="button"
                    className="aurosReactionAddButton"
                    onClick={() => onDeleteMessage?.(message.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}