"use client";

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
import { chatTheme } from "../../../lib/chat-theme";
import ChatGuildSidebar from "./ChatGuildSidebar";
import ChatSidebarList from "./ChatSidebarList";
import ChatMainView from "./ChatMainView";
import ChatRightPanel from "./ChatRightPanel";

type ChatAppShellProps = {
  mode: "friends" | "dm" | "channel";
  currentTab?: string;
  profile: ProfileItem | null;
  channels: ChatChannelItem[];
  currentChannelSlug?: string;
  currentChannel: ChatChannelItem | null;
  channelMessages: ChatMessageItem[];
  channelUnreadMap?: Record<string, number>;
  conversations: DirectConversationListItem[];
  currentConversationId?: string | null;
  dmUnreadMap?: Record<string, number>;
  totalDmUnread?: number;
  totalChannelUnread?: number;
  dmConversation: DirectConversationItem | null;
  dmMessages: DirectMessageItem[];
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
  onlineUsers: {
    profileId: string;
    username: string;
    displayName: string | null;
    onlineAt: string;
  }[];
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
};

export default function ChatAppShell(props: ChatAppShellProps) {
  return (
    <>
      <style jsx>{`
        .chatAppOuter {
          width: min(100%, 1820px);
          margin: 0 auto;
        }

        .chatAppGrid {
          display: grid;
          grid-template-columns: 76px 340px minmax(980px, 1fr) 300px;
          gap: 16px;
          align-items: start;
        }

        @media (max-width: 1800px) {
          .chatAppGrid {
            grid-template-columns: 76px 320px minmax(860px, 1fr) 280px;
          }
        }

        @media (max-width: 1560px) {
          .chatAppGrid {
            grid-template-columns: 76px 300px minmax(760px, 1fr) 260px;
          }
        }

        @media (max-width: 1360px) {
          .chatAppGrid {
            grid-template-columns: 76px 290px minmax(0, 1fr);
          }

          .chatRightPanelWrap {
            display: none;
          }
        }
      `}</style>

      <div className="chatAppOuter">
        <div
          style={{
            minHeight: "calc(100vh - 110px)",
            background: chatTheme.shellBg,
            borderRadius: 24,
            padding: 16,
            border: `1px solid ${chatTheme.border}`,
            boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
            width: "100%",
          }}
        >
          <div className="chatAppGrid">
            <ChatGuildSidebar
              currentView={props.mode}
              totalDmUnread={props.totalDmUnread}
              totalChannelUnread={props.totalChannelUnread}
            />

            <ChatSidebarList
              mode={props.mode}
              channels={props.channels}
              currentChannelSlug={props.currentChannelSlug}
              channelUnreadMap={props.channelUnreadMap}
              conversations={props.conversations}
              currentConversationId={props.currentConversationId}
              dmUnreadMap={props.dmUnreadMap}
            />

            <ChatMainView
              mode={props.mode}
              profile={props.profile}
              currentChannel={props.currentChannel}
              channelMessages={props.channelMessages}
              dmConversation={props.dmConversation}
              dmMessages={props.dmMessages}
              conversations={props.conversations}
              onlineUsers={props.onlineUsers}
              currentTab={props.currentTab}
              loading={props.loading}
              accessDenied={props.accessDenied}
              messageInput={props.messageInput}
              setMessageInput={props.setMessageInput}
              sendMessage={props.sendMessage}
              sending={props.sending}
              reactionsMap={props.reactionsMap}
              onToggleReaction={props.onToggleReaction}
              customEmojis={props.customEmojis}
              customEmojiMap={props.customEmojiMap}
              mentionResults={props.mentionResults}
              mentionLoading={props.mentionLoading}
              mentionOpen={props.mentionOpen}
              onPickMention={props.onPickMention}
              isUserOnline={props.isUserOnline}

              acceptedFriends={props.acceptedFriends}
              incomingRequests={props.incomingRequests}
              outgoingRequests={props.outgoingRequests}
              friendSearchValue={props.friendSearchValue}
              setFriendSearchValue={props.setFriendSearchValue}
              friendUserResults={props.friendUserResults}
              searchingFriendUsers={props.searchingFriendUsers}
              onSearchFriendUsers={props.onSearchFriendUsers}
              onAddFriend={props.onAddFriend}
              onAcceptFriend={props.onAcceptFriend}
              onRejectFriend={props.onRejectFriend}
              onRemoveFriend={props.onRemoveFriend}
              onStartFriendDm={props.onStartFriendDm}
              totalDmUnread={props.totalDmUnread}
            />

            <div className="chatRightPanelWrap">
              <ChatRightPanel mode={props.mode} onlineUsers={props.onlineUsers} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}