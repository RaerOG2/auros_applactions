import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import StructuredData from "../../components/seo/StructuredData";

import {
  createSeoMetadata,
} from "../../lib/seo";

import {
  createFaqPageStructuredData,
} from "../../lib/structured-data";


export const metadata:
  Metadata =
  createSeoMetadata({
    title:
      "FAQ",

    description:
      "Find answers about Auros Royale, the interactive map, website features, applications, patchnotes and the Auros community.",

    path:
      "/faq",

    keywords: [
      "Auros FAQ",
      "Auros Royale FAQ",
      "Auros Map Help",
      "Auros Applications",
      "Auros Website Help",
    ],
  });


const faqData =
  createFaqPageStructuredData([
    {
      question:
        "What is Auros Royale?",

      answer:
        "Auros Royale is a custom Battle Royale experience created in UEFN with its own island, locations, gameplay systems, story and seasonal updates.",
    },

    {
      question:
        "What can I find on the Auros website?",

      answer:
        "The Auros website includes the interactive map, map archive, timeline, patchnotes, news, gallery, FAQ and application information.",
    },

    {
      question:
        "What is the Auros interactive map?",

      answer:
        "The interactive map lets players explore Auros Royale locations, POIs, landmarks, story locations and different versions of the island.",
    },

    {
      question:
        "Can I apply to join the Auros team?",

      answer:
        "Yes. Available roles and application information can be found on the Auros applications page.",
    },
  ]);


export default function FaqLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <>
      <StructuredData
        data={
          faqData
        }
      />


      {
        children
      }
    </>
  );
}