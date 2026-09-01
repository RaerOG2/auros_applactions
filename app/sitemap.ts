import type {
  MetadataRoute,
} from "next";

import {
  SITE_URL,
  getNewsSitemapEntries,
  getPatchnoteSitemapEntries,
} from "../lib/seo";


export default async function sitemap():
  Promise<
    MetadataRoute.Sitemap
  > {
  const [
    news,
    patchnotes,
  ] =
    await Promise.all([
      getNewsSitemapEntries(),
      getPatchnoteSitemapEntries(),
    ]);


  const staticPages:
    MetadataRoute.Sitemap =
    [
      {
        url:
          SITE_URL,

        changeFrequency:
          "weekly",

        priority:
          1,
      },

      {
        url:
          `${SITE_URL}/map`,

        changeFrequency:
          "weekly",

        priority:
          0.95,
      },

      {
        url:
          `${SITE_URL}/news`,

        changeFrequency:
          "daily",

        priority:
          0.9,
      },

      {
        url:
          `${SITE_URL}/patchnotes`,

        changeFrequency:
          "weekly",

        priority:
          0.9,
      },

      {
        url:
          `${SITE_URL}/gallery`,

        changeFrequency:
          "weekly",

        priority:
          0.8,
      },

      {
        url:
          `${SITE_URL}/faq`,

        changeFrequency:
          "monthly",

        priority:
          0.7,
      },

      {
        url:
          `${SITE_URL}/apply`,

        changeFrequency:
          "weekly",

        priority:
          0.7,
      },

      {
        url:
          `${SITE_URL}/contact`,

        changeFrequency:
          "monthly",

        priority:
          0.5,
      },
    ];


  const newsPages:
    MetadataRoute.Sitemap =
    news
      .filter(
        (
          item
        ) =>
          !!item.slug
      )
      .map(
        (
          item
        ) => ({
          url:
            `${SITE_URL}/news/${item.slug}`,

          lastModified:
            item.created_at
              ? new Date(
                  item.created_at
                )
              : undefined,

          changeFrequency:
            "monthly",

          priority:
            0.75,
        })
      );


  const patchnotePages:
    MetadataRoute.Sitemap =
    patchnotes
      .filter(
        (
          item
        ) =>
          !!item.slug
      )
      .map(
        (
          item
        ) => ({
          url:
            `${SITE_URL}/patchnotes/${item.slug}`,

          lastModified:
            item.updated_at ||
            item.created_at
              ? new Date(
                  item.updated_at ||
                    item.created_at!
                )
              : undefined,

          changeFrequency:
            "monthly",

          priority:
            0.8,
        })
      );


  return [
    ...staticPages,
    ...newsPages,
    ...patchnotePages,
  ];
}