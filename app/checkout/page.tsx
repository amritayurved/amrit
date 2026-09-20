"use client";

import { useEffect } from "react";

const NATIVE_CHECKOUT = "https://project26522.websitepublisher.ai/order.html";

export default function CheckoutRedirectPage() {
  useEffect(() => {
    const source = new URL(window.location.href);
    const target = new URL(NATIVE_CHECKOUT);
    const product = source.searchParams.get("product");
    const qty = source.searchParams.get("qty");
    if (product) target.searchParams.set("product", product);
    if (qty) target.searchParams.set("qty", qty);
    window.location.replace(target.toString());
  }, []);

  return (
    <main style={{
      minHeight:"100vh",
      display:"grid",
      placeItems:"center",
      background:"#0c0c0c",
      color:"#fff",
      padding:24,
      fontFamily:"Arial, sans-serif"
    }}>
      <div style={{textAlign:"center",maxWidth:520}}>
        <h1>Amrit Ayurveda Checkout</h1>
        <p>Secure CRM-connected checkout खोल रहे हैं…</p>
        <a
          href={NATIVE_CHECKOUT}
          style={{
            display:"inline-block",
            marginTop:12,
            padding:"14px 18px",
            borderRadius:12,
            background:"#c62828",
            color:"#fff",
            textDecoration:"none",
            fontWeight:800
          }}
        >
          CHECKOUT खोलें
        </a>
      </div>
    </main>
  );
}
