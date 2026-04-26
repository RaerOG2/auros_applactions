"use client";

import { useMemo, useRef, useState } from "react";
import type { ChatCustomEmoji, ChatUserProfile } from "../../types/chat";
import ChatEmojiPicker from "./ChatEmojiPicker";

type ChatMessageInputProps = {
  placeholder: string;
  customEmojis: ChatCustomEmoji[];
  mentionUsers: ChatUserProfile[];
  onSendMessage: (content: string, files?: File[]) => Promise<void>;
  onTyping?: () => void;
};

function getCurrentMentionQuery(value: string) {
  const match = value.match(/(^|\s)@([a-zA-Z0-9_]*)$/);
  return match?.[2] ?? null;
}

function isOnlineUser(user: ChatUserProfile) {
  return user.status === "online" || user.status === "idle" || user.status === "dnd";
}

export default function ChatMessageInput({
  placeholder,
  customEmojis,
  mentionUsers,
  onSendMessage,
  onTyping,
}: ChatMessageInputProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mentionQuery = getCurrentMentionQuery(content);

  const filteredMentionUsers = useMemo(() => {
    if (mentionQuery === null) return [];

    const query = mentionQuery.toLowerCase();

    return mentionUsers
      .filter((user) => {
        const username = user.username?.toLowerCase() ?? "";
        const displayName = user.displayName?.toLowerCase() ?? "";

        return username.includes(query) || displayName.includes(query);
      })
      .slice(0, 12);
  }, [mentionQuery, mentionUsers]);

  const onlineMentionUsers = filteredMentionUsers.filter(isOnlineUser);
  const offlineMentionUsers = filteredMentionUsers.filter(
    (user) => !isOnlineUser(user)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim() && files.length === 0) return;

    try {
      setSending(true);

      await onSendMessage(content, files);

      setContent("");
      setFiles([]);
      setEmojiOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setSending(false);
    }
  }

function handleSelectEmoji(emoji: string) {
  if (emoji.startsWith("custom:")) {
    const parts = emoji.split(":");
    const name = parts[2] || "emoji";

    setContent((prev) => `${prev}:${name}:`);
    return;
  }

  setContent((prev) => `${prev}${emoji}`);
}

  function handleSelectMention(user: ChatUserProfile) {
    const mentionName = user.username || user.displayName || "user";

    setContent((prev) => {
      return prev.replace(/(^|\s)@([a-zA-Z0-9_]*)$/, `$1@${mentionName} `);
    });
  }

  function renderMentionUser(user: ChatUserProfile) {
    return (
      <button
        key={user.id}
        type="button"
        className="aurosMentionPickerItem"
        onClick={() => handleSelectMention(user)}
      >
        <span className="aurosMentionPickerAvatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName || user.username} />
          ) : (
            (user.displayName || user.username || "U").slice(0, 1).toUpperCase()
          )}
        </span>

        <span>
          <strong>{user.displayName || user.username}</strong>
          <small>
            @{user.username} · {user.status ?? "offline"}
          </small>
        </span>
      </button>
    );
  }

  return (
    <form className="aurosMessageInputWrap" onSubmit={handleSubmit}>
      {files.length > 0 && (
        <div className="aurosAttachmentPreviewRow">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="aurosAttachmentPreview">
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() =>
                  setFiles((prev) =>
                    prev.filter((_, fileIndex) => fileIndex !== index)
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="aurosMessageInputBar">
        <button
          type="button"
          className="aurosMessageAttachButton"
          onClick={() => fileInputRef.current?.click()}
        >
          +
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.zip,.rar,.7z,.doc,.docx"
          style={{ display: "none" }}
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files ?? []);
            setFiles(selectedFiles);
          }}
        />

        <div className="aurosMessageInputEmojiWrap">
          {filteredMentionUsers.length > 0 && (
            <div className="aurosMentionPicker">
              {onlineMentionUsers.length > 0 && (
                <>
                  <p className="aurosMentionPickerGroup">Online</p>
                  {onlineMentionUsers.map(renderMentionUser)}
                </>
              )}

              {offlineMentionUsers.length > 0 && (
                <>
                  <p className="aurosMentionPickerGroup">Offline</p>
                  {offlineMentionUsers.map(renderMentionUser)}
                </>
              )}
            </div>
          )}

          <input
            className="aurosMessageInput"
            value={content}
            placeholder={placeholder}
            disabled={sending}
            onChange={(e) => {
              setContent(e.target.value);
              onTyping?.();
            }}
          />

          <ChatEmojiPicker
            open={emojiOpen}
            customEmojis={customEmojis}
            onSelectEmoji={handleSelectEmoji}
            onClose={() => setEmojiOpen(false)}
          />
        </div>

        <button
          type="button"
          className="aurosMessageEmojiButton"
          onClick={() => setEmojiOpen((prev) => !prev)}
        >
          :)
        </button>

        <button className="aurosMessageSendButton" type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}