"use client";

import type {
  ChatChannel,
  ChatServer,
  ChatView,
  DirectMessagePreview,
} from "../../types/chat";


type MentionNotifications =
  Record<
    string,
    {
      count: number;
      channelIds: string[];
    }
  >;


type ChatSidebarProps = {
  activeView:
    ChatView;

  activeServer:
    ChatServer | null;

  activeChannels:
    ChatChannel[];

  dms:
    DirectMessagePreview[];

  onSelectDM:
    (
      dmId: string
    ) =>
      void;

  onSelectChannel:
    (
      serverId: string,
      channelId: string
    ) =>
      void;

  onCreateChannel:
    () =>
      void;

  mentionNotifications:
    MentionNotifications;
};


export default function ChatSidebar({
  activeView,
  activeServer,
  activeChannels,
  dms,
  onSelectDM,
  onSelectChannel,
  onCreateChannel,
  mentionNotifications,
}: ChatSidebarProps) {
  const isServerView =
    activeView.type ===
    "server";


  const isDmView =
    activeView.type ===
    "dm";


  return (
    <>
      <aside className="channelSidebarV2">
        {isServerView &&
        activeServer ? (
          <ServerSidebar
            activeView={
              activeView
            }
            activeServer={
              activeServer
            }
            activeChannels={
              activeChannels
            }
            onSelectChannel={
              onSelectChannel
            }
            onCreateChannel={
              onCreateChannel
            }
            mentionNotifications={
              mentionNotifications
            }
          />
        ) : (
          <DirectMessagesSidebar
            activeView={
              activeView
            }
            dms={
              dms
            }
            onSelectDM={
              onSelectDM
            }
            active={
              isDmView
            }
          />
        )}
      </aside>


      <style jsx global>{`
        .channelSidebarV2 {
          width:
            100%;

          min-width:
            0;

          height:
            100%;

          display:
            flex;

          flex-direction:
            column;

          overflow:
            hidden;

          background:
            linear-gradient(
              180deg,
              #0b0e17,
              #090c14
            );

          color:
            #eef1ff;

          box-sizing:
            border-box;
        }


        .channelSidebarHeader {
          min-height:
            78px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            12px;

          flex-shrink:
            0;

          padding:
            14px
            14px
            13px
            16px;

          border-bottom:
            1px solid
            rgba(
              130,
              132,
              255,
              0.1
            );

          background:
            rgba(
              255,
              255,
              255,
              0.008
            );
        }


        .channelSidebarContext {
          min-width:
            0;

          display:
            flex;

          flex-direction:
            column;
        }


        .channelSidebarEyebrow {
          color:
            #8175ee;

          font-size:
            7px;

          font-weight:
            950;

          letter-spacing:
            0.16em;

          text-transform:
            uppercase;
        }


        .channelSidebarTitle {
          overflow:
            hidden;

          margin:
            5px
            0
            0;

          color:
            #f0f3ff;

          font-size:
            16px;

          font-weight:
            900;

          letter-spacing:
            -0.025em;

          line-height:
            1.05;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }


        .channelSidebarSubtitle {
          overflow:
            hidden;

          margin-top:
            5px;

          color:
            #68748b;

          font-size:
            8px;

          font-weight:
            650;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }


        .channelSidebarAddButton {
          width:
            31px;

          height:
            31px;

          min-width:
            31px;

          display:
            grid;

          place-items:
            center;

          padding:
            0;

          border:
            1px solid
            rgba(
              132,
              129,
              255,
              0.15
            );

          border-radius:
            9px;

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );

          color:
            #828da4;

          cursor:
            pointer;

          transition:
            140ms
            ease;
        }


        .channelSidebarAddButton:hover {
          border-color:
            rgba(
              139,
              124,
              255,
              0.32
            );

          background:
            rgba(
              139,
              124,
              255,
              0.08
            );

          color:
            #d3ceff;
        }


        .channelSidebarAddButton
          svg {
          width:
            14px;

          height:
            14px;
        }


        .channelSidebarBody {
          min-height:
            0;

          flex:
            1;

          overflow-x:
            hidden;

          overflow-y:
            auto;

          padding:
            13px
            9px
            16px;

          scrollbar-width:
            thin;

          scrollbar-color:
            rgba(
              137,
              125,
              255,
              0.2
            )
            transparent;
        }


        .channelSidebarBody::-webkit-scrollbar {
          width:
            6px;
        }


        .channelSidebarBody::-webkit-scrollbar-thumb {
          border-radius:
            999px;

          background:
            rgba(
              137,
              125,
              255,
              0.2
            );
        }


        .channelSidebarSection {
          margin-bottom:
            21px;
        }


        .channelSidebarSectionHeader {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            8px;

          padding:
            0
            6px;

          margin-bottom:
            7px;
        }


        .channelSidebarSectionLabel {
          color:
            #59657a;

          font-size:
            7px;

          font-weight:
            900;

          letter-spacing:
            0.12em;

          text-transform:
            uppercase;
        }


        .channelSidebarSectionCount {
          min-width:
            18px;

          height:
            18px;

          display:
            grid;

          place-items:
            center;

          border:
            1px solid
            rgba(
              130,
              132,
              255,
              0.09
            );

          border-radius:
            999px;

          background:
            rgba(
              255,
              255,
              255,
              0.014
            );

          color:
            #67738b;

          font-size:
            6px;

          font-weight:
            850;
        }


        .channelSidebarItems {
          display:
            grid;

          gap:
            4px;
        }


        .channelSidebarItem {
          position:
            relative;

          width:
            100%;

          min-width:
            0;

          min-height:
            37px;

          display:
            flex;

          align-items:
            center;

          gap:
            9px;

          padding:
            0
            10px;

          border:
            1px solid
            transparent;

          border-radius:
            9px;

          background:
            transparent;

          color:
            #7f899f;

          text-align:
            left;

          cursor:
            pointer;

          box-sizing:
            border-box;

          transition:
            background
              140ms
              ease,
            border-color
              140ms
              ease,
            color
              140ms
              ease,
            transform
              140ms
              ease;
        }


        .channelSidebarItem:hover {
          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          color:
            #c3cade;
        }


        .channelSidebarItem.active {
          border-color:
            rgba(
              135,
              122,
              255,
              0.2
            );

          background:
            linear-gradient(
              90deg,
              rgba(
                121,
                103,
                255,
                0.13
              ),
              rgba(
                121,
                103,
                255,
                0.035
              )
            );

          color:
            #eeedff;
        }


        .channelSidebarItem.active::before {
          content:
            "";

          position:
            absolute;

          left:
            0;

          top:
            9px;

          bottom:
            9px;

          width:
            2px;

          border-radius:
            999px;

          background:
            #9183ff;

          box-shadow:
            0
            0
            10px
            rgba(
              145,
              131,
              255,
              0.6
            );
        }


        .channelSidebarItemIcon {
          width:
            20px;

          height:
            20px;

          display:
            grid;

          place-items:
            center;

          flex:
            0
            0
            20px;

          color:
            #5f6d84;

          font-size:
            15px;

          font-weight:
            750;
        }


        .channelSidebarItem.active
          .channelSidebarItemIcon {
          color:
            #9b90ff;
        }


        .channelSidebarItemMain {
          min-width:
            0;

          display:
            flex;

          flex:
            1;

          flex-direction:
            column;
        }


        .channelSidebarItemName {
          overflow:
            hidden;

          color:
            inherit;

          font-size:
            10px;

          font-weight:
            760;

          line-height:
            1.15;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }


        .channelSidebarItemMeta {
          overflow:
            hidden;

          margin-top:
            3px;

          color:
            #566176;

          font-size:
            7px;

          font-weight:
            650;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }


        .channelSidebarItem.active
          .channelSidebarItemMeta {
          color:
            #777e9a;
        }


        .channelSidebarMentionBadge {
          min-width:
            18px;

          height:
            18px;

          display:
            grid;

          place-items:
            center;

          flex:
            0
            0
            auto;

          padding:
            0
            4px;

          border-radius:
            999px;

          background:
            #745fff;

          color:
            white;

          font-size:
            6px;

          font-weight:
            950;

          box-sizing:
            border-box;

          box-shadow:
            0
            0
            12px
            rgba(
              116,
              95,
              255,
              0.2
            );
        }


        .channelSidebarDmAvatar {
          width:
            27px;

          height:
            27px;

          display:
            grid;

          place-items:
            center;

          flex:
            0
            0
            27px;

          overflow:
            hidden;

          border:
            1px solid
            rgba(
              128,
              132,
              255,
              0.12
            );

          border-radius:
            50%;

          background:
            linear-gradient(
              145deg,
              #1a2032,
              #121623
            );

          color:
            #a7afff;

          font-size:
            9px;

          font-weight:
            900;
        }


        .channelSidebarDmAvatar
          img {
          width:
            100%;

          height:
            100%;

          display:
            block;

          object-fit:
            cover;
        }


        .channelSidebarEmpty {
          margin:
            7px
            5px;

          padding:
            14px;

          border:
            1px dashed
            rgba(
              125,
              128,
              255,
              0.11
            );

          border-radius:
            10px;

          background:
            rgba(
              255,
              255,
              255,
              0.01
            );

          color:
            #5e697e;

          font-size:
            8px;

          line-height:
            1.55;

          text-align:
            center;
        }


        .channelSidebarItem:focus-visible,
        .channelSidebarAddButton:focus-visible {
          outline:
            2px solid
            rgba(
              145,
              131,
              255,
              0.75
            );

          outline-offset:
            2px;
        }


        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .channelSidebarItem,
          .channelSidebarAddButton {
            transition:
              none;
          }
        }
      `}</style>
    </>
  );
}


