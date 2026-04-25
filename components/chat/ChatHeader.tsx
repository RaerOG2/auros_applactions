"use client";

import type {
  ApplicationChat,
  ChatChannel,
  ChatServer,
  ChatUserProfile,
  ChatView,
  DirectConversation,
} from "../../types/chat";

type ChatHeaderProps = {
  activeView: ChatView;
  activeServer: ChatServer | null;
  activeChannel: ChatChannel | null;
  activeDM: DirectConversation | null;
  activeDirectUser?: ChatUserProfile | null;
  activeApplicationChat: ApplicationChat | null;
};

export default function ChatHeader({
  activeView,
  activeServer,
  activeChannel,
  activeDM,
  activeDirectUser,
  activeApplicationChat,
}: ChatHeaderProps) {
  let title = "AUROSCHANNEL";
  let subtitle = "Unified communication platform";

  if (activeView.type === "server" && activeServer && activeChannel) {
    title = `# ${activeChannel.name}`;
    subtitle = `${activeServer.name} server`;
  }

  if (activeView.type === "dm" && activeDM) {
    title = activeDirectUser?.displayName ?? "Direct Message";
    subtitle = activeDirectUser?.username
      ? `@${activeDirectUser.username}`
      : `Conversation ID • ${activeDM.id.slice(0, 8)}`;
  }

  if (activeView.type === "application" && activeApplicationChat) {
    title = activeApplicationChat.applicantName;
    subtitle = `Application Chat • ${activeApplicationChat.chatId}`;
  }

  if (activeView.type === "home") {
    title = "Home";
    subtitle = "Direct messages, applications, and quick access";
  }

  return (
    <header className="aurosChatHeader">
      <div>
        <p className="aurosHeaderOverline">AUROSCHANNEL</p>
        <h1 className="aurosHeaderTitle">{title}</h1>
        <p className="aurosHeaderSubtitle">{subtitle}</p>
      </div>

      <div className="aurosHeaderActions">
        <button className="aurosHeaderButton" type="button">
          Search
        </button>
        <button className="aurosHeaderButton" type="button">
          Members
        </button>
        <button className="aurosHeaderButton" type="button">
          Moderation
        </button>
      </div>
    </header>
  );
}