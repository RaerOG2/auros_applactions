import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./seo";


export type BreadcrumbStructuredDataItem = {
  name: string;
  path: string;
};


export type NewsArticleStructuredDataInput = {
  title: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  createdAt?: string | null;
};


export type PatchnoteArticleStructuredDataInput = {
  title: string;
  version?: string | null;
  description?: string | null;
  slug: string;
  image?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};


export type FaqStructuredDataItem = {
  question: string;
  answer: string;
};


export function createWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",

    name: SITE_NAME,

    alternateName: "Auros",

    url: SITE_URL,

    description: DEFAULT_DESCRIPTION,

    inLanguage: "en",
  };
}


export function createOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",

    name: SITE_NAME,

    url: SITE_URL,

    logo: absoluteUrl(
      DEFAULT_IMAGE
    ),

    description:
      DEFAULT_DESCRIPTION,
  };
}


export function createVideoGameStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",

    name: SITE_NAME,

    url: SITE_URL,

    description:
      "Auros Royale is a custom Battle Royale experience created in UEFN with its own evolving island, gameplay systems, locations, story and seasonal updates.",

    gamePlatform: [
      "Fortnite",
    ],

    applicationCategory:
      "Game",

    genre: [
      "Battle Royale",
      "Action",
    ],

    operatingSystem:
      "Fortnite",

    publisher: {
      "@type":
        "Organization",

      name:
        SITE_NAME,

      url:
        SITE_URL,
    },
  };
}


export function createBreadcrumbStructuredData(
  items: BreadcrumbStructuredDataItem[]
) {
  return {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement:
      items.map(
        (
          item,
          index
        ) => ({
          "@type":
            "ListItem",

          position:
            index + 1,

          name:
            item.name,

          item:
            absoluteUrl(
              item.path
            ),
        })
      ),
  };
}


export function createNewsArticleStructuredData({
  title,
  description,
  slug,
  image,
  createdAt,
}: NewsArticleStructuredDataInput) {
  const articleUrl =
    absoluteUrl(
      `/news/${slug}`
    );


  return {
    "@context":
      "https://schema.org",

    "@type":
      "NewsArticle",

    headline:
      title,

    description:
      description ||
      undefined,

    image:
      image
        ? [
            absoluteUrl(
              image
            ),
          ]
        : [
            absoluteUrl(
              DEFAULT_IMAGE
            ),
          ],

    datePublished:
      createdAt ||
      undefined,

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        articleUrl,
    },

    author: {
      "@type":
        "Organization",

      name:
        SITE_NAME,

      url:
        SITE_URL,
    },

    publisher: {
      "@type":
        "Organization",

      name:
        SITE_NAME,

      url:
        SITE_URL,

      logo: {
        "@type":
          "ImageObject",

        url:
          absoluteUrl(
            DEFAULT_IMAGE
          ),
      },
    },
  };
}


export function createPatchnoteArticleStructuredData({
  title,
  version,
  description,
  slug,
  image,
  createdAt,
  updatedAt,
}: PatchnoteArticleStructuredDataInput) {
  const articleUrl =
    absoluteUrl(
      `/patchnotes/${slug}`
    );


  return {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    headline:
      version
        ? `${title} — ${version}`
        : title,

    description:
      description ||
      undefined,

    image:
      image
        ? [
            absoluteUrl(
              image
            ),
          ]
        : [
            absoluteUrl(
              DEFAULT_IMAGE
            ),
          ],

    datePublished:
      createdAt ||
      undefined,

    dateModified:
      updatedAt ||
      createdAt ||
      undefined,

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        articleUrl,
    },

    author: {
      "@type":
        "Organization",

      name:
        SITE_NAME,

      url:
        SITE_URL,
    },

    publisher: {
      "@type":
        "Organization",

      name:
        SITE_NAME,

      url:
        SITE_URL,

      logo: {
        "@type":
          "ImageObject",

        url:
          absoluteUrl(
            DEFAULT_IMAGE
          ),
      },
    },
  };
}


export function createFaqPageStructuredData(
  items:
    FaqStructuredDataItem[]
) {
  return {
    "@context":
      "https://schema.org",

    "@type":
      "FAQPage",

    mainEntity:
      items.map(
        (
          item
        ) => ({
          "@type":
            "Question",

          name:
            item.question,

          acceptedAnswer: {
            "@type":
              "Answer",

            text:
              item.answer,
          },
        })
      ),
  };
}