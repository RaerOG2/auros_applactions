"use client";

import type {
  ChatChannelItem,
  ChatMessageItem,
  MessageReactionItem,
} from "../../types/chat";
import type { ProfileItem } from "../../types/profile";
import type { CustomEmojiItem } from "../../types/emoji";
import ChatAuthGate from "./ChatAuthGate";
import ChannelHeader from "./ChannelHeader";
import ChannelSidebar from "./ChannelSidebar";
import ChatMessageInput from "./ChatMessageInput";
import ChatMessageList from "./ChatMessageList";
import OnlineUsersCard from "./OnlineUsersCard";
import ChannelAccessDenied from "./ChannelAccessDenied";

type ChatShellProps = {
  channels: ChatChannelItem[];
  currentChannel: ChatChannelItem | null;
  currentChannelSlug: string;
  messages: ChatMessageItem[];
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
  onlineUsers: {
    profileId: string;
    username: string;
    displayName: string | null;
    onlineAt: string;
  }[];
  isUserOnline: (profileId?: string | null) => boolean;
  accessDenied?: boolean;
};

export default function ChatShell({
  channels,
  currentChannel,
  currentChannelSlug,
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
  onlineUsers,
  isUserOnline,
  accessDenied = false,
}: ChatShellProps) {
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
        <ChannelSidebar
          channels={channels}
          currentChannelSlug={currentChannelSlug}
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: 18,
          minWidth: 0,
        }}
      >
        <ChannelHeader currentChannel={currentChannel} profile={profile} />

        {accessDenied ? (
          <ChannelAccessDenied />
        ) : (
          <>
            <ChatAuthGate profile={profile} />

            <ChatMessageList
              messages={messages}
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
      </div>

      <div style={{ minWidth: 0 }}>
        <OnlineUsersCard title="Channel Presence" users={onlineUsers} />
      </div>
    </div>
  );
}