import { supabase } from "../lib/supabase";
import { mapProfileRow } from "../lib/chat-mappers";
import type { ChatUserProfile, UserStatus } from "../types/chat";

function cleanUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

async function createUniqueUsername(baseUsername: string, userId?: string) {
  const cleanBase = cleanUsername(baseUsername) || "user";

  const { data } = await supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", cleanBase)
    .maybeSingle();

  if (!data || data.id === userId) {
    return cleanBase;
  }

  for (let i = 0; i < 20; i++) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${cleanBase.slice(0, 18)}${randomNumber}`;

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", candidate)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }
  }

  return `${cleanBase.slice(0, 16)}${Date.now().toString().slice(-6)}`;
}

export async function getCurrentAuthUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data.user ?? null;
}

export async function getProfileById(profileId: string): Promise<ChatUserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapProfileRow(data);
}

export async function getCurrentProfile(): Promise<ChatUserProfile | null> {
  const user = await getCurrentAuthUser();
  if (!user) return null;

  return getProfileById(user.id);
}

export async function getOrCreateProfile(): Promise<ChatUserProfile | null> {
  const user = await getCurrentAuthUser();

  if (!user) return null;

  const existingProfile = await getProfileById(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const emailPrefix = user.email?.split("@")[0]?.trim() || "user";

  const metadataUsername =
    typeof user.user_metadata?.username === "string"
      ? user.user_metadata.username
      : emailPrefix;

  const metadataDisplayName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : emailPrefix;

  const uniqueUsername = await createUniqueUsername(metadataUsername, user.id);

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username: uniqueUsername,
      display_name: metadataDisplayName.slice(0, 32) || uniqueUsername,
      status: "online",
      is_admin: false,
      last_seen: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;

  return mapProfileRow(data);
}

export async function updateCurrentProfile(input: {
  username?: string;
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  status?: UserStatus;
}) {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const payload: Record<string, unknown> = {};

  if (input.username !== undefined) {
    payload.username = await createUniqueUsername(input.username, user.id);
  }

  if (input.displayName !== undefined) {
    payload.display_name = input.displayName.trim().slice(0, 32) || "User";
  }

  if (input.bio !== undefined) payload.bio = input.bio;
  if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl;
  if (input.bannerUrl !== undefined) payload.banner_url = input.bannerUrl;
  if (input.status !== undefined) payload.status = input.status;

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) throw error;

  return mapProfileRow(data);
}

export async function updatePresence(status: UserStatus = "online") {
  const user = await getCurrentAuthUser();

  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      status,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error;
}

export async function setOfflinePresence() {
  await updatePresence("offline");
}

export function subscribeToProfile(profileId: string, onChange: () => void) {
  return supabase
    .channel(`profile:${profileId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${profileId}`,
      },
      onChange
    )
    .subscribe();
}