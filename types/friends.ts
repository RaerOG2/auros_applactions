export type FriendshipStatus = "pending" | "accepted" | "rejected" | "blocked";

export type FriendProfileItem = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  role?: string | null;
  created_at?: string | null;
};

export type FriendshipItem = {
  id: string;
  requester_profile_id: string;
  addressee_profile_id: string;
  status: FriendshipStatus;
  created_at: string;
  responded_at: string | null;
  requester_profile?: FriendProfileItem | null;
  addressee_profile?: FriendProfileItem | null;
};

export type FriendCardItem = {
  friendshipId: string;
  profile: FriendProfileItem;
  direction: "incoming" | "outgoing" | "friend";
  status: FriendshipStatus;
  createdAt: string;
  respondedAt: string | null;
};