"use client";

import type { CustomEmojiItem } from "../../types/emoji";

type EmojiPickerProps = {
  customEmojis: CustomEmojiItem[];
  onPick: (emoji: string) => void;
};

const defaultEmojis = ["😀", "😂", "🔥", "❤️", "👍", "👀", "🎉", "😎", "✅", "🚀"];

export default function EmojiPicker({
  customEmojis,
  onPick,
}: EmojiPickerProps) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "16px",
        border: "1px solid #22304d",
        background: "rgba(11, 21, 43, 0.96)",
        display: "grid",
        gap: 12,
      }}
    >
      <div>
        <p style={{ margin: "0 0 8px 0", color: "#9fb0d0", fontSize: 13 }}>
          Standard Emojis
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {defaultEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onPick(emoji)}
              style={{
                padding: "8px 10px",
                borderRadius: "12px",
                border: "1px solid #22304d",
                background: "rgba(15, 27, 52, 0.9)",
                color: "white",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {customEmojis.length > 0 && (
        <div>
          <p style={{ margin: "0 0 8px 0", color: "#9fb0d0", fontSize: 13 }}>
            Custom Emojis
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {customEmojis.map((emoji) => (
              <button
                key={emoji.id}
                onClick={() => onPick(`:${emoji.shortcode}:`)}
                style={{
                  padding: "8px 10px",
                  borderRadius: "12px",
                  border: "1px solid #22304d",
                  background: "rgba(15, 27, 52, 0.9)",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <img
                  src={emoji.image_url}
                  alt={emoji.shortcode}
                  style={{
                    width: 20,
                    height: 20,
                    objectFit: "contain",
                    borderRadius: 4,
                  }}
                />
                <span style={{ fontSize: 13 }}>:{emoji.shortcode}:</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}