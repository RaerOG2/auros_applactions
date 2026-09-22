"use client";

import {
  useState,
} from "react";

import type {
  ChatCustomEmoji,
  ChatMessage,
  ChatUserProfile,
} from "../../types/chat";

import ChatEmojiPicker from "./ChatEmojiPicker";


type ChatMessageListProps = {
  messages:
    ChatMessage[];

  customEmojis:
    ChatCustomEmoji[];

  mentionUsers:
    ChatUserProfile[];

  currentUserId?:
    string | null;

  onToggleReaction?:
    (
      messageId: string,
      emoji: string
    ) =>
      void |
      Promise<void>;

  onDeleteMessage?:
    (
      messageId: string
    ) =>
      void |
      Promise<void>;

  onOpenMentionProfile?:
    (
      user: ChatUserProfile
    ) =>
      void;

  onEditMessage?:
    (
      messageId: string,
      content: string
    ) =>
      void |
      Promise<void>;

  onReplyMessage?:
    (
      message: ChatMessage
    ) =>
      void;
};


function getAuthorName(
  message: ChatMessage
) {
  return (
    message.author?.displayName ??
    message.author?.username ??
    "Unknown User"
  );
}


function getMessageTime(
  message: ChatMessage
) {
  try {
    return new Date(
      message.createdAt
    ).toLocaleTimeString(
      [],
      {
        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    );
  } catch {
    return message.createdAt;
  }
}


function getMessageDate(
  message: ChatMessage
) {
  try {
    const date =
      new Date(
        message.createdAt
      );

    const today =
      new Date();


    if (
      date.toDateString() ===
      today.toDateString()
    ) {
      return "Today";
    }


    const yesterday =
      new Date();

    yesterday.setDate(
      today.getDate() -
        1
    );


    if (
      date.toDateString() ===
      yesterday.toDateString()
    ) {
      return "Yesterday";
    }


    return date.toLocaleDateString(
      [],
      {
        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric",
      }
    );
  } catch {
    return "";
  }
}


function groupReactions(
  message: ChatMessage
) {
  const grouped =
    new Map<
      string,
      number
    >();


  for (
    const reaction
    of message.reactions ??
    []
  ) {
    grouped.set(
      reaction.emoji,
      (
        grouped.get(
          reaction.emoji
        ) ??
        0
      ) +
        1
    );
  }


  return Array.from(
    grouped.entries()
  ).map(
    ([
      emoji,
      count,
    ]) => ({
      emoji,
      count,
    })
  );
}


function isImage(
  fileType?:
    string | null
) {
  return (
    !!fileType &&
    fileType.startsWith(
      "image/"
    )
  );
}


function isVideo(
  fileType?:
    string | null
) {
  return (
    !!fileType &&
    fileType.startsWith(
      "video/"
    )
  );
}


function isAudio(
  fileType?:
    string | null
) {
  return (
    !!fileType &&
    fileType.startsWith(
      "audio/"
    )
  );
}


function getFileLabel(
  fileType?:
    string | null,
  fileName = ""
) {
  const name =
    fileName.toLowerCase();


  if (
    fileType ===
      "application/pdf" ||
    name.endsWith(
      ".pdf"
    )
  ) {
    return "PDF";
  }


  if (
    name.endsWith(
      ".zip"
    )
  ) {
    return "ZIP";
  }


  if (
    name.endsWith(
      ".rar"
    )
  ) {
    return "RAR";
  }


  if (
    name.endsWith(
      ".7z"
    )
  ) {
    return "7Z";
  }


  if (
    name.endsWith(
      ".doc"
    ) ||
    name.endsWith(
      ".docx"
    )
  ) {
    return "DOC";
  }


  if (
    name.endsWith(
      ".xls"
    ) ||
    name.endsWith(
      ".xlsx"
    )
  ) {
    return "XLS";
  }


  if (
    name.endsWith(
      ".ppt"
    ) ||
    name.endsWith(
      ".pptx"
    )
  ) {
    return "PPT";
  }


  if (
    fileType?.startsWith(
      "audio/"
    )
  ) {
    return "AUD";
  }


  if (
    fileType?.startsWith(
      "video/"
    )
  ) {
    return "VID";
  }


  return "FILE";
}


function parseCustomEmoji(
  value: string,
  customEmojis:
    ChatCustomEmoji[]
) {
  if (
    !value.startsWith(
      "custom:"
    )
  ) {
    return null;
  }


  const parts =
    value.split(
      ":"
    );


  const id =
    parts[1];


  if (!id) {
    return null;
  }


  return (
    customEmojis.find(
      (
        emoji
      ) =>
        emoji.id ===
        id
    ) ??
    null
  );
}


function renderMessageTextWithMentions(
  content: string,
  customEmojis:
    ChatCustomEmoji[],
  mentionUsers:
    ChatUserProfile[],
  currentUserId?:
    string | null,
  onOpenMentionProfile?:
    (
      user:
        ChatUserProfile
    ) =>
      void
) {
  const parts =
    content.split(
      /(<@[a-zA-Z0-9-]+>|@everyone|@here|:[a-zA-Z0-9_]+:|@[a-zA-Z0-9_]+)/g
    );


  return parts.map(
    (
      part,
      index
    ) => {
      const emojiMatch =
        part.match(
          /^:([a-zA-Z0-9_]+):$/
        );


      if (
        emojiMatch
      ) {
        const emojiName =
          emojiMatch[1];


        const customEmoji =
          customEmojis.find(
            (
              emoji
            ) =>
              emoji.name ===
              emojiName
          );


        if (
          customEmoji
        ) {
          return (
            <img
              key={
                index
              }
              src={
                customEmoji.imageUrl
              }
              alt={
                customEmoji.name
              }
              title={`:${customEmoji.name}:`}
              className="channelInlineEmoji"
            />
          );
        }
      }


      const idMentionMatch =
        part.match(
          /^<@([a-zA-Z0-9-]+)>$/
        );


      if (
        idMentionMatch
      ) {
        const userId =
          idMentionMatch[1];


        const mentionedUser =
          mentionUsers.find(
            (
              user
            ) =>
              user.id ===
              userId
          );


        if (
          mentionedUser
        ) {
          const isMe =
            mentionedUser.id ===
            currentUserId;


          const username =
            mentionedUser.username ||
            mentionedUser.displayName ||
            "user";


          return (
            <button
              key={
                index
              }
              type="button"
              className={
                isMe
                  ? "channelMention isMe"
                  : "channelMention"
              }
              onClick={() =>
                onOpenMentionProfile?.(
                  mentionedUser
                )
              }
            >
              @{username}
            </button>
          );
        }


        return (
          <span
            key={
              index
            }
          >
            @unknown
          </span>
        );
      }


      if (
        part ===
          "@everyone" ||
        part ===
          "@here"
      ) {
        return (
          <span
            key={
              index
            }
            className="channelMention isEveryone"
          >
            {
              part
            }
          </span>
        );
      }


      const oldMentionMatch =
        part.match(
          /^@([a-zA-Z0-9_]+)$/
        );


      if (
        oldMentionMatch
      ) {
        const username =
          oldMentionMatch[1].toLowerCase();


        const mentionedUser =
          mentionUsers.find(
            (
              user
            ) =>
              user.username?.toLowerCase() ===
              username
          );


        if (
          mentionedUser
        ) {
          const isMe =
            mentionedUser.id ===
            currentUserId;


          return (
            <button
              key={
                index
              }
              type="button"
              className={
                isMe
                  ? "channelMention isMe"
                  : "channelMention"
              }
              onClick={() =>
                onOpenMentionProfile?.(
                  mentionedUser
                )
              }
            >
              {
                part
              }
            </button>
          );
        }
      }


      return (
        <span
          key={
            index
          }
        >
          {
            part
          }
        </span>
      );
    }
  );
}


function ReactionContent({
  emoji,
  customEmojis,
}: {
  emoji:
    string;

  customEmojis:
    ChatCustomEmoji[];
}) {
  const customEmoji =
    parseCustomEmoji(
      emoji,
      customEmojis
    );


  if (
    customEmoji
  ) {
    return (
      <img
        className="channelReactionCustomEmoji"
        src={
          customEmoji.imageUrl
        }
        alt={
          customEmoji.name
        }
        title={`:${customEmoji.name}:`}
      />
    );
  }


  return (
    <span>
      {
        emoji
      }
    </span>
  );
}


export default function ChatMessageList({
  messages,
  customEmojis,
  mentionUsers,
  currentUserId,
  onToggleReaction,
  onDeleteMessage,
  onOpenMentionProfile,
  onEditMessage,
  onReplyMessage,
}: ChatMessageListProps) {
  const [
    reactionPickerMessageId,
    setReactionPickerMessageId,
  ] =
    useState<
      string | null
    >(
      null
    );


  const [
    editingMessageId,
    setEditingMessageId,
  ] =
    useState<
      string | null
    >(
      null
    );


  const [
    editingContent,
    setEditingContent,
  ] =
    useState(
      ""
    );


  if (
    !messages.length
  ) {
    return (
      <>
        <div className="channelEmptyMessages">
          <div className="channelEmptyMessagesIcon">
            <MessageIcon />
          </div>


          <span>
            NO MESSAGES YET
          </span>


          <h3>
            Start the conversation
          </h3>


          <p>
            Be the first person to send a message here.
          </p>
        </div>


        <MessageStyles />
      </>
    );
  }


  return (
    <>
      <div className="channelMessageListV2">
        {messages.map(
          (
            message,
            index
          ) => {
            const authorName =
              getAuthorName(
                message
              );


            const isOwnMessage =
              !!currentUserId &&
              message.authorId ===
                currentUserId;


            const attachments =
              message.attachments ??
              [];


            const previousMessage =
              index >
              0
                ? messages[
                    index -
                      1
                  ]
                : null;


            const previousDate =
              previousMessage
                ? getMessageDate(
                    previousMessage
                  )
                : null;


            const currentDate =
              getMessageDate(
                message
              );


            const showDateDivider =
              !previousMessage ||
              previousDate !==
                currentDate;


            const grouped =
              previousMessage &&
              previousMessage.authorId ===
                message.authorId &&
              !message.replyToId &&
              !previousMessage.replyToId &&
              Math.abs(
                new Date(
                  message.createdAt
                ).getTime() -
                  new Date(
                    previousMessage.createdAt
                  ).getTime()
              ) <
                5 *
                  60 *
                  1000;


            return (
              <div
                key={
                  message.id
                }
              >
                {showDateDivider && (
                  <div className="channelDateDivider">
                    <span>
                      {
                        currentDate
                      }
                    </span>
                  </div>
                )}


                <article
                  id={`message-${message.id}`}
                  className={
                    grouped
                      ? "channelMessageV2 grouped"
                      : isOwnMessage
                      ? "channelMessageV2 own"
                      : "channelMessageV2"
                  }
                >
                  <div className="channelMessageAvatarColumn">
                    {!grouped && (
                      <button
                        type="button"
                        className="channelMessageAvatar"
                        onClick={() => {
                          if (
                            message.author
                          ) {
                            onOpenMentionProfile?.(
                              message.author
                            );
                          }
                        }}
                        aria-label={`Open ${authorName}'s profile`}
                      >
                        {message.author?.avatarUrl ? (
                          <img
                            src={
                              message.author.avatarUrl
                            }
                            alt={
                              authorName
                            }
                          />
                        ) : (
                          authorName
                            .slice(
                              0,
                              1
                            )
                            .toUpperCase()
                        )}


                        {message.author?.status && (
                          <StatusDot
                            status={
                              message.author.status
                            }
                          />
                        )}
                      </button>
                    )}
                  </div>


                  <div className="channelMessageBody">
                    {!grouped && (
                      <div className="channelMessageMeta">
                        <button
                          type="button"
                          className="channelMessageAuthor"
                          onClick={() => {
                            if (
                              message.author
                            ) {
                              onOpenMentionProfile?.(
                                message.author
                              );
                            }
                          }}
                        >
                          {
                            authorName
                          }
                        </button>


                        <span className="channelMessageTime">
                          {
                            getMessageTime(
                              message
                            )
                          }
                        </span>


                        {message.editedAt && (
                          <span className="channelMessageEdited">
                            edited
                          </span>
                        )}
                      </div>
                    )}


                    {grouped && (
                      <span className="channelGroupedTime">
                        {
                          getMessageTime(
                            message
                          )
                        }
                      </span>
                    )}


                    {message.replyToId && (
                      <ReplyReference
                        message={
                          message
                        }
                        messages={
                          messages
                        }
                      />
                    )}


                    {editingMessageId ===
                    message.id ? (
                      <form
                        className="channelEditMessage"
                        onSubmit={async (
                          event
                        ) => {
                          event.preventDefault();


                          await onEditMessage?.(
                            message.id,
                            editingContent
                          );


                          setEditingMessageId(
                            null
                          );


                          setEditingContent(
                            ""
                          );
                        }}
                      >
                        <input
                          value={
                            editingContent
                          }
                          onChange={(
                            event
                          ) =>
                            setEditingContent(
                              event.target.value
                            )
                          }
                          autoFocus
                        />


                        <button
                          type="submit"
                          className="primary"
                        >
                          Save
                        </button>


                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessageId(
                              null
                            );

                            setEditingContent(
                              ""
                            );
                          }}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      message.content.trim() && (
                        <p className="channelMessageText">
                          {renderMessageTextWithMentions(
                            message.content,
                            customEmojis,
                            mentionUsers,
                            currentUserId,
                            onOpenMentionProfile
                          )}
                        </p>
                      )
                    )}


                    {attachments.length >
                      0 && (
                      <div className="channelAttachments">
                        {attachments.map(
                          (
                            file
                          ) => (
                            <a
                              key={
                                file.id
                              }
                              className="channelAttachment"
                              href={
                                file.fileUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              {isImage(
                                file.fileType
                              ) ? (
                                <img
                                  className="channelAttachmentImage"
                                  src={
                                    file.fileUrl
                                  }
                                  alt={
                                    file.fileName
                                  }
                                />
                              ) : isVideo(
                                  file.fileType
                                ) ? (
                                <video
                                  className="channelAttachmentVideo"
                                  src={
                                    file.fileUrl
                                  }
                                  controls
                                />
                              ) : isAudio(
                                  file.fileType
                                ) ? (
                                <audio
                                  className="channelAttachmentAudio"
                                  src={
                                    file.fileUrl
                                  }
                                  controls
                                />
                              ) : (
                                <div className="channelFileCard">
                                  <span className="channelFileType">
                                    {getFileLabel(
                                      file.fileType,
                                      file.fileName
                                    )}
                                  </span>


                                  <div>
                                    <strong>
                                      {
                                        file.fileName
                                      }
                                    </strong>

                                    <small>
                                      Open attachment
                                    </small>
                                  </div>
                                </div>
                              )}
                            </a>
                          )
                        )}
                      </div>
                    )}


                    {groupReactions(
                      message
                    ).length >
                      0 && (
                      <div className="channelReactions">
                        {groupReactions(
                          message
                        ).map(
                          (
                            reaction
                          ) => (
                            <button
                              key={`${message.id}-${reaction.emoji}`}
                              type="button"
                              className="channelReaction"
                              onClick={() =>
                                onToggleReaction?.(
                                  message.id,
                                  reaction.emoji
                                )
                              }
                            >
                              <ReactionContent
                                emoji={
                                  reaction.emoji
                                }
                                customEmojis={
                                  customEmojis
                                }
                              />

                              <span>
                                {
                                  reaction.count
                                }
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    )}


                    <div className="channelMessageActions">
                      <div className="channelReactionPickerWrap">
                        <button
                          type="button"
                          className="channelMessageAction"
                          onClick={() =>
                            setReactionPickerMessageId(
                              (
                                current
                              ) =>
                                current ===
                                message.id
                                  ? null
                                  : message.id
                            )
                          }
                          title="Add reaction"
                        >
                          <SmileIcon />
                        </button>


                        <ChatEmojiPicker
                          open={
                            reactionPickerMessageId ===
                            message.id
                          }
                          customEmojis={
                            customEmojis
                          }
                          onSelectEmoji={(
                            emoji
                          ) =>
                            onToggleReaction?.(
                              message.id,
                              emoji
                            )
                          }
                          onClose={() =>
                            setReactionPickerMessageId(
                              null
                            )
                          }
                        />
                      </div>


                      <button
                        type="button"
                        className="channelMessageAction"
                        onClick={() =>
                          onReplyMessage?.(
                            message
                          )
                        }
                        title="Reply"
                      >
                        <ReplyIcon />
                      </button>


                      {isOwnMessage && (
                        <button
                          type="button"
                          className="channelMessageAction"
                          onClick={() => {
                            setEditingMessageId(
                              message.id
                            );

                            setEditingContent(
                              message.content
                            );
                          }}
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                      )}


                      {isOwnMessage && (
                        <button
                          type="button"
                          className="channelMessageAction danger"
                          onClick={() =>
                            onDeleteMessage?.(
                              message.id
                            )
                          }
                          title="Delete"
                        >
                          <DeleteIcon />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            );
          }
        )}
      </div>


      <MessageStyles />
    </>
  );
}


function ReplyReference({
  message,
  messages,
}: {
  message:
    ChatMessage;

  messages:
    ChatMessage[];
}) {
  const repliedMessage =
    messages.find(
      (
        item
      ) =>
        item.id ===
        message.replyToId
    );


  function jumpToReply() {
    if (
      !message.replyToId
    ) {
      return;
    }


    const target =
      document.getElementById(
        `message-${message.replyToId}`
      );


    const scrollArea =
      target?.closest(
        ".aurosChannelMessageViewport"
      ) as
        HTMLElement |
        null;


    if (
      !target ||
      !scrollArea
    ) {
      return;
    }


    const targetTop =
      target.offsetTop -
      scrollArea.offsetTop;


    scrollArea.scrollTo({
      top:
        targetTop -
        scrollArea.clientHeight /
          2 +
        target.clientHeight /
          2,

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
  }


  if (
    !repliedMessage
  ) {
    return (
      <button
        type="button"
        className="channelReplyReference unavailable"
      >
        <ReplySmallIcon />

        <span>
          Reply to deleted or unavailable message
        </span>
      </button>
    );
  }


  const author =
    repliedMessage.author?.displayName ??
    repliedMessage.author?.username ??
    "User";


  const text =
    repliedMessage.content?.trim() ||
    (
      repliedMessage.attachments?.length
        ? "Attachment"
        : "Message"
    );


  return (
    <button
      type="button"
      className="channelReplyReference"
      onClick={
        jumpToReply
      }
    >
      <ReplySmallIcon />


      <span>
        <strong>
          {
            author
          }
        </strong>

        {
          text.slice(
            0,
            90
          )
        }
      </span>
    </button>
  );
}


function StatusDot({
  status,
}: {
  status:
    string;
}) {
  const normalized =
    status ===
      "online" ||
    status ===
      "idle" ||
    status ===
      "dnd"
      ? status
      : "offline";


  return (
    <span
      className={`channelMessageStatus ${normalized}`}
    />
  );
}


function MessageStyles() {
  return (
    <style jsx global>{`
      .channelMessageListV2 {
        width:
          100%;

        min-height:
          100%;

        padding:
          10px
          0
          28px;

        box-sizing:
          border-box;
      }


      .channelDateDivider {
        position:
          relative;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        margin:
          22px
          20px
          15px;
      }


      .channelDateDivider::before {
        content:
          "";

        position:
          absolute;

        left:
          0;

        right:
          0;

        height:
          1px;

        background:
          rgba(
            126,
            130,
            255,
            0.08
          );
      }


      .channelDateDivider
        span {
        position:
          relative;

        z-index:
          1;

        padding:
          0
          9px;

        background:
          #0b0e17;

        color:
          #555f74;

        font-size:
          6px;

        font-weight:
          850;

        letter-spacing:
          0.08em;

        text-transform:
          uppercase;
      }


      .channelMessageV2 {
        position:
          relative;

        display:
          grid;

        grid-template-columns:
          42px
          minmax(
            0,
            1fr
          );

        gap:
          11px;

        padding:
          7px
          20px;

        transition:
          background
            120ms
            ease;
      }


      .channelMessageV2.grouped {
        padding-top:
          2px;

        padding-bottom:
          2px;
      }


      .channelMessageV2:hover {
        background:
          rgba(
            255,
            255,
            255,
            0.018
          );
      }


      .channelMessageV2.isReplyHighlighted {
        background:
          rgba(
            126,
            103,
            255,
            0.12
          );

        animation:
          channelReplyHighlight
          4s
          ease
          forwards;
      }


      @keyframes channelReplyHighlight {
        0%,
        25% {
          background:
            rgba(
              126,
              103,
              255,
              0.16
            );
        }

        100% {
          background:
            transparent;
        }
      }


      .channelMessageAvatarColumn {
        position:
          relative;

        display:
          flex;

        justify-content:
          flex-end;
      }


      .channelMessageAvatar {
        position:
          relative;

        width:
          38px;

        height:
          38px;

        display:
          grid;

        place-items:
          center;

        overflow:
          visible;

        padding:
          0;

        border:
          1px solid
          rgba(
            130,
            132,
            255,
            0.12
          );

        border-radius:
          50%;

        background:
          linear-gradient(
            145deg,
            #1b2030,
            #111522
          );

        color:
          #aaaaff;

        font-size:
          12px;

        font-weight:
          900;

        cursor:
          pointer;
      }


      .channelMessageAvatar
        img {
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


      .channelMessageStatus {
        position:
          absolute;

        right:
          -1px;

        bottom:
          -1px;

        width:
          8px;

        height:
          8px;

        border:
          2px solid
          #0b0e17;

        border-radius:
          50%;
      }


      .channelMessageStatus.online {
        background:
          #4fe1a4;
      }


      .channelMessageStatus.idle {
        background:
          #f2c85b;
      }


      .channelMessageStatus.dnd {
        background:
          #ff657b;
      }


      .channelMessageStatus.offline {
        background:
          #596377;
      }


      .channelMessageBody {
        position:
          relative;

        min-width:
          0;

        padding-right:
          10px;
      }


      .channelMessageMeta {
        display:
          flex;

        align-items:
          baseline;

        gap:
          8px;

        min-height:
          18px;
      }


      .channelMessageAuthor {
        overflow:
          hidden;

        max-width:
          260px;

        padding:
          0;

        border:
          0;

        background:
          transparent;

        color:
          #dfe3f4;

        font-size:
          10px;

        font-weight:
          850;

        text-overflow:
          ellipsis;

        white-space:
          nowrap;

        cursor:
          pointer;
      }


      .channelMessageAuthor:hover {
        color:
          #a89eff;

        text-decoration:
          underline;
      }


      .channelMessageTime,
      .channelMessageEdited {
        color:
          #4e596d;

        font-size:
          6px;

        font-weight:
          650;
      }


      .channelMessageEdited {
        font-style:
          italic;
      }


      .channelGroupedTime {
        position:
          absolute;

        left:
          -49px;

        top:
          5px;

        width:
          38px;

        color:
          transparent;

        font-size:
          6px;

        text-align:
          right;
      }


      .channelMessageV2.grouped:hover
        .channelGroupedTime {
        color:
          #485367;
      }


      .channelMessageText {
        margin:
          1px
          0
          0;

        color:
          #abb3c8;

        font-size:
          10px;

        font-weight:
          520;

        line-height:
          1.52;

        overflow-wrap:
          anywhere;

        white-space:
          pre-wrap;
      }


      .channelMention {
        display:
          inline;

        margin:
          0
          1px;

        padding:
          1px
          4px;

        border:
          0;

        border-radius:
          4px;

        background:
          rgba(
            116,
            96,
            255,
            0.12
          );

        color:
          #a79cff;

        font:
          inherit;

        font-weight:
          750;

        cursor:
          pointer;
      }


      .channelMention:hover {
        background:
          rgba(
            116,
            96,
            255,
            0.23
          );

        color:
          #d5d1ff;
      }


      .channelMention.isMe,
      .channelMention.isEveryone {
        background:
          rgba(
            84,
            202,
            255,
            0.12
          );

        color:
          #72dcff;
      }


      .channelInlineEmoji {
        width:
          20px;

        height:
          20px;

        display:
          inline-block;

        margin:
          0
          2px;

        object-fit:
          contain;

        vertical-align:
          middle;
      }


      .channelReplyReference {
        max-width:
          min(
            520px,
            100%
          );

        display:
          flex;

        align-items:
          center;

        gap:
          7px;

        margin:
          2px
          0
          5px;

        padding:
          5px
          8px;

        border:
          0;

        border-left:
          2px solid
          #7868ec;

        border-radius:
          0
          6px
          6px
          0;

        background:
          rgba(
            123,
            104,
            239,
            0.045
          );

        color:
          #69758d;

        font-size:
          7px;

        text-align:
          left;

        cursor:
          pointer;
      }


      .channelReplyReference
        svg {
        width:
          11px;

        height:
          11px;

        flex:
          0 0 auto;

        color:
          #7e70ef;
      }


      .channelReplyReference
        strong {
        margin-right:
          5px;

        color:
          #a89eff;
      }


      .channelReplyReference:hover {
        background:
          rgba(
            123,
            104,
            239,
            0.08
          );

        color:
          #8c96aa;
      }


      .channelReplyReference.unavailable {
        cursor:
          default;

        opacity:
          0.65;
      }


      .channelAttachments {
        display:
          grid;

        gap:
          8px;

        width:
          min(
            580px,
            100%
          );

        margin-top:
          8px;
      }


      .channelAttachment {
        display:
          block;

        overflow:
          hidden;

        color:
          inherit;

        text-decoration:
          none;
      }


      .channelAttachmentImage,
      .channelAttachmentVideo {
        display:
          block;

        width:
          auto;

        max-width:
          min(
            520px,
            100%
          );

        max-height:
          360px;

        border:
          1px solid
          rgba(
            131,
            133,
            255,
            0.11
          );

        border-radius:
          11px;

        object-fit:
          contain;

        background:
          #070910;
      }


      .channelAttachmentAudio {
        width:
          min(
            430px,
            100%
          );
      }


      .channelFileCard {
        width:
          min(
            400px,
            100%
          );

        min-height:
          58px;

        display:
          flex;

        align-items:
          center;

        gap:
          11px;

        padding:
          9px
          11px;

        border:
          1px solid
          rgba(
            130,
            133,
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
            0.018
          );

        box-sizing:
          border-box;
      }


      .channelFileType {
        width:
          37px;

        height:
          37px;

        display:
          grid;

        place-items:
          center;

        flex:
          0 0 37px;

        border-radius:
          9px;

        background:
          rgba(
            122,
            102,
            255,
            0.09
          );

        color:
          #9a8fff;

        font-size:
          7px;

        font-weight:
          950;
      }


      .channelFileCard
        > div {
        min-width:
          0;

        display:
          flex;

        flex-direction:
          column;
      }


      .channelFileCard
        strong {
        overflow:
          hidden;

        color:
          #aeb6cb;

        font-size:
          8px;

        text-overflow:
          ellipsis;

        white-space:
          nowrap;
      }


      .channelFileCard
        small {
        margin-top:
          3px;

        color:
          #566176;

        font-size:
          6px;
      }


      .channelReactions {
        display:
          flex;

        align-items:
          center;

        flex-wrap:
          wrap;

        gap:
          5px;

        margin-top:
          6px;
      }


      .channelReaction {
        min-height:
          25px;

        display:
          inline-flex;

        align-items:
          center;

        gap:
          5px;

        padding:
          0
          7px;

        border:
          1px solid
          rgba(
            130,
            132,
            255,
            0.12
          );

        border-radius:
          7px;

        background:
          rgba(
            255,
            255,
            255,
            0.018
          );

        color:
          #8994aa;

        font-size:
          8px;

        cursor:
          pointer;
      }


      .channelReaction:hover {
        border-color:
          rgba(
            140,
            125,
            255,
            0.28
          );

        background:
          rgba(
            140,
            125,
            255,
            0.07
          );
      }


      .channelReactionCustomEmoji {
        width:
          15px;

        height:
          15px;

        object-fit:
          contain;
      }


      .channelMessageActions {
        position:
          absolute;

        z-index:
          10;

        top:
          -15px;

        right:
          7px;

        display:
          flex;

        align-items:
          center;

        gap:
          2px;

        padding:
          3px;

        border:
          1px solid
          rgba(
            130,
            132,
            255,
            0.12
          );

        border-radius:
          8px;

        background:
          #111521;

        box-shadow:
          0
          8px
          24px
          rgba(
            0,
            0,
            0,
            0.28
          );

        opacity:
          0;

        pointer-events:
          none;

        transform:
          translateY(
            3px
          );

        transition:
          120ms
          ease;
      }


      .channelMessageV2:hover
        .channelMessageActions,
      .channelMessageV2:focus-within
        .channelMessageActions {
        opacity:
          1;

        pointer-events:
          auto;

        transform:
          translateY(
            0
          );
      }


      .channelReactionPickerWrap {
        position:
          relative;
      }


      .channelMessageAction {
        width:
          29px;

        height:
          27px;

        display:
          grid;

        place-items:
          center;

        padding:
          0;

        border:
          0;

        border-radius:
          6px;

        background:
          transparent;

        color:
          #747f96;

        cursor:
          pointer;
      }


      .channelMessageAction:hover {
        background:
          rgba(
            137,
            122,
            255,
            0.08
          );

        color:
          #bbb4ff;
      }


      .channelMessageAction.danger:hover {
        background:
          rgba(
            255,
            101,
            124,
            0.08
          );

        color:
          #ff8293;
      }


      .channelMessageAction
        svg {
        width:
          13px;

        height:
          13px;
      }


      .channelEditMessage {
        width:
          min(
            620px,
            100%
          );

        display:
          flex;

        gap:
          6px;

        margin-top:
          4px;
      }


      .channelEditMessage
        input {
        min-width:
          0;

        min-height:
          34px;

        flex:
          1;

        padding:
          0
          10px;

        border:
          1px solid
          rgba(
            137,
            122,
            255,
            0.24
          );

        border-radius:
          8px;

        outline:
          none;

        background:
          #080b13;

        color:
          white;

        font-size:
          9px;
      }


      .channelEditMessage
        button {
        min-height:
          34px;

        padding:
          0
          10px;

        border:
          1px solid
          rgba(
            131,
            133,
            255,
            0.12
          );

        border-radius:
          8px;

        background:
          rgba(
            255,
            255,
            255,
            0.02
          );

        color:
          #7e899e;

        font-size:
          7px;

        font-weight:
          850;

        cursor:
          pointer;
      }


      .channelEditMessage
        button.primary {
        border-color:
          rgba(
            139,
            124,
            255,
            0.25
          );

        background:
          rgba(
            139,
            124,
            255,
            0.1
          );

        color:
          #c9c4ff;
      }


      .channelEmptyMessages {
        min-height:
          100%;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        flex-direction:
          column;

        padding:
          40px;

        text-align:
          center;
      }


      .channelEmptyMessagesIcon {
        width:
          50px;

        height:
          50px;

        display:
          grid;

        place-items:
          center;

        margin-bottom:
          16px;

        border:
          1px solid
          rgba(
            139,
            124,
            255,
            0.17
          );

        border-radius:
          15px;

        background:
          rgba(
            139,
            124,
            255,
            0.06
          );

        color:
          #9184ff;
      }


      .channelEmptyMessagesIcon
        svg {
        width:
          22px;

        height:
          22px;
      }


      .channelEmptyMessages
        > span {
        color:
          #786ee0;

        font-size:
          7px;

        font-weight:
          950;

        letter-spacing:
          0.15em;
      }


      .channelEmptyMessages
        h3 {
        margin:
          7px
          0
          4px;

        color:
          #dce0ee;

        font-size:
          17px;
      }


      .channelEmptyMessages
        p {
        margin:
          0;

        color:
          #5e697e;

        font-size:
          8px;
      }


      @media (
        max-width:
          650px
      ) {
        .channelMessageV2 {
          grid-template-columns:
            36px
            minmax(
              0,
              1fr
            );

          gap:
            9px;

          padding-left:
            11px;

          padding-right:
            9px;
        }


        .channelMessageAvatar {
          width:
            34px;

          height:
            34px;
        }


        .channelMessageText {
          font-size:
            9px;
        }


        .channelMessageActions {
          position:
            static;

          width:
            fit-content;

          margin-top:
            5px;

          opacity:
            1;

          pointer-events:
            auto;

          transform:
            none;

          box-shadow:
            none;
        }


        .channelGroupedTime {
          display:
            none;
        }
      }


      @media (
        prefers-reduced-motion:
          reduce
      ) {
        .channelMessageV2,
        .channelMessageActions {
          transition:
            none;
        }


        .channelMessageV2.isReplyHighlighted {
          animation:
            none;
        }
      }
    `}</style>
  );
}


function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 3V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function SmileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M9 10h.01M15 10h.01M9 14c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function ReplyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m10 7-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 12h7c4 0 6 2 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function ReplySmallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m10 7-5 5 5 5M6 12h7c4 0 6 2 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m14.5 5.5 4 4M5 19l3.8-.8L18.5 7.5a1.4 1.4 0 0 0 0-2l-.9-.9a1.4 1.4 0 0 0-2 0L5.8 14.3 5 19Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7h14M9 7V5h6v2M8 10v7M12 10v7M16 10v7M7 7l1 13h8l1-13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}