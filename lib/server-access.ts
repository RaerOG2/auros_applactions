import {
  createSupabaseServerClient,
} from "./supabase-server";


export type ServerSiteAccess = {
  userId:
    string | null;

  userEmail:
    string | null;

  isAuthenticated:
    boolean;

  isAdmin:
    boolean;

  isDev:
    boolean;

  isBeta:
    boolean;
};


export async function getServerSiteAccess():
  Promise<ServerSiteAccess> {
  const supabase =
    await createSupabaseServerClient();


  const {
    data: {
      user,
    },
    error:
      userError,
  } =
    await supabase.auth.getUser();


  if (
    userError ||
    !user
  ) {
    return {
      userId:
        null,

      userEmail:
        null,

      isAuthenticated:
        false,

      isAdmin:
        false,

      isDev:
        false,

      isBeta:
        false,
    };
  }


  const {
    data:
      profile,

    error:
      profileError,
  } =
    await supabase
      .from(
        "profiles"
      )
      .select(
        "is_admin, is_dev, is_beta"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();


  if (
    profileError
  ) {
    console.error(
      "Server access profile lookup failed."
    );


    return {
      userId:
        user.id,

      userEmail:
        user.email ??
        null,

      isAuthenticated:
        true,

      isAdmin:
        false,

      isDev:
        false,

      isBeta:
        false,
    };
  }


  return {
    userId:
      user.id,

    userEmail:
      user.email ??
      null,

    isAuthenticated:
      true,

    isAdmin:
      profile?.is_admin ===
      true,

    isDev:
      profile?.is_dev ===
      true,

    isBeta:
      profile?.is_beta ===
      true,
  };
}


export async function getServerAdminAccess() {
  const access =
    await getServerSiteAccess();


  return {
    ...access,

    hasAdminAccess:
      access.isAdmin,
  };
}


export async function getServerDevAccess() {
  const access =
    await getServerSiteAccess();


  return {
    ...access,

    hasDevAccess:
      access.isDev ||
      access.isAdmin,
  };
}


export async function getServerBetaAccess() {
  const access =
    await getServerSiteAccess();


  return {
    ...access,

    hasBetaAccess:
      access.isBeta ||
      access.isDev ||
      access.isAdmin,
  };
}