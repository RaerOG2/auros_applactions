"use client";

import { useEffect, useState } from "react";
import type { ChatCustomEmoji } from "../../types/chat";

type ChatCustomEmojiModalProps = {
  open: boolean;
  customEmojis: ChatCustomEmoji[];
  onClose: () => void;
  onCreate: (input: { name: string; file: File }) => Promise<void>;
  onDelete: (emojiId: string) => Promise<void>;
};

export default function ChatCustomEmojiModal({
  open,
  customEmojis,
  onClose,
  onCreate,
  onDelete,
}: ChatCustomEmojiModalProps) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setName("");
    setFile(null);
    setSubmitting(false);
    setDeletingId(null);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) return;

    try {
      setSubmitting(true);

      await onCreate({
        name,
        file,
      });

      setName("");
      setFile(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(emojiId: string) {
    try {
      setDeletingId(emojiId);
      await onDelete(emojiId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="aurosModalOverlay">
      <div className="aurosModalCard">
        <div className="aurosModalHeader">
          <div>
            <p className="aurosPanelOverline">CUSTOM EMOJI</p>
            <h3 className="aurosModalTitle">Create custom emoji</h3>
          </div>

          <button type="button" className="aurosModalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="aurosModalForm" onSubmit={handleSubmit}>
          <label className="aurosModalField">
            <span>Emoji Name</span>
            <input
              className="aurosModalInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="example: auros_fire"
              maxLength={32}
            />
          </label>

          <label className="aurosModalField">
            <span>Emoji Image</span>
            <input
              className="aurosModalInput"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="aurosModalActions">
            <button type="button" className="aurosModalSecondary" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="aurosModalPrimary"
              disabled={submitting || !file}
            >
              {submitting ? "Creating..." : "Create Emoji"}
            </button>
          </div>
        </form>

        <div className="aurosCustomEmojiList">
          <p className="aurosPanelOverline">EXISTING EMOJIS</p>

          {customEmojis.length === 0 ? (
            <p className="aurosEmojiEmpty">No custom emojis yet.</p>
          ) : (
            customEmojis.map((emoji) => (
              <div key={emoji.id} className="aurosCustomEmojiRow">
                <img src={emoji.imageUrl} alt={emoji.name} />

                <span>:{emoji.name}:</span>

                <button
                  type="button"
                  className="aurosModalSecondary"
                  onClick={() => handleDelete(emoji.id)}
                  disabled={deletingId === emoji.id}
                >
                  {deletingId === emoji.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}