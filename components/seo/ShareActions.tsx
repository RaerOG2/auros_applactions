"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


type ShareActionsProps = {
  title: string;

  text?: string | null;

  url?: string;
};


type FeedbackState =
  | "idle"
  | "copied"
  | "shared"
  | "error";


export default function ShareActions({
  title,
  text,
  url,
}: ShareActionsProps) {
  const [
    feedback,
    setFeedback,
  ] =
    useState<FeedbackState>(
      "idle"
    );


  const [
    canNativeShare,
    setCanNativeShare,
  ] =
    useState(false);


  const timeoutRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(
      null
    );


  useEffect(() => {
    setCanNativeShare(
      typeof navigator !==
        "undefined" &&
        typeof navigator.share ===
          "function"
    );


    return () => {
      if (
        timeoutRef.current
      ) {
        clearTimeout(
          timeoutRef.current
        );
      }
    };
  }, []);


  function resolveUrl() {
    if (url) {
      if (
        /^https?:\/\//i.test(
          url
        )
      ) {
        return url;
      }


      if (
        typeof window !==
        "undefined"
      ) {
        return new URL(
          url,
          window.location.origin
        ).toString();
      }


      return url;
    }


    if (
      typeof window !==
      "undefined"
    ) {
      return window.location.href;
    }


    return "";
  }


  function showFeedback(
    state: FeedbackState
  ) {
    setFeedback(
      state
    );


    if (
      timeoutRef.current
    ) {
      clearTimeout(
        timeoutRef.current
      );
    }


    if (
      state !==
      "idle"
    ) {
      timeoutRef.current =
        setTimeout(
          () => {
            setFeedback(
              "idle"
            );
          },
          2200
        );
    }
  }


  async function copyLink() {
    const targetUrl =
      resolveUrl();


    if (!targetUrl) {
      showFeedback(
        "error"
      );

      return;
    }


    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          targetUrl
        );
      } else {
        fallbackCopy(
          targetUrl
        );
      }


      showFeedback(
        "copied"
      );
    } catch (
      error
    ) {
      console.error(
        "Could not copy share URL:",
        error
      );


      try {
        fallbackCopy(
          targetUrl
        );

        showFeedback(
          "copied"
        );
      } catch (
        fallbackError
      ) {
        console.error(
          "Fallback copy failed:",
          fallbackError
        );

        showFeedback(
          "error"
        );
      }
    }
  }


  async function share() {
    const targetUrl =
      resolveUrl();


    if (!targetUrl) {
      showFeedback(
        "error"
      );

      return;
    }


    if (
      typeof navigator !==
        "undefined" &&
      typeof navigator.share ===
        "function"
    ) {
      try {
        await navigator.share({
          title,

          text:
            text?.trim() ||
            undefined,

          url:
            targetUrl,
        });


        showFeedback(
          "shared"
        );

        return;
      } catch (
        error
      ) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }


        console.error(
          "Native share failed:",
          error
        );
      }
    }


    await copyLink();
  }


  function getFeedbackText() {
    if (
      feedback ===
      "copied"
    ) {
      return "Link copied!";
    }


    if (
      feedback ===
      "shared"
    ) {
      return "Shared!";
    }


    if (
      feedback ===
      "error"
    ) {
      return "Could not copy link.";
    }


    return null;
  }


  const feedbackText =
    getFeedbackText();


  return (
    <>
      <div
        className="aurosShareActions"
      >
        <button
          type="button"
          className="aurosShareButton aurosShareButtonPrimary"
          onClick={
            share
          }
          aria-label={
            canNativeShare
              ? "Share this page"
              : "Copy link to this page"
          }
        >
          <ShareIcon />

          <span>
            Share
          </span>
        </button>


        <button
          type="button"
          className={`aurosShareButton ${
            feedback ===
            "copied"
              ? "aurosShareButtonCopied"
              : ""
          }`}
          onClick={
            copyLink
          }
          aria-label="Copy link to this page"
        >
          {feedback ===
          "copied" ? (
            <CheckIcon />
          ) : (
            <LinkIcon />
          )}


          <span>
            {feedback ===
            "copied"
              ? "Copied!"
              : "Copy Link"}
          </span>
        </button>


        <div
          className={`aurosShareFeedback ${
            feedback !==
            "idle"
              ? "aurosShareFeedbackVisible"
              : ""
          }`}
          role="status"
          aria-live="polite"
        >
          {
            feedbackText
          }
        </div>
      </div>


      <style jsx>{`
        .aurosShareActions {
          position: relative;

          display: flex;
          align-items: center;
          gap: 9px;

          flex-wrap: wrap;
        }


        .aurosShareButton {
          min-height: 38px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 0 13px;

          border: 1px solid
            rgba(
              119,
              150,
              192,
              0.14
            );

          border-radius: 9px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          color: #a4b5cc;

          font-family: inherit;
          font-size: 9px;
          font-weight: 850;

          cursor: pointer;

          transition:
            transform
              140ms ease,
            border-color
              140ms ease,
            background
              140ms ease,
            color
              140ms ease,
            box-shadow
              140ms ease;
        }


        .aurosShareButton:hover {
          border-color:
            rgba(
              99,
              221,
              255,
              0.28
            );

          background:
            rgba(
              99,
              221,
              255,
              0.055
            );

          color: #d9f7ff;

          transform:
            translateY(
              -1px
            );
        }


        .aurosShareButton:active {
          transform:
            translateY(
              0
            )
            scale(
              0.98
            );
        }


        .aurosShareButton:focus-visible {
          outline: 2px solid
            rgba(
              99,
              221,
              255,
              0.62
            );

          outline-offset: 2px;
        }


        .aurosShareButtonPrimary {
          border-color:
            rgba(
              99,
              221,
              255,
              0.2
            );

          background:
            linear-gradient(
              135deg,
              rgba(
                99,
                221,
                255,
                0.095
              ),
              rgba(
                117,
                91,
                255,
                0.06
              )
            );

          color: #75e2ff;
        }


        .aurosShareButtonCopied {
          border-color:
            rgba(
              83,
              220,
              164,
              0.23
            );

          background:
            rgba(
              83,
              220,
              164,
              0.065
            );

          color: #72e2ad;
        }


        .aurosShareButton
          :global(svg) {
          width: 14px;
          height: 14px;

          flex: 0 0 auto;
        }


        .aurosShareFeedback {
          position: absolute;

          left: 0;
          top: calc(
            100% + 8px
          );

          z-index: 10;

          pointer-events: none;

          padding: 7px 10px;

          border: 1px solid
            rgba(
              119,
              150,
              192,
              0.12
            );

          border-radius: 8px;

          background:
            rgba(
              7,
              15,
              29,
              0.96
            );

          color: #9cafc8;

          font-size: 8px;
          font-weight: 750;

          opacity: 0;

          transform:
            translateY(
              -3px
            );

          transition:
            opacity
              140ms ease,
            transform
              140ms ease;
        }


        .aurosShareFeedbackVisible {
          opacity: 1;

          transform:
            translateY(
              0
            );
        }


        @media (
          max-width: 520px
        ) {
          .aurosShareActions {
            width: 100%;
          }


          .aurosShareButton {
            flex: 1 1
              calc(
                50% - 5px
              );
          }
        }


        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .aurosShareButton,
          .aurosShareFeedback {
            transition: none;
          }


          .aurosShareButton:hover,
          .aurosShareButton:active {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}


function fallbackCopy(
  value: string
) {
  const textarea =
    document.createElement(
      "textarea"
    );


  textarea.value =
    value;

  textarea.setAttribute(
    "readonly",
    ""
  );


  textarea.style.position =
    "fixed";

  textarea.style.left =
    "-9999px";

  textarea.style.opacity =
    "0";


  document.body.appendChild(
    textarea
  );


  textarea.select();

  textarea.setSelectionRange(
    0,
    textarea.value.length
  );


  const copied =
    document.execCommand(
      "copy"
    );


  document.body.removeChild(
    textarea
  );


  if (!copied) {
    throw new Error(
      "document.execCommand('copy') returned false."
    );
  }
}


function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 15V3M12 3L7.5 7.5M12 3l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.5 13.5l3-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M8.2 15.8l-1.4 1.4a4 4 0 1 1-5.7-5.7l3.6-3.6a4 4 0 0 1 5.7 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M15.8 8.2l1.4-1.4a4 4 0 1 1 5.7 5.7l-3.6 3.6a4 4 0 0 1-5.7 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5l4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}