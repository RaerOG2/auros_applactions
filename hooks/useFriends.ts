"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProfileItem } from "../types/profile";
import type { FriendCardItem } from "../types/friends";
import { getProfilesForMentions } from "../services/profile-service";
import {
  getFriendCardsForProfile,
  removeFriendship,
  respondToFriendRequest,
  sendFriendRequest,
} from "../services/friend-service";
import { getOrCreateDirectConversationBetweenProfiles } from "../services/dm-service";

type UseFriendsParams = {
  profile: ProfileItem | null;
};

export function useFriends({ profile }: UseFriendsParams) {
  const [friends, setFriends] = useState<FriendCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [userResults, setUserResults] = useState<ProfileItem[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  async function loadFriends() {
    if (!profile) {
      setFriends([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getFriendCardsForProfile(profile.id);
      setFriends(data);
    } catch (error) {
      console.error("[Friends] loadFriends failed:", error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers() {
    if (!profile) return;

    try {
      setSearchingUsers(true);
      const results = await getProfilesForMentions(searchValue.trim(), 20);
      setUserResults(results.filter((item) => item.id !== profile.id));
    } catch (error) {
      console.error("[Friends] searchUsers failed:", error);
      setUserResults([]);
    } finally {
      setSearchingUsers(false);
    }
  }

  async function addFriend(targetProfileId: string) {
    if (!profile) return;

    try {
      await sendFriendRequest({
        requesterProfileId: profile.id,
        addresseeProfileId: targetProfileId,
      });

      await loadFriends();
    } catch (error) {
      console.error("[Friends] addFriend failed:", error);
      alert("Friend request could not be sent.");
    }
  }

  async function acceptFriend(friendshipId: string) {
    try {
      await respondToFriendRequest({
        friendshipId,
        status: "accepted",
      });

      await loadFriends();
    } catch (error) {
      console.error("[Friends] acceptFriend failed:", error);
      alert("Friend request could not be accepted.");
    }
  }

  async function rejectFriend(friendshipId: string) {
    try {
      await respondToFriendRequest({
        friendshipId,
        status: "rejected",
      });

      await loadFriends();
    } catch (error) {
      console.error("[Friends] rejectFriend failed:", error);
      alert("Friend request could not be rejected.");
    }
  }

  async function removeFriend(friendshipId: string) {
    try {
      await removeFriendship(friendshipId);
      await loadFriends();
    } catch (error) {
      console.error("[Friends] removeFriend failed:", error);
      alert("Friend could not be removed.");
    }
  }

  async function startDmWithFriend(targetProfileId: string) {
    if (!profile) throw new Error("No profile");

    return await getOrCreateDirectConversationBetweenProfiles({
      currentProfileId: profile.id,
      targetProfileId,
    });
  }

  useEffect(() => {
    loadFriends();
  }, [profile?.id]);

  const acceptedFriends = useMemo(
    () => friends.filter((item) => item.direction === "friend" && item.status === "accepted"),
    [friends]
  );

  const incomingRequests = useMemo(
    () => friends.filter((item) => item.direction === "incoming" && item.status === "pending"),
    [friends]
  );

  const outgoingRequests = useMemo(
    () => friends.filter((item) => item.direction === "outgoing" && item.status === "pending"),
    [friends]
  );

  return {
    friends,
    acceptedFriends,
    incomingRequests,
    outgoingRequests,
    loading,
    reload: loadFriends,

    searchValue,
    setSearchValue,
    userResults,
    searchingUsers,
    searchUsers,

    addFriend,
    acceptFriend,
    rejectFriend,
    removeFriend,
    startDmWithFriend,
  };
}