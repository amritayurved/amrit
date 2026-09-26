"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const packs = [
  { qty: 1, price: 999, label: "1 Pack", detail: "1 महीने का कोर्स" },
  { qty: 2, price: 1699, label: "2 Packs", detail: "2 महीने का कोर्स", badge: "Best Seller" },
  { qty: 3, price: 1999, label: "3 Packs", detail: "3 महीने का कोर्स", badge: "Best Value" },
] as const;

export default function StoreOrder() {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const orderRef = useRef<{ key: string; id: string } | null>(null);
  const pack = packs.find(item => item.qty === qty) ?? packs[0];

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href^="/checkout?product=takat-power-x"]');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
      event.preventDefault();
      const requested = Number(new URL(link.href).searchParams.get("qty") || 1);
      setQty(packs.some(item => item.qty === requested) ? requested : 1);
      setError("");
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, saving]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("कृपया पूरा नाम भरें।");
    if (!/^[6-9]\d{9}$/.test(mobile)) return setError("सही 10 अंकों का मोबाइल नंबर भरें।");
    if (address.trim().length < 5) return setError("पूरा डिलीवरी पता भरें।");
    if (!/^\d{6}$/.test(pincode)) return setError("सही 6 अंकों का पिनकोड भरें।");
    setSaving(true);
    try {
      const key = JSON.stringify([qty, name.trim(), mobile, address.trim(), pincode]);
      if (orderRef.current?.key !== key) orderRef.current = { key, id: crypto.randomUUID() };
      const response = await fetch("/api/website-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: name.trim(), phone: mobile, address: address.trim(), pincode,
          product: "TAKAT POWER X", quantity: String(qty), payment: "COD",
          amount: String(pack.price), state: "Unknown", district: "Unknown", city: "Unknown",
          notes: "150g Bottle • Store popup", order_type: "Order",
          order_id: orderRef.current.id, website: window.location.hostname,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok !== true || !result?.order?.orderCode) {
        throw new Error(result?.error || "ऑर्डर सेव नहीं हुआ। कृपया दोबारा कोशिश करें।");
      }
      sessionStorage.setItem("amrit-order-success", JSON.stringify({
        id: String(result.order.orderCode), productId: "takat-power-x", productName: "TAKAT POWER X",
        quantity: qty, total: pack.price, payment: "COD", upiUrl: "",
      }));
      if (typeof (window as Window & { fbq?: (...args: unknown[]) => void }).fbq === "function") {
        (window as Window & { fbq: (...args: unknown[]) => void }).fbq("track", "Purchase", { value: pack.price, currency: "INR" });
      }
      window.location.assign("/order-success");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ऑर्डर सेव नहीं हुआ। कृपया दोबारा कोशिश करें।");
      setSaving(false);
    }
  }

  if (!open) return null;
  return (
    <div className="storeOrderOverlay" onMouseDown={() => { if (!saving) setOpen(false); }}>
      <section className="storeOrderCard" role="dialog" aria-modal="true" aria-labelledby="store-order-title" onMouseDown={event => event.stopPropagation()}>
        <button className="storeOrderClose" type="button" aria-label="ऑर्डर फॉर्म बंद करें" onClick={() => { if (!saving) setOpen(false); }}>×</button>
        <div className="storeOrderBanner"><img src="/takat-power-x.jpg" alt="TAKAT POWER X पैक"/><span>AMRIT AYURVEDA<br/><strong>TAKAT POWER X</strong></span></div>
        <form onSubmit={event => void submit(event)} className="storeOrderBody">
          <h2 id="store-order-title">अपना पैक चुनें — COD उपलब्ध</h2>
          <p className="storeOrderSub">कोई अग्रिम भुगतान नहीं · डिलीवरी पर भुगतान करें</p>
          <div className="storeOrderAssurance"><strong>सुरक्षित ऑर्डर</strong><span>पैक चुनें और अपना डिलीवरी पता भरें।</span></div>
          <div className="storePackGrid" aria-label="पैक चुनें">
            {packs.map(item => <button type="button" key={item.qty} className={qty === item.qty ? "selected" : ""} aria-pressed={qty === item.qty} onClick={() => setQty(item.qty)}>
              {"badge" in item && <i>{item.badge}</i>}<span>{item.label}</span><strong>₹{item.price.toLocaleString("en-IN")}</strong><small>{item.detail}</small>
            </button>)}
          </div>
          <div className="storeOrderSummary"><span>{pack.label} — {pack.detail}</span><strong>₹{pack.price.toLocaleString("en-IN")}</strong></div>
          <label>पूरा नाम *<input required autoComplete="name" placeholder="जैसे: राहुल शर्मा" value={name} onChange={event => setName(event.target.value)} /></label>
          <label>मोबाइल नंबर * (10 अंक)<span className="storePhoneField"><span>+91</span><input required type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210" value={mobile} onChange={event => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))} /></span></label>
          <label>पूरा पता *<textarea required rows={2} autoComplete="street-address" placeholder="घर/फ्लैट नंबर, गली, मोहल्ला, शहर" value={address} onChange={event => setAddress(event.target.value)} /></label>
          <label>पिनकोड * (6 अंक)<input required type="text" inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="जैसे: 110001" value={pincode} onChange={event => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))} /></label>
          {error && <p className="storeOrderError" role="alert">{error}</p>}
          <div className="storeOrderTrust"><span>Free Delivery</span><span>सुरक्षित पैकिंग</span><span>COD Available</span></div>
          <button className="storeOrderSubmit" type="submit" disabled={saving}>{saving ? "ऑर्डर सेव हो रहा है…" : `₹${pack.price.toLocaleString("en-IN")} — COD Order करें`}</button>
          <small className="storeOrderFine">आपकी जानकारी केवल ऑर्डर और डिलीवरी के लिए उपयोग होगी।</small>
        </form>
      </section>
    </div>
  );
}
