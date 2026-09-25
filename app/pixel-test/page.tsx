"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
    };
  }
}

const PIXEL_ID = "2952176195138054";

export default function PixelTestPage() {
  const [libraryStatus, setLibraryStatus] = useState("Checking Meta library...");
  const [endpointStatus, setEndpointStatus] = useState("Checking Facebook tracking endpoint...");

  useEffect(() => {
    let attempts = 0;
    let fired = false;

    const timer = window.setInterval(() => {
      attempts += 1;

      const libraryLoaded =
        typeof window.fbq === "function" &&
        typeof window.fbq.callMethod === "function";

      const resourceSeen = performance
        .getEntriesByType("resource")
        .some((entry) => entry.name.includes("connect.facebook.net/en_US/fbevents.js"));

      if (libraryLoaded) {
        if (!fired) {
          window.fbq?.("track", "PageView");
          fired = true;
        }
        setLibraryStatus(
          resourceSeen
            ? "PASS: Meta fbevents.js loaded and PageView sent"
            : "PASS: Meta Pixel library initialized and PageView sent"
        );
        window.clearInterval(timer);
        return;
      }

      if (attempts >= 20) {
        setLibraryStatus(
          resourceSeen
            ? "FAIL: fbevents.js request appeared, but Pixel library did not initialize"
            : "BLOCKED: connect.facebook.net/fbevents.js did not load"
        );
        window.clearInterval(timer);
      }
    }, 500);

    const beacon = new Image();
    beacon.onload = () =>
      setEndpointStatus("PASS: facebook.com/tr tracking endpoint is reachable");
    beacon.onerror = () =>
      setEndpointStatus("BLOCKED/FAILED: facebook.com/tr tracking endpoint could not load");
    beacon.src =
      "https://www.facebook.com/tr?id=" +
      PIXEL_ID +
      "&ev=PageView&noscript=1&dl=" +
      encodeURIComponent(window.location.href) +
      "&ts=" +
      Date.now();

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 24,
        lineHeight: 1.6,
        background: "#fff",
        color: "#111",
        minHeight: "100vh",
      }}
    >
      <h1>Meta Pixel Diagnostic</h1>
      <p><strong>Pixel ID:</strong> {PIXEL_ID}</p>
      <p><strong>Library:</strong> {libraryStatus}</p>
      <p><strong>Tracking endpoint:</strong> {endpointStatus}</p>
      <p style={{ marginTop: 24 }}>
        Keep this page open for 10 seconds, then read both results.
      </p>
    </main>
  );
}
