"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatMessageItem } from "../types/chat";
import type { ModerationLogItem, ChatUserModerationItem } from "../types/moderation";
import type { ProfileItem } from "../types/profile";
import { getCurrentProfile, getProfilesForMentions } from "../services/profile-service";
import { getChatChannels, getChannelMessages, softDeleteChannelMessage } from "../services/chat-service";
import { createModerationLog, getModerationLogs, moderateUser } from "../services/moderation-service";

function isModerator(profile: ProfileItem | null) {
  if (!profile) return false;
  return profile.role === "admin" || profile.role === "moderator";
}

export function useModerationPanel() {
  const [profile, setProfile] = useState<ProfileItem | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [channelId, setChannelId] = useState("");
  const [channels, setChannels] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [logs, setLogs] = useState<ModerationLogItem[]>([]);

  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<ProfileItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<ProfileItem | null>(null);

  const [actionType, setActionType] = useState("mute");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submittingModeration, setSubmittingModeration] = useState(false);

  async function loadBase() {
    try {
      setLoading(true);

      const currentProfile = await getCurrentProfile();
      setProfile(currentProfile);
      setAuthorized(isModerator(currentProfile));

      if (!isModerator(currentProfile)) {
        setChannels([]);
        setMessages([]);
        setLogs([]);
        return;
      }

      const [channelData, logData] = await Promise.all([
        getChatChannels(),
        getModerationLogs(100),
      ]);

      const mappedChannels = channelData.map((channel) => ({
        id: channel.id,
        name: channel.name,
        slug: channel.slug,
      }));

      setChannels(mappedChannels);
      setLogs(logData);

      if (mappedChannels.length > 0) {
        const nextChannelId = channelId || mappedChannels[0].id;
        setChannelId(nextChannelId);

        const channelMessages = await getChannelMessages(nextChannelId, 100);
        setMessages(channelMessages);
      }
    } catch (error) {
      console.error("[Moderation] loadBase failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadChannelMessages(nextChannelId: string) {
    try {
      const data = await getChannelMessages(nextChannelId, 100);
      setMessages(data);
    } catch (error) {
      console.error("[Moderation] loadChannelMessages failed:", error);
      setMessages([]);
    }
  }

  async function refreshLogs() {
    try {
      const data = await getModerationLogs(100);
      setLogs(data);
    } catch (error) {
      console.error("[Moderation] refreshLogs failed:", error);
    }
  }

  async function deleteMessage(message: ChatMessageItem) {
    if (!profile || !authorized) return;

    const confirmed = window.confirm("Do you really want to delete this message?");
    if (!confirmed) return;

    try {
      await softDeleteChannelMessage(message.id);

      await createModerationLog({
        moderatorProfileId: profile.id,
        action: "delete_channel_message",
        targetProfileId: message.author_profile_id ?? null,
        targetMessageId: message.id,
        details: {
          channelId: message.channel_id,
          originalContent: message.content,
          authorProfileId: message.author_profile_id,
          authorApplicantAccountId: message.author_applicant_account_id,
        },
      });

      await loadChannelMessages(message.channel_id);
      await refreshLogs();
    } catch (error) {
      console.error("[Moderation] deleteMessage failed:", error);
      alert("Message could not be deleted.");
    }
  }

  async function searchUsers() {
    try {
      const results = await getProfilesForMentions(userSearch.trim(), 12);
      setUserResults(results);
    } catch (error) {
      console.error("[Moderation] searchUsers failed:", error);
      setUserResults([]);
    }
  }

  async function submitModerationAction() {
    if (!profile || !authorized || !selectedUser) {
      alert("Select a user first.");
      return;
    }

    try {
      setSubmittingModeration(true);

      const moderationEntry = await moderateUser({
        targetProfileId: selectedUser.id,
        actionType,
        reason: reason.trim() || null,
        expiresAt: expiresAt || null,
        createdBy: profile.id,
      });

      await createModerationLog({
        moderatorProfileId: profile.id,
        action: `user_${actionType}`,
        targetProfileId: selectedUser.id,
        targetMessageId: null,
        details: {
          moderationEntryId: moderationEntry.id,
          username: selectedUser.username,
          displayName: selectedUser.display_name,
          reason: reason.trim() || null,
          expiresAt: expiresAt || null,
        },
      });

      setReason("");
      setExpiresAt("");
      await refreshLogs();
      alert("Moderation action saved.");
    } catch (error) {
      console.error("[Moderation] submitModerationAction failed:", error);
      alert("Moderation action failed.");
    } finally {
      setSubmittingModeration(false);
    }
  }

  useEffect(() => {
    loadBase();
  }, []);

  useEffect(() => {
    if (!authorized || !channelId) return;
    loadChannelMessages(channelId);
  }, [channelId, authorized]);

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => !message.deleted_at);
  }, [messages]);

  return {
    profile,
    authorized,
    loading,

    channelId,
    setChannelId,
    channels,
    messages: filteredMessages,
    logs,

    userSearch,
    setUserSearch,
    userResults,
    selectedUser,
    setSelectedUser,

    actionType,
    setActionType,
    reason,
    setReason,
    expiresAt,
    setExpiresAt,
    submittingModeration,

    searchUsers,
    deleteMessage,
    submitModerationAction,
    refreshLogs,
  };
}