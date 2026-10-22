import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Developers",
  description: "Meet the developers and creative team building Auros Royale.",
  path: "/developers",
  keywords: ["Auros Developers", "Auros Royale Team", "Auros UEFN Developers", "Auros Team"],
});

export default function DevelopersLayout({ children }: { children: ReactNode }) {
  return children;
}
