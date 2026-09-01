import {
  ImageResponse,
} from "next/og";

import SocialShareCard from "../../../components/seo/SocialShareCard";

import {
  getPatchnoteForSeo,
} from "../../../lib/seo";

import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
  getPatchnoteCardEyebrow,
  getSocialCardDescription,
} from "../../../lib/social-card";

export const alt =
  "Auros Patchnotes";

export const size = {
  width:
    SOCIAL_CARD_WIDTH,

  height:
    SOCIAL_CARD_HEIGHT,
};

export const contentType =
  "image/png";

export default async function PatchnoteTwitterImage({
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

  const note =
    await getPatchnoteForSeo(
      slug
    );

  const description =
    getSocialCardDescription(
      note?.summary ||
        note?.content
    );

  return new ImageResponse(
    (
      <SocialShareCard
        data={{
          variant:
            "patchnote",

          eyebrow:
            getPatchnoteCardEyebrow(
              note?.title ||
                ""
            ),

          version:
            note?.version,

          title:
            note?.title ||
            "Auros Patchnotes",

          description:
            description ||
            "Discover the latest changes, improvements and features in Auros.",

          image:
            note?.cover_url,

          badge:
            "PATCHNOTES",
        }}
      />
    ),
    {
      ...size,
    }
  );
}