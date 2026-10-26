import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const configured = process.env.CRM_ABANDONED_CART_ENDPOINT;
  const token = process.env.CRM_ABANDONED_CART_API_TOKEN;
  if (!configured || !token) {
    return NextResponse.json({ ok: false, error: "CRM lead intake is not configured" }, { status: 503 });
  }
  // Prevent arbitrary external endpoints from being configured accidentally.
  let endpoint: URL;
  try {
    endpoint = new URL(configured);
    if (endpoint.protocol !== "https:" || endpoint.hostname !== "amrit-ayurveda-crm-new.amritayurveda.chatgpt.site") {
      throw new Error("Invalid CRM host");
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid CRM endpoint" }, { status: 503 });
  }
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!["amritayurveda.shop", "www.amritayurveda.shop"].includes(new URL(origin).hostname)) {
        return NextResponse.json({ ok: false }, { status: 403 });
      }
    } catch { return NextResponse.json({ ok: false }, { status: 403 }); }
  }
  try {
    const raw = await request.text();
    if (raw.length > 3000) return NextResponse.json({ ok: false }, { status: 413 });
    const payload = JSON.parse(raw);
    const phone = String(payload.phone ?? "").replace(/\D/g, "");
    if (!payload.consent || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ ok: false, error: "Valid consent and phone required" }, { status: 400 });
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        phone, customer: String(payload.name ?? "").slice(0, 120),
        product: "AMRIT URJA Capsule + Oil Combo",
        source: "Amrit Urja Abandoned Cart",
        order_type: "Lead",
        status: "Callback Pending",
        consent: true,
        website: "www.amritayurveda.shop",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) return NextResponse.json({ ok: false }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
