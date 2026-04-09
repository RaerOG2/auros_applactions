import { supabase } from "../lib/supabase";
import type {
  ApplicantChatAccountItem,
  CreateApplicantChatAccountInput,
} from "../types/chat";

function generateChatIdentityCode() {
  return `CHAT-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now()
    .toString()
    .slice(-6)}`;
}

export async function createApplicantChatAccount(
  input: CreateApplicantChatAccountInput
) {
  const payload = {
    application_id: input.applicationId,
    chat_identity_code: generateChatIdentityCode(),
    display_name: input.displayName ?? null,
    discord_name: input.discordName ?? null,
    created_by_admin_id: input.createdByAdminId ?? null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from("applicant_chat_accounts")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as ApplicantChatAccountItem;
}

export async function getApplicantChatAccountByApplicationId(applicationId: string) {
  const { data, error } = await supabase
    .from("applicant_chat_accounts")
    .select("*")
    .eq("application_id", applicationId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ApplicantChatAccountItem | null;
}

export async function getApplicantChatAccountByCode(chatIdentityCode: string) {
  const { data, error } = await supabase
    .from("applicant_chat_accounts")
    .select("*")
    .eq("chat_identity_code", chatIdentityCode.trim())
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ApplicantChatAccountItem | null;
}

export async function deactivateApplicantChatAccount(accountId: string) {
  const { error } = await supabase
    .from("applicant_chat_accounts")
    .update({ is_active: false })
    .eq("id", accountId);

  if (error) throw error;
}