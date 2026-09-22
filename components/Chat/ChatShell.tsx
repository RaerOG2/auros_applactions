"use client";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import ChatConfirmModal from "./ChatConfirmModal";
import ChatCreateChannelModal from "./ChatCreateChannelModal";
import ChatCreateServerModal from "./ChatCreateServerModal";
import ChatCustomEmojiModal from "./ChatCustomEmojiModal";
import ChatHeader from "./ChatHeader";
import ChatMembersModal from "./ChatMembersModal";
import ChatMentionProfileModal from "./ChatMentionProfileModal";
import ChatMessageInput from "./ChatMessageInput";
import ChatMessageList from "./ChatMessageList";
import ChatModerationModal from "./ChatModerationModal";
import ChatProfileEditorModal from "./ChatProfileEditorModal";
import ChatRightPanel from "./ChatRightPanel";
import ChatSearchModal from "./ChatSearchModal";
import ChatServerRail from "./ChatServerRail";
import ChatServerSettingsModal from "./ChatServerSettingsModal";
import ChatSidebar from "./ChatSidebar";
import ChatWelcomeView from "./ChatWelcomeView";

import {
  useChatState,
} from "../../hooks/useChatState";

import type {
  ChatUserProfile,
} from "../../types/chat";


type ConfirmAction = {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;

  onConfirm:
    () =>
      Promise<void> |
      void;
};


const BOTTOM_THRESHOLD =
  110;


