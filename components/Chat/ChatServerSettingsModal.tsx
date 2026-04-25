"use client";

import { useState } from "react";

type ChatServerSettingsModalProps = {
  open: boolean;
  currentName?: string;
  currentDescription?: string | null;
  onClose: () => void;
  onSave: (input: {
    name?: string;
    description?: string | null;
    iconFile?: File | null;
  }) => Promise<void>;
};

export default function ChatServerSettingsModal({
  open,
  currentName,
  currentDescription,
  onClose,
  onSave,
}: ChatServerSettingsModalProps) {
  const [name, setName] = useState(currentName ?? "");
  const [description, setDescription] = useState(currentDescription ?? "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);

      await onSave({
        name: name.trim() || undefined,
        description: description.trim() || null,
        iconFile,
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
            <p className="aurosPanelOverline">SERVER SETTINGS</p>
            <h3 className="aurosModalTitle">Edit server</h3>
          </div>

          <button type="button" className="aurosModalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="aurosModalForm" onSubmit={handleSubmit}>
          <label className="aurosModalField">
            <span>Server Name</span>
            <input
              className="aurosModalInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Server name"
            />
          </label>

          <label className="aurosModalField">
            <span>Description</span>
            <textarea
              className="aurosModalTextarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your server"
              rows={4}
            />
          </label>

          <label className="aurosModalField">
            <span>Server Icon</span>
            <input
              className="aurosModalInput"
              type="file"
              accept="image/*"
              onChange={(e) => setIconFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="aurosModalActions">
            <button type="button" className="aurosModalSecondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="aurosModalPrimary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}