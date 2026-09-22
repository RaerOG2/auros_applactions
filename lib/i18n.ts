export const SUPPORTED_LANGUAGES = [
  "en",
  "de",
  "es",
  "fr",
] as const;

export type Language =
  (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language =
  "en";

export const LANGUAGE_STORAGE_KEY =
  "auros-language";

export type TranslationDictionary = {
  common: {
    language: string;
    account: string;
    signedIn: string;
    logout: string;
    loggingOut: string;
  };

  navigation: {
    home: string;
    map: string;
    news: string;
    patchnotes: string;
    gallery: string;
    status: string;
    login: string;
    dev: string;
    admin: string;
  };

  languageSelector: {
    label: string;
    english: string;
    german: string;
    spanish: string;
    french: string;
  };
};

export function isLanguage(
  value: string | null | undefined
): value is Language {
  return SUPPORTED_LANGUAGES.includes(
    value as Language
  );
}