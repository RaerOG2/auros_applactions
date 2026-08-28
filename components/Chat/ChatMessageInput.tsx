"use client";

import { useMemo, useRef, useState } from "react";
import type {
  ChatCustomEmoji,
  ChatMessage,
  ChatUserProfile,
} from "../../types/chat";
import ChatEmojiPicker from "./ChatEmojiPicker";

type ChatMessageInputProps = {
  placeholder: string;
  customEmojis: ChatCustomEmoji[];
  mentionUsers: ChatUserProfile[];
  replyToMessage?: ChatMessage | null;
  onCancelReply?: () => void;
  onSendMessage: (content: string, files?: File[]) => Promise<void>;
  onTyping?: () => void;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function getCurrentMentionQuery(value: string) {
  const match = value.match(/(^|\s)@([a-zA-Z0-9_]*)$/);
  return match?.[2] ?? null;
}

function isOnlineUser(user: ChatUserProfile) {
  return user.status === "online" || user.status === "idle" || user.status === "dnd";
}

function getFilePreviewLabel(file: File) {
  const name = file.name.toLowerCase();

  if (file.type.startsWith("image/")) return "IMG";
  if (file.type.startsWith("video/")) return "VID";
  if (file.type.startsWith("audio/")) return "AUD";
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".zip")) return "ZIP";
  if (name.endsWith(".rar")) return "RAR";
  if (name.endsWith(".7z")) return "7Z";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "DOC";
  if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "XLS";
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "PPT";

  return "FILE";
}

export default function ChatMessageInput({
  placeholder,
  customEmojis,
  mentionUsers,
  replyToMessage,
  onCancelReply,
  onSendMessage,
  onTyping,
}: ChatMessageInputProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
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
  const specialMentions =
  mentionQuery !== null
    ? ["everyone", "here"].filter((item) =>
        item.includes(mentionQuery.toLowerCase())
      )
    : [];


  function addFiles(nextFiles: File[]) {
    const validFiles = nextFiles.filter((file) => file.size <= MAX_FILE_SIZE);

    if (validFiles.length !== nextFiles.length) {
      alert("One or more files are larger than 100MB.");
    }

    setFiles((prev) => [...prev, ...validFiles]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim() && files.length === 0) return;

    try {
      setSending(true);
      setUploading(files.length > 0);

      await onSendMessage(content, files);

      setContent("");
      setFiles([]);
      setEmojiOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setSending(false);
      setUploading(false);
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
    const username = user.username || user.displayName || "user";

    setContent((prev) => {
      return prev.replace(/(^|\s)@([a-zA-Z0-9_]*)$/, `$1@${username} `);
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
    <form
      className="aurosMessageInputWrap"
      onSubmit={handleSubmit}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        addFiles(Array.from(e.dataTransfer.files ?? []));
      }}
    >
      {replyToMessage && (
        <div className="aurosReplyPreview">
          <div>
            <strong>
              Replying to{" "}
              {replyToMessage.author?.displayName ??
                replyToMessage.author?.username ??
                "User"}
            </strong>
            <p>{replyToMessage.content || "Attachment"}</p>
          </div>

          <button type="button" onClick={onCancelReply}>
            ×
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="aurosAttachmentPreviewRow">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="aurosAttachmentPreview">
              <strong className="aurosAttachmentPreviewIcon">
                {getFilePreviewLabel(file)}
              </strong>

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

      {uploading && (
        <div className="aurosUploadProgress">
          <div />
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
          accept="image/*,video/*,audio/*,.pdf,.txt,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.json,.csv"
          style={{ display: "none" }}
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
        />

        <div className="aurosMessageInputEmojiWrap">
          {(specialMentions.length > 0 || filteredMentionUsers.length > 0) && (
            <div className="aurosMentionPicker">
              {specialMentions.length > 0 && (
                <>
                  <p className="aurosMentionPickerGroup">Special</p>

                  {specialMentions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="aurosMentionPickerItem"
                      onClick={() => {
                        setContent((prev) =>
                          prev.replace(/(^|\s)@([a-zA-Z0-9_]*)$/, `$1@${item} `)
                        );
                      }}
                    >
                      <span className="aurosMentionPickerAvatar">@</span>

                      <span>
                        <strong>@{item}</strong>
                        <small>
                          {item === "everyone"
                            ? "Notify everyone in this server"
                            : "Notify people currently here"}
                        </small>
                      </span>
                    </button>
                  ))}
                </>
              )}

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