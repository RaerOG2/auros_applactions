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
  activeView:
    ChatView;

  activeServer:
    ChatServer | null;

  activeChannel:
    ChatChannel | null;

  activeDM:
    DirectConversation | null;

  activeDirectUser?:
    ChatUserProfile | null;

  activeApplicationChat?:
    ApplicationChat | null;

  onOpenSearch?:
    () => void;

  onOpenMembers?:
    () => void;

  onOpenModeration?:
    () => void;
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
  let title =
    "AurosChannel";

  let subtitle =
    "Your communication hub";

  let eyebrow =
    "HOME";

  let iconType:
    "channel" |
    "dm" |
    "home" |
    "application" =
    "home";


  const isServerView =
    activeView.type ===
    "server";


  if (
    activeView.type ===
      "server" &&
    activeServer &&
    activeChannel
  ) {
    title =
      activeChannel.name;

    subtitle =
      activeChannel.topic ||
      `${activeServer.name} · Text Channel`;

    eyebrow =
      activeServer.name;

    iconType =
      "channel";
  }


  if (
    activeView.type ===
      "dm" &&
    activeDM
  ) {
    title =
      activeDirectUser?.displayName ??
      activeDirectUser?.username ??
      "Direct Message";

    subtitle =
      activeDirectUser?.username
        ? `@${activeDirectUser.username}`
        : "Private conversation";

    eyebrow =
      "DIRECT MESSAGE";

    iconType =
      "dm";
  }


  if (
    activeView.type ===
      "application" &&
    activeApplicationChat
  ) {
    title =
      activeApplicationChat.applicantName;

    subtitle =
      `Application Chat · ${activeApplicationChat.chatId}`;

    eyebrow =
      "APPLICATION";

    iconType =
      "application";
  }


  if (
    activeView.type ===
      "application" &&
    !activeApplicationChat
  ) {
    title =
      "Application Chat";

    subtitle =
      "Application conversation";

    eyebrow =
      "APPLICATION";

    iconType =
      "application";
  }


  if (
    activeView.type ===
    "home"
  ) {
    title =
      "AurosChannel";

    subtitle =
      "Messages, communities and conversations";

    eyebrow =
      "WELCOME";

    iconType =
      "home";
  }


  return (
    <>
      <header className="channelHeaderV2">
        <div className="channelHeaderIdentity">
          <div
            className={`channelHeaderIcon ${iconType}`}
          >
            <HeaderIcon
              type={
                iconType
              }
            />
          </div>


          <div className="channelHeaderText">
            <span className="channelHeaderEyebrow">
              {
                eyebrow
              }
            </span>


            <div className="channelHeaderTitleRow">
              <h1>
                {
                  title
                }
              </h1>


              {activeView.type ===
                "dm" &&
                activeDirectUser && (
                <UserStatus
                  user={
                    activeDirectUser
                  }
                />
              )}
            </div>


            <p>
              {
                subtitle
              }
            </p>
          </div>
        </div>


        <div className="channelHeaderActions">
          {activeView.type !==
            "home" && (
            <button
              type="button"
              className="channelHeaderAction"
              onClick={
                onOpenSearch
              }
              title="Search messages"
            >
              <SearchIcon />

              <span>
                Search
              </span>
            </button>
          )}


          {isServerView && (
            <button
              type="button"
              className="channelHeaderAction"
              onClick={
                onOpenMembers
              }
              title="Server members"
            >
              <MembersIcon />

              <span>
                Members
              </span>
            </button>
          )}


          {isServerView && (
            <button
              type="button"
              className="channelHeaderAction moderation"
              onClick={
                onOpenModeration
              }
              title="Moderation"
            >
              <ShieldIcon />

              <span>
                Moderation
              </span>
            </button>
          )}
        </div>
      </header>


      <style jsx global>{`
        .channelHeaderV2 {
          min-height:
            69px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            20px;

          flex:
            0 0 auto;

          padding:
            10px
            15px
            10px
            17px;

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
              9,
              12,
              21,
              0.88
            );

          backdrop-filter:
            blur(
              14px
            );
        }


        .channelHeaderIdentity {
          min-width:
            0;

          display:
            flex;

          align-items:
            center;

          gap:
            12px;
        }


        .channelHeaderIcon {
          width:
            38px;

          height:
            38px;

          display:
            grid;

          place-items:
            center;

          flex:
            0 0 38px;

          border:
            1px solid
            rgba(
              139,
              126,
              255,
              0.16
            );

          border-radius:
            11px;

          background:
            linear-gradient(
              145deg,
              rgba(
                130,
                111,
                255,
                0.12
              ),
              rgba(
                73,
                104,
                255,
                0.04
              )
            );

          color:
            #9589ff;
        }


        .channelHeaderIcon.dm {
          border-radius:
            50%;

          color:
            #63dfff;
        }


        .channelHeaderIcon.home {
          color:
            #9589ff;
        }


        .channelHeaderIcon.application {
          color:
            #73cfff;
        }


        .channelHeaderIcon
          svg {
          width:
            18px;

          height:
            18px;
        }


        .channelHeaderText {
          min-width:
            0;
        }


        .channelHeaderEyebrow {
          display:
            block;

          overflow:
            hidden;

          max-width:
            400px;

          color:
            #7067cc;

          font-size:
            6px;

          font-weight:
            950;

          letter-spacing:
            0.13em;

          text-overflow:
            ellipsis;

          text-transform:
            uppercase;

          white-space:
            nowrap;
        }


        .channelHeaderTitleRow {
          min-width:
            0;

          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          margin-top:
            3px;
        }


        .channelHeaderTitleRow
          h1 {
          overflow:
            hidden;

          margin:
            0;

          color:
            #f1f3ff;

          font-size:
            16px;

          font-weight:
            900;

          letter-spacing:
            -0.025em;

          line-height:
            1.1;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }


        .channelHeaderText
          p {
          overflow:
            hidden;

          max-width:
            540px;

          margin:
            4px
            0
            0;

          color:
            #66728a;

          font-size:
            8px;

          font-weight:
            650;

          line-height:
            1.2;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }


        .channelHeaderUserStatus {
          width:
            7px;

          height:
            7px;

          flex:
            0 0 7px;

          border:
            2px solid
            #0b0e17;

          border-radius:
            50%;

          box-sizing:
            content-box;
        }


        .channelHeaderUserStatus.online {
          background:
            #4fe2a6;

          box-shadow:
            0
            0
            9px
            rgba(
              79,
              226,
              166,
              0.5
            );
        }


        .channelHeaderUserStatus.idle {
          background:
            #f2c85b;
        }


        .channelHeaderUserStatus.dnd {
          background:
            #ff647a;
        }


        .channelHeaderUserStatus.offline {
          background:
            #596477;
        }


        .channelHeaderActions {
          display:
            flex;

          align-items:
            center;

          gap:
            7px;

          flex:
            0 0 auto;
        }


        .channelHeaderAction {
          min-height:
            34px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            7px;

          padding:
            0
            10px;

          border:
            1px solid
            rgba(
              128,
              131,
              255,
              0.12
            );

          border-radius:
            9px;

          background:
            rgba(
              255,
              255,
              255,
              0.015
            );

          color:
            #7e899f;

          font-size:
            7px;

          font-weight:
            850;

          cursor:
            pointer;

          transition:
            140ms
            ease;
        }


        .channelHeaderAction
          svg {
          width:
            14px;

          height:
            14px;
        }


        .channelHeaderAction:hover {
          border-color:
            rgba(
              139,
              124,
              255,
              0.27
            );

          background:
            rgba(
              139,
              124,
              255,
              0.07
            );

          color:
            #c9c4ff;
        }


        .channelHeaderAction.moderation:hover {
          border-color:
            rgba(
              255,
              103,
              128,
              0.25
            );

          background:
            rgba(
              255,
              103,
              128,
              0.05
            );

          color:
            #ff9baa;
        }


        .channelHeaderAction:focus-visible {
          outline:
            2px solid
            rgba(
              145,
              131,
              255,
              0.7
            );

          outline-offset:
            2px;
        }


        @media (
          max-width:
            900px
        ) {
          .channelHeaderAction
            span {
            display:
              none;
          }


          .channelHeaderAction {
            width:
              34px;

            padding:
              0;
          }
        }


        @media (
          max-width:
            520px
        ) {
          .channelHeaderV2 {
            min-height:
              62px;

            padding:
              8px
              9px
              8px
              11px;
          }


          .channelHeaderIcon {
            width:
              34px;

            height:
              34px;

            flex-basis:
              34px;
          }


          .channelHeaderTitleRow
            h1 {
            font-size:
              14px;
          }


          .channelHeaderText
            p {
            max-width:
              190px;

            font-size:
              7px;
          }
        }


        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .channelHeaderAction {
            transition:
              none;
          }
        }
      `}</style>
    </>
  );
}


