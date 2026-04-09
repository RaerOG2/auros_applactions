export type ModerationLogItem = {
  id: string;
  moderator_profile_id: string | null;
  action: string;
  target_profile_id: string | null;
  target_message_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type ChatUserModerationItem = {
  id: string;
  target_profile_id: string | null;
  action_type: string;
  reason: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
};