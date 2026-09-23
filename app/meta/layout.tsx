import type { Metadata } from "next";
export const metadata: Metadata = { title: "Amrit Ayurveda | उत्पाद और ऑर्डर", description: "उत्पाद और ऑर्डर की जानकारी।", alternates: { canonical: "/" } };
export default function MetaLandingLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
