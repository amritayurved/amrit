"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function PixelTestPage() {
  const [status, setStatus] = useState("Checking Meta Pixel...");

  useEffect(() => {
    let attempts = 0;

    const timer = window.setInterval(() => {
      attempts += 1;

      if (typeof window.fbq === "function") {
        window.fbq("track", "PageView");
        setStatus("Meta Pixel PageView fired");
        window.clearInterval(timer);
        return;
      }

      if (attempts >= 10) {
        setStatus("Meta Pixel did not initialize in this browser");
        window.clearInterval(timer);
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Meta Pixel Test</h1>
      <p>Pixel ID: 2952176195138054</p>
      <p>{status}</p>
    </main>
  );
}
