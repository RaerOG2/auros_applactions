"use client";

import type {
  ChatServer,
  ChatView,
} from "../../types/chat";


type MentionNotifications =
  Record<
    string,
    {
      count: number;
      channelIds: string[];
    }
  >;


type ChatServerRailProps = {
  servers: ChatServer[];

  activeView: ChatView;

  onSelectHome:
    () =>
      void;

  onSelectServer:
    (
      serverId: string
    ) =>
      Promise<void> |
      void;

  onCreateServer:
    () =>
      void;

  mentionNotifications:
    MentionNotifications;
};


export default function ChatServerRail({
  servers,
  activeView,
  onSelectHome,
  onSelectServer,
  onCreateServer,
  mentionNotifications,
}: ChatServerRailProps) {
  const homeActive =
    activeView.type ===
    "home";


  return (
    <>
      <aside className="channelServerRail">
        <div className="channelServerRailTop">
          <button
            type="button"
            className={
              homeActive
                ? "channelServerButton home active"
                : "channelServerButton home"
            }
            onClick={
              onSelectHome
            }
            aria-label="AurosChannel Home"
            title="AurosChannel Home"
          >
            <HomeIcon />

            <span className="channelServerActiveMarker" />
          </button>


          <div className="channelServerDivider" />
        </div>


        <div className="channelServerList">
          {servers.map(
            (
              server
            ) => {
              const active =
                activeView.type ===
                  "server" &&
                activeView.serverId ===
                  server.id;


              const notification =
                mentionNotifications[
                  server.id
                ];


              const count =
                notification?.count ??
                0;


              return (
                <button
                  key={
                    server.id
                  }
                  type="button"
                  className={
                    active
                      ? "channelServerButton active"
                      : "channelServerButton"
                  }
                  onClick={() =>
                    onSelectServer(
                      server.id
                    )
                  }
                  aria-label={
                    server.name
                  }
                  title={
                    server.name
                  }
                >
                  <span className="channelServerActiveMarker" />


                  <ServerVisual
                    server={
                      server
                    }
                  />


                  {count >
                    0 && (
                    <span className="channelServerBadge">
                      {count >
                      99
                        ? "99+"
                        : count}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>


        <div className="channelServerRailBottom">
          <div className="channelServerDivider" />


          <button
            type="button"
            className="channelServerButton create"
            onClick={
              onCreateServer
            }
            aria-label="Create Server"
            title="Create Server"
          >
            <PlusIcon />
          </button>
        </div>
      </aside>


      <style jsx global>{`
        .channelServerRail {
          width:
            74px;

          min-width:
            74px;

          height:
            100%;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          overflow:
            hidden;

          padding:
            12px
            9px;

          border-right:
            1px solid
            rgba(
              130,
              132,
              255,
              0.1
            );

          background:
            linear-gradient(
              180deg,
              #080a12,
              #080b13
            );

          box-sizing:
            border-box;
        }


        .channelServerRailTop,
        .channelServerRailBottom {
          width:
            100%;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;
        }


        .channelServerRailBottom {
          margin-top:
            auto;
        }


        .channelServerList {
          width:
            100%;

          min-height:
            0;

          display:
            flex;

          flex:
            1;

          flex-direction:
            column;

          align-items:
            center;

          gap:
            9px;

          overflow-x:
            hidden;

          overflow-y:
            auto;

          padding:
            4px
            0;

          scrollbar-width:
            none;
        }


        .channelServerList::-webkit-scrollbar {
          display:
            none;
        }


        .channelServerDivider {
          width:
            30px;

          height:
            1px;

          margin:
            8px
            0;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(
                140,
                129,
                255,
                0.25
              ),
              transparent
            );
        }


        .channelServerButton {
          position:
            relative;

          width:
            48px;

          height:
            48px;

          min-width:
            48px;

          min-height:
            48px;

          display:
            grid;

          place-items:
            center;

          flex-shrink:
            0;

          overflow:
            visible;

          padding:
            0;

          border:
            1px solid
            rgba(
              132,
              135,
              255,
              0.12
            );

          border-radius:
            15px;

          background:
            #111522;

          color:
            #8692ab;

          cursor:
            pointer;

          transition:
            border-color
              150ms
              ease,
            border-radius
              150ms
              ease,
            background
              150ms
              ease,
            color
              150ms
              ease,
            transform
              150ms
              ease,
            box-shadow
              150ms
              ease;
        }


        .channelServerButton:hover {
          border-color:
            rgba(
              141,
              128,
              255,
              0.3
            );

          border-radius:
            12px;

          background:
            rgba(
              126,
              105,
              255,
              0.1
            );

          color:
            #d7d2ff;

          transform:
            translateY(
              -1px
            );
        }


        .channelServerButton.active {
          border-color:
            rgba(
              150,
              132,
              255,
              0.42
            );

          border-radius:
            12px;

          background:
            linear-gradient(
              145deg,
              rgba(
                112,
                93,
                255,
                0.2
              ),
              rgba(
                77,
                116,
                255,
                0.1
              )
            );

          box-shadow:
            0
            0
            25px
            rgba(
              103,
              84,
              255,
              0.13
            );
        }


        .channelServerButton.home {
          color:
            #9d91ff;
        }


        .channelServerButton.create {
          border-style:
            dashed;

          color:
            #758198;
        }


        .channelServerButton.create:hover {
          border-color:
            rgba(
              86,
              220,
              255,
              0.3
            );

          background:
            rgba(
              86,
              220,
              255,
              0.06
            );

          color:
            #65dcff;
        }


        .channelServerButton
          svg {
          width:
            20px;

          height:
            20px;
        }


        .channelServerImage {
          width:
            100%;

          height:
            100%;

          display:
            block;

          border-radius:
            inherit;

          object-fit:
            cover;
        }


        .channelServerFallback {
          width:
            100%;

          height:
            100%;

          display:
            grid;

          place-items:
            center;

          border-radius:
            inherit;

          background:
            linear-gradient(
              145deg,
              #1a2033,
              #111522
            );

          color:
            #c7caff;

          font-size:
            14px;

          font-weight:
            950;

          letter-spacing:
            -0.03em;
        }


        .channelServerActiveMarker {
          position:
            absolute;

          left:
            -11px;

          top:
            50%;

          width:
            3px;

          height:
            8px;

          border-radius:
            0
            999px
            999px
            0;

          background:
            #9183ff;

          opacity:
            0;

          transform:
            translateY(
              -50%
            );

          transition:
            height
              150ms
              ease,
            opacity
              150ms
              ease;
        }


        .channelServerButton.active
          .channelServerActiveMarker {
          height:
            25px;

          opacity:
            1;

          box-shadow:
            0
            0
            12px
            rgba(
              145,
              131,
              255,
              0.7
            );
        }


        .channelServerBadge {
          position:
            absolute;

          right:
            -5px;

          bottom:
            -4px;

          min-width:
            17px;

          height:
            17px;

          display:
            grid;

          place-items:
            center;

          padding:
            0
            4px;

          border:
            2px solid
            #080a12;

          border-radius:
            999px;

          background:
            #745fff;

          color:
            white;

          font-size:
            7px;

          font-weight:
            950;

          line-height:
            1;

          box-sizing:
            border-box;
        }


        .channelServerButton:focus-visible {
          outline:
            2px solid
            rgba(
              145,
              131,
              255,
              0.8
            );

          outline-offset:
            3px;
        }


        @media (
          max-width:
            800px
        ) {
          .channelServerRail {
            width:
              70px;

            min-width:
              70px;

            padding:
              10px
              8px;
          }


          .channelServerButton {
            width:
              46px;

            height:
              46px;

            min-width:
              46px;

            min-height:
              46px;
          }
        }


        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .channelServerButton,
          .channelServerActiveMarker {
            transition:
              none;
          }
        }
      `}</style>
    </>
  );
}


function ServerVisual({
  server,
}: {
  server:
    ChatServer;
}) {
  const iconUrl =
    getServerIconUrl(
      server
    );


  if (
    iconUrl
  ) {
    return (
      <img
        src={
          iconUrl
        }
        alt=""
        className="channelServerImage"
      />
    );
  }


  return (
    <span className="channelServerFallback">
      {getServerInitials(
        server.name
      )}
    </span>
  );
}


function getServerIconUrl(
  server: ChatServer
) {
  const value =
    server as ChatServer &
      Record<
        string,
        unknown
      >;


  const candidate =
    value.iconUrl ??
    value.icon_url ??
    value.imageUrl ??
    value.image_url;


  return typeof candidate ===
    "string" &&
    candidate.trim()
      ? candidate
      : null;
}


function getServerInitials(
  name: string
) {
  const parts =
    name
      .trim()
      .split(
        /\s+/
      )
      .filter(
        Boolean
      );


  if (
    parts.length ===
    0
  ) {
    return "?";
  }


  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2
      )
      .toUpperCase();
  }


  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}


function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10.4 12 4l8 6.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.4 9.2V20h4v-5.6h3.2V20h4V9.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}