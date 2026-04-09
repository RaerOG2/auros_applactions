"use client";

import { useEffect, useState } from "react";
import type { ProfileItem } from "../types/profile";
import type { DirectConversationListItem } from "../services/dm-service";
import { getDirectConversationsForProfile } from "../services/dm-service";
import { getProfilesForMentions } from "../services/profile-service";

type UseDmListParams = {
  profile: ProfileItem | null;
};

export function useDmList({ profile }: UseDmListParams) {
  const [conversations, setConversations] = useState<DirectConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [userResults, setUserResults] = useState<ProfileItem[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  async function loadConversations() {
    if (!profile) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getDirectConversationsForProfile(profile.id);
      setConversations(data);
    } catch (error) {
      console.error("[DM List] loadConversations failed:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers() {
    if (!profile) return;

    try {
      setSearchingUsers(true);
      const results = await getProfilesForMentions(searchValue.trim(), 12);
      setUserResults(results.filter((item) => item.id !== profile.id));
    } catch (error) {
      console.error("[DM List] searchUsers failed:", error);
      setUserResults([]);
    } finally {
      setSearchingUsers(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, [profile?.id]);

  return {
    conversations,
    loading,
    reload: loadConversations,
    searchValue,
    setSearchValue,
    userResults,
    searchingUsers,
    searchUsers,
  };
}