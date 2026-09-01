import {
  DEFAULT_IMAGE,
  SITE_URL,
  absoluteUrl,
} from "./seo";

export const SOCIAL_CARD_WIDTH = 1200;
export const SOCIAL_CARD_HEIGHT = 630;

export type SocialCardVariant =
  | "default"
  | "news"
  | "patchnote";

export type SocialCardData = {
  variant: SocialCardVariant;

  eyebrow: string;

  title: string;

  description?: string | null;

  image?: string | null;

  version?: string | null;

  badge?: string | null;
};

export function getSocialCardImage(
  image?: string | null
) {
  if (!image) {
    return absoluteUrl(
      DEFAULT_IMAGE
    );
  }

  return absoluteUrl(
    image
  );
}

export function getSocialCardDomain() {
  return SITE_URL
    .replace(
      /^https?:\/\//,
      ""
    )
    .replace(
      /\/$/,
      ""
    );
}

export function getSocialCardDescription(
  value?: string | null,
  maxLength = 145
) {
  if (!value) {
    return null;
  }

  const clean =
    value
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (
    clean.length <=
    maxLength
  ) {
    return clean;
  }

  return `${clean.slice(
    0,
    maxLength - 1
  )}…`;
}

export function getPatchnoteCardEyebrow(
  title: string
) {
  const normalized =
    title.toLowerCase();

  if (
    normalized.includes(
      "website"
    )
  ) {
    return "AUROS WEBSITE UPDATE";
  }

  return "AUROS ROYALE UPDATE";
}