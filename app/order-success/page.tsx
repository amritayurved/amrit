"use client";

import { useEffect, useState } from "react";

const PIXEL_ID = "1720516185901735";

type SuccessOrder = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  payment: "COD" | "Prepaid";
  upiUrl?: string;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(Number(value || 0)) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function sendMetaEvent(
  eventName: "PageView" | "Purchase",
  data: Record<string, unknown> = {},
  eventId?: string,
) {
  const tryFbq = () => {
    const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq !== "function") return false;
    if (eventId) fbq("track", eventName, data, { eventID: eventId });
    else fbq("track", eventName, data);
    return true;
  };

  const fallback = () => {
    const params = new URLSearchParams({
      id: PIXEL_ID,
      ev: eventName,
      noscript: "1",
      dl: window.location.href,
      rl: document.referrer || "",
      ts: String(Date.now()),
    });
    if (eventId) params.set("eid", eventId);
    Object.entries(data).forEach(([key, value]) => {
      const serialized = Array.isArray(value) || (value && typeof value === "object")
        ? JSON.stringify(value)
        : String(value ?? "");
      params.set(`cd[${key}]`, serialized);
    });
    const img = new window.Image(1, 1);
    img.referrerPolicy = "no-referrer-when-downgrade";
    img.src = `https://www.facebook.com/tr?${params.toString()}`;
  };

  if (tryFbq()) return;

  let attempts = 0;
  const retry = window.setInterval(() => {
    attempts += 1;
    if (tryFbq()) {
      window.clearInterval(retry);
      return;
    }
    if (attempts >= 12) {
      window.clearInterval(retry);
      fallback();
    }
  }, 250);
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<SuccessOrder | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("amrit-order-success");
    const parsed = raw ? JSON.parse(raw) as SuccessOrder : null;
    setOrder(parsed);

    if (parsed?.id) {
      const purchaseKey = `amrit-success-purchase-${parsed.id}`;
      if (localStorage.getItem(purchaseKey) !== "sent") {
        const purchaseTimer = window.setTimeout(() => {
          sendMetaEvent("Purchase", {
            value: Number(parsed.total || 0),
            currency: "INR",
            content_name: parsed.productName,
            content_ids: [parsed.productId],
            content_type: "product",
            num_items: Number(parsed.quantity || 1),
          }, parsed.id);
          localStorage.setItem(purchaseKey, "sent");
        }, 700);
        return () => {
          window.clearTimeout(purchaseTimer);
        };
      }
    }

    return undefined;
  }, []);

  return (
    <main style={{minHeight:"100vh",background:"#0b0b0d",color:"#fff",display:"grid",placeItems:"center",padding:20,fontFamily:"Arial,sans-serif"}}>
      <section style={{width:"100%",maxWidth:560,background:"#17171b",border:"1px solid #333",borderRadius:22,padding:24,textAlign:"center"}}>
        <div style={{fontSize:48}}>✓</div>
        <h1 style={{margin:"8px 0"}}>Order Confirmed</h1>
        <p style={{opacity:.75}}>आपका order सफलतापूर्वक receive हो गया है।</p>

        {order ? (
          <>
            <p style={{opacity:.8}}>Order ID: <b>{order.id}</b></p>
            <p><b>{order.productName}</b> × {order.quantity}</p>
            <p style={{fontSize:30,fontWeight:900}}>₹{money(order.total)}</p>

            {order.payment === "Prepaid" && order.upiUrl ? (
              <>
                <p>अब UPI payment पूरा करें।</p>
                <a href={order.upiUrl} style={{display:"block",padding:"15px 18px",borderRadius:12,background:"#16883f",color:"#fff",textDecoration:"none",fontWeight:900}}>
                  UPI PAYMENT खोलें
                </a>
              </>
            ) : (
              <p style={{fontWeight:800}}>Cash on Delivery • Parcel मिलने पर payment करें।</p>
            )}
          </>
        ) : (
          <p>Order confirmation सुरक्षित हो चुका है।</p>
        )}

        <a href="/" style={{display:"block",marginTop:18,color:"#fff"}}>← Website पर वापस जाएँ</a>
      </section>
    </main>
  );
}
