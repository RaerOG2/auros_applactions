"use client";

import { useEffect, useState } from "react";
import type { ChatChannelMemberItem } from "../types/chat";
import type { ProfileItem } from "../types/profile";
import {
  addChannelMember,
  getChannelMembers,
  removeChannelMember,
} from "../services/chat-service";
import { getProfilesForMentions } from "../services/profile-service";

export function useChannelMembers(channelId?: string | null, enabled = true) {
  const [members, setMembers] = useState<ChatChannelMemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [userResults, setUserResults] = useState<ProfileItem[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  async function loadMembers() {
    if (!channelId || !enabled) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getChannelMembers(channelId);
      setMembers(data);
    } catch (error) {
      console.error("[ChannelMembers] loadMembers failed:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers() {
    try {
      setSearchingUsers(true);
      const results = await getProfilesForMentions(searchValue.trim(), 12);
      setUserResults(results);
    } catch (error) {
      console.error("[ChannelMembers] searchUsers failed:", error);
      setUserResults([]);
    } finally {
      setSearchingUsers(false);
    }
  }

  async function addMember(profile: ProfileItem) {
    if (!channelId) return;
    await addChannelMember({
      channelId,
      profileId: profile.id,
      role: "member",
    });
    await loadMembers();
  }

  async function removeMember(profileId: string) {
    if (!channelId) return;
    await removeChannelMember(channelId, profileId);
    await loadMembers();
  }

  useEffect(() => {
    loadMembers();
  }, [channelId, enabled]);

  return {
    members,
    loading,
    reload: loadMembers,
    searchValue,
    setSearchValue,
    userResults,
    searchingUsers,
    searchUsers,
    addMember,
    removeMember,
  };
}