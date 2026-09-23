"use client";

import { useEffect, useState } from "react";

const META_PIXEL_ID = "4101120370192000";

export default function PixelTestPage() {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const img = new Image(1, 1);
    img.style.display = "none";
    img.onload = () => setSent(true);
    img.onerror = () => setSent(false);
    img.src =
      "https://www.facebook.com/tr?id=" +
      META_PIXEL_ID +
      "&ev=PageView&noscript=1&dl=" +
      encodeURIComponent(window.location.href) +
      "&ts=" +
      Date.now();
    document.body.appendChild(img);
    return () => {
      if (img.parentNode) img.parentNode.removeChild(img);
    };
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 560, textAlign: "center" }}>
        <h1>Meta Pixel Test</h1>
        <p>Pixel ID: {META_PIXEL_ID}</p>
        <p>{sent ? "Test request sent." : "Sending test request…"}</p>
        <p>इस page को 15–20 सेकंड खुला रखें, फिर Meta Events Manager में वापस जाएँ।</p>
      </section>
    </main>
  );
}
