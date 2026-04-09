import { supabase } from "../lib/supabase";

export async function signUpWithEmail(params: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim().toLowerCase(),
    password: params.password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(params: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email.trim().toLowerCase(),
    password: params.password,
  });

  if (error) throw error;
  return data;
}

export async function signOutCurrentUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}