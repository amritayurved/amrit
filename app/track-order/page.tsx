import type { Metadata } from "next";
import TrackingForm from "./tracking-form";

export const metadata: Metadata = { title: "Track Your Order | Amrit Ayurveda", description: "अपने ऑर्डर नंबर और मोबाइल नंबर से Amrit Ayurveda पार्सल का स्टेटस देखें।", robots: { index: false, follow: true } };

export default function TrackOrderPage() {
  return <main className="customerTrackingPage">
    <header><a href="/" className="trackingBrand">AMRIT <span>AYURVEDA</span></a><a href="/">← वेबसाइट पर वापस</a></header>
    <section className="trackingContent">
      <p className="trackingEyebrow">ORDER TRACKING</p>
      <h1>आपका पार्सल कहाँ पहुँचा?</h1>
      <p className="trackingLead">ऑर्डर नंबर और ऑर्डर करते समय दिया गया मोबाइल नंबर भरें।</p>
      <TrackingForm />
    </section>
  </main>;
}
