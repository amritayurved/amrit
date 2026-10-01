"use client";
import { useState, type FormEvent } from "react";

export default function EnquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    const website = new FormData(event.currentTarget).get("website");
    try {
      const response = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, consent, website }) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "जानकारी सेव नहीं हुई। दोबारा कोशिश करें।");
      setSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : "कनेक्शन जाँचकर दोबारा कोशिश करें।"); }
    finally { setBusy(false); }
  }
  return <main className="enquiry-shell"><section className="enquiry-card">
    <div className="enquiry-brand"><span aria-hidden="true">अ</span><div><strong>AMRIT</strong><small>AYURVEDA</small></div></div>
    {saved ? <div className="enquiry-success" role="status"><span aria-hidden="true">✓</span><h1>आपकी जानकारी मिल गई है</h1><p>हमारी टीम प्रोडक्ट की जानकारी के लिए आपसे संपर्क करेगी।</p><p>धन्यवाद!</p></div> : <>
      <p className="enquiry-kicker">AMRIT URJA</p><h1>मुझे कॉल करें</h1><p className="enquiry-intro">अपना नाम और मोबाइल नंबर भेजें। हमारी टीम आपसे संपर्क करेगी।</p>
      <form onSubmit={submit}>
        <label htmlFor="enquiry-name">आपका नाम</label><input id="enquiry-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="अपना नाम लिखें" />
        <label htmlFor="enquiry-phone">मोबाइल नंबर</label><input id="enquiry-phone" type="tel" inputMode="numeric" autoComplete="tel-national" required pattern="[6-9][0-9]{9}" maxLength={10} value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g, "").slice(0,10))} placeholder="10 अंकों का मोबाइल नंबर" />
        <div className="enquiry-honey" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="enquiry-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)} /><span>मैं Amrit Ayurveda से इस enquiry के बारे में कॉल या WhatsApp पर संपर्क की सहमति देता/देती हूँ।</span></label>
        {error && <p className="enquiry-error" role="alert">{error}</p>}
        <button disabled={busy} type="submit">{busy ? "भेज रहे हैं…" : "मुझे कॉल करें"}</button>
      </form><p className="enquiry-note">यह केवल जानकारी के लिए है। इससे कोई ऑर्डर या भुगतान नहीं होगा।</p>
    </>}
  </section></main>;
}
