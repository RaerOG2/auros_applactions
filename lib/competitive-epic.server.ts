import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase-server";

export const EPIC_STATE_COOKIE = "auros_comp_epic_state";
export const EPIC_USER_COOKIE = "auros_comp_epic_user";

export function epicConfiguration() {
  const clientId = process.env.EPIC_CLIENT_ID;
  const clientSecret = process.env.EPIC_CLIENT_SECRET;
  const deploymentId = process.env.EPIC_DEPLOYMENT_ID;
  const redirectUri = process.env.EPIC_REDIRECT_URI;

  if (!clientId || !clientSecret || !deploymentId || !redirectUri) {
    throw new Error("EPIC_NOT_CONFIGURED");
  }

  const redirect = new URL(redirectUri);

  if (
    !["https:", "http:"].includes(redirect.protocol) ||
    (redirect.protocol !== "https:" && redirect.hostname !== "localhost") ||
    redirect.pathname !== "/api/competitive/epic/callback"
  ) {
    throw new Error("EPIC_INVALID_REDIRECT_URI");
  }

  return { clientId, clientSecret, deploymentId, redirectUri, origin: redirect.origin };
}

export async function authenticatedAurosUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("AUROS_LOGIN_REQUIRED");
  }

  return data.user;
}

export function competitiveAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_SERVER_NOT_CONFIGURED");
  }

  // Never export this client to a client component or NEXT_PUBLIC_ environment variable.
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function epicRedirect(origin: string, result: string) {
  const url = new URL("/competitive/me", origin);
  url.searchParams.set("epic", result);
  return url;
}
