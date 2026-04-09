"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ProfileItem } from "../types/profile";
import { getCurrentProfile } from "../services/profile-service";

export function useCurrentUserProfile() {
  const [profile, setProfile] = useState<ProfileItem | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    try {
      setLoading(true);
      const nextProfile = await getCurrentProfile();
      setProfile(nextProfile);
    } catch (error) {
      console.error("[Chat] loadProfile failed:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    profile,
    loading,
    reloadProfile: loadProfile,
  };
}