import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TAKAT POWER X | Men's Daily Wellness | Amrit Ayurveda",
  description:
    "TAKAT POWER X by Amrit Ayurveda — पुरुषों की daily wellness, vitality और confidence routine के लिए Ayurvedic formulation. Online offer और COD उपलब्ध.",
  alternates: { canonical: "/meta" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "TAKAT POWER X | Amrit Ayurveda",
    description: "Men's daily wellness के लिए Ayurvedic formulation. Online offer और COD उपलब्ध.",
    url: "https://amrit-kohl.vercel.app/meta",
    type: "website",
    images: [{ url: "/takat-power-x.jpg", alt: "TAKAT POWER X" }],
  },
};

export default function MetaLandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
