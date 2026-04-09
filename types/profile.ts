export type UserRole = "user" | "admin" | "moderator";

export type ProfileItem = {
  id: string;
  username: string;
  display_name: string | null;
  role: UserRole | string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};