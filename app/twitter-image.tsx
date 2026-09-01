import {
  ImageResponse,
} from "next/og";

import SocialShareCard from "../components/seo/SocialShareCard";

import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
} from "../lib/social-card";

export const alt =
  "Auros Royale — Official Website";

export const size = {
  width:
    SOCIAL_CARD_WIDTH,

  height:
    SOCIAL_CARD_HEIGHT,
};

export const contentType =
  "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <SocialShareCard
        data={{
          variant:
            "default",

          eyebrow:
            "OFFICIAL WEBSITE",

          title:
            "Auros Royale",

          description:
            "Explore the evolving world of Auros Royale — interactive map, news, patchnotes, gallery and more.",

          badge:
            "AUROS",
        }}
      />
    ),
    {
      ...size,
    }
  );
}