import type { Metadata } from "next";
import TrackingForm from "./tracking-form";

export const metadata: Metadata = { title: "Track Your Order | Amrit Ayurveda", description: "अपने मोबाइल नंबर से Amrit Ayurveda के नवीनतम ऑर्डर का स्टेटस देखें।", robots: { index: false, follow: true } };

export default function TrackOrderPage() {
  return <main className="customerTrackingPage">
    <header><a href="/" className="trackingBrand">AMRIT <span>AYURVEDA</span></a><a href="/">← वेबसाइट पर वापस</a></header>
    <section className="trackingContent">
      <p className="trackingEyebrow">ORDER TRACKING</p>
      <h1>आपका पार्सल कहाँ पहुँचा?</h1>
      <p className="trackingLead">सिर्फ़ ऑर्डर वाला मोबाइल नंबर भरें। ऑर्डर ID की ज़रूरत नहीं है।</p>
      <TrackingForm />
    </section>
  </main>;
}
