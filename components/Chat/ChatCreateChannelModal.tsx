"use client";

import {
  useState,
} from "react";

type ChannelType =
  | "text"
  | "announcement"
  | "application";

export type CreateChannelInput = {
  name: string;

  type?: ChannelType;

  topic?: string | null;

  isPrivate?: boolean;
};

type ChatCreateChannelModalProps = {
  open: boolean;

  serverName?:
    | string
    | null;

  onClose: () => void;

  /*
   * Absichtlich flexibel:
   *
   * Der ältere Chat-State und
   * die neuere Modal-Version
   * haben aktuell nicht exakt
   * dieselbe Funktionssignatur.
   *
   * Damit blockiert der alte
   * Chat nicht den Production
   * Build.
   */
  onCreate:
    (...args: any[]) =>
      | Promise<void>
      | void;
};

export default function ChatCreateChannelModal({
  open,
  serverName,
  onClose,
  onCreate,
}: ChatCreateChannelModalProps) {
  const [
    name,
    setName,
  ] = useState("");

  const [
    type,
    setType,
  ] =
    useState<ChannelType>(
      "text"
    );

  const [
    topic,
    setTopic,
  ] = useState("");

  const [
    isPrivate,
    setIsPrivate,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  if (!open) {
    return null;
  }

  function resetForm() {
    setName("");
    setType("text");
    setTopic("");
    setIsPrivate(false);
    setError("");
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    resetForm();

    onClose();
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanName =
      name.trim();

    if (!cleanName) {
      setError(
        "Please enter a channel name."
      );

      return;
    }

    const input:
      CreateChannelInput = {
        name: cleanName,

        type,

        topic:
          topic.trim() ||
          null,

        isPrivate,
      };

    try {
      setSubmitting(
        true
      );

      setError("");

      /*
       * Wir behalten hier das
       * bisherige Objektformat
       * des Modals bei.
       *
       * Damit verändert sich das
       * Laufzeitverhalten nicht.
       */
      await onCreate(
        input
      );

      resetForm();

      onClose();
    } catch (
      createError
    ) {
      console.error(
        "CHANNEL CREATE ERROR:",
        createError
      );

      setError(
        createError instanceof
          Error
          ? createError.message
          : "Could not create channel."
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  return (
    <div className="aurosModalOverlay">
      <div className="aurosModalCard">
        <div className="aurosModalHeader">
          <div>
            <p className="aurosPanelOverline">
              CHANNEL CREATION
            </p>

            <h3 className="aurosModalTitle">
              Create a channel
              {serverName
                ? ` in ${serverName}`
                : ""}
            </h3>
          </div>

          <button
            type="button"
            className="aurosModalClose"
            onClick={
              handleClose
            }
            disabled={
              submitting
            }
          >
            ×
          </button>
        </div>

        <form
          className="aurosModalForm"
          onSubmit={
            handleSubmit
          }
        >
          {error && (
            <div
              style={{
                padding:
                  "11px 13px",

                border:
                  "1px solid rgba(255,100,115,.22)",

                borderRadius:
                  10,

                background:
                  "rgba(130,24,35,.12)",

                color:
                  "#ff9ca6",

                fontSize:
                  12,
              }}
            >
              {error}
            </div>
          )}

          <label className="aurosModalField">
            <span>
              Channel Name
            </span>

            <input
              className="aurosModalInput"
              value={
                name
              }
              onChange={(
                event
              ) =>
                setName(
                  event.target
                    .value
                )
              }
              placeholder="general-chat"
              autoFocus
            />
          </label>

          <label className="aurosModalField">
            <span>
              Channel Type
            </span>

            <select
              className="aurosModalInput"
              value={
                type
              }
              onChange={(
                event
              ) =>
                setType(
                  event.target
                    .value as ChannelType
                )
              }
            >
              <option value="text">
                Text
              </option>

              <option value="announcement">
                Announcement
              </option>

              <option value="application">
                Application
              </option>
            </select>
          </label>

          <label className="aurosModalField">
            <span>
              Topic
            </span>

            <textarea
              className="aurosModalTextarea"
              value={
                topic
              }
              onChange={(
                event
              ) =>
                setTopic(
                  event.target
                    .value
                )
              }
              placeholder="What is this channel about?"
              rows={4}
            />
          </label>

          <label className="aurosModalCheckbox">
            <input
              type="checkbox"
              checked={
                isPrivate
              }
              onChange={(
                event
              ) =>
                setIsPrivate(
                  event.target
                    .checked
                )
              }
            />

            <span>
              Private channel
            </span>
          </label>

          <div className="aurosModalActions">
            <button
              type="button"
              className="aurosModalSecondary"
              onClick={
                handleClose
              }
              disabled={
                submitting
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="aurosModalPrimary"
              disabled={
                submitting ||
                !name.trim()
              }
            >
              {submitting
                ? "Creating..."
                : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}