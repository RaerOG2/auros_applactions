import { supabase } from "../lib/supabase";
import { getCurrentAuthUser } from "./profile.service";


/* =========================
   TYPES
========================= */

export type ServerRole = {
  id: string;
  serverId: string;
  name: string;
  color: string;
  position: number;
  icon: string | null;
  groupName: string;
  locked: boolean;
  adminOnly: boolean;

  canManageServer: boolean;
  canManageChannels: boolean;
  canManageRoles: boolean;

  canKickMembers: boolean;
  canBanMembers: boolean;
  canMuteMembers: boolean;

  canManageMessages: boolean;
};

/* =========================
   MAPPER
========================= */

function mapRole(row: any): ServerRole {
  return {
    id: row.id,
    serverId: row.server_id,
    name: row.name,
    color: row.color,
    position: row.position,
    icon: row.icon ?? null,
    groupName: row.group_name ?? "Default",
    locked: row.locked ?? false,
    adminOnly: row.admin_only ?? false,

    canManageServer: row.can_manage_server,
    canManageChannels: row.can_manage_channels,
    canManageRoles: row.can_manage_roles,

    canKickMembers: row.can_kick_members,
    canBanMembers: row.can_ban_members,
    canMuteMembers: row.can_mute_members,

    canManageMessages: row.can_manage_messages,
  };
}
/* =========================
   ROLE CRUD
========================= */

export async function getServerRoles(serverId: string): Promise<ServerRole[]> {
  const { data, error } = await supabase
    .from("chat_server_roles")
    .select("*")
    .eq("server_id", serverId)
    .order("position", { ascending: true });

  if (error) throw error;

  return (data ?? []).map(mapRole);
}

export async function createServerRole(input: {
  serverId: string;
  name: string;
  color?: string;
  icon?: string | null;
  groupName?: string;
  position?: number;
  locked?: boolean;
  adminOnly?: boolean;
}) {
  const { data, error } = await supabase
    .from("chat_server_roles")
    .insert({
      server_id: input.serverId,
      name: input.name,
      color: input.color ?? "#d4af37",
      icon: input.icon ?? null,
      group_name: input.groupName?.trim() || "Default",
      position: input.position ?? 0,
      locked: input.locked ?? false,
      admin_only: input.adminOnly ?? false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create server role.");
  }

  return mapRole(data);
}

export async function updateServerRole(
  roleId: string,
  input: Partial<{
    name: string;
    color: string;
    icon: string | null;
    groupName: string;
    position: number;
    locked: boolean;
    adminOnly: boolean;

    canManageServer: boolean;
    canManageChannels: boolean;
    canManageRoles: boolean;

    canKickMembers: boolean;
    canBanMembers: boolean;
    canMuteMembers: boolean;

    canManageMessages: boolean;
  }>
) {
  const payload: any = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.color !== undefined) payload.color = input.color;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.groupName !== undefined) payload.group_name = input.groupName;
  if (input.position !== undefined) payload.position = input.position;
  if (input.locked !== undefined) payload.locked = input.locked;
  if (input.adminOnly !== undefined) payload.admin_only = input.adminOnly;

  if (input.canManageServer !== undefined)
    payload.can_manage_server = input.canManageServer;
  if (input.canManageChannels !== undefined)
    payload.can_manage_channels = input.canManageChannels;
  if (input.canManageRoles !== undefined)
    payload.can_manage_roles = input.canManageRoles;

  if (input.canKickMembers !== undefined)
    payload.can_kick_members = input.canKickMembers;
  if (input.canBanMembers !== undefined)
    payload.can_ban_members = input.canBanMembers;
  if (input.canMuteMembers !== undefined)
    payload.can_mute_members = input.canMuteMembers;

  if (input.canManageMessages !== undefined)
    payload.can_manage_messages = input.canManageMessages;

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("chat_server_roles")
    .update(payload)
    .eq("id", roleId)
    .select("*")
    .single();

  if (error) throw error;

  return mapRole(data);
}

export async function deleteServerRole(roleId: string) {
  const { error } = await supabase
    .from("chat_server_roles")
    .delete()
    .eq("id", roleId);

  if (error) throw error;
}

/* =========================
   MEMBER ROLES
========================= */

export async function assignRoleToMember(input: {
  serverId: string;
  userId: string;
  roleId: string;
}) {
  const { error } = await supabase
    .from("chat_server_member_roles")
    .upsert({
      server_id: input.serverId,
      user_id: input.userId,
      role_id: input.roleId,
    });

  if (error) throw error;
}

export async function removeRoleFromMember(input: {
  serverId: string;
  userId: string;
  roleId: string;
}) {
  const { error } = await supabase
    .from("chat_server_member_roles")
    .delete()
    .match({
      server_id: input.serverId,
      user_id: input.userId,
      role_id: input.roleId,
    });

  if (error) throw error;
}

export async function getMemberRoles(serverId: string, userId: string) {
  const { data, error } = await supabase
    .from("chat_server_member_roles")
    .select("role_id")
    .eq("server_id", serverId)
    .eq("user_id", userId);

  if (error) throw error;

  return data?.map((r) => r.role_id) ?? [];
}

export async function kickServerMember(input: {
  serverId: string;
  userId: string;
}) {
  const { error } = await supabase
    .from("chat_server_members")
    .delete()
    .eq("server_id", input.serverId)
    .eq("user_id", input.userId);

  if (error) throw error;
}

export async function banServerMember(input: {
  serverId: string;
  userId: string;
  reason?: string | null;
}) {
  const currentUser = await getCurrentAuthUser();

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const { error: banError } = await supabase.from("chat_server_bans").upsert({
    server_id: input.serverId,
    user_id: input.userId,
    banned_by: currentUser.id,
    reason: input.reason ?? null,
  });

  if (banError) throw banError;

  const { error: kickError } = await supabase
    .from("chat_server_members")
    .delete()
    .eq("server_id", input.serverId)
    .eq("user_id", input.userId);

  if (kickError) throw kickError;
}

export async function muteServerMember(input: {
  serverId: string;
  userId: string;
  reason?: string | null;
  mutedUntil?: string | null;
}) {
  const currentUser = await getCurrentAuthUser();

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("chat_server_mutes").upsert({
    server_id: input.serverId,
    user_id: input.userId,
    muted_by: currentUser.id,
    reason: input.reason ?? null,
    muted_until: input.mutedUntil ?? null,
  });

  if (error) throw error;
}

export async function reorderServerRoles(input: {
  roles: {
    roleId: string;
    position: number;
    groupName?: string;
  }[];
}) {
  await Promise.all(
    input.roles.map((role) =>
      supabase
        .from("chat_server_roles")
        .update({
          position: role.position,
          ...(role.groupName !== undefined
            ? { group_name: role.groupName }
            : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", role.roleId)
    )
  );
}

export async function getServerMemberRoles(serverId: string) {
  const { data, error } = await supabase
    .from("chat_server_member_roles")
    .select(`
      server_id,
      user_id,
      role_id,
      role:chat_server_roles (*)
    `)
    .eq("server_id", serverId);

  if (error) throw error;

  return data ?? [];
}