import { supabase } from "../lib/supabase";
import type { FriendCardItem, FriendshipItem } from "../types/friends";

function mapFriendshipsToCards(
  friendships: FriendshipItem[],
  currentProfileId: string
): FriendCardItem[] {
  return friendships
    .map((item) => {
      const isRequester = item.requester_profile_id === currentProfileId;

      if (item.status === "accepted") {
        const otherProfile = isRequester ? item.addressee_profile : item.requester_profile;
        if (!otherProfile) return null;

        return {
          friendshipId: item.id,
          profile: otherProfile,
          direction: "friend" as const,
          status: item.status,
          createdAt: item.created_at,
          respondedAt: item.responded_at,
        };
      }

      if (item.status === "pending") {
        if (isRequester) {
          if (!item.addressee_profile) return null;

          return {
            friendshipId: item.id,
            profile: item.addressee_profile,
            direction: "outgoing" as const,
            status: item.status,
            createdAt: item.created_at,
            respondedAt: item.responded_at,
          };
        }

        if (!item.requester_profile) return null;

        return {
          friendshipId: item.id,
          profile: item.requester_profile,
          direction: "incoming" as const,
          status: item.status,
          createdAt: item.created_at,
          respondedAt: item.responded_at,
        };
      }

      return null;
    })
    .filter(Boolean) as FriendCardItem[];
}

export async function getFriendshipsForProfile(profileId: string) {
  const { data, error } = await supabase
    .from("friendships")
    .select(`
      *,
      requester_profile:profiles!friendships_requester_profile_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        role,
        created_at
      ),
      addressee_profile:profiles!friendships_addressee_profile_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        role,
        created_at
      )
    `)
    .or(`requester_profile_id.eq.${profileId},addressee_profile_id.eq.${profileId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as FriendshipItem[];
}

export async function getFriendCardsForProfile(profileId: string) {
  const friendships = await getFriendshipsForProfile(profileId);
  return mapFriendshipsToCards(friendships, profileId);
}

export async function sendFriendRequest(params: {
  requesterProfileId: string;
  addresseeProfileId: string;
}) {
  if (params.requesterProfileId === params.addresseeProfileId) {
    throw new Error("You cannot add yourself.");
  }

  const { data, error } = await supabase
    .from("friendships")
    .insert({
      requester_profile_id: params.requesterProfileId,
      addressee_profile_id: params.addresseeProfileId,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as FriendshipItem;
}

export async function respondToFriendRequest(params: {
  friendshipId: string;
  status: "accepted" | "rejected";
}) {
  const { data, error } = await supabase
    .from("friendships")
    .update({
      status: params.status,
      responded_at: new Date().toISOString(),
    })
    .eq("id", params.friendshipId)
    .select("*")
    .single();

  if (error) throw error;
  return data as FriendshipItem;
}

export async function removeFriendship(friendshipId: string) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) throw error;
}

export async function getExistingFriendshipBetweenProfiles(params: {
  profileAId: string;
  profileBId: string;
}) {
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(requester_profile_id.eq.${params.profileAId},addressee_profile_id.eq.${params.profileBId}),and(requester_profile_id.eq.${params.profileBId},addressee_profile_id.eq.${params.profileAId})`
    )
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as FriendshipItem | null;
}