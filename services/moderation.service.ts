import { supabase } from "../lib/supabase";
import type { ChatModerationActionType } from "../types/chat";
import { getCurrentAuthUser } from "./profile.service";

export async function createModerationAction(input: {
  targetUserId?: string | null;
  serverId?: string | null;
  actionType: ChatModerationActionType;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const user = await getCurrentAuthUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("chat_moderation_actions")
    .insert({
      target_user_id: input.targetUserId ?? null,
      moderator_user_id: user.id,
      server_id: input.serverId ?? null,
      action_type: input.actionType,
      reason: input.reason ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}