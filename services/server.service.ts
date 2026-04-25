import { supabase } from "../lib/supabase";
import { mapChannelRow, mapServerRow } from "../lib/chat-mappers";
import type { ChatChannel, ChatServer } from "../types/chat";
import { getCurrentAuthUser } from "./profile.service";

export async function ensureAurosCommunityServer(): Promise<string | null> {
  const user = await getCurrentAuthUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.rpc("ensure_auros_community_for_user", {
    input_user_id: user.id,
  });

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function getMyServers(): Promise<ChatServer[]> {
  const user = await getCurrentAuthUser();

  if (!user) {
    return [];
  }

  await ensureAurosCommunityServer();

  const { data, error } = await supabase
    .from("chat_server_members")
    .select(`
      server:chat_servers (*)
    `)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row: any) => {
      if (Array.isArray(row.server)) {
        return row.server[0] ?? null;
      }

      return row.server ?? null;
    })
    .filter(Boolean)
    .map(mapServerRow);
}

export async function getServerChannels(serverId: string): Promise<ChatChannel[]> {
  const { data, error } = await supabase
    .from("chat_channels")
    .select("*")
    .eq("server_id", serverId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapChannelRow);
}

export async function createServer(input: {
  name: string;
  slug?: string | null;
  description?: string | null;
  isPublic?: boolean;
}): Promise<ChatServer> {
  const cleanName = input.name.trim();

  if (!cleanName) {
    throw new Error("Server name is required.");
  }

  const { data, error } = await supabase.rpc("create_chat_server", {
    input_name: cleanName,
    input_slug: input.slug?.trim() || null,
    input_description: input.description?.trim() || null,
    input_is_public: input.isPublic ?? true,
  });

  if (error) {
    console.warn("[server.service] createServer failed:", error.message, error);
    throw new Error(error.message || "Failed to create server.");
  }

  if (!data) {
    throw new Error("Server could not be created.");
  }

  return mapServerRow(data);
}

export async function createChannel(input: {
  serverId: string;
  name: string;
  type?: "text" | "announcement" | "application";
  topic?: string | null;
  position?: number;
  isPrivate?: boolean;
}): Promise<ChatChannel> {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("chat_channels")
    .insert({
      server_id: input.serverId,
      created_by: user.id,
      name: input.name,
      type: input.type ?? "text",
      topic: input.topic ?? null,
      position: input.position ?? 0,
      is_private: input.isPrivate ?? false,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapChannelRow(data);
}

export async function updateServer(input: {
  serverId: string;
  name?: string;
  description?: string | null;
  iconUrl?: string | null;
}) {
  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.iconUrl !== undefined) payload.icon_url = input.iconUrl;

  const { data, error } = await supabase
    .from("chat_servers")
    .update(payload)
    .eq("id", input.serverId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapServerRow(data);
}

export async function createServerInvite(serverId: string): Promise<string> {
  const { data, error } = await supabase.rpc("create_chat_server_invite", {
    input_server_id: serverId,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function joinServerByInvite(token: string): Promise<ChatServer> {
  const { data, error } = await supabase.rpc("join_chat_server_by_invite", {
    input_token: token.trim(),
  });

  if (error) {
    throw error;
  }

  return mapServerRow(data);
}

export async function deleteServer(serverId: string): Promise<void> {
  const { error } = await supabase.rpc("delete_chat_server", {
    input_server_id: serverId,
  });

  if (error) {
    throw new Error(error.message || "Failed to delete server.");
  }
}

export async function getMyServerRole(serverId: string) {
  const user = await getCurrentAuthUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("chat_server_members")
    .select("role")
    .eq("server_id", serverId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role ?? null;
}