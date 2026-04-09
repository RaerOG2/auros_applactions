"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import { useDmConversation } from "../../hooks/useDmConversation";
import { useDmList } from "../../hooks/useDmList";
import { usePresence } from "../../hooks/usePresence";
import DmShell from "../../components/chat/DmShell";
import type { ProfileItem } from "../../types/profile";

export default function DmIndexPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useCurrentUserProfile();

  const dm = useDmConversation({
    conversationId: null,
    profile,
  });

  const dmList = useDmList({ profile });

  const presence = usePresence({
    roomKey: "dm:index",
    profile,
  });

  async function startDm(targetProfile: ProfileItem) {
    try {
      const conversation = await dm.createNewConversationWithProfile(targetProfile.id);
      router.push(`/dm/${conversation.id}`);
    } catch (error) {
      console.error("[DM] startDm failed:", error);
      alert("Could not start direct message.");
    }
  }

  if (profileLoading || dmList.loading) {
    return <div>Loading direct messages...</div>;
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            padding: "24px",
            borderRadius: "24px",
            border: "1px solid #22304d",
            background: "rgba(15, 27, 52, 0.74)",
            color: "white",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Direct Messages</h1>
          <p style={{ color: "#9fb0d0", lineHeight: 1.7 }}>
            You need an account and must be logged in to access direct messages.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/login" style={{ color: "#95ecff" }}>
              Login
            </Link>
            <Link href="/register" style={{ color: "#95ecff" }}>
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DmShell
      conversations={dmList.conversations}
      currentConversationId={null}
      conversation={dm.conversation}
      messages={dm.messages}
      loading={dm.loading}
      profile={profile}
      messageInput={dm.messageInput}
      setMessageInput={dm.setMessageInput}
      sendMessage={dm.sendMessage}
      sending={dm.sending}
      reactionsMap={dm.reactionsMap}
      onToggleReaction={dm.toggleReaction}
      customEmojis={dm.customEmojis}
      customEmojiMap={dm.customEmojiMap}
      mentionResults={dm.mentionResults}
      mentionLoading={dm.mentionLoading}
      mentionOpen={dm.mentionOpen}
      onPickMention={dm.applyMention}
      dmSearchValue={dmList.searchValue}
      setDmSearchValue={dmList.setSearchValue}
      onSearchUsers={dmList.searchUsers}
      searchingUsers={dmList.searchingUsers}
      dmUserResults={dmList.userResults}
      onStartDm={startDm}
      onlineUsers={presence.onlineUsers}
      isUserOnline={presence.isUserOnline}
    />
  );
}