"use client";

import { useState } from "react";
import type { ProfileItem } from "../../types/profile";
import type { CustomEmojiItem } from "../../types/emoji";
import EmojiPicker from "./EmojiPicker";
import MentionAutocomplete from "./MentionAutocomplete";

type ChatMessageInputProps = {
  profile: ProfileItem | null;
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: () => void;
  sending: boolean;
  customEmojis: CustomEmojiItem[];
  mentionResults: ProfileItem[];
  mentionLoading: boolean;
  mentionOpen: boolean;
  onPickMention: (username: string) => void;
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "20px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "15px",
  minHeight: "120px",
  resize: "vertical",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(76, 201, 240, 0.18)",
};

const ghostButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

export default function ChatMessageInput({
  profile,
  messageInput,
  setMessageInput,
  sendMessage,
  sending,
  customEmojis,
  mentionResults,
  mentionLoading,
  mentionOpen,
  onPickMention,
}: ChatMessageInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  function appendEmoji(emoji: string) {
    setMessageInput(`${messageInput}${emoji}`);
    setShowEmojiPicker(false);
  }

  return (
    <section style={glassCardStyle}>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Send Message</h3>

      {!profile ? (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(245, 158, 11, 0.20)",
            background: "rgba(245, 158, 11, 0.10)",
            color: "#ffd58f",
            fontWeight: 600,
          }}
        >
          You need an account and must be logged in to send messages.
        </div>
      ) : (
        <>
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Write a message... Use @username for mentions"
            style={textareaStyle}
          />

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <MentionAutocomplete
              open={mentionOpen}
              loading={mentionLoading}
              results={mentionResults}
              onPick={onPickMention}
            />

            {showEmojiPicker && (
              <EmojiPicker customEmojis={customEmojis} onPick={appendEmoji} />
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                type="button"
                style={ghostButtonStyle}
              >
                {showEmojiPicker ? "Hide Emojis" : "Emoji Picker"}
              </button>
            </div>

            <button onClick={sendMessage} disabled={sending} style={primaryButtonStyle}>
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}