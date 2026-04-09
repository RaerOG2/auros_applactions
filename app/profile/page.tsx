"use client";

import ProfileSettingsCard from "../../components/accounts/ProfileSettingsCard";
import { useProfileSettings } from "../../hooks/useProfileSettings";

export default function ProfilePage() {
  const profile = useProfileSettings();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <ProfileSettingsCard
        profile={profile.profile}
        loading={profile.loading}
        saving={profile.saving}
        username={profile.username}
        setUsername={profile.setUsername}
        displayName={profile.displayName}
        setDisplayName={profile.setDisplayName}
        bio={profile.bio}
        setBio={profile.setBio}
        errorMessage={profile.errorMessage}
        successMessage={profile.successMessage}
        saveProfile={profile.saveProfile}
        logout={profile.logout}
      />
    </div>
  );
}