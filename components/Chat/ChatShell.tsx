"use client";

import { useState } from "react";
import ChatConfirmModal from "./ChatConfirmModal";
import ChatCreateChannelModal from "./ChatCreateChannelModal";
import ChatCreateServerModal from "./ChatCreateServerModal";
import ChatCustomEmojiModal from "./ChatCustomEmojiModal";
import ChatHeader from "./ChatHeader";
import ChatMessageInput from "./ChatMessageInput";
import ChatMessageList from "./ChatMessageList";
import ChatProfileEditorModal from "./ChatProfileEditorModal";
import ChatRightPanel from "./ChatRightPanel";
import ChatServerRail from "./ChatServerRail";
import ChatServerSettingsModal from "./ChatServerSettingsModal";
import ChatSidebar from "./ChatSidebar";
import ChatWelcomeView from "./ChatWelcomeView";
import ChatMentionProfileModal from "./ChatMentionProfileModal";
import type { ChatUserProfile } from "../../types/chat";
import { useChatState } from "../../hooks/useChatState";

type ConfirmAction = {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
};

export default function ChatShell() {
  const chat = useChatState();

  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [serverSettingsOpen, setServerSettingsOpen] = useState(false);
  const [emojiModalOpen, setEmojiModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [mentionProfileUser, setMentionProfileUser] =
    useState<ChatUserProfile | null>(null);

  const inputPlaceholder =
    chat.activeView.type === "dm"
      ? "Write a direct message..."
      : chat.activeView.type === "application"
      ? "Reply to this application chat..."
      : chat.activeView.type === "server"
      ? "Write a message to this channel..."
      : "Select a conversation to start chatting...";

  if (chat.loading) {
    return (
      <section className="aurosChatShell">
        <div className="aurosChatCenter" style={{ gridColumn: "1 / -1" }}>
          <div className="aurosWelcomeView">
            <div className="aurosWelcomeCard">
              <p className="aurosWelcomeOverline">AUROSCHANNEL</p>
              <h2 className="aurosWelcomeTitle">Loading live chat data...</h2>
              <p className="aurosWelcomeText">
                Your profile, servers, channels, and messages are being loaded from
                Supabase.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="aurosChatShell">
        <ChatServerRail
          servers={chat.servers}
          activeView={chat.activeView}
          onSelectHome={chat.selectHome}
          onSelectServer={chat.selectServer}
          onCreateServer={() => setServerModalOpen(true)}
        />

        <ChatSidebar
          activeView={chat.activeView}
          activeServer={chat.activeServer}
          activeChannels={chat.channels}
          dms={chat.dms}
          applicationChats={chat.applicationChats}
          onSelectDM={chat.selectDM}
          onSelectApplicationChat={chat.selectApplicationChat}
          onSelectChannel={chat.selectChannel}
          onCreateChannel={() => setChannelModalOpen(true)}
        />

        <div className="aurosChatCenter">
          <ChatHeader
            activeView={chat.activeView}
            activeServer={chat.activeServer}
            activeChannel={chat.activeChannel}
            activeDM={chat.activeDirectConversation}
            activeDirectUser={chat.activeDirectUser}
            activeApplicationChat={chat.activeApplicationChat}
          />

          {chat.error && (
            <div
              style={{
                margin: "16px 20px 0",
                padding: "12px 14px",
                borderRadius: "14px",
                border: "1px solid rgba(255,107,107,0.25)",
                background: "rgba(255,107,107,0.10)",
                color: "#ffb7b7",
                fontWeight: 700,
              }}
            >
              {chat.error}
            </div>
          )}

          {chat.activeView.type === "home" ? (
            <ChatWelcomeView />
          ) : (
            <>
              <div className="aurosChatScrollArea">
                {chat.messagesLoading ? (
                  <div className="aurosChatEmptyMessages">
                    <p>Loading messages...</p>
                  </div>
                ) : (
                  <ChatMessageList
                    messages={chat.activeMessages}
                    customEmojis={chat.customEmojis}
                    mentionUsers={chat.serverMentionUsers}
                    currentUserId={chat.currentUser?.id}
                    onToggleReaction={chat.toggleMessageReaction}
                    onOpenMentionProfile={(user) => setMentionProfileUser(user)}
                    onDeleteMessage={(messageId) =>
                      setConfirmAction({
                        title: "Delete message?",
                        message:
                          "This message will be removed from the chat. This action cannot be undone.",
                        confirmLabel: "Delete Message",
                        danger: true,
                        onConfirm: async () => {
                          await chat.deleteMessage(messageId);
                          setConfirmAction(null);
                        },
                      })
                    }
                  />
                )}
              </div>

              <ChatMessageInput
                onSendMessage={chat.sendMessage}
                customEmojis={chat.customEmojis}
                mentionUsers={chat.serverMentionUsers}
                placeholder={inputPlaceholder}
              />
            </>
          )}
        </div>

        <ChatRightPanel
          currentUser={chat.currentUser}
          activeView={chat.activeView}
          activeChannel={chat.activeChannel}
          activeDM={chat.activeDirectConversation}
          activeDirectUser={chat.activeDirectUser}
          activeApplicationChat={chat.activeApplicationChat}
          activeServer={chat.activeServer}
          activeServerRole={chat.activeServerRole}
          serverInviteLink={chat.serverInviteLink}
          onCreateInvite={chat.createInviteForActiveServer}
          onJoinInvite={chat.joinServerWithInvite}
          onOpenProfileEditor={() => setProfileEditorOpen(true)}
          onOpenServerSettings={() => setServerSettingsOpen(true)}
          onOpenCustomEmojiModal={() => setEmojiModalOpen(true)}
          onDeleteServer={() =>
            setConfirmAction({
              title: "Delete server?",
              message:
                "This server, its channels, and its messages will be deleted. This action cannot be undone.",
              confirmLabel: "Delete Server",
              danger: true,
              onConfirm: async () => {
                await chat.deleteActiveServer();
                setConfirmAction(null);
              },
            })
          }
        />
      </section>

      <ChatCreateServerModal
        open={serverModalOpen}
        onClose={() => setServerModalOpen(false)}
        onCreate={chat.createNewServer}
      />

      <ChatCreateChannelModal
        open={channelModalOpen}
        serverName={chat.activeServer?.name ?? null}
        onClose={() => setChannelModalOpen(false)}
        onCreate={chat.createNewChannel}
      />

      <ChatProfileEditorModal
        open={profileEditorOpen}
        currentUsername={chat.currentUser?.username}
        currentDisplayName={chat.currentUser?.displayName}
        currentBio={chat.currentUser?.bio ?? null}
        onClose={() => setProfileEditorOpen(false)}
        onSave={chat.updateMyProfile}
      />

      <ChatServerSettingsModal
        open={serverSettingsOpen}
        currentName={chat.activeServer?.name}
        currentDescription={chat.activeServer?.description ?? null}
        onClose={() => setServerSettingsOpen(false)}
        onSave={chat.updateActiveServer}
      />

      <ChatCustomEmojiModal
        open={emojiModalOpen}
        onClose={() => setEmojiModalOpen(false)}
        onCreate={chat.createNewCustomEmoji}
      />

      <ChatMentionProfileModal
        user={mentionProfileUser}
        onClose={() => setMentionProfileUser(null)}
      />

      <ChatConfirmModal
        open={!!confirmAction}
        title={confirmAction?.title ?? ""}
        message={confirmAction?.message ?? ""}
        confirmLabel={confirmAction?.confirmLabel}
        danger={confirmAction?.danger}
        onCancel={() => setConfirmAction(null)}
        onConfirm={async () => {
          await confirmAction?.onConfirm();
        }}
      />
    </>
  );
}