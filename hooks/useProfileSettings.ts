"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileItem } from "../types/profile";
import { getCurrentAuthUser, signOutCurrentUser } from "../services/auth-service";
import { ensureProfileExists, getCurrentProfile, updateProfile } from "../services/profile-service";

export function useProfileSettings() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadProfile() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const user = await getCurrentAuthUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const ensured = await ensureProfileExists({
        userId: user.id,
        fallbackEmail: user.email,
      });

      const current = (await getCurrentProfile()) ?? ensured;

      setProfile(current);
      setUsername(current.username || "");
      setDisplayName(current.display_name || "");
      setBio(current.bio || "");
    } catch (error: any) {
      setErrorMessage(error?.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!profile) return;

    try {
      setSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!username.trim()) {
        throw new Error("Username is required.");
      }

      await updateProfile(profile.id, {
        username: username.trim(),
        display_name: displayName.trim() || username.trim(),
        bio: bio.trim() || null,
      });

      setSuccessMessage("Profile saved successfully.");
      await loadProfile();
    } catch (error: any) {
      setErrorMessage(error?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await signOutCurrentUser();
    router.push("/login");
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    saving,
    username,
    setUsername,
    displayName,
    setDisplayName,
    bio,
    setBio,
    errorMessage,
    successMessage,
    saveProfile,
    logout,
  };
}