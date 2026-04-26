"use client";

import type { ChatMessage, ChatCustomEmoji, ChatUserProfile } from "../../types/chat";
import ChatEmojiPicker from "./ChatEmojiPicker";
import { useState } from "react";

type ChatMessageListProps = {
  messages: ChatMessage[];
  customEmojis: ChatCustomEmoji[];
  mentionUsers: ChatUserProfile[];
  onToggleReaction?: (messageId: string, emoji: string) => void | Promise<void>;
  currentUserId?: string | null;
  onDeleteMessage?: (messageId: string) => void | Promise<void>;
  onOpenMentionProfile?: (user: ChatUserProfile) => void;
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

function isImage(fileType?: string | null) {
  return !!fileType && fileType.startsWith("image/");
}

function isPdf(fileType?: string | null, fileName?: string) {
  return fileType === "application/pdf" || fileName?.toLowerCase().endsWith(".pdf");
}

function parseCustomEmoji(value: string, customEmojis: ChatCustomEmoji[]) {
  if (!value.startsWith("custom:")) return null;

  const parts = value.split(":");
  const id = parts[1];

  if (!id) return null;

  return customEmojis.find((emoji) => emoji.id === id) ?? null;
}

function renderMessageText(content: string, customEmojis: ChatCustomEmoji[]) {
  const parts = content.split(/(:[a-zA-Z0-9_]+:)/g);

  return parts.map((part, index) => {
    const match = part.match(/^:([a-zA-Z0-9_]+):$/);

    if (!match) {
      return <span key={index}>{part}</span>;
    }

    const emojiName = match[1];
    const customEmoji = customEmojis.find((emoji) => emoji.name === emojiName);

    if (!customEmoji) {
      return <span key={index}>{part}</span>;
    }

    return (
      <img
        key={index}
        src={customEmoji.imageUrl}
        alt={customEmoji.name}
        title={`:${customEmoji.name}:`}
        className="aurosInlineCustomEmoji"
      />
    );
  });
}

function renderMessageTextWithMentions(
  content: string,
  customEmojis: ChatCustomEmoji[],
  mentionUsers: ChatUserProfile[],
  currentUserId?: string | null,
  onOpenMentionProfile?: (user: ChatUserProfile) => void
) {
  const parts = content.split(/(:[a-zA-Z0-9_]+:|@[a-zA-Z0-9_]+)/g);

  return parts.map((part, index) => {
    const emojiMatch = part.match(/^:([a-zA-Z0-9_]+):$/);

    if (emojiMatch) {
      const emojiName = emojiMatch[1];
      const customEmoji = customEmojis.find((emoji) => emoji.name === emojiName);

      if (customEmoji) {
        return (
          <img
            key={index}
            src={customEmoji.imageUrl}
            alt={customEmoji.name}
            title={`:${customEmoji.name}:`}
            className="aurosInlineCustomEmoji"
          />
        );
      }
    }

    const mentionMatch = part.match(/^@([a-zA-Z0-9_]+)$/);

    if (mentionMatch) {
      const username = mentionMatch[1].toLowerCase();

      const mentionedUser = mentionUsers.find(
        (user) => user.username?.toLowerCase() === username
      );

      if (mentionedUser) {
        const isMe = mentionedUser.id === currentUserId;

        return (
          <button
            key={index}
            type="button"
            className={`aurosMention ${isMe ? "isMe" : ""}`}
            onClick={() => onOpenMentionProfile?.(mentionedUser)}
          >
            {part}
          </button>
        );
      }
    }

    return <span key={index}>{part}</span>;
  });
}

function ReactionContent({
  emoji,
  customEmojis,
}: {
  emoji: string;
  customEmojis: ChatCustomEmoji[];
}) {
  const customEmoji = parseCustomEmoji(emoji, customEmojis);

  if (customEmoji) {
    return (
      <img
        className="aurosReactionCustomEmoji"
        src={customEmoji.imageUrl}
        alt={customEmoji.name}
        title={`:${customEmoji.name}:`}
      />
    );
  }

  return <span>{emoji}</span>;
}

export default function ChatMessageList({
  messages,
  customEmojis,
  mentionUsers,
  currentUserId,
  onToggleReaction,
  onDeleteMessage,
  onOpenMentionProfile,
}: ChatMessageListProps) {
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<
    string | null
  >(null);

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
        const attachments = message.attachments ?? [];

        return (
          <article key={message.id} className="aurosMessageCard">
            <div className="aurosMessageAvatar">
              {message.author?.avatarUrl ? (
                <img src={message.author.avatarUrl} alt={authorName} />
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

              {message.content.trim() && (
               <p className="aurosMessageText">
                {renderMessageTextWithMentions(
                  message.content,
                  customEmojis,
                  mentionUsers,
                  currentUserId,
                  onOpenMentionProfile
                )}
               </p>
              )}

              {attachments.length > 0 && (
                <div className="aurosMessageAttachments">
                  {attachments.map((file) => (
                    <a
                      key={file.id}
                      className="aurosMessageAttachment"
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {isImage(file.fileType) ? (
                        <img
                          className="aurosMessageAttachmentImage"
                          src={file.fileUrl}
                          alt={file.fileName}
                        />
                      ) : (
                        <div className="aurosMessageFileCard">
                          <span className="aurosMessageFileIcon">
                            {isPdf(file.fileType, file.fileName) ? "PDF" : "FILE"}
                          </span>
                          <span>{file.fileName}</span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              )}

              <div className="aurosReactionRow">
                {groupReactions(message).map((reaction) => (
                  <button
                    key={`${message.id}-${reaction.emoji}`}
                    type="button"
                    className="aurosReactionButton"
                    onClick={() => onToggleReaction?.(message.id, reaction.emoji)}
                  >
                    <ReactionContent emoji={reaction.emoji} customEmojis={customEmojis} />
                    <span>{reaction.count}</span>
                  </button>
                ))}

                <div className="aurosReactionPickerWrap">
                  <button
                    type="button"
                    className="aurosReactionAddButton"
                    onClick={() =>
                      setReactionPickerMessageId((prev) =>
                        prev === message.id ? null : message.id
                      )
                    }
                  >
                    +
                  </button>

                  <ChatEmojiPicker
                    open={reactionPickerMessageId === message.id}
                    customEmojis={customEmojis}
                    onSelectEmoji={(emoji) => onToggleReaction?.(message.id, emoji)}
                    onClose={() => setReactionPickerMessageId(null)}
                  />
                </div>

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