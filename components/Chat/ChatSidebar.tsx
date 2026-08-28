"use client";

import type {
  ChatChannel,
  ChatServer,
  ChatView,
  DirectMessagePreview,
} from "../../types/chat";

type ChatSidebarProps = {
  activeView: ChatView;

  activeServer: ChatServer | null;

  activeChannels: ChatChannel[];

  dms: DirectMessagePreview[];

  mentionNotifications: Record<
    string,
    {
      count: number;
      channelIds: string[];
    }
  >;

  onSelectDM: (
    dmId: string
  ) => void;

  onSelectChannel: (
    serverId: string,
    channelId: string
  ) => void;

  onCreateChannel: () => void;

  onCreateDM?: () => void;
};

function getInitial(
  label: string
) {
  return label
    .slice(0, 1)
    .toUpperCase();
}

export default function ChatSidebar({
  activeView,
  activeServer,
  activeChannels,
  dms,
  mentionNotifications,
  onSelectDM,
  onSelectChannel,
  onCreateChannel,
  onCreateDM,
}: ChatSidebarProps) {
  /*
   * =========================================================
   * SERVER VIEW
   * =========================================================
   */

  if (
    activeView.type === "server" &&
    activeServer
  ) {
    const activeServerNotifications =
      mentionNotifications[
        activeServer.id
      ] ?? null;

    return (
      <aside className="aurosChatSidebar">
        <div className="aurosSidebarHeader">
          <div>
            <p className="aurosSidebarOverline">
              SERVER
            </p>

            <h2 className="aurosSidebarTitle">
              {activeServer.name}
            </h2>
          </div>

          <button
            className="aurosSidebarActionButton"
            type="button"
            onClick={
              onCreateChannel
            }
            aria-label="Create channel"
            title="Create channel"
          >
            +
          </button>
        </div>

        <div className="aurosSidebarSection">
          <p className="aurosSidebarSectionLabel">
            Text Channels
          </p>

          <div className="aurosSidebarList">
            {activeChannels.length ===
              0 && (
              <div
                className="aurosSidebarRow"
                style={{
                  cursor: "default",
                }}
              >
                <span className="aurosSidebarRowLeft">
                  <span className="aurosSidebarHash">
                    #
                  </span>

                  <span>
                    No channels yet
                  </span>
                </span>
              </div>
            )}

            {activeChannels.map(
              (channel) => {
                const isActive =
                  activeView.type ===
                    "server" &&
                  activeView.channelId ===
                    channel.id;

                const hasChannelNotification =
                  activeServerNotifications?.channelIds.includes(
                    channel.id
                  ) ?? false;

                return (
                  <button
                    key={
                      channel.id
                    }
                    className={`aurosSidebarRow ${
                      isActive
                        ? "isActive"
                        : ""
                    } ${
                      hasChannelNotification
                        ? "hasMentionNotification"
                        : ""
                    }`}
                    onClick={() =>
                      onSelectChannel(
                        activeServer.id,
                        channel.id
                      )
                    }
                    type="button"
                  >
                    <span className="aurosSidebarRowLeft">
                      <span className="aurosSidebarHash">
                        #
                      </span>

                      <span>
                        {
                          channel.name
                        }
                      </span>
                    </span>

                    {hasChannelNotification && (
                      <span className="aurosSidebarMiniBadge">
                        @
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </aside>
    );
  }

  /*
   * =========================================================
   * HOME / DIRECT MESSAGE VIEW
   * =========================================================
   */

  return (
    <aside className="aurosChatSidebar">
      <div className="aurosSidebarHeader">
        <div>
          <p className="aurosSidebarOverline">
            HOME
          </p>

          <h2 className="aurosSidebarTitle">
            Direct Messages
          </h2>
        </div>

        {onCreateDM && (
          <button
            className="aurosSidebarActionButton"
            type="button"
            onClick={
              onCreateDM
            }
            aria-label="Create direct message"
            title="Create direct message"
          >
            +
          </button>
        )}
      </div>

      <div className="aurosSidebarSection">
        <p className="aurosSidebarSectionLabel">
          Direct Messages
        </p>

        <div className="aurosSidebarList">
          {dms.length === 0 && (
            <div
              className="aurosSidebarRow"
              style={{
                cursor: "default",
              }}
            >
              <span className="aurosSidebarRowLeft">
                <span className="aurosAvatarDot" />

                <span>
                  No direct messages yet
                </span>
              </span>
            </div>
          )}

          {dms.map(
            (dm) => {
              const isActive =
                activeView.type ===
                  "dm" &&
                activeView.dmId ===
                  dm.id;

              const displayName =
                dm.user
                  ?.displayName ??
                dm.label;

              const username =
                dm.user?.username
                  ? `@${dm.user.username}`
                  : null;

              return (
                <button
                  key={
                    dm.id
                  }
                  className={`aurosSidebarRow ${
                    isActive
                      ? "isActive"
                      : ""
                  }`}
                  onClick={() =>
                    onSelectDM(
                      dm.id
                    )
                  }
                  type="button"
                >
                  <span className="aurosSidebarRowLeft">
                    <span
                      className="aurosDmAvatarMini"
                      title={
                        displayName
                      }
                    >
                      {dm.user
                        ?.avatarUrl ? (
                        <img
                          src={
                            dm.user
                              .avatarUrl
                          }
                          alt={
                            displayName
                          }
                          style={{
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "cover",
                            borderRadius:
                              "inherit",
                          }}
                        />
                      ) : (
                        getInitial(
                          displayName
                        )
                      )}
                    </span>

                    <span
                      style={{
                        display:
                          "grid",
                        gap: 2,
                      }}
                    >
                      <span>
                        {
                          displayName
                        }
                      </span>

                      {username && (
                        <span
                          style={{
                            fontSize:
                              12,
                            color:
                              "#998f76",
                          }}
                        >
                          {
                            username
                          }
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>
    </aside>
  );
}