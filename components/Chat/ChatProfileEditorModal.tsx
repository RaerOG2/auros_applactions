"use client";

import { useEffect, useState } from "react";

type ChatProfileEditorModalProps = {
  open: boolean;
  currentUsername?: string;
  currentDisplayName?: string;
  currentBio?: string | null;
  onClose: () => void;
  onSave: (input: {
    username?: string;
    displayName?: string;
    bio?: string | null;
    avatarFile?: File | null;
    bannerFile?: File | null;
    removeAvatar?: boolean;
    removeBanner?: boolean;
  }) => Promise<void>;
};

export default function ChatProfileEditorModal({
  open,
  currentUsername,
  currentDisplayName,
  currentBio,
  onClose,
  onSave,
}: ChatProfileEditorModalProps) {
  const [username, setUsername] = useState(currentUsername ?? "");
  const [displayName, setDisplayName] = useState(currentDisplayName ?? "");
  const [bio, setBio] = useState(currentBio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setUsername(currentUsername ?? "");
    setDisplayName(currentDisplayName ?? "");
    setBio(currentBio ?? "");
    setAvatarFile(null);
    setBannerFile(null);
    setRemoveAvatar(false);
    setRemoveBanner(false);
  }, [open, currentUsername, currentDisplayName, currentBio]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);

      await onSave({
        username: username.trim(),
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        avatarFile: removeAvatar ? null : avatarFile,
        bannerFile: removeBanner ? null : bannerFile,
        removeAvatar,
        removeBanner,
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
            <p className="aurosPanelOverline">PROFILE EDITOR</p>
            <h3 className="aurosModalTitle">Edit your profile</h3>
          </div>

          <button type="button" className="aurosModalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="aurosModalForm" onSubmit={handleSubmit}>
          <label className="aurosModalField">
            <span>Display Name</span>
            <input
              className="aurosModalInput"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={32}
            />
          </label>

          <label className="aurosModalField">
            <span>Username</span>
            <input
              className="aurosModalInput"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              maxLength={24}
            />
          </label>

          <label className="aurosModalField">
            <span>Bio</span>
            <textarea
              className="aurosModalTextarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people something about you"
              rows={4}
              maxLength={180}
            />
          </label>

          <label className="aurosModalField">
            <span>Avatar</span>
            <input
              className="aurosModalInput"
              type="file"
              accept="image/*"
              disabled={removeAvatar}
              onChange={(e) => {
                setAvatarFile(e.target.files?.[0] ?? null);
                setRemoveAvatar(false);
              }}
            />
          </label>

          <button
            type="button"
            className="aurosModalSecondary"
            onClick={() => {
              setAvatarFile(null);
              setRemoveAvatar(true);
            }}
          >
            Delete Avatar
          </button>

          <label className="aurosModalField">
            <span>Banner</span>
            <input
              className="aurosModalInput"
              type="file"
              accept="image/*"
              disabled={removeBanner}
              onChange={(e) => {
                setBannerFile(e.target.files?.[0] ?? null);
                setRemoveBanner(false);
              }}
            />
          </label>

          <button
            type="button"
            className="aurosModalSecondary"
            onClick={() => {
              setBannerFile(null);
              setRemoveBanner(true);
            }}
          >
            Delete Banner
          </button>

          <div className="aurosModalActions">
            <button type="button" className="aurosModalSecondary" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="aurosModalPrimary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}