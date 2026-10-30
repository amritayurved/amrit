"use client";

import { useRef, useState } from "react";

type Tracking = { orderCode: string; status: string; stage: number; attention: boolean; courier: string; awb: string; shipmentStatus: string; updatedAt: string };
const steps = ["ऑर्डर मिला", "कन्फर्म", "बुकिंग", "रास्ते में", "डिलीवर"];

export default function TrackingForm() {
  const [mobile, setMobile] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const pending = useRef(false);

  async function findOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError(""); setTracking(null);
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("ऑर्डर करते समय दिया गया 10 अंकों का मोबाइल नंबर भरें।"); return;
    }
    pending.current = true; setBusy(true);
    try {
      const response = await fetch("/api/track-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile }), cache: "no-store", signal: AbortSignal.timeout(15000) });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok || !result.tracking) throw new Error(result?.error || "ट्रैकिंग अभी उपलब्ध नहीं है। कृपया बाद में कोशिश करें।");
      setTracking(result.tracking);
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== "TimeoutError" ? cause.message : "जवाब मिलने में समय लग रहा है। कृपया दोबारा कोशिश करें।");
    } finally { pending.current = false; setBusy(false); }
  }

  return <div className="customerTrackingCard">
    <form onSubmit={findOrder} aria-label="अपना ऑर्डर खोजें">
      <label htmlFor="tracking-mobile">ऑर्डर वाला मोबाइल नंबर<input id="tracking-mobile" type="tel" inputMode="numeric" value={mobile} onChange={e => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setTracking(null); setError(""); }} placeholder="10 अंक, +91 के बिना" autoComplete="off" maxLength={10} minLength={10} pattern="[6-9][0-9]{9}" required /></label>
      <button type="submit" disabled={busy}>{busy ? "स्टेटस खोज रहे हैं…" : "TRACK ORDER →"}</button>
      <p className="trackingPrivacy">इस नंबर का सबसे नया ऑर्डर दिखेगा। ऑर्डर ID की ज़रूरत नहीं है।</p>
    </form>
    {error && <p className="trackingError" role="alert">{error}</p>}
    <div aria-live="polite" aria-atomic="true">
      {tracking && <section className="trackingResult" aria-label="ऑर्डर का स्टेटस">
        <p className="trackingOrderCode">नवीनतम ऑर्डर · {tracking.orderCode}</p>
        <h2>{tracking.status}</h2>
        {!tracking.attention && <ol className="trackingSteps" aria-label="डिलीवरी के चरण">{steps.map((label, i) => <li key={label} className={i <= tracking.stage ? "complete" : ""} aria-current={i === tracking.stage ? "step" : undefined}><span aria-hidden="true">{i < tracking.stage ? "✓" : i + 1}</span>{label}</li>)}</ol>}
        {tracking.attention && <p>अधिक जानकारी के लिए हमारी सहायता टीम से संपर्क करें।</p>}
        {tracking.courier && <dl><div><dt>कूरियर</dt><dd>{tracking.courier}</dd></div><div><dt>AWB / Article No.</dt><dd>{tracking.awb}</dd></div></dl>}
        {tracking.shipmentStatus && <p className="trackingCarrierStatus">कूरियर अपडेट: {tracking.shipmentStatus}</p>}
        <p>गोपनीयता के लिए यहाँ केवल डिलीवरी की स्थिति दिखाई जाती है। नाम, पता और पूरा ऑर्डर नंबर नहीं दिखता।</p>
        {tracking.updatedAt && Number.isFinite(Date.parse(tracking.updatedAt)) && <p className="trackingUpdated">CRM में आखिरी अपडेट: {new Date(tracking.updatedAt).toLocaleString("hi-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</p>}
        <p className="trackingUpdated">कूरियर के नए स्कैन CRM में आने के बाद स्टेटस बदलेगा। नया स्टेटस देखने के लिए दोबारा Track Order दबाएँ।</p>
      </section>}
    </div>
    <div className="trackingHelp">स्टेटस देखने में परेशानी? <a href="tel:8290695226">8290695226 पर सहायता लें</a></div>
  </div>;
}
