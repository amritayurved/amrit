import type { MetadataRoute } from "next";

const siteUrl = const siteUrl = "https://www.amritayurveda.shop";

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
