import { supabase } from "../lib/supabase";

export type PublicApplicationChatAccess = {
  id: string;
  chatId: string;
  applicantName: string;
  status: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export type PublicApplicationChatMessage = {
  id: string;
  content: string;
  messageType: string;
  createdAt: string;
  guestName: string | null;
  authorDisplayName: string | null;
};

function normalizeUsername(username: string) {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

export async function getCurrentSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}

export async function signInToChat(input: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });

  if (error) throw error;
  return data.user;
}

export async function signUpForChat(input: {
  email: string;
  password: string;
  username: string;
  displayName: string;
}) {
  const email = input.email.trim().toLowerCase();
  const username = normalizeUsername(input.username);
  const displayName = input.displayName.trim().slice(0, 32);

  if (!email) throw new Error("Email is required.");
  if (!username) throw new Error("Username is required.");
  if (!displayName) throw new Error("Display name is required.");
  if (input.password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const { data: usernameTaken, error: usernameCheckError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();

  if (usernameCheckError) throw usernameCheckError;
  if (usernameTaken) throw new Error("Username is already taken.");

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        username,
        display_name: displayName,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Account could not be created.");

  /*
    If Supabase Email Confirmation is OFF, data.session exists and we can create
    the profile immediately from the client.

    If Email Confirmation is ON, data.session is usually null. In that case the
    user must confirm email first, then login. getOrCreateProfile() will create
    the profile after login.
  */
  if (data.session) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        username,
        display_name: displayName,
        status: "online",
        is_admin: false,
        last_seen: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    if (profileError) throw profileError;
  }

  return {
    user: data.user,
    session: data.session ?? null,
    needsEmailConfirmation: !data.session,
  };
}

export async function signOutFromChat() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function validateAuId(
  auId: string
): Promise<PublicApplicationChatAccess | null> {
  const { data, error } = await supabase.rpc(
    "get_public_application_chat_by_au_id",
    {
      input_chat_id: auId.trim(),
    }
  );

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    id: row.id,
    chatId: row.chat_id,
    applicantName: row.applicant_name,
    status: row.status,
    isActive: !!row.is_active,
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at,
  };
}

export async function getPublicApplicationChatMessages(
  auId: string
): Promise<PublicApplicationChatMessage[]> {
  const { data, error } = await supabase.rpc(
    "get_public_application_chat_messages",
    {
      input_chat_id: auId.trim(),
    }
  );

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    content: row.content,
    messageType: row.message_type,
    createdAt: row.created_at,
    guestName: row.guest_name ?? null,
    authorDisplayName: row.author_display_name ?? null,
  }));
}

export async function sendPublicApplicationChatMessage(input: {
  auId: string;
  content: string;
  guestName: string;
}) {
  const { error } = await supabase.rpc("send_public_application_chat_message", {
    input_chat_id: input.auId.trim(),
    input_content: input.content.trim(),
    input_guest_name: input.guestName.trim(),
  });

  if (error) throw error;
}