function ServerSidebar({
  activeView,
  activeServer,
  activeChannels,
  onSelectChannel,
  onCreateChannel,
  mentionNotifications,
}: {
  activeView:
    ChatView;

  activeServer:
    ChatServer;

  activeChannels:
    ChatChannel[];

  onSelectChannel:
    (
      serverId: string,
      channelId: string
    ) =>
      void;

  onCreateChannel:
    () =>
      void;

  mentionNotifications:
    MentionNotifications;
}) {
  const textChannels =
    activeChannels.filter(
      (
        channel
      ) =>
        !channel.type ||
        channel.type ===
          "text" ||
        channel.type ===
          "announcement"
    );


  const serverNotifications =
    mentionNotifications[
      activeServer.id
    ];


  return (
    <>
      <header className="channelSidebarHeader">
        <div className="channelSidebarContext">
          <span className="channelSidebarEyebrow">
            SERVER
          </span>


          <h2 className="channelSidebarTitle">
            {
              activeServer.name
            }
          </h2>


          <span className="channelSidebarSubtitle">
            {activeServer.description ||
              "AurosChannel Server"}
          </span>
        </div>


        <button
          type="button"
          className="channelSidebarAddButton"
          onClick={
            onCreateChannel
          }
          aria-label="Create Channel"
          title="Create Channel"
        >
          <PlusIcon />
        </button>
      </header>


      <div className="channelSidebarBody">
        <section className="channelSidebarSection">
          <div className="channelSidebarSectionHeader">
            <span className="channelSidebarSectionLabel">
              Channels
            </span>


            <span className="channelSidebarSectionCount">
              {
                textChannels.length
              }
            </span>
          </div>


          <div className="channelSidebarItems">
            {textChannels.length ===
            0 ? (
              <div className="channelSidebarEmpty">
                No channels available.
              </div>
            ) : (
              textChannels.map(
                (
                  channel
                ) => {
                  const active =
                    activeView.type ===
                      "server" &&
                    activeView.channelId ===
                      channel.id;


                  const hasMention =
                    serverNotifications?.channelIds?.includes(
                      channel.id
                    ) ??
                    false;


                  return (
                    <button
                      key={
                        channel.id
                      }
                      type="button"
                      className={
                        active
                          ? "channelSidebarItem active"
                          : "channelSidebarItem"
                      }
                      onClick={() =>
                        onSelectChannel(
                          activeServer.id,
                          channel.id
                        )
                      }
                    >
                      <span className="channelSidebarItemIcon">
                        {channel.type ===
                        "announcement"
                          ? "!"
                          : "#"}
                      </span>


                      <span className="channelSidebarItemMain">
                        <span className="channelSidebarItemName">
                          {
                            channel.name
                          }
                        </span>


                        {channel.topic && (
                          <span className="channelSidebarItemMeta">
                            {
                              channel.topic
                            }
                          </span>
                        )}
                      </span>


                      {hasMention && (
                        <span className="channelSidebarMentionBadge">
                          !
                        </span>
                      )}
                    </button>
                  );
                }
              )
            )}
          </div>
        </section>
      </div>
    </>
  );
}


