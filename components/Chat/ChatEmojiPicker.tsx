"use client";

import type { ChatCustomEmoji } from "../../types/chat";

const STANDARD_EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "☺️",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "😘",
  "😗",
  "😋",
  "😜",
  "😝",
  "😛",
  "🤑",
  "🤗",
  "🤓",
  "😎",
  "🤡",
  "🤠",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "😭",
  "😡",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "🎉",
  "💀",
  "👀",
  "✅",
  "❌",
  "⭐",
  "💎",
  "🚀",
];

type ChatEmojiPickerProps = {
  open: boolean;
  customEmojis: ChatCustomEmoji[];
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
};

export default function ChatEmojiPicker({
  open,
  customEmojis,
  onSelectEmoji,
  onClose,
}: ChatEmojiPickerProps) {
  if (!open) return null;

  return (
    <div className="aurosEmojiPicker">
      <div className="aurosEmojiPickerHeader">
        <span>Emojis</span>
        <button type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <p className="aurosEmojiPickerLabel">Standard</p>

      <div className="aurosEmojiGrid">
        {STANDARD_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="aurosEmojiButton"
            onClick={() => {
              onSelectEmoji(emoji);
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      <p className="aurosEmojiPickerLabel">Custom</p>

      {customEmojis.length === 0 ? (
        <p className="aurosEmojiEmpty">No custom emojis yet.</p>
      ) : (
        <div className="aurosEmojiGrid">
          {customEmojis.map((emoji) => (
            <button
              key={emoji.id}
              type="button"
              className="aurosEmojiButton"
              title={`:${emoji.name}:`}
              onClick={() => {
                onSelectEmoji(
                  `custom:${emoji.id}`
                );
                onClose();
              }}
            >
              <img src={emoji.imageUrl} alt={emoji.name} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}