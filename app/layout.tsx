import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.amritayurveda.shop"),
  title: "Amrit Urja | Amrit Ayurveda Official Website",
description: "AMRIT URJA by Amrit Ayurveda – Ayurvedic men's wellness capsules and oil combo. Explore product details, usage and ₹999 Cash on Delivery ordering.",
  keywords: [
    "AMRIT URJA",
    "Amrit Ayurveda",
    "Ayurvedic wellness combo",
    "30 capsules",
    "20 ml massage oil"
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "AMRIT URJA | Amrit Ayurveda",
    description: "30 Capsules + 20 ml Massage Oil premium wellness combo.",
    url: "https://amritayurveda.shop",
    siteName: "Amrit Ayurveda",
    locale: "hi_IN",
    type: "website",
    images: [{ url: "/amrit-urja-share-v2.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "AMRIT URJA Capsule + Oil Combo" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "AMRIT URJA | Amrit Ayurveda",
    description: "30 Capsules + 20 ml Massage Oil premium wellness combo.",
    images: ["/amrit-urja-share-v2.jpg"]
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="hi"><body>{children}</body></html>;
}
