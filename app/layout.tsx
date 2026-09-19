import type { Metadata } from "next";
import "./globals.css";
import "./gallery-fix.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://amrit-ayurveda.rohitsangwan517.chatgpt.site"),
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
    url: "https://amrit-ayurveda.rohitsangwan517.chatgpt.site",
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

const META_PIXEL_ID = "1720516185901735";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
          }}
        />
      </head>
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