function DirectMessagesSidebar({
  activeView,
  dms,
  onSelectDM,
  active,
}: {
  activeView:
    ChatView;

  dms:
    DirectMessagePreview[];

  onSelectDM:
    (
      dmId: string
    ) =>
      void;

  active:
    boolean;
}) {
  return (
    <>
      <header className="channelSidebarHeader">
        <div className="channelSidebarContext">
          <span className="channelSidebarEyebrow">
            AUROSCHANNEL
          </span>


          <h2 className="channelSidebarTitle">
            Messages
          </h2>


          <span className="channelSidebarSubtitle">
            Direct conversations
          </span>
        </div>
      </header>


      <div className="channelSidebarBody">
        <section className="channelSidebarSection">
          <div className="channelSidebarSectionHeader">
            <span className="channelSidebarSectionLabel">
              Direct Messages
            </span>


            <span className="channelSidebarSectionCount">
              {
                dms.length
              }
            </span>
          </div>


          <div className="channelSidebarItems">
            {dms.length ===
            0 ? (
              <div className="channelSidebarEmpty">
                No direct messages yet.
              </div>
            ) : (
              dms.map(
                (
                  dm
                ) => {
                  const selected =
                    active &&
                    activeView.type ===
                      "dm" &&
                    activeView.dmId ===
                      dm.id;


                  return (
                    <button
                      key={
                        dm.id
                      }
                      type="button"
                      className={
                        selected
                          ? "channelSidebarItem active"
                          : "channelSidebarItem"
                      }
                      onClick={() =>
                        onSelectDM(
                          dm.id
                        )
                      }
                    >
                      <DmAvatar
                        dm={
                          dm
                        }
                      />


                      <span className="channelSidebarItemMain">
                        <span className="channelSidebarItemName">
                          {
                            dm.label
                          }
                        </span>


                        <span className="channelSidebarItemMeta">
                          Direct Message
                        </span>
                      </span>
                    </button>
                  );
                }
              )
            )}
          </div>
        </section>
      </div>
    </>
  );
}


function DmAvatar({
  dm,
}: {
  dm:
    DirectMessagePreview;
}) {
  const avatar =
    dm.user?.avatarUrl ??
    null;


  const name =
    dm.user?.displayName ||
    dm.user?.username ||
    dm.label ||
    "User";


  if (
    avatar
  ) {
    return (
      <span className="channelSidebarDmAvatar">
        <img
          src={
            avatar
          }
          alt=""
        />
      </span>
    );
  }


  return (
    <span className="channelSidebarDmAvatar">
      {name
        .slice(
          0,
          1
        )
        .toUpperCase()}
    </span>
  );
}


function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}