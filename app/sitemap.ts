import type { MetadataRoute } from "next";

const siteUrl = "https://amrit-ayurveda.rohitsangwan517.chatgpt.site";

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
