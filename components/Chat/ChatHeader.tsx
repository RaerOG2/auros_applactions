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

  activeApplicationChat?: ApplicationChat | null;

  onOpenSearch?: () => void;
  onOpenMembers?: () => void;
  onOpenModeration?: () => void;
};

export default function ChatHeader({
  activeView,
  activeServer,
  activeChannel,
  activeDM,
  activeDirectUser,
  activeApplicationChat = null,
  onOpenSearch,
  onOpenMembers,
  onOpenModeration,
}: ChatHeaderProps) {
  let title = "AUROSCHANNEL";
  let subtitle = "Unified communication platform";

  const isServerView =
    activeView.type === "server";

  if (
    activeView.type === "server" &&
    activeServer &&
    activeChannel
  ) {
    title = `# ${activeChannel.name}`;
    subtitle = `${activeServer.name} server`;
  }

  if (
    activeView.type === "dm" &&
    activeDM
  ) {
    title =
      activeDirectUser?.displayName ??
      "Direct Message";

    subtitle =
      activeDirectUser?.username
        ? `@${activeDirectUser.username}`
        : `Conversation ID • ${activeDM.id.slice(
            0,
            8
          )}`;
  }

  if (
    activeView.type === "application" &&
    activeApplicationChat
  ) {
    title =
      activeApplicationChat.applicantName;

    subtitle =
      `Application Chat • ${activeApplicationChat.chatId}`;
  }

  if (
    activeView.type === "application" &&
    !activeApplicationChat
  ) {
    title = "Application Chat";
    subtitle =
      "Application conversation";
  }

  if (activeView.type === "home") {
    title = "Home";
    subtitle =
      "Direct messages, applications, and quick access";
  }

  return (
    <header className="aurosChatHeader">
      <div>
        <p className="aurosHeaderOverline">
          AUROSCHANNEL
        </p>

        <h1 className="aurosHeaderTitle">
          {title}
        </h1>

        <p className="aurosHeaderSubtitle">
          {subtitle}
        </p>
      </div>

      <div className="aurosHeaderActions">
        {activeView.type !== "home" && (
          <button
            className="aurosHeaderButton"
            type="button"
            onClick={onOpenSearch}
          >
            Search
          </button>
        )}

        {isServerView && (
          <button
            className="aurosHeaderButton"
            type="button"
            onClick={onOpenMembers}
          >
            Members
          </button>
        )}

        {isServerView && (
          <button
            className="aurosHeaderButton"
            type="button"
            onClick={onOpenModeration}
          >
            Moderation
          </button>
        )}
      </div>
    </header>
  );
}