"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLanguage,
} from "./LanguageProvider";

import type {
  Language,
} from "../../lib/i18n";

type LanguageOption = {
  value: Language;
  short: string;
};

const languageOptions:
  LanguageOption[] = [
    {
      value: "en",
      short: "EN",
    },
    {
      value: "de",
      short: "DE",
    },
    {
      value: "es",
      short: "ES",
    },
    {
      value: "fr",
      short: "FR",
    },
  ];

export default function LanguageSelector() {
  const {
    language,
    dictionary,
    setLanguage,
  } =
    useLanguage();

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleMouseDown(
      event: MouseEvent
    ) {
      const target =
        event.target;

      if (
        !(target instanceof Node)
      ) {
        return;
      }

      if (
        containerRef.current &&
        !containerRef.current.contains(
          target
        )
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleMouseDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  function getLanguageName(
    value: Language
  ) {
    switch (value) {
      case "de":
        return dictionary
          .languageSelector
          .german;

      case "es":
        return dictionary
          .languageSelector
          .spanish;

      case "fr":
        return dictionary
          .languageSelector
          .french;

      default:
        return dictionary
          .languageSelector
          .english;
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="aurosLanguageSelector"
      >
        <button
          type="button"
          className={
            open
              ? "aurosLanguageButton active"
              : "aurosLanguageButton"
          }
          aria-label={
            dictionary
              .languageSelector
              .label
          }
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() =>
            setOpen(
              (
                previous
              ) =>
                !previous
            )
          }
        >
          <GlobeIcon />

          <span>
            {language.toUpperCase()}
          </span>

          <ChevronIcon
            open={open}
          />
        </button>

        {open && (
          <div
            className="aurosLanguageMenu"
            role="menu"
          >
            <div className="aurosLanguageMenuHeader">
              {dictionary
                .languageSelector
                .label}
            </div>

            {languageOptions.map(
              (
                option
              ) => (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  role="menuitem"
                  className={
                    language ===
                    option.value
                      ? "aurosLanguageOption active"
                      : "aurosLanguageOption"
                  }
                  onClick={() => {
                    setLanguage(
                      option.value
                    );

                    setOpen(false);
                  }}
                >
                  <span className="aurosLanguageCode">
                    {option.short}
                  </span>

                  <span className="aurosLanguageName">
                    {getLanguageName(
                      option.value
                    )}
                  </span>

                  {language ===
                    option.value && (
                    <span className="aurosLanguageCheck">
                      ✓
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .aurosLanguageSelector {
          position: relative;
          flex-shrink: 0;
        }

        .aurosLanguageButton {
          min-height: 39px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          padding:
            6px
            9px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.14
            );

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          color: #c9d7ed;

          font-family: inherit;

          font-size: 11px;
          font-weight: 800;

          cursor: pointer;

          transition:
            border-color
              140ms ease,
            background
              140ms ease,
            color
              140ms ease;
        }

        .aurosLanguageButton.active {
          border-color:
            rgba(
              99,
              221,
              255,
              0.38
            );

          background:
            rgba(
              99,
              221,
              255,
              0.09
            );

          color: white;
        }

        .aurosLanguageButton
          svg {
          width: 14px;
          height: 14px;
        }

        .aurosLanguageButton
          svg.chevron {
          width: 11px;
          height: 11px;

          color: #7489aa;

          transition:
            transform
              150ms ease;
        }

        .aurosLanguageButton
          svg.chevron.open {
          transform:
            rotate(180deg);
        }

        .aurosLanguageMenu {
          position: absolute;

          top:
            calc(
              100% + 10px
            );

          right: 0;

          z-index: 110;

          width: 210px;

          padding: 8px;

          border:
            1px solid
            rgba(
              112,
              143,
              190,
              0.22
            );

          border-radius: 15px;

          background:
            rgba(
              8,
              14,
              27,
              0.985
            );

          box-shadow:
            0
            20px
            60px
            rgba(
              0,
              0,
              0,
              0.45
            );

          backdrop-filter:
            blur(20px);
        }

        .aurosLanguageMenuHeader {
          padding:
            6px
            8px
            8px;

          color: #637a9c;

          font-size: 8px;
          font-weight: 850;

          letter-spacing:
            0.12em;

          text-transform:
            uppercase;
        }

        .aurosLanguageOption {
          width: 100%;

          min-height: 39px;

          display: flex;
          align-items: center;
          gap: 9px;

          padding:
            7px
            8px;

          border:
            1px solid
            transparent;

          border-radius: 10px;

          background:
            transparent;

          color: #a9b9d0;

          font-family: inherit;

          text-align: left;

          cursor: pointer;
        }

        .aurosLanguageOption:hover {
          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          color: white;
        }

        .aurosLanguageOption.active {
          border-color:
            rgba(
              99,
              221,
              255,
              0.16
            );

          background:
            rgba(
              99,
              221,
              255,
              0.07
            );

          color: white;
        }

        .aurosLanguageCode {
          width: 31px;
          height: 25px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.13
            );

          border-radius: 7px;

          background:
            rgba(
              99,
              221,
              255,
              0.05
            );

          color: #76e3ff;

          font-size: 9px;
          font-weight: 900;
        }

        .aurosLanguageName {
          flex: 1;

          font-size: 11px;
          font-weight: 700;
        }

        .aurosLanguageCheck {
          color: #63ddff;

          font-size: 11px;
          font-weight: 900;
        }

        .aurosLanguageButton:focus-visible,
        .aurosLanguageOption:focus-visible {
          outline:
            2px solid
            rgba(
              99,
              221,
              255,
              0.8
            );

          outline-offset: 2px;
        }

        @media (
          max-width:
            700px
        ) {
          .aurosLanguageButton {
            min-height: 36px;
          }

          .aurosLanguageMenu {
            position: fixed;

            top: auto;
            right: 12px;
            bottom: 12px;
            left: 12px;

            width: auto;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .aurosLanguageButton,
          .aurosLanguageButton
            svg.chevron {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5M12 3.5C9.8 5.8 8.7 8.6 8.7 12s1.1 6.2 3.3 8.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({
  open,
}: {
  open: boolean;
}) {
  return (
    <svg
      className={
        open
          ? "chevron open"
          : "chevron"
      }
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m7 9.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}