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
  getPatchnoteForSeo,
} from "../../../lib/seo";

import {
  createBreadcrumbStructuredData,
  createPatchnoteArticleStructuredData,
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


  const note =
    await getPatchnoteForSeo(
      slug
    );


  if (
    !note
  ) {
    return {
      title:
        "Patchnote",

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }


  const description =
    note.summary?.trim() ||
    note.content
      ?.replace(
        /\s+/g,
        " "
      )
      .trim()
      .slice(
        0,
        160
      ) ||
    `Read the latest ${SITE_NAME} patchnote.`;


  const title =
    note.version
      ? `${note.title} — ${note.version}`
      : note.title;


  return createSeoMetadata({
    title,

    description,

    path:
      `/patchnotes/${note.slug}`,

    image:
      note.cover_url,

    type:
      "article",

    keywords: [
      "Auros Patchnotes",
      "Auros Royale Update",
      note.version ||
        "",
      note.title,
    ].filter(
      Boolean
    ),
  });
}


export default async function PatchnoteArticleLayout({
  children,
  params,
}: Props) {
  const {
    slug,
  } =
    await params;


  const note =
    await getPatchnoteForSeo(
      slug
    );


  const title =
    note?.version
      ? `${note.title} ${note.version}`
      : note?.title ||
        "Patchnote";


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
          "Patchnotes",

        path:
          "/patchnotes",
      },

      {
        name:
          title,

        path:
          `/patchnotes/${slug}`,
      },
    ]);


  const articleData =
    note
      ? createPatchnoteArticleStructuredData({
          title:
            note.title,

          version:
            note.version,

          description:
            note.summary,

          slug:
            note.slug,

          image:
            note.cover_url,

          createdAt:
            note.created_at,

          updatedAt:
            note.updated_at,
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
              "Patchnotes",

            href:
              "/patchnotes",
          },

          {
            label:
              title,
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