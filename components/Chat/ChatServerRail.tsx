"use client";

import type { ChatServer, ChatView } from "../../types/chat";

type ChatServerRailProps = {
  servers: ChatServer[];
  activeView: ChatView;
  mentionNotifications: Record<string, { count: number; channelIds: string[] }>;
  onSelectHome: () => void;
  onSelectServer: (serverId: string) => void | Promise<void>;
  onCreateServer: () => void;
};

export default function ChatServerRail({
  servers,
  activeView,
  mentionNotifications,
  onSelectHome,
  onSelectServer,
  onCreateServer,
}: ChatServerRailProps) {
  return (
    <aside className="aurosChatServerRail">
      <button
        className={`aurosServerHomeButton ${
          activeView.type === "home" ? "isActive" : ""
        }`}
        onClick={onSelectHome}
        title="AUROSCHANNEL Home"
        type="button"
      >
        🏠
      </button>

      <div className="aurosRailDivider" />

      {servers.map((server) => {
        const isActive =
          activeView.type === "server" && activeView.serverId === server.id;

        const notification = mentionNotifications[server.id];

        return (
          <button
            key={server.id}
            className={`aurosServerIconButton ${isActive ? "isActive" : ""}`}
            onClick={() => onSelectServer(server.id)}
            title={server.name}
            type="button"
          >
            {server.iconUrl ? (
              <img
                src={server.iconUrl}
                alt={server.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "inherit",
                }}
              />
            ) : (
              <span>{server.name.slice(0, 1).toUpperCase()}</span>
            )}

            {notification?.count ? (
              <span className="aurosUnreadBadge">{notification.count}</span>
            ) : null}
          </button>
        );
      })}

      <button
        className="aurosServerAddButton"
        title="Create Server"
        type="button"
        onClick={onCreateServer}
      >
        +
      </button>
    </aside>
  );
}