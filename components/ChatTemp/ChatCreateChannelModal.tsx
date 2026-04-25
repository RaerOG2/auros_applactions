"use client";

import { useState } from "react";

type ChatCreateChannelModalProps = {
  open: boolean;
  serverName?: string | null;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    type?: "text" | "announcement" | "application";
    topic?: string | null;
    isPrivate?: boolean;
  }) => Promise<void>;
};

export default function ChatCreateChannelModal({
  open,
  serverName,
  onClose,
  onCreate,
}: ChatCreateChannelModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "announcement" | "application">("text");
  const [topic, setTopic] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);

      await onCreate({
        name: name.trim(),
        type,
        topic: topic.trim() || null,
        isPrivate,
      });

      setName("");
      setType("text");
      setTopic("");
      setIsPrivate(false);
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
            <p className="aurosPanelOverline">CHANNEL CREATION</p>
            <h3 className="aurosModalTitle">
              Create a channel{serverName ? ` in ${serverName}` : ""}
            </h3>
          </div>

          <button type="button" className="aurosModalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="aurosModalForm" onSubmit={handleSubmit}>
          <label className="aurosModalField">
            <span>Channel Name</span>
            <input
              className="aurosModalInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="general-chat"
            />
          </label>

          <label className="aurosModalField">
            <span>Channel Type</span>
            <select
              className="aurosModalInput"
              value={type}
              onChange={(e) =>
                setType(e.target.value as "text" | "announcement" | "application")
              }
            >
              <option value="text">Text</option>
              <option value="announcement">Announcement</option>
              <option value="application">Application</option>
            </select>
          </label>

          <label className="aurosModalField">
            <span>Topic</span>
            <textarea
              className="aurosModalTextarea"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What is this channel about?"
              rows={4}
            />
          </label>

          <label className="aurosModalCheckbox">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <span>Private channel</span>
          </label>

          <div className="aurosModalActions">
            <button type="button" className="aurosModalSecondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="aurosModalPrimary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}