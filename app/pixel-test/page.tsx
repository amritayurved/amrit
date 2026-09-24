"use client";

import { useEffect, useState } from "react";

const META_PIXEL_ID = "3143912892480883";

type MetaWindow = Window & {
  fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void };
};

export default function PixelTestPage() {
  const [endpoint, setEndpoint] = useState<"checking" | "reachable" | "blocked">("checking");
  const [fbqReady, setFbqReady] = useState<"checking" | "ready" | "not-ready">("checking");
  const [manual, setManual] = useState("");

  function sendDirectPixel() {
    setEndpoint("checking");
    const img = new Image(1, 1);
    img.style.display = "none";
    img.onload = () => setEndpoint("reachable");
    img.onerror = () => setEndpoint("blocked");
    img.src =
      "https://www.facebook.com/tr?id=" +
      META_PIXEL_ID +
      "&ev=PageView&noscript=1&dl=" +
      encodeURIComponent(window.location.href) +
      "&ts=" +
      Date.now();
    document.body.appendChild(img);
    window.setTimeout(() => {
      setEndpoint((current) => (current === "checking" ? "blocked" : current));
      if (img.parentNode) img.parentNode.removeChild(img);
    }, 10000);
  }

  function fireFbq() {
    const fbq = (window as MetaWindow).fbq;
    if (!fbq) {
      setManual("fbq अभी available नहीं है.");
      return;
    }
    fbq("track", "PageView", { pixel_test_manual: true });
    setManual("Manual PageView fired. Meta Events Manager 20–30 सेकंड बाद check करें.");
  }

  useEffect(() => {
    sendDirectPixel();

    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      const fbq = (window as MetaWindow).fbq;
      if (fbq?.callMethod) {
        setFbqReady("ready");
        window.clearInterval(timer);
      } else if (tries >= 20) {
        setFbqReady("not-ready");
        window.clearInterval(timer);
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, []);

  const endpointText =
    endpoint === "checking"
      ? "Checking…"
      : endpoint === "reachable"
        ? "REACHABLE ✅"
        : "BLOCKED ❌";

  const fbqText =
    fbqReady === "checking"
      ? "Checking…"
      : fbqReady === "ready"
        ? "READY ✅"
        : "NOT READY ❌";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "Arial, sans-serif", background: "#f6f7f7", color: "#111" }}>
      <section style={{ width: "100%", maxWidth: 620, background: "#fff", color: "#111", border: "1px solid #ddd", borderRadius: 16, padding: 24, lineHeight: 1.6 }}>
        <h1>Meta Pixel Diagnostic</h1>
        <p><b>Pixel ID:</b> {META_PIXEL_ID}</p>
        <div style={{padding:12,border:"1px solid #ddd",borderRadius:10,margin:"12px 0",background:"#fafafa",color:"#111"}}><b>1. Meta tracking endpoint:</b><br/><span style={{fontSize:20,fontWeight:800,color:"#111"}}>{endpointText}</span></div>
        <div style={{padding:12,border:"1px solid #ddd",borderRadius:10,margin:"12px 0",background:"#fafafa",color:"#111"}}><b>2. fbq library:</b><br/><span style={{fontSize:20,fontWeight:800,color:"#111"}}>{fbqText}</span></div>

        <button onClick={fireFbq} style={{ padding: "12px 16px", marginRight: 10, marginBottom: 10, color:"#111", background:"#eee", border:"1px solid #bbb", borderRadius:8 }}>
          Fire PageView
        </button>
        <button onClick={sendDirectPixel} style={{ padding: "12px 16px", marginBottom: 10, color:"#111", background:"#eee", border:"1px solid #bbb", borderRadius:8 }}>
          Retry direct test
        </button>

        {manual ? <p><b>{manual}</b></p> : null}

        <hr style={{ margin: "20px 0" }} />
        <p>अगर ऊपर दोनों ✅ हैं लेकिन Events Manager में No activity है, तो website code काम कर रहा है और अगली जाँच Meta के selected Pixel/Dataset की करनी है।</p>
        <p>अगर कोई ❌ है, तो browser/network Meta tracking को block कर रहा है। दूसरे browser या mobile data से यह page खोलकर Retry करें।</p>
      </section>
    </main>
  );
}
