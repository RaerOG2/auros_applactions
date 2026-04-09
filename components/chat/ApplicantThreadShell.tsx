"use client";

import type {
  ApplicantChatAccountItem,
  DirectConversationItem,
  DirectMessageItem,
  MessageReactionItem,
} from "../../types/chat";
import type { CustomEmojiItem } from "../../types/emoji";
import DmHeader from "./DmHeader";
import DmMessageInput from "./DmMessageInput";
import DmMessageList from "./DmMessageList";

type ApplicantThreadShellProps = {
  account: ApplicantChatAccountItem | null;
  conversation: DirectConversationItem | null;
  messages: DirectMessageItem[];
  loading: boolean;
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: () => void;
  sending: boolean;
  reactionsMap: Record<string, MessageReactionItem[]>;
  onToggleReaction: (messageId: string, emojiKey: string) => void;
  customEmojis: CustomEmojiItem[];
  customEmojiMap: Record<string, string>;
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "20px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(76, 201, 240, 0.18)",
  background: "rgba(76, 201, 240, 0.10)",
  color: "#95ecff",
  fontSize: "13px",
  fontWeight: 700,
};

export default function ApplicantThreadShell({
  account,
  conversation,
  messages,
  loading,
  messageInput,
  setMessageInput,
  sendMessage,
  sending,
  reactionsMap,
  onToggleReaction,
  customEmojis,
  customEmojiMap,
}: ApplicantThreadShellProps) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <DmHeader
        conversation={conversation}
        profile={null}
        title="Applicant Thread"
        description="Private application-related communication thread."
      />

      {account ? (
        <section style={glassCardStyle}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <span style={pillStyle}>
              {account.display_name || account.discord_name || "Applicant"}
            </span>
            <span style={pillStyle}>Application Thread</span>
          </div>

          <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
            Accessed via applicant chat identity code.
          </p>
        </section>
      ) : null}

      <DmMessageList
        messages={messages}
        loading={loading}
        profile={null}
        reactionsMap={reactionsMap}
        onToggleReaction={onToggleReaction}
        customEmojiMap={customEmojiMap}
        currentApplicantAccountId={account?.id ?? null}
      />

      <DmMessageInput
        canSend={!!account}
        guestText="A valid applicant chat code is required to send messages."
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={sendMessage}
        sending={sending}
        customEmojis={customEmojis}
        mentionResults={[]}
        mentionLoading={false}
        mentionOpen={false}
        onPickMention={() => {}}
      />
    </div>
  );
}