import { supabase } from "../lib/supabase";
import { getCurrentAuthUser } from "./profile.service";

export function getConversationKey(input: {
  type: "server" | "dm" | "application";
  id: string;
}) {
  return `${input.type}:${input.id}`;
}

export async function sendTypingEvent(conversationKey: string) {
  const user = await getCurrentAuthUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.from("chat_typing_events").upsert(
    {
      conversation_key: conversationKey,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "conversation_key,user_id",
    }
  );

  if (error) {
    console.warn("[typing.service] Failed to send typing event:", error);
  }
}

export function subscribeToTypingEvents(
  conversationKey: string,
  onChange: () => void
) {
  return supabase
    .channel(`typing:${conversationKey}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_typing_events",
        filter: `conversation_key=eq.${conversationKey}`,
      },
      () => onChange()
    )
    .subscribe();
}

export async function getTypingUsers(conversationKey: string, currentUserId?: string) {
  const since = new Date(Date.now() - 4000).toISOString();

  const { data, error } = await supabase
    .from("chat_typing_events")
    .select("*, profile:profiles (*)")
    .eq("conversation_key", conversationKey)
    .gte("updated_at", since);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row: any) => row.user_id !== currentUserId)
    .map((row: any) => row.profile?.display_name ?? row.profile?.username ?? "Someone");
}