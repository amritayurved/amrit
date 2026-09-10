import type { MetadataRoute } from "next";

const siteUrl = "https://amrit-ayurveda.rohitsangwan517.chatgpt.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
