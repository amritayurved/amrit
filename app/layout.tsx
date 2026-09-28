import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://amritayurveda.shop"),
  title: "AMRIT URJA Capsule + Oil Combo | Amrit Ayurveda",
  description: "AMRIT URJA by Amrit Ayurveda — 30 capsules और 20 ml massage oil का premium Ayurvedic wellness combo. COD और online payment available.",
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
    images: [{ url: "/amrit-urja-combo.webp", width: 360, height: 640, alt: "AMRIT URJA Capsule + Oil Combo" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "AMRIT URJA | Amrit Ayurveda",
    description: "30 Capsules + 20 ml Massage Oil premium wellness combo.",
    images: ["/amrit-urja-combo.webp"]
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="hi"><body>{children}</body></html>;
}
