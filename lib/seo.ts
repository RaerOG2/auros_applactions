import type {
  Metadata,
} from "next";

export const SITE_URL =
  "https://auros-uefn.com";

export const SITE_NAME =
  "Auros Royale";

export const DEFAULT_DESCRIPTION =
  "Explore Auros Royale, discover the interactive map, read the latest news and patchnotes, browse the gallery and follow the development of the Auros experience.";

export const DEFAULT_IMAGE =
  "/auros_royale_pfp_draft_1.png";


export type SeoMetadataInput = {
  title:
    string;

  description:
    string;

  path:
    string;

  image?:
    string | null;

  keywords?:
    string[];

  noIndex?:
    boolean;

  type?:
    "website" | "article";
};


export type SeoNewsRecord = {
  id:
    string;

  title:
    string;

  slug:
    string;

  summary:
    string | null;

  content:
    string | null;

  image_url:
    string | null;

  created_at:
    string | null;
};


export type SeoPatchnoteRecord = {
  id:
    string;

  version:
    string | null;

  title:
    string;

  slug:
    string;

  summary:
    string | null;

  content:
    string | null;

  cover_url:
    string | null;

  created_at:
    string | null;

  updated_at:
    string | null;
};


export function absoluteUrl(
  value:
    string
) {
  if (
    /^https?:\/\//i.test(
      value
    )
  ) {
    return value;
  }


  return `${SITE_URL}${
    value.startsWith(
      "/"
    )
      ? value
      : `/${value}`
  }`;
}


export function createSeoMetadata({
  title,
  description,
  path,
  image,
  keywords,
  noIndex =
    false,
  type =
    "website",
}: SeoMetadataInput): Metadata {
  const canonical =
    absoluteUrl(
      path
    );


  const socialImage =
    absoluteUrl(
      image ||
        DEFAULT_IMAGE
    );


  return {
    title,

    description,

    keywords,

    alternates: {
      canonical,
    },

    openGraph: {
      type,

      locale:
        "en_US",

      siteName:
        SITE_NAME,

      url:
        canonical,

      title,

      description,

      images: [
        {
          url:
            socialImage,

          alt:
            title,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,

      images: [
        socialImage,
      ],
    },

    robots: noIndex
      ? {
          index:
            false,

          follow:
            false,

          nocache:
            true,

          googleBot: {
            index:
              false,

            follow:
              false,

            noimageindex:
              true,
          },
        }
      : {
          index:
            true,

          follow:
            true,

          googleBot: {
            index:
              true,

            follow:
              true,
          },
        },
  };
}


export const NO_INDEX_METADATA:
  Metadata =
  {
    robots: {
      index:
        false,

      follow:
        false,

      nocache:
        true,

      googleBot: {
        index:
          false,

        follow:
          false,

        noimageindex:
          true,
      },
    },
  };


function getSupabaseConfig() {
  const url =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;


  if (
    !url ||
    !key
  ) {
    return null;
  }


  return {
    url:
      url.replace(
        /\/$/,
        ""
      ),

    key,
  };
}


async function supabaseRestFetch<
  T
>(
  path:
    string
): Promise<T | null> {
  const config =
    getSupabaseConfig();


  if (
    !config
  ) {
    return null;
  }


  try {
    const response =
      await fetch(
        `${config.url}/rest/v1/${path}`,
        {
          headers: {
            apikey:
              config.key,

            Authorization:
              `Bearer ${config.key}`,
          },

          next: {
            revalidate:
              300,
          },
        }
      );


    if (
      !response.ok
    ) {
      console.error(
        "SEO Supabase fetch failed:",
        response.status,
        response.statusText
      );

      return null;
    }


    return (
      await response.json()
    ) as T;
  } catch (
    error
  ) {
    console.error(
      "SEO Supabase fetch error:",
      error
    );

    return null;
  }
}


export async function getNewsForSeo(
  slug:
    string
): Promise<
  SeoNewsRecord | null
> {
  const encodedSlug =
    encodeURIComponent(
      slug
    );


  const data =
    await supabaseRestFetch<
      SeoNewsRecord[]
    >(
      `news?slug=eq.${encodedSlug}&published=eq.true&select=id,title,slug,summary,content,image_url,created_at&limit=1`
    );


  return data?.[0] ??
    null;
}


export async function getPatchnoteForSeo(
  slug:
    string
): Promise<
  SeoPatchnoteRecord | null
> {
  const encodedSlug =
    encodeURIComponent(
      slug
    );


  const data =
    await supabaseRestFetch<
      SeoPatchnoteRecord[]
    >(
      `patchnotes?slug=eq.${encodedSlug}&published=eq.true&select=id,version,title,slug,summary,content,cover_url,created_at,updated_at&limit=1`
    );


  return data?.[0] ??
    null;
}


export async function getNewsSitemapEntries() {
  return (
    await supabaseRestFetch<
      Array<{
        slug:
          string;

        created_at:
          string | null;
      }>
    >(
      "news?published=eq.true&select=slug,created_at&order=created_at.desc"
    )
  ) ?? [];
}


export async function getPatchnoteSitemapEntries() {
  return (
    await supabaseRestFetch<
      Array<{
        slug:
          string;

        created_at:
          string | null;

        updated_at:
          string | null;
      }>
    >(
      "patchnotes?published=eq.true&select=slug,created_at,updated_at&order=created_at.desc"
    )
  ) ?? [];
}


export function createBreadcrumbJsonLd(
  items:
    Array<{
      name:
        string;

      path:
        string;
    }>
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
            index +
            1,

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


export function serializeJsonLd(
  data:
    unknown
) {
  return JSON.stringify(
    data
  ).replace(
    /</g,
    "\\u003c"
  );
}