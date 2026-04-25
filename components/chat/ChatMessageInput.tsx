"use client";

import { useState } from "react";

type ChatMessageInputProps = {
  disabled?: boolean;
  placeholder?: string;
  onSendMessage: (value: string) => void | Promise<void>;
};

export default function ChatMessageInput({
  disabled,
  placeholder,
  onSendMessage,
}: ChatMessageInputProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (disabled || submitting) return;

    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      setSubmitting(true);
      await onSendMessage(trimmed);
      setValue("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="aurosMessageInputWrap" onSubmit={handleSubmit}>
      <button type="button" className="aurosInputActionButton">
        +
      </button>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="aurosMessageInput"
        placeholder={placeholder ?? "Write a message..."}
        disabled={disabled || submitting}
      />

      <button type="button" className="aurosInputActionButton">
        :)
      </button>

      <button
        type="submit"
        className="aurosSendButton"
        disabled={disabled || submitting}
      >
        {submitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}