@@ -1,4 +1,5 @@
 import type { Metadata } from "next";
+import Script from "next/script";
 import "./globals.css";
 import "./gallery-fix.css";
 
@@ -52,7 +53,15 @@ export const metadata: Metadata = {
 export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
   return (
     <html lang="hi">
-      <body>{children}</body>
+      <body>
+        {children}
+        <Script id="meta-pixel" strategy="afterInteractive">{`
+          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
+          fbq('init', '1720516185901735');
+          fbq('track', 'PageView');
+        `}</Script>
+        <noscript><img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=1720516185901735&ev=PageView&noscript=1" alt="" /></noscript>
+      </body>
     </html>
   );
 }
