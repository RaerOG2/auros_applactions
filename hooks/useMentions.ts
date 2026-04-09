"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProfileItem } from "../types/profile";
import { getProfilesForMentions } from "../services/profile-service";

function extractMentionQuery(input: string) {
  const match = input.match(/(?:^|\s)@([a-zA-Z0-9_.-]{0,30})$/);
  return match ? match[1] : null;
}

export function useMentions(inputValue: string) {
  const [results, setResults] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const mentionQuery = useMemo(() => extractMentionQuery(inputValue), [inputValue]);

  useEffect(() => {
    let active = true;

    async function run() {
      if (mentionQuery === null) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const data = await getProfilesForMentions(mentionQuery, 6);
        if (active) setResults(data);
      } catch (error) {
        console.error("[Mentions] lookup failed:", error);
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [mentionQuery]);

  function applyMention(currentValue: string, username: string) {
    return currentValue.replace(/@([a-zA-Z0-9_.-]{0,30})$/, `@${username} `);
  }

  return {
    mentionQuery,
    results,
    loading,
    hasActiveMention: mentionQuery !== null,
    applyMention,
  };
}