function UserStatus({
  user,
}: {
  user:
    ChatUserProfile;
}) {
  const status =
    user.status ===
      "online" ||
    user.status ===
      "idle" ||
    user.status ===
      "dnd"
      ? user.status
      : "offline";


  return (
    <span
      className={`channelHeaderUserStatus ${status}`}
      title={
        status
      }
    />
  );
}


function HeaderIcon({
  type,
}: {
  type:
    "channel" |
    "dm" |
    "home" |
    "application";
}) {
  if (
    type ===
    "channel"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 3 7 21M17 3l-2 18M4 9h16M3 15h16"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }


  if (
    type ===
    "dm"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 3v-13a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }


  if (
    type ===
    "application"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 3.5h7l4 4V20H7V3.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M14 3.5V8h4M10 12h5M10 15.5h5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }


  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10.5 12 4l8 6.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.5 9.5V20h11V9.5M10 20v-5.5h4V20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10.5"
        cy="10.5"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m15 15 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function MembersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="9"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M3.5 19c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M16 6.5a2.5 2.5 0 0 1 0 4.9M17 14c2.1.6 3.3 2 3.5 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}


function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 6v5c0 4.4-2.6 7.5-7 9.5C7.6 18.5 5 15.4 5 11V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="m9.2 12 1.8 1.8 3.8-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}