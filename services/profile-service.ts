import { supabase } from "../lib/supabase";
import type { ProfileItem } from "../types/profile";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
}

export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ProfileItem | null;
}

export async function getProfileById(profileId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ProfileItem | null;
}

export async function getProfilesForMentions(searchValue: string, limit = 8) {
  const query = searchValue.trim();

  if (!query) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, role, avatar_url, bio, created_at")
      .order("username", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as ProfileItem[];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, role, avatar_url, bio, created_at")
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .order("username", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ProfileItem[];
}

export async function updateProfile(profileId: string, updates: Partial<ProfileItem>) {
  const payload: Record<string, unknown> = {};

  if (typeof updates.username !== "undefined") {
    payload.username = normalizeUsername(updates.username);
  }

  if (typeof updates.display_name !== "undefined") {
    payload.display_name = updates.display_name;
  }

  if (typeof updates.avatar_url !== "undefined") {
    payload.avatar_url = updates.avatar_url;
  }

  if (typeof updates.bio !== "undefined") {
    payload.bio = updates.bio;
  }

  if (typeof updates.role !== "undefined") {
    payload.role = updates.role;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", profileId);

  if (error) throw error;
}

export async function createProfile(params: {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string;
}) {
  const payload = {
    id: params.id,
    username: normalizeUsername(params.username),
    display_name: params.displayName ?? null,
    avatar_url: params.avatarUrl ?? null,
    bio: params.bio ?? null,
    role: params.role ?? "user",
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as ProfileItem;
}

export async function ensureProfileExists(params: {
  userId: string;
  fallbackEmail?: string | null;
}) {
  const existing = await getProfileById(params.userId);
  if (existing) return existing;

  const emailPrefix =
    params.fallbackEmail?.split("@")[0]?.trim().toLowerCase() || "user";

  const baseUsername = normalizeUsername(emailPrefix) || `user_${params.userId.slice(0, 8)}`;
  let candidateUsername = baseUsername;

  for (let index = 0; index < 10; index += 1) {
    try {
      const created = await createProfile({
        id: params.userId,
        username: candidateUsername,
        displayName: emailPrefix,
        role: "user",
      });

      return created;
    } catch (error: any) {
      const message = String(error?.message || "").toLowerCase();

      if (message.includes("duplicate") || message.includes("unique")) {
        candidateUsername = `${baseUsername}${index + 1}`;
        continue;
      }

      throw error;
    }
  }

  return await createProfile({
    id: params.userId,
    username: `${baseUsername}_${Date.now().toString().slice(-4)}`,
    displayName: emailPrefix,
    role: "user",
  });
}