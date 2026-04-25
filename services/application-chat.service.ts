import { supabase } from "../lib/supabase";
import { mapApplicationChatRow } from "../lib/chat-mappers";
import type { ApplicationChat } from "../types/chat";
import { getCurrentAuthUser } from "./profile.service";

export async function createApplicationChat(input: {
  applicantName: string;
  applicantEmail?: string | null;
  staffUserIds?: string[];
  expiresAt?: string | null;
}): Promise<ApplicationChat> {
  const user = await getCurrentAuthUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: generatedChatId, error: generatedChatIdError } = await supabase.rpc(
    "generate_application_chat_id"
  );

  if (generatedChatIdError) {
    throw generatedChatIdError;
  }

  const { data: chatRow, error: chatError } = await supabase
    .from("application_chats")
    .insert({
      chat_id: generatedChatId,
      applicant_name: input.applicantName,
      applicant_email: input.applicantEmail ?? null,
      created_by_admin_id: user.id,
      expires_at: input.expiresAt ?? null,
      status: "open",
      is_active: true,
    })
    .select("*")
    .single();

  if (chatError) {
    throw chatError;
  }

  const accessRows = [
    {
      application_chat_id: chatRow.id,
      user_id: user.id,
      role: "admin",
    },
    ...(input.staffUserIds ?? []).map((staffUserId) => ({
      application_chat_id: chatRow.id,
      user_id: staffUserId,
      role: "staff" as const,
    })),
  ];

  if (accessRows.length > 0) {
    const { error: accessError } = await supabase
      .from("application_chat_access")
      .insert(accessRows);

    if (accessError) {
      throw accessError;
    }
  }

  return mapApplicationChatRow(chatRow);
}

export async function getMyApplicationChats(): Promise<ApplicationChat[]> {
  const { data, error } = await supabase
    .from("application_chats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapApplicationChatRow);
}

export async function updateApplicationChatStatus(
  applicationChatId: string,
  status: "open" | "review" | "closed"
): Promise<ApplicationChat> {
  const { data, error } = await supabase
    .from("application_chats")
    .update({ status })
    .eq("id", applicationChatId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapApplicationChatRow(data);
}