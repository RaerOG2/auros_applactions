"use client";

import { useRouter, useParams } from "next/navigation";
import { useCurrentUserProfile } from "../../../hooks/useCurrentUserProfile";
import { useDmConversation } from "../../../hooks/useDmConversation";
import { useDmList } from "../../../hooks/useDmList";
import { usePresence } from "../../../hooks/usePresence";
import DmShell from "../../../components/chat/DmShell";
import type { ProfileItem } from "../../../types/profile";

export default function DirectConversationPage() {
  const router = useRouter();
  const params = useParams();

  const conversationId =
    typeof params.conversationId === "string"
      ? params.conversationId
      : Array.isArray(params.conversationId)
      ? params.conversationId[0]
      : null;

  const { profile, loading: profileLoading } = useCurrentUserProfile();

  const dm = useDmConversation({
    conversationId,
    profile,
  });

  const dmList = useDmList({ profile });

  const presence = usePresence({
    roomKey: `dm:${conversationId || "unknown"}`,
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
    return <div>Loading direct conversation...</div>;
  }

  return (
    <DmShell
      conversations={dmList.conversations}
      currentConversationId={conversationId}
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