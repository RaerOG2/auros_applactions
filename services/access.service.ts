import { supabase } from "../lib/supabase";

export type SiteAccess = {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
  userEmail: string | null;
  isAdmin: boolean;
  isDev: boolean;
};

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }

  return user ?? null;
}

export async function getSiteAccess(): Promise<SiteAccess> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      userEmail: null,
      isAdmin: false,
      isDev: false,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin, is_dev")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "site access profile lookup error:",
      error
    );

    return {
      user,
      userEmail: user.email ?? null,
      isAdmin: false,
      isDev: false,
    };
  }

  return {
    user,
    userEmail: user.email ?? null,
    isAdmin: !!profile?.is_admin,
    isDev: !!profile?.is_dev,
  };
}

export async function getDevAccess() {
  const access = await getSiteAccess();

  return {
    ...access,
    hasDevAccess: access.isDev,
  };
}

export async function getAdminAccessV2() {
  const access = await getSiteAccess();

  return {
    ...access,
    hasAdminAccess: access.isAdmin,
  };
}