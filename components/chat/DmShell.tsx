"use client";

import type {
  DirectConversationItem,
  DirectMessageItem,
  MessageReactionItem,
} from "../../types/chat";
import type { ProfileItem } from "../../types/profile";
import type { CustomEmojiItem } from "../../types/emoji";
import type { DirectConversationListItem } from "../../services/dm-service";
import DmHeader from "./DmHeader";
import DmList from "./DmList";
import DmMessageInput from "./DmMessageInput";
import DmMessageList from "./DmMessageList";
import DmStartCard from "./DmStartCard";
import OnlineUsersCard from "./OnlineUsersCard";

type DmShellProps = {
  conversations: DirectConversationListItem[];
  currentConversationId?: string | null;
  conversation: DirectConversationItem | null;
  messages: DirectMessageItem[];
  loading: boolean;
  profile: ProfileItem | null;
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
  dmSearchValue: string;
  setDmSearchValue: (value: string) => void;
  onSearchUsers: () => void;
  searchingUsers: boolean;
  dmUserResults: ProfileItem[];
  onStartDm: (profile: ProfileItem) => void;
  onlineUsers: {
    profileId: string;
    username: string;
    displayName: string | null;
    onlineAt: string;
  }[];
  isUserOnline: (profileId?: string | null) => boolean;
};

export default function DmShell({
  conversations,
  currentConversationId,
  conversation,
  messages,
  loading,
  profile,
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
  dmSearchValue,
  setDmSearchValue,
  onSearchUsers,
  searchingUsers,
  dmUserResults,
  onStartDm,
  onlineUsers,
  isUserOnline,
}: DmShellProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px minmax(0, 1fr) 260px",
        gap: 18,
        alignItems: "start",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <DmList
          conversations={conversations}
          currentConversationId={currentConversationId}
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: 18,
          minWidth: 0,
        }}
      >
        <DmHeader conversation={conversation} profile={profile} />

        {profile ? (
          <DmStartCard
            searchValue={dmSearchValue}
            setSearchValue={setDmSearchValue}
            onSearch={onSearchUsers}
            searchingUsers={searchingUsers}
            userResults={dmUserResults}
            onStartDm={onStartDm}
          />
        ) : null}

        <DmMessageList
          messages={messages}
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
      </div>

      <div style={{ minWidth: 0 }}>
        <OnlineUsersCard title="DM Presence" users={onlineUsers} />
      </div>
    </div>
  );
}