import type { MetadataRoute } from "next";

const siteUrl = "https://amrit-kohl.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-08-21"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
