"use client";

import { useEffect, useRef } from "react";

const LEGACY_CRM_ENDPOINT =
  "https://amrit-ayurveda-crm.rohitsangwan517.chatgpt.site/api/website-orders";
const LOCAL_CRM_ENDPOINT = "/api/website-order";

export default function CrmOrderBridge() {
  const originalFetchRef = useRef<typeof fetch | null>(null);

  useEffect(() => {
    if (originalFetchRef.current) return;

    const originalFetch = window.fetch.bind(window);
    originalFetchRef.current = originalFetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (
        url === LEGACY_CRM_ENDPOINT &&
        (init?.method || "GET").toUpperCase() === "POST"
      ) {
        return originalFetch(LOCAL_CRM_ENDPOINT, {
          ...init,
          headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
          },
        });
      }

      return originalFetch(input, init);
    };

    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
        originalFetchRef.current = null;
      }
    };
  }, []);

  return null;
}
