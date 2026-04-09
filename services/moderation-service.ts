import { supabase } from "../lib/supabase";
import type { ChatUserModerationItem, ModerationLogItem } from "../types/moderation";

export async function createModerationLog(params: {
  moderatorProfileId?: string | null;
  action: string;
  targetProfileId?: string | null;
  targetMessageId?: string | null;
  details?: Record<string, unknown> | null;
}) {
  const { error } = await supabase.from("moderation_logs").insert({
    moderator_profile_id: params.moderatorProfileId ?? null,
    action: params.action,
    target_profile_id: params.targetProfileId ?? null,
    target_message_id: params.targetMessageId ?? null,
    details: params.details ?? null,
  });

  if (error) throw error;
}

export async function getModerationLogs(limit = 100) {
  const { data, error } = await supabase
    .from("moderation_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ModerationLogItem[];
}

export async function moderateUser(params: {
  targetProfileId: string;
  actionType: string;
  reason?: string | null;
  expiresAt?: string | null;
  createdBy?: string | null;
}) {
  const { data, error } = await supabase
    .from("chat_user_moderation")
    .insert({
      target_profile_id: params.targetProfileId,
      action_type: params.actionType,
      reason: params.reason ?? null,
      expires_at: params.expiresAt ?? null,
      created_by: params.createdBy ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ChatUserModerationItem;
}

export async function getActiveUserModeration(profileId: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("chat_user_moderation")
    .select("*")
    .eq("target_profile_id", profileId)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ChatUserModerationItem[];
}