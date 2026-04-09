"use client";

import { useState } from "react";
import type {
  ChatChannelItem,
  ChatMessageItem,
  MessageReactionItem,
  DirectConversationItem,
  DirectMessageItem,
} from "../../../types/chat";
import type { ProfileItem } from "../../../types/profile";
import type { CustomEmojiItem } from "../../../types/emoji";
import type { DirectConversationListItem } from "../../../services/dm-service";
import type { FriendCardItem } from "../../../types/friends";
import { chatTheme, chatUi } from "../../../lib/chat-theme";
import ChatMessageList from "../ChatMessageList";
import ChatMessageInput from "../ChatMessageInput";
import DmMessageList from "../DmMessageList";
import DmMessageInput from "../DmMessageInput";
import ChannelAccessDenied from "../ChannelAccessDenied";
import FriendsHomeView from "../friends/FriendsHomeView";
import DmHomeView from "../dm/DmHomeView";
import { StartChatModal } from "../friends/StartChatModal";

type OnlineUserItem = {
  profileId: string;
  username: string;
  displayName: string | null;
  onlineAt: string;
};

type ChatMainViewProps = {
  mode: "friends" | "dm" | "channel";
  profile: ProfileItem | null;
  currentChannel: ChatChannelItem | null;
  channelMessages: ChatMessageItem[];
  dmConversation: DirectConversationItem | null;
  dmMessages: DirectMessageItem[];
  conversations: DirectConversationListItem[];
  onlineUsers: OnlineUserItem[];
  currentTab?: string;
  loading: boolean;
  accessDenied: boolean;
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: () => void;
  sending: boolean;
  reactionsMap: Record<string, MessageReactionItem[]>;
  onToggleReaction: (messageId: string, emojiKey: string) => void;
  customEmojis: CustomEmojiItem[];
  customEmojiMap: Record<string, string>;
  mentionResults: ProfileItem[];
  mentionLoading: boolean;
  mentionOpen: boolean;
  onPickMention: (username: string) => void;
  isUserOnline: (profileId?: string | null) => boolean;

  acceptedFriends: FriendCardItem[];
  incomingRequests: FriendCardItem[];
  outgoingRequests: FriendCardItem[];
  friendSearchValue: string;
  setFriendSearchValue: (value: string) => void;
  friendUserResults: ProfileItem[];
  searchingFriendUsers: boolean;
  onSearchFriendUsers: () => void;
  onAddFriend: (profileId: string) => void;
  onAcceptFriend: (friendshipId: string) => void;
  onRejectFriend: (friendshipId: string) => void;
  onRemoveFriend: (friendshipId: string) => void;
  onStartFriendDm: (profileId: string) => Promise<void>;

  totalDmUnread?: number;
};

