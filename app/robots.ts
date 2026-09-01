import type {
  MetadataRoute,
} from "next";

import {
  SITE_URL,
} from "../lib/seo";


export default function robots():
  MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent:
          "*",

        allow:
          "/",

        disallow: [
          "/admin/",
          "/dev/",
          "/login",
          "/beta-login",
          "/chat",
          "/status",
          "/Test/",
        ],
      },
    ],

    sitemap:
      `${SITE_URL}/sitemap.xml`,

    host:
      SITE_URL,
  };
}