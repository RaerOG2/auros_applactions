"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ProfileItem } from "../types/profile";

type PresencePayload = {
  onlineAt: string;
  username: string;
  displayName: string | null;
};

type PresenceUser = {
  profileId: string;
  username: string;
  displayName: string | null;
  onlineAt: string;
};

type UsePresenceParams = {
  roomKey: string;
  profile: ProfileItem | null;
};

export function usePresence({ roomKey, profile }: UsePresenceParams) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!profile) {
      setOnlineUsers([]);
      return;
    }

    const channel = supabase.channel(`presence:${roomKey}`, {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();

        const mapped = Object.entries(state)
          .map(([profileId, entries]) => {
            const rawEntries = entries as unknown;
            const typedEntries: PresencePayload[] = Array.isArray(rawEntries)
              ? (rawEntries as PresencePayload[])
              : [];

            const latest =
              typedEntries.length > 0 ? typedEntries[typedEntries.length - 1] : null;

            if (!latest) return null;

            return {
              profileId,
              username: latest.username || "unknown",
              displayName: latest.displayName ?? null,
              onlineAt: latest.onlineAt,
            };
          })
          .filter((item): item is PresenceUser => item !== null);

        mapped.sort((a, b) => a.username.localeCompare(b.username));
        setOnlineUsers(mapped);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;

        await channel.track({
          onlineAt: new Date().toISOString(),
          username: profile.username,
          displayName: profile.display_name ?? null,
        });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomKey, profile?.id, profile?.username, profile?.display_name]);

  const onlineIds = useMemo(
    () => new Set(onlineUsers.map((user) => user.profileId)),
    [onlineUsers]
  );

  return {
    onlineUsers,
    onlineIds,
    isUserOnline: (profileId?: string | null) => !!profileId && onlineIds.has(profileId),
  };
}