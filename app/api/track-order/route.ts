import { NextResponse } from "next/server";

const endpoint = "https://amrit-ayurveda-crm-new.amritayurveda.chatgpt.site/api/customer-tracking";
const headers = { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" };
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers });

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ ok: false, error: "Invalid request" }, 415);
  try {
    const text = await request.text();
    if (text.length > 1024) return reply({ ok: false, error: "Invalid request" }, 400);
    const input = JSON.parse(text);
    if (!input || typeof input !== "object" || typeof input.mobile !== "string" || !/^[6-9]\d{9}$/.test(input.mobile)) return reply({ ok: false, error: "सही 10 अंकों का मोबाइल नंबर भरें।" }, 400);
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://www.amritayurveda.shop" }, body: JSON.stringify({ mobile: input.mobile }), cache: "no-store", signal: AbortSignal.timeout(10000) });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok || !result.tracking) return reply({ ok: false, error: response.status === 404 ? "इस मोबाइल नंबर से ऑर्डर नहीं मिला। ऑर्डर वाला मोबाइल नंबर जाँचें।" : response.status === 429 ? "कृपया थोड़ी देर बाद कोशिश करें।" : "ट्रैकिंग अभी उपलब्ध नहीं है। बाद में कोशिश करें या 8290695226 पर संपर्क करें।" }, [400, 404, 429].includes(response.status) ? response.status : 503);
    // Project again at the public storefront boundary. Never forward a full CRM object.
    const t = result.tracking;
    return reply({ ok: true, tracking: { orderCode: String(t.orderCode).slice(-8), status: String(t.status).slice(0, 100), stage: Math.max(0, Math.min(4, Number(t.stage) || 0)), attention: t.attention === true, courier: "", awb: "", shipmentStatus: "", updatedAt: String(t.updatedAt || "").slice(0, 50) } });
  } catch { return reply({ ok: false, error: "ट्रैकिंग अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद कोशिश करें।" }, 503); }
}
