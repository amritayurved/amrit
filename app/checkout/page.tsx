"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ProductKey = "takat-power-x" | "max-x7-x100-combo";

const products = {
  "takat-power-x": {
    name: "TAKAT POWER X",
    price: 1499,
    label: "TAKAT POWER X",
  },
  "max-x7-x100-combo": {
    name: "MAX X7 Capsule + MAX X100 Oil Combo",
    price: 2500,
    label: "MAX X7 + MAX X100 Combo",
  },
} as const;

export default function CheckoutPage() {
  const [productKey, setProductKey] = useState<ProductKey>("takat-power-x");
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("product");
    if (p === "takat-power-x" || p === "max-x7-x100-combo") setProductKey(p);
    const q = Number(params.get("qty") || "1");
    if (Number.isFinite(q) && q >= 1 && q <= 10) setQty(Math.floor(q));
  }, []);

  const product = products[productKey];
  const total = useMemo(() => product.price * qty, [product, qty]);

  async function submitOrder(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
    const cleanPin = pincode.replace(/\D/g, "").slice(0, 6);

    if (
      name.trim().length < 2 ||
      !/^[6-9]\d{9}$/.test(cleanMobile) ||
      address.trim().length < 5 ||
      !/^\d{6}$/.test(cleanPin)
    ) {
      setMessage("कृपया नाम, 10-digit mobile, address और 6-digit PIN सही भरें।");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/website-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: name.trim(),
          phone: cleanMobile,
          address: address.trim(),
          pincode: cleanPin,
          product: product.name,
          quantity: String(qty),
          payment: "COD",
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok !== true) {
        throw new Error(String(result?.error || "Original CRM save failed"));
      }

      const code = result?.order?.orderCode || result?.order?.id || "Saved";
      setSuccess(true);
      setMessage(
        result?.duplicate
          ? `✓ Order पहले से CRM में मौजूद है। Order: ${code}`
          : `✓ Order original CRM backend में save हो गया। Order: ${code}`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Order save नहीं हुआ: ${error.message}`
          : "Order save नहीं हुआ।",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{minHeight:"100vh",background:"#0c0c0c",color:"#fff",padding:"24px 14px",fontFamily:"Arial, sans-serif"}}>
      <div style={{maxWidth:620,margin:"0 auto"}}>
        <a href="/" style={{color:"#f0c36b",textDecoration:"none",fontWeight:700}}>← AMRIT AYURVEDA</a>
        <div style={{marginTop:18,background:"#171717",border:"1px solid #333",borderRadius:18,padding:20}}>
          <div style={{fontSize:12,fontWeight:800,letterSpacing:1.2,color:"#f0c36b"}}>ORIGINAL CRM DIRECT • V2</div>
          <h1 style={{fontSize:28,margin:"10px 0"}}>Order Checkout</h1>
          <p style={{color:"#bbb",marginTop:0}}>यह order आपके original Amrit Ayurveda CRM backend में save होगा।</p>

          <form onSubmit={submitOrder} style={{display:"grid",gap:14}}>
            <label style={{display:"grid",gap:6}}>
              <span>Product</span>
              <select value={productKey} onChange={e=>setProductKey(e.target.value as ProductKey)} style={{padding:13,borderRadius:10}}>
                <option value="takat-power-x">TAKAT POWER X</option>
                <option value="max-x7-x100-combo">MAX X7 + MAX X100 Combo</option>
              </select>
            </label>

            <label style={{display:"grid",gap:6}}>
              <span>Quantity</span>
              <input type="number" min={1} max={10} value={qty} onChange={e=>setQty(Math.max(1,Math.min(10,Number(e.target.value)||1)))} style={{padding:13,borderRadius:10}} />
            </label>

            <label style={{display:"grid",gap:6}}>
              <span>Customer Name *</span>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="पूरा नाम" style={{padding:13,borderRadius:10}} />
            </label>

            <label style={{display:"grid",gap:6}}>
              <span>Mobile Number *</span>
              <input value={mobile} inputMode="numeric" maxLength={10} onChange={e=>setMobile(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10 digit mobile" style={{padding:13,borderRadius:10}} />
            </label>

            <label style={{display:"grid",gap:6}}>
              <span>Home Address *</span>
              <textarea value={address} onChange={e=>setAddress(e.target.value)} rows={3} placeholder="मकान नंबर, गली, शहर/गाँव" style={{padding:13,borderRadius:10}} />
            </label>

            <label style={{display:"grid",gap:6}}>
              <span>PIN Code *</span>
              <input value={pincode} inputMode="numeric" maxLength={6} onChange={e=>setPincode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="6 digit PIN" style={{padding:13,borderRadius:10}} />
            </label>

            <div style={{padding:14,borderRadius:12,background:"#222",display:"flex",justifyContent:"space-between"}}>
              <span>Cash on Delivery</span>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            <button type="submit" disabled={saving} style={{padding:16,border:0,borderRadius:12,background:"#c62828",color:"#fff",fontWeight:900,fontSize:16}}>
              {saving ? "ORIGINAL CRM में SAVE हो रहा है…" : "COD ORDER CONFIRM करें"}
            </button>

            {message && (
              <div role="status" style={{
                padding:12,
                borderRadius:10,
                background: success ? "#153d2c" : "#4a1f26",
                color:"#fff"
              }}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