export default function ChatShell() {
  const chat =
    useChatState();


  const chatScrollRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const previousMessageCountRef =
    useRef(0);


  const previousScrollHeightRef =
    useRef(0);


  const wasLoadingOlderRef =
    useRef(false);


  const nearBottomRef =
    useRef(true);


  const previousViewRef =
    useRef("");


  const [
    showNewMessages,
    setShowNewMessages,
  ] =
    useState(false);


  const [
    mobileNavigationOpen,
    setMobileNavigationOpen,
  ] =
    useState(false);


  const [
    detailsOpen,
    setDetailsOpen,
  ] =
    useState(true);


  const [
    membersOpen,
    setMembersOpen,
  ] =
    useState(false);


  const [
    searchOpen,
    setSearchOpen,
  ] =
    useState(false);


  const [
    moderationOpen,
    setModerationOpen,
  ] =
    useState(false);


  const [
    serverModalOpen,
    setServerModalOpen,
  ] =
    useState(false);


  const [
    channelModalOpen,
    setChannelModalOpen,
  ] =
    useState(false);


  const [
    profileEditorOpen,
    setProfileEditorOpen,
  ] =
    useState(false);


  const [
    serverSettingsOpen,
    setServerSettingsOpen,
  ] =
    useState(false);


  const [
    emojiModalOpen,
    setEmojiModalOpen,
  ] =
    useState(false);


  const [
    confirmAction,
    setConfirmAction,
  ] =
    useState<
      ConfirmAction | null
    >(
      null
    );


  const [
    mentionProfileUser,
    setMentionProfileUser,
  ] =
    useState<
      ChatUserProfile | null
    >(
      null
    );


  const inputPlaceholder =
    chat.activeView.type ===
    "dm"
      ? "Write a direct message..."
      : chat.activeView.type ===
        "server"
      ? "Write a message to this channel..."
      : "Select a conversation to start chatting...";


  const activeViewKey =
    chat.activeView.type ===
    "server"
      ? `server:${chat.activeView.serverId}:${chat.activeView.channelId}`
      : chat.activeView.type ===
        "dm"
      ? `dm:${chat.activeView.dmId}`
      : "home";


  /* =========================================================
     FULLSCREEN MODE
  ========================================================= */

  useEffect(() => {
    document.body.classList.add(
      "aurosChannelFullscreenOpen"
    );

    return () => {
      document.body.classList.remove(
        "aurosChannelFullscreenOpen"
      );
    };
  }, []);


  /* =========================================================
     SCROLL TRACKING
  ========================================================= */

  useEffect(() => {
    const element =
      chatScrollRef.current;


    if (!element) {
      return;
    }


    function handleScroll() {
      const scrollElement =
        chatScrollRef.current;

      if (!scrollElement) {
        return;
      }

      const distanceFromBottom =
        scrollElement.scrollHeight -
        scrollElement.scrollTop -
        scrollElement.clientHeight;

      const isNearBottom =
        distanceFromBottom <=
        BOTTOM_THRESHOLD;

      nearBottomRef.current =
        isNearBottom;

      if (
        isNearBottom
      ) {
        setShowNewMessages(
          false
        );
      }
    }


    handleScroll();


    element.addEventListener(
      "scroll",
      handleScroll,
      {
        passive:
          true,
      }
    );


    return () => {
      element.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [
    activeViewKey,
    chat.messagesLoading,
  ]);


  /* =========================================================
     CHANGE CHANNEL / DM
  ========================================================= */

  useEffect(() => {
    if (
      previousViewRef.current ===
      activeViewKey
    ) {
      return;
    }


    previousViewRef.current =
      activeViewKey;


    previousMessageCountRef.current =
      0;


    previousScrollHeightRef.current =
      0;


    wasLoadingOlderRef.current =
      false;


    nearBottomRef.current =
      true;


    setShowNewMessages(
      false
    );


    setMobileNavigationOpen(
      false
    );


    const firstFrame =
      window.requestAnimationFrame(
        () => {
          window.requestAnimationFrame(
            () => {
              scrollToBottom(
                false
              );
            }
          );
        }
      );


    return () => {
      window.cancelAnimationFrame(
        firstFrame
      );
    };
  }, [
    activeViewKey,
  ]);


  /* =========================================================
     MESSAGE LIST CHANGES
  ========================================================= */

  useEffect(() => {
    const scrollArea =
      chatScrollRef.current;


    if (!scrollArea) {
      return;
    }


    if (
      chat.olderMessagesLoading
    ) {
      previousScrollHeightRef.current =
        scrollArea.scrollHeight;


      wasLoadingOlderRef.current =
        true;


      return;
    }


    if (
      wasLoadingOlderRef.current
    ) {
      const oldHeight =
        previousScrollHeightRef.current;


      const newHeight =
        scrollArea.scrollHeight;


      const heightDifference =
        newHeight -
        oldHeight;


      scrollArea.scrollTop =
        scrollArea.scrollTop +
        heightDifference;


      wasLoadingOlderRef.current =
        false;


      previousMessageCountRef.current =
        chat.activeMessages.length;


      return;
    }


    const previousCount =
      previousMessageCountRef.current;


    const currentCount =
      chat.activeMessages.length;


    if (
      currentCount >
      previousCount
    ) {
      if (
        previousCount ===
          0 ||
        nearBottomRef.current
      ) {
        window.requestAnimationFrame(
          () => {
            scrollToBottom(
              previousCount >
                0
            );
          }
        );
      } else {
        setShowNewMessages(
          true
        );
      }
    }


    previousMessageCountRef.current =
      currentCount;
  }, [
    chat.activeMessages.length,
    chat.olderMessagesLoading,
  ]);


  /* =========================================================
     HELPERS
  ========================================================= */

  function scrollToBottom(
    smooth = true
  ) {
    const scrollArea =
      chatScrollRef.current;


    if (!scrollArea) {
      return;
    }


    scrollArea.scrollTo({
      top:
        scrollArea.scrollHeight,

      behavior:
        smooth
          ? "smooth"
          : "auto",
    });


    nearBottomRef.current =
      true;


    setShowNewMessages(
      false
    );
  }


  function closeMobileNavigation() {
    setMobileNavigationOpen(
      false
    );
  }


  function handleSelectHome() {
    chat.selectHome();

    closeMobileNavigation();
  }


  async function handleSelectServer(
    serverId: string
  ) {
    await chat.selectServer(
      serverId
    );

    closeMobileNavigation();
  }


  function handleSelectDM(
    dmId: string
  ) {
    chat.selectDM(
      dmId
    );

    closeMobileNavigation();
  }


  function handleSelectChannel(
    serverId: string,
    channelId: string
  ) {
    chat.selectChannel(
      serverId,
      channelId
    );

    closeMobileNavigation();
  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (
    chat.loading
  ) {
    return (
      <>
        <div className="aurosChannelFullscreen">
          <div className="aurosChannelLoading">
            <div className="aurosChannelLoadingLogo">
              <img
                src="/auros_royale_pfp_draft_1.png"
                alt="Auros Royale"
              />
            </div>


            <div className="aurosChannelLoadingPulse" />


            <span>
              AUROSCHANNEL
            </span>


            <h2>
              Connecting to AurosChannel
            </h2>


            <p>
              Loading your profile,
              servers, channels and
              conversations.
            </p>


            <div className="aurosChannelLoadingBar">
              <i />
            </div>
          </div>
        </div>


        <ChatShellStyles />
      </>
    );
  }


  return (
    <>
      <div className="aurosChannelFullscreen">
        {/* ===================================================
            TOP APP BAR
        ==================================================== */}

        <header className="aurosChannelAppBar">
          <div className="aurosChannelBrand">
            <img
              src="/auros_royale_pfp_draft_1.png"
              alt="AurosChannel"
            />


            <div className="aurosChannelBrandName">
              <span>
                AUROS
              </span>

              <strong>
                CHANNEL
              </strong>
            </div>


            <small>
              BETA
            </small>
          </div>


          <Link
            href="/"
            className="aurosChannelWebsiteButton"
            aria-label="Back to Auros Website"
          >
            <HomeIcon />

            <span>
              Website
            </span>
          </Link>


          <div className="aurosChannelLiveState">
            <i />

            <span>
              Live
            </span>
          </div>


          <div className="aurosChannelToolbar">
            <button
              type="button"
              className="aurosChannelMobileNavButton"
              onClick={() =>
                setMobileNavigationOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }
              aria-label="Open navigation"
            >
              <MenuIcon />

              <span>
                Browse
              </span>
            </button>


            <button
              type="button"
              className={
                detailsOpen
                  ? "aurosChannelDetailsButton active"
                  : "aurosChannelDetailsButton"
              }
              onClick={() =>
                setDetailsOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }
              aria-label="Toggle details panel"
            >
              <DetailsIcon />

              <span>
                Details
              </span>
            </button>
          </div>
        </header>


        {/* ===================================================
            MAIN APP
        ==================================================== */}

        <section
          className={
            detailsOpen
              ? "aurosChatShellV2"
              : "aurosChatShellV2 detailsClosed"
          }
        >
          <div
            className={
              mobileNavigationOpen
                ? "aurosChannelNavigation open"
                : "aurosChannelNavigation"
            }
          >
            <ChatServerRail
              servers={
                chat.servers
              }
              activeView={
                chat.activeView
              }
              onSelectHome={
                handleSelectHome
              }
              onSelectServer={
                handleSelectServer
              }
              onCreateServer={() =>
                setServerModalOpen(
                  true
                )
              }
              mentionNotifications={
                chat.mentionNotifications
              }
            />


            <ChatSidebar
              activeView={
                chat.activeView
              }
              activeServer={
                chat.activeServer
              }
              activeChannels={
                chat.channels
              }
              dms={
                chat.dms
              }
              onSelectDM={
                handleSelectDM
              }
              onSelectChannel={
                handleSelectChannel
              }
              onCreateChannel={() => {
                if (
                  chat.activeServerRole !==
                    "owner" &&
                  chat.activeServerRole !==
                    "admin"
                ) {
                  return;
                }


                setChannelModalOpen(
                  true
                );
              }}
              mentionNotifications={
                chat.mentionNotifications
              }
            />
          </div>


          {mobileNavigationOpen && (
            <button
              type="button"
              className="aurosChannelMobileBackdrop"
              onClick={
                closeMobileNavigation
              }
              aria-label="Close navigation"
            />
          )}


          <main className="aurosChannelCenter">
            <ChatHeader
              activeView={
                chat.activeView
              }
              activeServer={
                chat.activeServer
              }
              activeChannel={
                chat.activeChannel
              }
              activeDM={
                chat.activeDirectConversation
              }
              activeDirectUser={
                chat.activeDirectUser
              }
              onOpenSearch={() =>
                setSearchOpen(
                  true
                )
              }
              onOpenMembers={() =>
                setMembersOpen(
                  true
                )
              }
              onOpenModeration={() =>
                setModerationOpen(
                  true
                )
              }
            />


            {chat.error && (
              <div className="aurosChannelError">
                <div>
                  !
                </div>


                <span>
                  {
                    chat.error
                  }
                </span>
              </div>
            )}


            {chat.activeView.type ===
            "home" ? (
              <ChatWelcomeView />
            ) : (
              <>
                <div
                  className="aurosChannelMessageViewport"
                  ref={
                    chatScrollRef
                  }
                >
                  {chat.messagesLoading ? (
                    <MessageSkeleton />
                  ) : (
                    <>
                      {chat.hasOlderMessages && (
                        <div className="aurosChannelOlderMessages">
                          <button
                            type="button"
                            disabled={
                              chat.olderMessagesLoading
                            }
                            onClick={
                              chat.loadOlderMessages
                            }
                          >
                            {chat.olderMessagesLoading
                              ? "Loading history..."
                              : "Load older messages"}
                          </button>
                        </div>
                      )}


                      <ChatMessageList
                        onEditMessage={
                          chat.editMessage
                        }
                        onReplyMessage={
                          chat.setReplyToMessage
                        }
                        messages={
                          chat.activeMessages
                        }
                        customEmojis={
                          chat.customEmojis
                        }
                        mentionUsers={
                          chat.serverMentionUsers
                        }
                        currentUserId={
                          chat.currentUser?.id
                        }
                        onToggleReaction={
                          chat.toggleMessageReaction
                        }
                        onOpenMentionProfile={(
                          user
                        ) =>
                          setMentionProfileUser(
                            user
                          )
                        }
                        onDeleteMessage={(
                          messageId
                        ) =>
                          setConfirmAction({
                            title:
                              "Delete message?",

                            message:
                              "This message will be removed from the chat. This action cannot be undone.",

                            confirmLabel:
                              "Delete Message",

                            danger:
                              true,

                            onConfirm:
                              async () => {
                                await chat.deleteMessage(
                                  messageId
                                );

                                setConfirmAction(
                                  null
                                );
                              },
                          })
                        }
                      />


                      {showNewMessages && (
                        <button
                          type="button"
                          className="aurosChannelNewMessages"
                          onClick={() =>
                            scrollToBottom(
                              true
                            )
                          }
                        >
                          <span>
                            ↓
                          </span>

                          New messages
                        </button>
                      )}
                    </>
                  )}
                </div>


                <div className="aurosChannelComposer">
                  <ChatMessageInput
                    onSendMessage={
                      chat.sendMessage
                    }
                    replyToMessage={
                      chat.replyToMessage
                    }
                    onCancelReply={() =>
                      chat.setReplyToMessage(
                        null
                      )
                    }
                    customEmojis={
                      chat.customEmojis
                    }
                    mentionUsers={
                      chat.serverMentionUsers
                    }
                    placeholder={
                      inputPlaceholder
                    }
                  />
                </div>
              </>
            )}
          </main>


          <aside
            className={
              detailsOpen
                ? "aurosChannelDetails open"
                : "aurosChannelDetails"
            }
          >
            <ChatRightPanel
              currentUser={
                chat.currentUser
              }
              activeView={
                chat.activeView
              }
              activeChannel={
                chat.activeChannel
              }
              activeDM={
                chat.activeDirectConversation
              }
              activeDirectUser={
                chat.activeDirectUser
              }
              activeServer={
                chat.activeServer
              }
              activeServerRole={
                chat.activeServerRole
              }
              serverInviteLink={
                chat.serverInviteLink
              }
              onCreateInvite={
                chat.createInviteForActiveServer
              }
              onJoinInvite={
                chat.joinServerWithInvite
              }
              onOpenProfileEditor={() =>
                setProfileEditorOpen(
                  true
                )
              }
              onOpenServerSettings={() =>
                setServerSettingsOpen(
                  true
                )
              }
              onOpenCustomEmojiModal={() =>
                setEmojiModalOpen(
                  true
                )
              }
              onDeleteServer={() =>
                setConfirmAction({
                  title:
                    "Delete server?",

                  message:
                    "This server, its channels, and its messages will be deleted. This action cannot be undone.",

                  confirmLabel:
                    "Delete Server",

                  danger:
                    true,

                  onConfirm:
                    async () => {
                      await chat.deleteActiveServer();

                      setConfirmAction(
                        null
                      );
                    },
                })
              }
            />
          </aside>
        </section>
      </div>


      <ChatCreateServerModal
        open={
          serverModalOpen
        }
        onClose={() =>
          setServerModalOpen(
            false
          )
        }
        onCreate={
          chat.createNewServer
        }
      />


      <ChatCreateChannelModal
        open={
          channelModalOpen
        }
        serverName={
          chat.activeServer?.name ??
          null
        }
        onClose={() =>
          setChannelModalOpen(
            false
          )
        }
        onCreate={
          chat.createNewChannel
        }
      />


      <ChatProfileEditorModal
        open={
          profileEditorOpen
        }
        currentUsername={
          chat.currentUser?.username
        }
        currentDisplayName={
          chat.currentUser?.displayName
        }
        currentBio={
          chat.currentUser?.bio ??
          null
        }
        onClose={() =>
          setProfileEditorOpen(
            false
          )
        }
        onSave={
          chat.updateMyProfile
        }
      />


      <ChatServerSettingsModal
        open={
          serverSettingsOpen
        }
        serverId={
          chat.activeServer?.id ??
          null
        }
        members={
          chat.serverMentionUsers
        }
        currentName={
          chat.activeServer?.name
        }
        currentDescription={
          chat.activeServer?.description ??
          null
        }
        onClose={() =>
          setServerSettingsOpen(
            false
          )
        }
        onSave={
          chat.updateActiveServer
        }
      />


      <ChatCustomEmojiModal
        open={
          emojiModalOpen
        }
        customEmojis={
          chat.customEmojis
        }
        onClose={() =>
          setEmojiModalOpen(
            false
          )
        }
        onCreate={
          chat.createNewCustomEmoji
        }
        onDelete={
          chat.deleteCustomEmojiFromActiveServer
        }
      />


      <ChatMentionProfileModal
        user={
          mentionProfileUser
        }
        onClose={() =>
          setMentionProfileUser(
            null
          )
        }
      />


      <ChatModerationModal
        open={
          moderationOpen
        }
        members={
          chat.serverMentionUsers
        }
        onClose={() =>
          setModerationOpen(
            false
          )
        }
        onKickMember={
          chat.kickMember
        }
        onBanMember={
          chat.banMember
        }
        onMuteMember={
          chat.muteMember
        }
      />


      <ChatConfirmModal
        open={
          !!confirmAction
        }
        title={
          confirmAction?.title ??
          ""
        }
        message={
          confirmAction?.message ??
          ""
        }
        confirmLabel={
          confirmAction?.confirmLabel
        }
        danger={
          confirmAction?.danger
        }
        onCancel={() =>
          setConfirmAction(
            null
          )
        }
        onConfirm={
          async () => {
            await confirmAction?.onConfirm();
          }
        }
      />


      <ChatMembersModal
        open={
          membersOpen
        }
        members={
          chat.serverMentionUsers
        }
        onClose={() =>
          setMembersOpen(
            false
          )
        }
        onOpenProfile={(
          user
        ) => {
          setMembersOpen(
            false
          );

          setMentionProfileUser(
            user
          );
        }}
      />


      <ChatSearchModal
        open={
          searchOpen
        }
        messages={
          chat.activeMessages
        }
        onClose={() =>
          setSearchOpen(
            false
          )
        }
        onJumpToMessage={(
          messageId
        ) => {
          const target =
            document.getElementById(
              `message-${messageId}`
            );


          const scrollArea =
            chatScrollRef.current;


          if (
            !target ||
            !scrollArea
          ) {
            return;
          }


          const targetTop =
            target.offsetTop -
            80;


          scrollArea.scrollTo({
            top:
              Math.max(
                0,
                targetTop
              ),

            behavior:
              "smooth",
          });


          target.classList.add(
            "isReplyHighlighted"
          );


          window.setTimeout(
            () => {
              target.classList.remove(
                "isReplyHighlighted"
              );
            },
            4000
          );
        }}
      />


      <ChatShellStyles />
    </>
  );
}


function MessageSkeleton() {
  return (
    <div className="aurosChannelMessagesLoading">
      {[
        1,
        2,
        3,
        4,
      ].map(
        (
          item
        ) => (
          <div
            key={
              item
            }
            className="aurosChannelSkeletonMessage"
          >
            <i />

            <div>
              <span />

              <span />
            </div>
          </div>
        )
      )}
    </div>
  );
}


function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function DetailsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M15 4v16"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}


function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 10.6 12 3.5l8.5 7.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5.8 9.3V20h4.4v-6.1h3.6V20h4.4V9.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function ChatShellStyles() {
  return (
    <style jsx global>{`
      body.aurosChannelFullscreenOpen {
        overflow:
          hidden !important;
      }


      .aurosChannelFullscreen {
        width:
          100%;

        height:
          100dvh;

        display:
          flex;

        flex-direction:
          column;

        overflow:
          hidden;

        background:
          #070910;

        color:
          #f4f6ff;
      }


      .aurosChannelAppBar {
        position:
          relative;

        z-index:
          100;

        height:
          58px;

        min-height:
          58px;

        display:
          flex;

        align-items:
          center;

        gap:
          14px;

        padding:
          0
          17px;

        border-bottom:
          1px solid
          rgba(
            126,
            128,
            255,
            0.13
          );

        background:
          linear-gradient(
            90deg,
            #080a12,
            #090b15
          );

        box-shadow:
          0
          6px
          30px
          rgba(
            0,
            0,
            0,
            0.18
          );
      }


      .aurosChannelBrand {
        display:
          flex;

        align-items:
          center;

        gap:
          10px;
      }


      .aurosChannelBrand
        > img {
        width:
          37px;

        height:
          37px;

        display:
          block;

        border:
          1px solid
          rgba(
            128,
            117,
            255,
            0.22
          );

        border-radius:
          11px;

        object-fit:
          cover;

        box-shadow:
          0
          0
          24px
          rgba(
            112,
            91,
            255,
            0.12
          );
      }


      .aurosChannelBrandName {
        display:
          flex;

        align-items:
          center;

        gap:
          4px;
      }


      .aurosChannelBrandName
        span,
      .aurosChannelBrandName
        strong {
        font-size:
          12px;

        font-weight:
          950;

        letter-spacing:
          0.08em;
      }


      .aurosChannelBrandName
        span {
        color:
          #d4dcf0;
      }


      .aurosChannelBrandName
        strong {
        color:
          #9184ff;
      }


      .aurosChannelBrand
        small {
        padding:
          4px
          6px;

        border:
          1px solid
          rgba(
            139,
            124,
            255,
            0.18
          );

        border-radius:
          999px;

        background:
          rgba(
            139,
            124,
            255,
            0.08
          );

        color:
          #9b91ff;

        font-size:
          6px;

        font-weight:
          950;

        letter-spacing:
          0.12em;
      }


      .aurosChannelWebsiteButton {
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

        margin-left:
          4px;

        padding:
          0
          10px;

        border:
          1px solid
          rgba(
            128,
            126,
            255,
            0.13
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
          #8d97b0;

        font-size:
          8px;

        font-weight:
          850;

        text-decoration:
          none;

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


      .aurosChannelWebsiteButton
        svg {
        width:
          14px;

        height:
          14px;

        flex:
          0
          0
          auto;
      }


      .aurosChannelWebsiteButton:hover {
        border-color:
          rgba(
            139,
            124,
            255,
            0.3
          );

        background:
          rgba(
            139,
            124,
            255,
            0.08
          );

        color:
          #d2ceff;

        transform:
          translateY(
            -1px
          );
      }


      .aurosChannelWebsiteButton:focus-visible {
        outline:
          2px solid
          rgba(
            139,
            124,
            255,
            0.7
          );

        outline-offset:
          3px;
      }


      .aurosChannelLiveState {
        display:
          flex;

        align-items:
          center;

        gap:
          7px;
      }


      .aurosChannelLiveState
        i {
        width:
          6px;

        height:
          6px;

        border-radius:
          999px;

        background:
          #51e9ae;

        box-shadow:
          0
          0
          10px
          rgba(
            81,
            233,
            174,
            0.7
          );
      }


      .aurosChannelLiveState
        span {
        color:
          #7f8ba4;

        font-size:
          8px;

        font-weight:
          800;
      }


      .aurosChannelToolbar {
        display:
          flex;

        align-items:
          center;

        gap:
          8px;

        margin-left:
          auto;
      }


      .aurosChannelToolbar
        button {
        min-height:
          35px;

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
          11px;

        border:
          1px solid
          rgba(
            128,
            126,
            255,
            0.13
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
          #8d97b0;

        font-size:
          8px;

        font-weight:
          850;

        cursor:
          pointer;

        transition:
          140ms
          ease;
      }


      .aurosChannelToolbar
        button:hover,
      .aurosChannelToolbar
        button.active {
        border-color:
          rgba(
            139,
            124,
            255,
            0.3
          );

        background:
          rgba(
            139,
            124,
            255,
            0.08
          );

        color:
          #d2ceff;
      }


      .aurosChannelToolbar
        svg {
        width:
          15px;

        height:
          15px;
      }


      .aurosChannelMobileNavButton {
        display:
          none !important;
      }


      .aurosChatShellV2 {
        position:
          relative;

        flex:
          1;

        min-height:
          0;

        display:
          grid;

        grid-template-columns:
          330px
          minmax(
            0,
            1fr
          )
          320px;

        overflow:
          hidden;

        background:
          #070910;
      }


      .aurosChatShellV2.detailsClosed {
        grid-template-columns:
          330px
          minmax(
            0,
            1fr
          )
          0;
      }


      .aurosChannelNavigation {
        min-width:
          0;

        min-height:
          0;

        display:
          grid;

        grid-template-columns:
          74px
          minmax(
            0,
            1fr
          );

        overflow:
          hidden;

        border-right:
          1px solid
          rgba(
            126,
            128,
            255,
            0.11
          );

        background:
          #090c14;
      }


      .aurosChannelNavigation
        > * {
        min-width:
          0 !important;

        max-width:
          100% !important;

        min-height:
          0 !important;

        height:
          100% !important;
      }


      .aurosChannelCenter {
        min-width:
          0;

        min-height:
          0;

        display:
          flex;

        flex-direction:
          column;

        overflow:
          hidden;

        background:
          radial-gradient(
            circle at 50% -20%,
            rgba(
              101,
              90,
              255,
              0.07
            ),
            transparent
            35%
          ),
          linear-gradient(
            180deg,
            #0e111c,
            #0a0d16
          );
      }


      .aurosChannelMessageViewport {
        position:
          relative;

        flex:
          1;

        min-height:
          0;

        overflow-x:
          hidden;

        overflow-y:
          auto;

        overscroll-behavior:
          contain;

        scrollbar-width:
          thin;

        scrollbar-color:
          rgba(
            136,
            121,
            255,
            0.32
          )
          transparent;
      }


      .aurosChannelComposer {
        flex:
          0
          0
          auto;

        min-width:
          0;
      }


      .aurosChannelDetails {
        min-width:
          0;

        min-height:
          0;

        overflow-x:
          hidden;

        overflow-y:
          auto;

        border-left:
          1px solid
          rgba(
            126,
            128,
            255,
            0.11
          );

        background:
          #090c14;

        opacity:
          0;

        pointer-events:
          none;
      }


      .aurosChannelDetails.open {
        opacity:
          1;

        pointer-events:
          auto;
      }


      .aurosChannelDetails
        > * {
        width:
          100% !important;

        max-width:
          none !important;

        min-width:
          0 !important;

        box-sizing:
          border-box !important;
      }


      .aurosChannelDetails
        .aurosRightPanel {
        width:
          100% !important;

        min-width:
          0 !important;

        max-width:
          none !important;

        height:
          auto !important;

        box-sizing:
          border-box !important;

        overflow:
          visible !important;
      }


      .aurosChannelDetails
        .aurosPanelCard {
        width:
          auto !important;

        max-width:
          none !important;

        box-sizing:
          border-box !important;
      }


      .aurosChannelError {
        display:
          flex;

        align-items:
          center;

        gap:
          10px;

        margin:
          11px
          15px
          0;

        padding:
          10px
          12px;

        border:
          1px solid
          rgba(
            255,
            102,
            124,
            0.2
          );

        border-radius:
          10px;

        background:
          rgba(
            255,
            102,
            124,
            0.06
          );

        color:
          #ff9baa;

        font-size:
          8px;

        font-weight:
          750;
      }


      .aurosChannelError
        > div {
        width:
          25px;

        height:
          25px;

        display:
          grid;

        place-items:
          center;

        flex-shrink:
          0;

        border-radius:
          7px;

        background:
          rgba(
            255,
            102,
            124,
            0.1
          );

        font-weight:
          950;
      }


      .aurosChannelOlderMessages {
        display:
          flex;

        justify-content:
          center;

        padding:
          13px;
      }


      .aurosChannelOlderMessages
        button {
        min-height:
          31px;

        padding:
          0
          12px;

        border:
          1px solid
          rgba(
            136,
            121,
            255,
            0.18
          );

        border-radius:
          8px;

        background:
          rgba(
            136,
            121,
            255,
            0.05
          );

        color:
          #9e9cc4;

        font-size:
          7px;

        font-weight:
          850;

        cursor:
          pointer;
      }


      .aurosChannelNewMessages {
        position:
          sticky;

        z-index:
          30;

        left:
          50%;

        bottom:
          16px;

        min-height:
          35px;

        display:
          flex;

        align-items:
          center;

        gap:
          7px;

        margin:
          0
          auto;

        padding:
          0
          13px;

        border:
          1px solid
          rgba(
            175,
            166,
            255,
            0.3
          );

        border-radius:
          999px;

        background:
          linear-gradient(
            135deg,
            #6258d9,
            #765eff
          );

        color:
          white;

        box-shadow:
          0
          12px
          35px
          rgba(
            91,
            72,
            220,
            0.32
          );

        font-size:
          8px;

        font-weight:
          900;

        cursor:
          pointer;
      }


      .aurosChannelMessagesLoading {
        display:
          grid;

        gap:
          22px;

        padding:
          28px
          24px;
      }


      .aurosChannelSkeletonMessage {
        display:
          grid;

        grid-template-columns:
          38px
          minmax(
            0,
            1fr
          );

        gap:
          11px;
      }


      .aurosChannelSkeletonMessage
        > i {
        width:
          38px;

        height:
          38px;

        border-radius:
          50%;

        background:
          #161a28;
      }


      .aurosChannelSkeletonMessage
        > div {
        display:
          grid;

        align-content:
          center;

        gap:
          8px;
      }


      .aurosChannelSkeletonMessage
        span {
        display:
          block;

        height:
          7px;

        border-radius:
          999px;

        background:
          linear-gradient(
            90deg,
            #151927,
            #20263a,
            #151927
          );

        background-size:
          200%
          100%;

        animation:
          aurosChannelSkeleton
          1.4s
          linear
          infinite;
      }


      .aurosChannelSkeletonMessage
        span:first-child {
        width:
          110px;
      }


      .aurosChannelSkeletonMessage
        span:last-child {
        width:
          min(
            440px,
            72%
          );
      }


      @keyframes aurosChannelSkeleton {
        from {
          background-position:
            200%
            0;
        }

        to {
          background-position:
            -200%
            0;
        }
      }


      .aurosChannelLoading {
        width:
          100%;

        height:
          100%;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        flex-direction:
          column;

        text-align:
          center;

        background:
          radial-gradient(
            circle at 50% 35%,
            rgba(
              110,
              84,
              255,
              0.11
            ),
            transparent
            28%
          ),
          #070910;
      }


      .aurosChannelLoadingLogo {
        width:
          66px;

        height:
          66px;

        overflow:
          hidden;

        border:
          1px solid
          rgba(
            140,
            123,
            255,
            0.28
          );

        border-radius:
          19px;
      }


      .aurosChannelLoadingLogo
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


      .aurosChannelLoadingPulse {
        width:
          6px;

        height:
          6px;

        margin:
          22px
          0
          11px;

        border-radius:
          50%;

        background:
          #4fe4a7;
      }


      .aurosChannelLoading
        > span {
        color:
          #9484ff;

        font-size:
          8px;

        font-weight:
          950;

        letter-spacing:
          0.2em;
      }


      .aurosChannelLoading
        h2 {
        margin:
          10px
          0
          7px;

        color:
          white;

        font-size:
          23px;
      }


      .aurosChannelLoading
        p {
        max-width:
          360px;

        margin:
          0;

        color:
          #707b92;

        font-size:
          9px;

        line-height:
          1.65;
      }


      .aurosChannelLoadingBar {
        width:
          190px;

        height:
          3px;

        overflow:
          hidden;

        margin-top:
          23px;

        border-radius:
          999px;

        background:
          #151827;
      }


      .aurosChannelLoadingBar
        i {
        display:
          block;

        width:
          45%;

        height:
          100%;

        border-radius:
          inherit;

        background:
          linear-gradient(
            90deg,
            #625bdf,
            #9078ff,
            #5ccfff
          );

        animation:
          aurosChannelLoad
          1.25s
          ease-in-out
          infinite;
      }


      @keyframes aurosChannelLoad {
        0% {
          transform:
            translateX(
              -120%
            );
        }

        100% {
          transform:
            translateX(
              340%
            );
        }
      }


      .aurosChannelMobileBackdrop {
        display:
          none;
      }


      @media (
        max-width:
          1150px
      ) {
        .aurosChatShellV2,
        .aurosChatShellV2.detailsClosed {
          grid-template-columns:
            310px
            minmax(
              0,
              1fr
            );
        }


        .aurosChannelDetails {
          position:
            absolute;

          z-index:
            80;

          top:
            0;

          right:
            0;

          bottom:
            0;

          width:
            min(
              350px,
              92vw
            );

          transform:
            translateX(
              101%
            );

          box-shadow:
            -30px
            0
            70px
            rgba(
              0,
              0,
              0,
              0.45
            );

          transition:
            transform
            180ms
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            );
        }


        .aurosChannelDetails.open {
          transform:
            translateX(
              0
            );
        }
      }


      @media (
        max-width:
          800px
      ) {
        .aurosChannelMobileNavButton {
          display:
            inline-flex !important;
        }


        .aurosChannelLiveState {
          display:
            none;
        }


        .aurosChannelWebsiteButton
          span {
          display:
            none;
        }


        .aurosChannelWebsiteButton {
          width:
            34px;

          padding:
            0;
        }


        .aurosChatShellV2,
        .aurosChatShellV2.detailsClosed {
          display:
            block;
        }


        .aurosChannelCenter {
          width:
            100%;

          height:
            100%;
        }


        .aurosChannelNavigation {
          position:
            absolute;

          z-index:
            100;

          top:
            0;

          left:
            0;

          bottom:
            0;

          width:
            min(
              340px,
              90vw
            );

          grid-template-columns:
            70px
            minmax(
              0,
              1fr
            );

          transform:
            translateX(
              -102%
            );

          box-shadow:
            28px
            0
            80px
            rgba(
              0,
              0,
              0,
              0.55
            );

          transition:
            transform
            180ms
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            );
        }


        .aurosChannelNavigation.open {
          transform:
            translateX(
              0
            );
        }


        .aurosChannelMobileBackdrop {
          position:
            absolute;

          z-index:
            90;

          inset:
            0;

          display:
            block;

          border:
            0;

          background:
            rgba(
              2,
              3,
              8,
              0.7
            );

          backdrop-filter:
            blur(
              4px
            );
        }
      }


      @media (
        max-width:
          520px
      ) {
        .aurosChannelAppBar {
          height:
            54px;

          min-height:
            54px;

          padding:
            0
            10px;
        }


        .aurosChannelBrand
          > img {
          width:
            34px;

          height:
            34px;
        }


        .aurosChannelBrandName
          span,
        .aurosChannelBrandName
          strong {
          font-size:
            10px;
        }


        .aurosChannelBrand
          small {
          display:
            none;
        }


        .aurosChannelToolbar
          button {
          width:
            34px;

          min-height:
            34px;

          padding:
            0;
        }


        .aurosChannelToolbar
          button
          span {
          display:
            none;
        }
      }


      @media (
        prefers-reduced-motion:
          reduce
      ) {
        .aurosChannelNavigation,
        .aurosChannelDetails,
        .aurosChannelToolbar
          button,
        .aurosChannelWebsiteButton {
          transition:
            none;
        }


        .aurosChannelSkeletonMessage
          span,
        .aurosChannelLoadingBar
          i {
          animation:
            none;
        }
      }
    `}</style>
  );
}