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
  const [requestStatus, setRequestStatus] = useState("Waiting for PageView network request...");

  useEffect(() => {
    let attempts = 0;
    let fired = false;

    const timer = window.setInterval(() => {
      attempts += 1;

      const resources = performance.getEntriesByType("resource");
      const librarySeen = resources.some((entry) =>
        entry.name.includes("connect.facebook.net/en_US/fbevents.js")
      );
      const trackingSeen = resources.some((entry) =>
        /https:\/\/(www\.)?facebook\.com\/tr[/?]/.test(entry.name)
      );

      const libraryLoaded =
        typeof window.fbq === "function" &&
        typeof window.fbq.callMethod === "function";

      if (libraryLoaded && !fired) {
        window.fbq?.("track", "PageView");
        fired = true;
      }

      if (libraryLoaded) {
        setLibraryStatus(
          librarySeen
            ? "PASS: Meta fbevents.js loaded and Pixel initialized"
            : "PASS: Meta Pixel initialized"
        );
      } else if (attempts >= 20) {
        setLibraryStatus(
          librarySeen
            ? "FAIL: fbevents.js requested but Pixel did not initialize"
            : "BLOCKED: fbevents.js did not load"
        );
      }

      if (trackingSeen) {
        setRequestStatus("PASS: facebook.com/tr PageView request was created by the browser");
        window.clearInterval(timer);
        return;
      }

      if (attempts >= 20) {
        setRequestStatus(
          fired
            ? "NO REQUEST DETECTED: fbq ran, but no facebook.com/tr request appeared"
            : "NO REQUEST DETECTED: Pixel never fired"
        );
        window.clearInterval(timer);
      }
    }, 500);

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
      <p><strong>Browser network:</strong> {requestStatus}</p>
      <p style={{ marginTop: 24 }}>
        Keep this page open for 10 seconds, then read both results.
      </p>
    </main>
  );
}
