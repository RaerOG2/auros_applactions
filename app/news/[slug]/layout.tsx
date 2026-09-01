import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import Breadcrumbs from "../../../components/seo/Breadcrumbs";
import StructuredData from "../../../components/seo/StructuredData";

import {
  SITE_NAME,
  createSeoMetadata,
  getNewsForSeo,
} from "../../../lib/seo";

import {
  createBreadcrumbStructuredData,
  createNewsArticleStructuredData,
} from "../../../lib/structured-data";


type Props = {
  children:
    ReactNode;

  params:
    Promise<{
      slug:
        string;
    }>;
};


export async function generateMetadata({
  params,
}: {
  params:
    Promise<{
      slug:
        string;
    }>;
}): Promise<Metadata> {
  const {
    slug,
  } =
    await params;


  const item =
    await getNewsForSeo(
      slug
    );


  if (
    !item
  ) {
    return {
      title:
        "News Article",

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }


  const description =
    item.summary?.trim() ||
    item.content
      ?.replace(
        /\s+/g,
        " "
      )
      .trim()
      .slice(
        0,
        160
      ) ||
    `Read the latest news from ${SITE_NAME}.`;


  return createSeoMetadata({
    title:
      item.title,

    description,

    path:
      `/news/${item.slug}`,

    image:
      item.image_url,

    type:
      "article",

    keywords: [
      "Auros News",
      "Auros Royale",
      item.title,
    ],
  });
}


export default async function NewsArticleLayout({
  children,
  params,
}: Props) {
  const {
    slug,
  } =
    await params;


  const item =
    await getNewsForSeo(
      slug
    );


  const breadcrumbData =
    createBreadcrumbStructuredData([
      {
        name:
          "Home",

        path:
          "/",
      },

      {
        name:
          "News",

        path:
          "/news",
      },

      {
        name:
          item?.title ||
          "Article",

        path:
          `/news/${slug}`,
      },
    ]);


  const articleData =
    item
      ? createNewsArticleStructuredData({
          title:
            item.title,

          description:
            item.summary,

          slug:
            item.slug,

          image:
            item.image_url,

          createdAt:
            item.created_at,
        })
      : null;


  return (
    <>
      <Breadcrumbs
        items={[
          {
            label:
              "Home",

            href:
              "/",
          },

          {
            label:
              "News",

            href:
              "/news",
          },

          {
            label:
              item?.title ||
              "Article",
          },
        ]}
      />


      <StructuredData
        data={
          breadcrumbData
        }
      />


      {articleData ? (
        <StructuredData
          data={
            articleData
          }
        />
      ) : null}


      {
        children
      }
    </>
  );
}