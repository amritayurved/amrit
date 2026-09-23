import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./gallery-fix.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://amrit-kohl.vercel.app"),
  title: "Amrit Ayurveda | उत्पाद और ऑर्डर",
  description: "Amrit Ayurveda के उत्पाद, कीमत और ऑनलाइन ऑर्डर की जानकारी।",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { title: "Amrit Ayurveda", description: "उत्पाद और ऑर्डर की जानकारी।", url: "https://amrit-kohl.vercel.app", siteName: "Amrit Ayurveda", locale: "hi_IN", type: "website" },
  twitter: { card: "summary", title: "Amrit Ayurveda", description: "उत्पाद और ऑर्डर की जानकारी।" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="hi"><body>{children}
    <Script id="meta-pixel" strategy="afterInteractive">{`
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1720516185901735');
      fbq('track', 'PageView');
    `}</Script>
    <noscript><img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=1720516185901735&ev=PageView&noscript=1" alt="" /></noscript>
  </body></html>;
}
