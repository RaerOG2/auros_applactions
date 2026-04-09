"use client";

import { useEffect, useState } from "react";
import type { ChatChannelItem } from "../types/chat";
import type { ProfileItem } from "../types/profile";
import { getCurrentProfile } from "../services/profile-service";
import {
  createChatChannel,
  deleteChatChannel,
  getChatChannels,
  updateChatChannel,
} from "../services/chat-service";
import { createModerationLog } from "../services/moderation-service";

function slugifyChannelName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isModerator(profile: ProfileItem | null) {
  if (!profile) return false;
  return profile.role === "admin" || profile.role === "moderator";
}

export function useChannelManagement() {
  const [profile, setProfile] = useState<ProfileItem | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [channels, setChannels] = useState<ChatChannelItem[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadChannels() {
    try {
      const data = await getChatChannels();
      setChannels(data);

      if (!selectedChannelId && data.length > 0) {
        setSelectedChannelId(data[0].id);
      }
    } catch (error) {
      console.error("[ChannelManagement] loadChannels failed:", error);
      setChannels([]);
    }
  }

  async function loadBase() {
    try {
      setLoading(true);

      const currentProfile = await getCurrentProfile();
      setProfile(currentProfile);
      setAuthorized(isModerator(currentProfile));

      if (!isModerator(currentProfile)) {
        setChannels([]);
        return;
      }

      await loadChannels();
    } catch (error) {
      console.error("[ChannelManagement] loadBase failed:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingChannelId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIsPublic(true);
  }

  function startCreate() {
    resetForm();
  }

  function startEdit(channel: ChatChannelItem) {
    setEditingChannelId(channel.id);
    setSelectedChannelId(channel.id);
    setName(channel.name);
    setSlug(channel.slug);
    setDescription(channel.description ?? "");
    setIsPublic(channel.is_public);
  }

  async function saveChannel() {
    if (!profile || !authorized) {
      alert("No permission.");
      return;
    }

    const trimmedName = name.trim();
    const finalSlug = slugifyChannelName(slug || trimmedName);

    if (!trimmedName) {
      alert("Channel name is required.");
      return;
    }

    if (!finalSlug) {
      alert("Valid slug is required.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingChannelId) {
        const updated = await updateChatChannel({
          channelId: editingChannelId,
          name: trimmedName,
          slug: finalSlug,
          description: description.trim() || null,
          isPublic,
        });

        await createModerationLog({
          moderatorProfileId: profile.id,
          action: "update_channel",
          details: {
            channelId: updated.id,
            name: updated.name,
            slug: updated.slug,
            isPublic: updated.is_public,
          },
        });
      } else {
        const created = await createChatChannel({
          name: trimmedName,
          slug: finalSlug,
          description: description.trim() || null,
          isPublic,
          createdBy: profile.id,
        });

        await createModerationLog({
          moderatorProfileId: profile.id,
          action: "create_channel",
          details: {
            channelId: created.id,
            name: created.name,
            slug: created.slug,
            isPublic: created.is_public,
          },
        });
      }

      await loadChannels();
      resetForm();
    } catch (error) {
      console.error("[ChannelManagement] saveChannel failed:", error);
      alert("Channel could not be saved.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeChannel(channel: ChatChannelItem) {
    if (!profile || !authorized) {
      alert("No permission.");
      return;
    }

    const confirmed = window.confirm(
      `Do you really want to delete #${channel.name}?`
    );
    if (!confirmed) return;

    try {
      await deleteChatChannel(channel.id);

      await createModerationLog({
        moderatorProfileId: profile.id,
        action: "delete_channel",
        details: {
          channelId: channel.id,
          name: channel.name,
          slug: channel.slug,
        },
      });

      await loadChannels();

      if (selectedChannelId === channel.id) {
        setSelectedChannelId(null);
      }

      if (editingChannelId === channel.id) {
        resetForm();
      }
    } catch (error) {
      console.error("[ChannelManagement] removeChannel failed:", error);
      alert("Channel could not be deleted.");
    }
  }

  useEffect(() => {
    loadBase();
  }, []);

  return {
    profile,
    authorized,
    loading,
    channels,
    selectedChannelId,
    setSelectedChannelId,
    name,
    setName,
    slug,
    setSlug,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    editingChannelId,
    submitting,
    startCreate,
    startEdit,
    saveChannel,
    removeChannel,
    resetForm,
  };
}