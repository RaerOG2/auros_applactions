import { supabase } from "../lib/supabase";

export type ChatSystemStatus = {
  chatDisabled: boolean;
  downtimeMessage: string | null;
};

export async function getChatSystemStatus(): Promise<ChatSystemStatus> {
  const { data, error } = await supabase
    .from("chat_system_status")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to load chat status.");
  }

  return {
    chatDisabled: !!data?.chat_disabled,
    downtimeMessage: data?.downtime_message ?? null,
  };
}

export async function updateChatSystemStatus(input: {
  chatDisabled: boolean;
  downtimeMessage?: string | null;
}) {
  const { error } = await supabase.from("chat_system_status").upsert({
    id: "main",
    chat_disabled: input.chatDisabled,
    downtime_message: input.downtimeMessage ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message || "Failed to update chat status.");
  }
}