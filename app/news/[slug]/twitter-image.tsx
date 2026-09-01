import {
  ImageResponse,
} from "next/og";

import SocialShareCard from "../../../components/seo/SocialShareCard";

import {
  getNewsForSeo,
} from "../../../lib/seo";

import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
  getSocialCardDescription,
} from "../../../lib/social-card";

export const alt =
  "Auros Royale News";

export const size = {
  width:
    SOCIAL_CARD_WIDTH,

  height:
    SOCIAL_CARD_HEIGHT,
};

export const contentType =
  "image/png";

export default async function NewsTwitterImage({
  params,
}: {
  params:
    Promise<{
      slug:
        string;
    }>;
}) {
  const {
    slug,
  } =
    await params;

  const item =
    await getNewsForSeo(
      slug
    );

  const description =
    getSocialCardDescription(
      item?.summary ||
        item?.content
    );

  return new ImageResponse(
    (
      <SocialShareCard
        data={{
          variant:
            "news",

          eyebrow:
            "AUROS NEWS",

          title:
            item?.title ||
            "Auros Royale News",

          description:
            description ||
            "Latest news and announcements from the world of Auros Royale.",

          image:
            item?.image_url,

          badge:
            "NEWS",
        }}
      />
    ),
    {
      ...size,
    }
  );
}