"use client";

import { useRef, useState } from "react";

type ChatMessageInputProps = {
  placeholder: string;
  onSendMessage: (content: string, files?: File[]) => Promise<void>;
  onTyping?: () => void;
};

export default function ChatMessageInput({
  placeholder,
  onSendMessage,
  onTyping,
}: ChatMessageInputProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim() && files.length === 0) return;

    try {
      setSending(true);
      await onSendMessage(content, files);
      setContent("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setSending(false);
    }
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
                  setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))
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

        <button className="aurosMessageSendButton" type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}