export default function ChatMainView({
  mode,
  profile,
  currentChannel,
  channelMessages,
  dmConversation,
  dmMessages,
  conversations,
  onlineUsers,
  currentTab = "online",
  loading,
  accessDenied,
  messageInput,
  setMessageInput,
  sendMessage,
  sending,
  reactionsMap,
  onToggleReaction,
  customEmojis,
  customEmojiMap,
  mentionResults,
  mentionLoading,
  mentionOpen,
  onPickMention,
  isUserOnline,

  acceptedFriends,
  incomingRequests,
  outgoingRequests,
  friendSearchValue,
  setFriendSearchValue,
  friendUserResults,
  searchingFriendUsers,
  onSearchFriendUsers,
  onAddFriend,
  onAcceptFriend,
  onRejectFriend,
  onRemoveFriend,
  onStartFriendDm,

  totalDmUnread = 0,
}: ChatMainViewProps) {
  const [startChatOpen, setStartChatOpen] = useState(false);

  if (mode === "friends") {
    return (
      <>
        <FriendsHomeView
          onlineUsers={onlineUsers}
          conversations={conversations}
          currentTab={currentTab}
          acceptedFriends={acceptedFriends}
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          friendSearchValue={friendSearchValue}
          setFriendSearchValue={setFriendSearchValue}
          friendUserResults={friendUserResults}
          searchingFriendUsers={searchingFriendUsers}
          onSearchFriendUsers={onSearchFriendUsers}
          onAddFriend={onAddFriend}
          onAcceptFriend={onAcceptFriend}
          onRejectFriend={onRejectFriend}
          onRemoveFriend={onRemoveFriend}
          onStartFriendDm={onStartFriendDm}
        />

        <StartChatModal
          open={startChatOpen}
          onClose={() => setStartChatOpen(false)}
          friends={acceptedFriends}
          onStartDm={onStartFriendDm}
        />
      </>
    );
  }

  if (mode === "channel") {
    return (
      <section
        style={{
          ...chatUi.shellCard,
          minHeight: "calc(100vh - 140px)",
          padding: 18,
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            padding: "8px 10px 16px 10px",
            borderBottom: `1px solid ${chatTheme.border}`,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 22 }}>
            {currentChannel
              ? `${currentChannel.is_public ? "#" : "🔒"} ${currentChannel.name}`
              : "Channel"}
          </div>
          <div style={{ marginTop: 6, color: chatTheme.textMuted }}>
            {currentChannel?.description || "No description"}
          </div>
        </div>

        {accessDenied ? (
          <ChannelAccessDenied />
        ) : (
          <>
            <ChatMessageList
              messages={channelMessages}
              loading={loading}
              profile={profile}
              reactionsMap={reactionsMap}
              onToggleReaction={onToggleReaction}
              customEmojiMap={customEmojiMap}
              isUserOnline={isUserOnline}
            />

            <ChatMessageInput
              profile={profile}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sendMessage={sendMessage}
              sending={sending}
              customEmojis={customEmojis}
              mentionResults={mentionResults}
              mentionLoading={mentionLoading}
              mentionOpen={mentionOpen}
              onPickMention={onPickMention}
            />
          </>
        )}
      </section>
    );
  }

  if (!dmConversation) {
    return (
      <>
        <DmHomeView
          conversations={conversations}
          acceptedFriends={acceptedFriends}
          totalDmUnread={totalDmUnread}
          onOpenStartChat={() => setStartChatOpen(true)}
        />

        <StartChatModal
          open={startChatOpen}
          onClose={() => setStartChatOpen(false)}
          friends={acceptedFriends}
          onStartDm={onStartFriendDm}
        />
      </>
    );
  }

  return (
    <>
      <section
        style={{
          ...chatUi.shellCard,
          minHeight: "calc(100vh - 140px)",
          padding: 18,
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            padding: "8px 10px 16px 10px",
            borderBottom: `1px solid ${chatTheme.border}`,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>
              {dmConversation.is_applicant_thread ? "Applicant Thread" : "Direct Messages"}
            </div>
            <div style={{ marginTop: 6, color: chatTheme.textMuted }}>
              Private conversation area
            </div>
          </div>

          <span style={chatUi.pill}>DM Active</span>
        </div>

        <DmMessageList
          messages={dmMessages}
          loading={loading}
          profile={profile}
          reactionsMap={reactionsMap}
          onToggleReaction={onToggleReaction}
          customEmojiMap={customEmojiMap}
          isUserOnline={isUserOnline}
        />

        <DmMessageInput
          canSend={!!profile}
          guestText="You must be logged in to send direct messages."
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          sendMessage={sendMessage}
          sending={sending}
          customEmojis={customEmojis}
          mentionResults={mentionResults}
          mentionLoading={mentionLoading}
          mentionOpen={mentionOpen}
          onPickMention={onPickMention}
        />
      </section>

      <StartChatModal
        open={startChatOpen}
        onClose={() => setStartChatOpen(false)}
        friends={acceptedFriends}
        onStartDm={onStartFriendDm}
      />
    </>
  );
}