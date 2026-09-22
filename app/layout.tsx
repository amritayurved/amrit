import type { Metadata } from "next";
import "./globals.css";
import "./gallery-fix.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://amrit-kohl.vercel.app"),
  title: "TAKAT POWER X & MAX X7 + X100 Combo | Amrit Ayurveda",
  description: "Amrit Ayurveda पुरुष wellness store—TAKAT POWER X और MAX X7 Capsule + MAX X100 Oil Combo। Limited-time online offer ₹1,499 और private delivery।",
  keywords: [
    "TAKAT POWER X",
    "MAX X7 capsule",
    "MAX X100 oil",
    "Ayurvedic capsule and oil combo",
    "Amrit Ayurveda",
    "original African herbs",
    "pure shilajit",
    "men wellness support",
    "ayurvedic wellness product",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Amrit Ayurveda | TAKAT POWER X & MAX Combo",
    description: "TAKAT POWER X और MAX X7 Capsule + MAX X100 Oil Combo—limited-time online offer ₹1,499।",
    url: "https://amrit-kohl.vercel.app",
    siteName: "Amrit Ayurveda",
    locale: "hi_IN",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Amrit Ayurveda TAKAT POWER X" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amrit Ayurveda | TAKAT POWER X & MAX Combo",
    description: "TAKAT POWER X और MAX X7 Capsule + MAX X100 Oil Combo—limited-time online offer ₹1,499।",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
