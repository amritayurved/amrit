import type { Metadata } from "next";
import "./globals.css";
import "./gallery-fix.css";

export const metadata: Metadata = {
  title: "Amrit Ayurveda | Takat Power X",
  description: "Amrit Ayurveda - African Herbs Takat Power X",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <body>
        {children}
      </body>
    </html>
  );
}
