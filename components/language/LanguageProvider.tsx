"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import en from "../../locales/en";
import de from "../../locales/de";
import es from "../../locales/es";
import fr from "../../locales/fr";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isLanguage,
  type Language,
  type TranslationDictionary,
} from "../../lib/i18n";

const dictionaries: Record<
  Language,
  TranslationDictionary
> = {
  en,
  de,
  es,
  fr,
};

type LanguageContextValue = {
  language: Language;

  dictionary:
    TranslationDictionary;

  setLanguage: (
    language: Language
  ) => void;
};

const LanguageContext =
  createContext<
    LanguageContextValue | undefined
  >(undefined);

export default function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    language,
    setLanguageState,
  ] =
    useState<Language>(
      DEFAULT_LANGUAGE
    );

  useEffect(() => {
    try {
      const storedLanguage =
        window.localStorage.getItem(
          LANGUAGE_STORAGE_KEY
        );

      if (
        isLanguage(
          storedLanguage
        )
      ) {
        setLanguageState(
          storedLanguage
        );

        document.documentElement.lang =
          storedLanguage;
      } else {
        document.documentElement.lang =
          DEFAULT_LANGUAGE;
      }
    } catch (
      error
    ) {
      console.error(
        "[i18n] Failed to load language:",
        error
      );

      document.documentElement.lang =
        DEFAULT_LANGUAGE;
    }
  }, []);

  const setLanguage =
    useCallback(
      (
        nextLanguage:
          Language
      ) => {
        setLanguageState(
          nextLanguage
        );

        document.documentElement.lang =
          nextLanguage;

        try {
          window.localStorage.setItem(
            LANGUAGE_STORAGE_KEY,
            nextLanguage
          );
        } catch (
          error
        ) {
          console.error(
            "[i18n] Failed to save language:",
            error
          );
        }
      },
      []
    );

  const value =
    useMemo(
      () => ({
        language,

        dictionary:
          dictionaries[
            language
          ],

        setLanguage,
      }),
      [
        language,
        setLanguage,
      ]
    );

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(
      LanguageContext
    );

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    );
  }

  return context;
}