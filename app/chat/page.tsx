"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatAppShell from "../../components/chat/layout/ChatAppShell";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import { useChatRoom } from "../../hooks/useChatRoom";
import { useDmConversation } from "../../hooks/useDmConversation";
import { useDmList } from "../../hooks/useDmList";
import { usePresence } from "../../hooks/usePresence";
import { useUnreadCounts } from "../../hooks/useUnreadCounts";
import { useFriends } from "../../hooks/useFriends";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawDmId = searchParams.get("dm")?.trim() || null;
  const dmHome = rawDmId === "home";
  const dmId = dmHome ? null : rawDmId;

  const channelSlug = searchParams.get("channel")?.trim() || "general";
  const tab = searchParams.get("tab")?.trim() || "online";

  const mode = useMemo<"friends" | "dm" | "channel">(() => {
    if (rawDmId) return "dm";
    if (searchParams.get("channel")) return "channel";
    return "friends";
  }, [rawDmId, searchParams]);

  const { profile, loading: profileLoading } = useCurrentUserProfile();

  const chat = useChatRoom({
    channelSlug,
    profile,
  });

  const dm = useDmConversation({
    conversationId: dmId,
    profile,
  });

  const dmList = useDmList({ profile });
  const friends = useFriends({ profile });

  const presence = usePresence({
    roomKey:
      mode === "dm"
        ? `dm:${dmId || "home"}`
        : mode === "channel"
        ? `channel:${channelSlug}`
        : "friends",
    profile,
  });

  const unread = useUnreadCounts({
    channels: chat.channels,
    conversations: dmList.conversations,
    currentChannelSlug: mode === "channel" ? channelSlug : undefined,
    currentConversationId: mode === "dm" && dmId ? dmId : null,
    mode,
  });

  async function startFriendDm(profileId: string) {
    try {
      const conversation = await friends.startDmWithFriend(profileId);
      router.push(`/chat?dm=${conversation.id}`);
    } catch (error) {
      console.error("[ChatPage] startFriendDm failed:", error);
      alert("DM could not be opened.");
    }
  }

  const loading =
    profileLoading ||
    (mode === "dm" && !dmHome ? dm.loading : mode === "channel" ? chat.loading : false) ||
    dmList.loading ||
    friends.loading;

  return (
    <ChatAppShell
      mode={mode}
      currentTab={tab}
      profile={profile}
      channels={chat.channels}
      currentChannelSlug={channelSlug}
      currentChannel={chat.currentChannel}
      channelMessages={chat.messages}
      channelUnreadMap={unread.channelUnreadMap}
      conversations={dmList.conversations}
      currentConversationId={dmId}
      dmUnreadMap={unread.dmUnreadMap}
      totalDmUnread={unread.totalDmUnread}
      totalChannelUnread={unread.totalChannelUnread}
      dmConversation={dmHome ? null : dm.conversation}
      dmMessages={dmHome ? [] : dm.messages}
      loading={loading}
      accessDenied={chat.accessDenied}
      messageInput={mode === "dm" ? dm.messageInput : chat.messageInput}
      setMessageInput={mode === "dm" ? dm.setMessageInput : chat.setMessageInput}
      sendMessage={mode === "dm" ? dm.sendMessage : chat.sendMessage}
      sending={mode === "dm" ? dm.sending : chat.sending}
      reactionsMap={mode === "dm" ? dm.reactionsMap : chat.reactionsMap}
      onToggleReaction={mode === "dm" ? dm.toggleReaction : chat.toggleReaction}
      customEmojis={mode === "dm" ? dm.customEmojis : chat.customEmojis}
      customEmojiMap={mode === "dm" ? dm.customEmojiMap : chat.customEmojiMap}
      mentionResults={mode === "dm" ? dm.mentionResults : chat.mentionResults}
      mentionLoading={mode === "dm" ? dm.mentionLoading : chat.mentionLoading}
      mentionOpen={mode === "dm" ? dm.mentionOpen : chat.mentionOpen}
      onPickMention={mode === "dm" ? dm.applyMention : chat.applyMention}
      onlineUsers={presence.onlineUsers}
      isUserOnline={presence.isUserOnline}

      acceptedFriends={friends.acceptedFriends}
      incomingRequests={friends.incomingRequests}
      outgoingRequests={friends.outgoingRequests}
      friendSearchValue={friends.searchValue}
      setFriendSearchValue={friends.setSearchValue}
      friendUserResults={friends.userResults}
      searchingFriendUsers={friends.searchingUsers}
      onSearchFriendUsers={friends.searchUsers}
      onAddFriend={friends.addFriend}
      onAcceptFriend={friends.acceptFriend}
      onRejectFriend={friends.rejectFriend}
      onRemoveFriend={friends.removeFriend}
      onStartFriendDm={startFriendDm}
    />
  );
}