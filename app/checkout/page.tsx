"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const UPI_ID = "8295820654@okbizaxis";

type ProductId = "takat-power-x" | "max-x7-x100-combo";
type PaymentMode = "COD" | "Prepaid";

const PRODUCTS: Record<ProductId, {
  name: string;
  detail: string;
  cod: number;
  prepaid: number;
  image: string;
}> = {
  "takat-power-x": {
    name: "TAKAT POWER X",
    detail: "150g Bottle",
    cod: 999,
    prepaid: 899.10,
    image: "/takat-power-x.jpg",
  },
  "max-x7-x100-combo": {
    name: "MAX X7 Capsule + MAX X100 Oil Combo",
    detail: "30 Capsule Bottle + Massage Oil",
    cod: 2500,
    prepaid: 1499,
    image: "/max-x7-capsule.webp",
  },
};

function money(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

async function submitDirectlyToCrm(fields: Record<string, string>) {
  const response = await fetch("/api/website-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.ok !== true || !result?.order?.orderCode) {
    throw new Error(result?.error || "Order save नहीं हुआ। कृपया दोबारा कोशिश करें।");
  }
  return result;
}

export default function CheckoutPage() {
  const [productId, setProductId] = useState<ProductId>("takat-power-x");
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState<PaymentMode>("COD");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const pendingOrder = useRef<{ key: string; id: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("product");
    const resolvedProduct = p === "max-x7-x100-combo" ? "max-x7-x100-combo" : "takat-power-x";
    if (p === "max-x7-x100-combo" || p === "takat-power-x") setProductId(p);
    const q = Number(params.get("qty") || 1);
    if (Number.isFinite(q)) setQty(Math.max(1, Math.min(10, q)));

    const pay = params.get("payment");
    if (pay === "COD" || pay === "Prepaid") setPayment(pay);

    void resolvedProduct;
  }, []);

  const product = PRODUCTS[productId];
  const unit = payment === "Prepaid" ? product.prepaid : product.cod;
  const total = useMemo(() => Number((unit * qty).toFixed(2)), [unit, qty]);

  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: "AMRIT AYURVEDA",
      tn: `Amrit Ayurveda ${product.name}`,
      am: total.toFixed(2),
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  }, [product.name, total]);

  async function placeOrder() {
    setError("");
    if (name.trim().length < 2) return setError("कृपया पूरा नाम भरें।");
    if (!/^[6-9]\d{9}$/.test(mobile)) return setError("सही 10-digit mobile number भरें।");
    if (address.trim().length < 5) return setError("पूरा delivery address भरें।");
    if (!/^\d{6}$/.test(pincode)) return setError("सही 6-digit PIN code भरें।");

    setSaving(true);
    try {
      const orderKey = JSON.stringify([productId, qty, payment, name.trim(), mobile, address.trim(), pincode]);
      if (pendingOrder.current?.key !== orderKey) {
        pendingOrder.current = { key: orderKey, id: crypto.randomUUID() };
      }
      const orderCode = pendingOrder.current.id;
      const orderFields = {
        customer: name.trim(),
        phone: mobile,
        address: address.trim(),
        pincode,
        product: product.name,
        quantity: String(qty),
        payment,
        amount: String(total),
        state: "Unknown",
        district: "Unknown",
        city: "Unknown",
        notes: `${product.detail} • Main domain checkout`,
        order_type: "Order",
        order_id: orderCode,
        website: window.location.hostname,
      };

      const result = await submitDirectlyToCrm(orderFields);
      const id = String(result.order.orderCode);
      setOrderId(id);

      const successPayload = {
        id,
        customerName: name.trim(),
        productId,
        productName: product.name,
        quantity: qty,
        total,
        payment,
        upiUrl: payment === "Prepaid" ? upiUrl : "",
      };
      sessionStorage.setItem("amrit-order-success", JSON.stringify(successPayload));

                  // Meta Pixel Purchase event — sirf amount aur currency, koi product detail nahi
      try {
        if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
          (window as any).fbq("track", "Purchase", {
            value: total,
            currency: "INR",
          });
        }
      } catch (e) {
        // Silently ignore agar fbq load na hua ho
      }

      // Thoda ruk kar redirect karein taki tracking event bhejne ka time mil jaaye
         setTimeout(() => {
     window.location.assign("/order-success");
   }, 300);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Order save नहीं हुआ। दोबारा try करें।");
    } finally {
      setSaving(false);
    }
  }

  if (orderId) {
    return (
      <main style={{minHeight:"100vh",background:"#0b0b0d",color:"#fff",display:"grid",placeItems:"center",padding:20,fontFamily:"Arial,sans-serif"}}>
        <section style={{width:"100%",maxWidth:560,background:"#17171b",border:"1px solid #333",borderRadius:22,padding:24,textAlign:"center"}}>
          <div style={{fontSize:44}}>✓</div>
          <h1 style={{margin:"8px 0"}}>Order Confirmed</h1>
          <p style={{opacity:.8}}>Order ID: <b>{orderId}</b></p>
          <p><b>{product.name}</b> × {qty}</p>
          <p style={{fontSize:28,fontWeight:900}}>₹{money(total)}</p>
          {payment === "Prepaid" ? (
            <>
              <p>अब UPI payment पूरा करें।</p>
              <a href={upiUrl} style={{display:"block",padding:"15px 18px",borderRadius:12,background:"#16883f",color:"#fff",textDecoration:"none",fontWeight:900}}>UPI PAYMENT खोलें</a>
            </>
          ) : (
            <p style={{fontWeight:800}}>Cash on Delivery • Parcel मिलने पर payment करें।</p>
          )}
          <a href="/" style={{display:"block",marginTop:14,color:"#fff"}}>← Website पर वापस जाएँ</a>
        </section>
      </main>
    );
  }

  return (
    <main style={{minHeight:"100vh",background:"#0b0b0d",color:"#fff",padding:"18px 14px 40px",fontFamily:"Arial,sans-serif"}}>
      <section style={{maxWidth:720,margin:"0 auto"}}>
        <a href="/" style={{color:"#fff",textDecoration:"none"}}>← Amrit Ayurveda</a>
        <div style={{marginTop:16,background:"#17171b",border:"1px solid #333",borderRadius:22,padding:20}}>
          <p style={{margin:0,fontSize:12,fontWeight:900,letterSpacing:1.5,color:"#e0b15a"}}>SECURE MAIN-DOMAIN CHECKOUT</p>
          <h1 style={{margin:"8px 0 18px"}}>अपना Order Confirm करें</h1>

          <div style={{display:"flex",gap:14,alignItems:"center",background:"#101014",padding:14,borderRadius:16}}>
            <img src={product.image} alt={product.name} style={{width:78,height:78,objectFit:"contain",borderRadius:12,background:"#fff"}} />
            <div style={{flex:1}}>
              <b>{product.name}</b>
              <div style={{opacity:.75,fontSize:13,marginTop:4}}>{product.detail}</div>
              <div style={{marginTop:8,fontWeight:900}}>₹{money(total)}</div>
            </div>
          </div>

          <label style={{display:"block",marginTop:16}}>
            <span style={{display:"block",fontWeight:800,marginBottom:6}}>Quantity</span>
            <select value={qty} onChange={e => setQty(Number(e.target.value))} style={{width:"100%",padding:13,borderRadius:10,border:"1px solid #555",background:"#fff",color:"#111"}}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
            <button onClick={() => setPayment("COD")} style={{padding:14,borderRadius:12,border:payment==="COD"?"2px solid #e0b15a":"1px solid #555",background:"#222",color:"#fff",fontWeight:900}}>COD<br/><small>₹{money(product.cod)} / item</small></button>
            <button onClick={() => setPayment("Prepaid")} style={{padding:14,borderRadius:12,border:payment==="Prepaid"?"2px solid #e0b15a":"1px solid #555",background:"#222",color:"#fff",fontWeight:900}}>Online / UPI<br/><small>₹{money(product.prepaid)} / item</small></button>
          </div>

          <div style={{display:"grid",gap:12,marginTop:18}}>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Customer Name" autoComplete="name" style={{padding:14,borderRadius:10,border:"1px solid #555"}} />
            <input value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10 digit Mobile Number" inputMode="numeric" autoComplete="tel" style={{padding:14,borderRadius:10,border:"1px solid #555"}} />
            <textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="Home Address" autoComplete="street-address" rows={3} style={{padding:14,borderRadius:10,border:"1px solid #555",resize:"vertical"}} />
            <input value={pincode} onChange={e=>setPincode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="6 digit PIN Code" inputMode="numeric" autoComplete="postal-code" style={{padding:14,borderRadius:10,border:"1px solid #555"}} />
          </div>

          {error && <p style={{background:"#4a1515",padding:12,borderRadius:10}}>{error}</p>}

          <button onClick={placeOrder} disabled={saving} style={{width:"100%",marginTop:18,padding:16,border:0,borderRadius:12,background:"#c62828",color:"#fff",fontWeight:900,fontSize:16}}>
            {saving ? "ORDER SAVE हो रहा है…" : payment === "COD" ? `COD ORDER CONFIRM • ₹${money(total)}` : `ONLINE ORDER CONFIRM • ₹${money(total)}`}
          </button>

          <p style={{fontSize:12,opacity:.65,lineHeight:1.5,marginTop:12}}>
            यह checkout केवल amrit-kohl.vercel.app पर चलता है। आपकी order details सीधे Amrit Ayurveda CRM intake में भेजी जाती हैं।
          </p>
        </div>
      </section>
    </main>
  );
}
