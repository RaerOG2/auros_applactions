"use client";

import { useEffect, useState } from "react";

type ChatCustomEmojiModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { name: string; file: File }) => Promise<void>;
};

export default function ChatCustomEmojiModal({
  open,
  onClose,
  onCreate,
}: ChatCustomEmojiModalProps) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setName("");
    setFile(null);
    setSubmitting(false);
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

      onClose();
    } finally {
      setSubmitting(false);
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
      </div>
    </div>
  );
}