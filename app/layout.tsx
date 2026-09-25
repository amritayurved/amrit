import type { Metadata } from "next";
import "./globals.css";
import "./gallery-fix.css";

const META_PIXEL_ID = "2952176195138054";

export const metadata: Metadata = {
  title: "Amrit Ayurveda | Takat Power X",
  description: "Amrit Ayurveda - African Herbs Takat Power X",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <head>
        <script
          id="meta-pixel"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){
                if(f.fbq)return;
                n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
                t=b.createElement(e);t.async=!0;t.src=v;
                s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
              }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body>
        {children}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
