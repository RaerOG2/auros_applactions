import { supabase } from "../lib/supabase";

import type {
  AssignableDevUser,
} from "../types/dev-tasks";


type RawDevProfile =
  Record<string, unknown> & {
    id: string;
  };


function readString(
  value: unknown
): string | null {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : null;
}


function readBoolean(
  value: unknown
): boolean {
  return value === true;
}


function mapDevProfile(
  profile: RawDevProfile
): AssignableDevUser {
  const username =
    readString(
      profile.username
    );


  const displayName =
    readString(
      profile.display_name
    ) ||
    readString(
      profile.displayName
    ) ||
    readString(
      profile.name
    ) ||
    username ||
    `DEV ${profile.id.slice(
      0,
      8
    )}`;


  const avatarUrl =
    readString(
      profile.avatar_url
    ) ||
    readString(
      profile.avatarUrl
    );


  return {
    id:
      profile.id,

    displayName,

    username,

    avatarUrl,

    isAdmin:
      readBoolean(
        profile.is_admin
      ),
  };
}


export async function getAssignableDevUsers(): Promise<
  AssignableDevUser[]
> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_auros_dev_profiles"
  );


  if (error) {
    throw new Error(
      `Could not load DEV users: ${error.message}`
    );
  }


  const profiles =
    (
      data ?? []
    ) as RawDevProfile[];


  return profiles
    .map(
      mapDevProfile
    )
    .sort(
      (
        first,
        second
      ) =>
        first.displayName.localeCompare(
          second.displayName
        )
    );
}