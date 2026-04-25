"use client";

import { useState } from "react";

type ChatCreateServerModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    slug?: string | null;
    description?: string | null;
    isPublic?: boolean;
  }) => Promise<void>;
};

export default function ChatCreateServerModal({
  open,
  onClose,
  onCreate,
}: ChatCreateServerModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);

      await onCreate({
        name: name.trim(),
        slug: slug.trim() || null,
        description: description.trim() || null,
        isPublic,
      });

      setName("");
      setSlug("");
      setDescription("");
      setIsPublic(true);
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
            <p className="aurosPanelOverline">SERVER CREATION</p>
            <h3 className="aurosModalTitle">Create a new server</h3>
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
              placeholder="My Community"
            />
          </label>

          <label className="aurosModalField">
            <span>Slug</span>
            <input
              className="aurosModalInput"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-community"
            />
          </label>

          <label className="aurosModalField">
            <span>Description</span>
            <textarea
              className="aurosModalTextarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this server for?"
              rows={4}
            />
          </label>

          <label className="aurosModalCheckbox">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span>Public server</span>
          </label>

          <div className="aurosModalActions">
            <button type="button" className="aurosModalSecondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="aurosModalPrimary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}