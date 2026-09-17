"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

const LEGACY_CRM_ENDPOINT =
  "https://amrit-ayurveda-crm.rohitsangwan517.chatgpt.site/api/website-orders";
const CRM_PROJECT_ID = 26522;
const CRM_FORM = "website_order";

type SapiResult = { ok: boolean; data?: unknown };
type SapiClient = {
  submitForm: (formName: string, fields: Record<string, unknown>) => Promise<SapiResult>;
};

declare global {
  interface Window {
    WP?: { sapi: (projectId: number) => SapiClient };
  }
}

export default function CrmOrderBridge() {
  const originalFetchRef = useRef<typeof fetch | null>(null);

  const installBridge = useCallback(() => {
    if (!window.WP?.sapi || originalFetchRef.current) return;

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
        url !== LEGACY_CRM_ENDPOINT ||
        (init?.method || "GET").toUpperCase() !== "POST"
      ) {
        return originalFetch(input, init);
      }

      try {
        const body = typeof init?.body === "string" ? JSON.parse(init.body) : {};
        const sapi = window.WP!.sapi(CRM_PROJECT_ID);
        const result = await sapi.submitForm(CRM_FORM, {
          customer: String(body.name || "").trim(),
          phone: String(body.phone || "").replace(/\D/g, "").slice(-10),
          address: String(body.address || "").trim(),
          state: String(body.state || "").trim(),
          district: String(body.district || "").trim(),
          city: String(body.city || "").trim(),
          pincode: String(body.pincode || "").replace(/\D/g, "").slice(0, 6),
          product: String(body.product || "TAKAT POWER X"),
          quantity: String(body.quantity || 1),
          payment: String(body.paymentMethod || "COD"),
          amount: String(body.orderValue || 0),
          order_id: String(body.orderId || ""),
          notes: String(body.notes || ""),
          website: "",
        });

        return new Response(JSON.stringify(result.data ?? {}), {
          status: result.ok ? 200 : 502,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : "CRM order bridging failed",
          }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    };
  }, []);

  useEffect(() => {
    installBridge();
    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
        originalFetchRef.current = null;
      }
    };
  }, [installBridge]);

  return (
    <Script
      src="https://cdn.websitepublisher.ai/js/sapi-client.js"
      strategy="afterInteractive"
      onLoad={installBridge}
    />
  );
}
