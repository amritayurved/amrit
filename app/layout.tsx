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
  return <html lang="hi"><head><script id="meta-pixel" dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init","2952176195138054");window.amritPageViewEventId="pageview_"+crypto.randomUUID();fbq("track","PageView",{},{eventID:window.amritPageViewEventId});` }} /></head><body>{children}<noscript><img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=2952176195138054&ev=PageView&noscript=1" alt="" /></noscript></body></html>;
}
