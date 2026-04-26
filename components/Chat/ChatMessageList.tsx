"use client";

import { useState } from "react";
import type { ChatMessage, ChatCustomEmoji, ChatUserProfile } from "../../types/chat";
import ChatEmojiPicker from "./ChatEmojiPicker";

type ChatMessageListProps = {
  messages: ChatMessage[];
  customEmojis: ChatCustomEmoji[];
  mentionUsers: ChatUserProfile[];
  currentUserId?: string | null;
  onToggleReaction?: (messageId: string, emoji: string) => void | Promise<void>;
  onDeleteMessage?: (messageId: string) => void | Promise<void>;
  onOpenMentionProfile?: (user: ChatUserProfile) => void;
  onEditMessage?: (messageId: string, content: string) => void | Promise<void>;
  onReplyMessage?: (message: ChatMessage) => void;
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

function isVideo(fileType?: string | null) {
  return !!fileType && fileType.startsWith("video/");
}

function isAudio(fileType?: string | null) {
  return !!fileType && fileType.startsWith("audio/");
}

function getFileLabel(fileType?: string | null, fileName = "") {
  const name = fileName.toLowerCase();

  if (fileType === "application/pdf" || name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".zip")) return "ZIP";
  if (name.endsWith(".rar")) return "RAR";
  if (name.endsWith(".7z")) return "7Z";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "DOC";
  if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "XLS";
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "PPT";
  if (fileType?.startsWith("audio/")) return "AUD";
  if (fileType?.startsWith("video/")) return "VID";

  return "FILE";
}

function parseCustomEmoji(value: string, customEmojis: ChatCustomEmoji[]) {
  if (!value.startsWith("custom:")) return null;

  const parts = value.split(":");
  const id = parts[1];

  if (!id) return null;

  return customEmojis.find((emoji) => emoji.id === id) ?? null;
}

function renderMessageTextWithMentions(
  content: string,
  customEmojis: ChatCustomEmoji[],
  mentionUsers: ChatUserProfile[],
  currentUserId?: string | null,
  onOpenMentionProfile?: (user: ChatUserProfile) => void
) {
  const parts = content.split(/(<@[a-zA-Z0-9-]+>|:[a-zA-Z0-9_]+:|@[a-zA-Z0-9_]+)/g);

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

    const idMentionMatch = part.match(/^<@([a-zA-Z0-9-]+)>$/);

    if (idMentionMatch) {
      const userId = idMentionMatch[1];
      const mentionedUser = mentionUsers.find((user) => user.id === userId);

      if (mentionedUser) {
        const isMe = mentionedUser.id === currentUserId;
        const username = mentionedUser.username || mentionedUser.displayName || "user";

        return (
          <button
            key={index}
            type="button"
            className={`aurosMention ${isMe ? "isMe" : ""}`}
            onClick={() => onOpenMentionProfile?.(mentionedUser)}
          >
            @{username}
          </button>
        );
      }

      return <span key={index}>@unknown</span>;
    }

    const oldMentionMatch = part.match(/^@([a-zA-Z0-9_]+)$/);

    if (oldMentionMatch) {
      const username = oldMentionMatch[1].toLowerCase();

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
  onEditMessage,
  onReplyMessage,
}: ChatMessageListProps) {
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<
    string | null
  >(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

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
          <article
            id={`message-${message.id}`}
            key={message.id}
            className="aurosMessageCard"
>
            <div className="aurosMessageAvatar">
              {message.author?.avatarUrl ? (
                <img src={message.author.avatarUrl} alt={authorName} />
              ) : (
                authorName.slice(0, 1).toUpperCase()
              )}
            </div>

            <div className="aurosMessageContent">
              <div className="aurosMessageMeta">
                <button
                  type="button"
                  className="aurosMessageAuthorButton"
                  onClick={() => {
                    if (message.author) onOpenMentionProfile?.(message.author);
                  }}
                >
                  {authorName}
                </button>

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

              {message.replyToId && (
                <button
                  type="button"
                  className="aurosMessageReplyReference"
                    onClick={() => {
                      const target = document.getElementById(`message-${message.replyToId}`);
                      const scrollArea = target?.closest(".aurosChatScrollArea") as HTMLElement | null;

                      if (!target || !scrollArea) return;

                      const targetTop = target.offsetTop - scrollArea.offsetTop;

                      scrollArea.scrollTo({
                        top: targetTop - scrollArea.clientHeight / 2 + target.clientHeight / 2,
                        behavior: "smooth",
                      });

                      target.classList.add("isReplyHighlighted");

                      window.setTimeout(() => {
                        target.classList.remove("isReplyHighlighted");
                      }, 12000);
                    }}
                >
                  {(() => {
                    const repliedMessage = messages.find(
                      (item) => item.id === message.replyToId
                    );

                    if (!repliedMessage) {
                      return "Reply to deleted or unavailable message";
                    }

                    const repliedAuthor =
                      repliedMessage.author?.displayName ??
                      repliedMessage.author?.username ??
                      "User";

                    const repliedText =
                      repliedMessage.content?.trim() ||
                      (repliedMessage.attachments?.length ? "Attachment" : "Message");

                    return `Replying to ${repliedAuthor}: ${repliedText.slice(0, 80)}`;
                  })()}
                </button>
              )}

              {editingMessageId === message.id ? (
                <form
                  className="aurosEditMessageForm"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await onEditMessage?.(message.id, editingContent);
                    setEditingMessageId(null);
                    setEditingContent("");
                  }}
                >
                  <input
                    className="aurosMessageInput"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    autoFocus
                  />

                  <button type="submit" className="aurosReactionAddButton">
                    Save
                  </button>

                  <button
                    type="button"
                    className="aurosReactionAddButton"
                    onClick={() => {
                      setEditingMessageId(null);
                      setEditingContent("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                message.content.trim() && (
                  <p className="aurosMessageText">
                    {renderMessageTextWithMentions(
                      message.content,
                      customEmojis,
                      mentionUsers,
                      currentUserId,
                      onOpenMentionProfile
                    )}
                  </p>
                )
              )}

              {attachments.length > 0 && (
                <div className="aurosMessageAttachmentList">
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
                      ) : isVideo(file.fileType) ? (
                        <video
                          className="aurosMessageAttachmentVideo"
                          src={file.fileUrl}
                          controls
                        />
                      ) : isAudio(file.fileType) ? (
                        <audio
                          className="aurosMessageAttachmentAudio"
                          src={file.fileUrl}
                          controls
                        />
                      ) : (
                        <div className="aurosMessageFileCard">
                          <span className="aurosMessageFileIcon">
                            {getFileLabel(file.fileType, file.fileName)}
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

                <button
                  type="button"
                  className="aurosReactionAddButton"
                  onClick={() => onReplyMessage?.(message)}
                >
                  Reply
                </button>

                {isOwnMessage && (
                  <button
                    type="button"
                    className="aurosReactionAddButton"
                    onClick={() => {
                      setEditingMessageId(message.id);
                      setEditingContent(message.content);
                    }}
                  >
                    Edit
                  </button>
                )}

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