"use client";

import { useEffect, useState } from "react";
import {
  getPublicApplicationChatMessages,
  sendPublicApplicationChatMessage,
  type PublicApplicationChatAccess,
  type PublicApplicationChatMessage,
} from "../../services/chat-access.service";

type GuestApplicationChatProps = {
  access: PublicApplicationChatAccess;
  onExit: () => void;
};

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function getAuthorLabel(message: PublicApplicationChatMessage) {
  return message.authorDisplayName ?? message.guestName ?? "Applicant";
}

export default function GuestApplicationChat({
  access,
  onExit,
}: GuestApplicationChatProps) {
  const [messages, setMessages] = useState<PublicApplicationChatMessage[]>([]);
  const [guestName, setGuestName] = useState(access.applicantName || "");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getPublicApplicationChatMessages(access.chatId);

        if (mounted) {
          setMessages(data);
        }
      } catch (loadError) {
        console.error("[GuestApplicationChat] Failed to load messages:", loadError);

        if (mounted) {
          setError("Failed to load application chat messages.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    const interval = window.setInterval(load, 4000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [access.chatId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    const trimmedMessage = input.trim();
    const trimmedGuestName = guestName.trim();

    if (!trimmedMessage || !trimmedGuestName) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      await sendPublicApplicationChatMessage({
        auId: access.chatId,
        content: trimmedMessage,
        guestName: trimmedGuestName,
      });

      setInput("");

      const refreshed = await getPublicApplicationChatMessages(access.chatId);
      setMessages(refreshed);
    } catch (sendError) {
      console.error("[GuestApplicationChat] Failed to send message:", sendError);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="aurosChatShell" style={{ gridTemplateColumns: "1fr" }}>
      <div className="aurosChatCenter" style={{ minHeight: "78vh" }}>
        <header className="aurosChatHeader">
          <div>
            <p className="aurosHeaderOverline">APPLICATION ACCESS</p>
            <h1 className="aurosHeaderTitle">{access.applicantName}</h1>
            <p className="aurosHeaderSubtitle">AU-ID • {access.chatId}</p>
          </div>

          <div className="aurosHeaderActions">
            <button className="aurosHeaderButton" type="button" onClick={onExit}>
              Exit AU-ID Mode
            </button>
          </div>
        </header>

        {error && (
          <div
            style={{
              margin: "16px 20px 0",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid rgba(255,107,107,0.25)",
              background: "rgba(255,107,107,0.10)",
              color: "#ffb7b7",
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        <div className="aurosChatScrollArea">
          {loading ? (
            <div className="aurosChatEmptyMessages">
              <p>Loading application chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="aurosChatEmptyMessages">
              <p>No messages yet.</p>
            </div>
          ) : (
            <div className="aurosChatMessageList">
              {messages.map((message) => (
                <article key={message.id} className="aurosMessageCard">
                  <div className="aurosMessageAvatar">
                    {getAuthorLabel(message).slice(0, 1).toUpperCase()}
                  </div>

                  <div className="aurosMessageContent">
                    <div className="aurosMessageMeta">
                      <strong>{getAuthorLabel(message)}</strong>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>

                    <p className="aurosMessageText">{message.content}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <form className="aurosMessageInputWrap" onSubmit={handleSend}>
          <input
            className="aurosMessageInput"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name"
          />

          <input
            className="aurosMessageInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your application message..."
          />

          <button className="aurosSendButton" type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
}