import { NextResponse } from "next/server";

const CRM_INTAKE = "https://amrit-ayurveda-crm-new.amritayurveda.chatgpt.site/api/website-order";

function normalizeIndianPhone(value: unknown) {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 14 && digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 12000) return NextResponse.json({ ok: false, error: "Request too large" }, { status: 413 });
    let fields: unknown;
    try { fields = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); }
    // Catalogue titles identify packs; CRM uses one product and its combo quantity.
    if (fields && typeof fields === "object" && !Array.isArray(fields)) {
      const order = fields as Record<string, unknown>;
      const phone = normalizeIndianPhone(order.phone);
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return NextResponse.json({ ok: false, error: "सही 10-digit mobile number भरें।" }, { status: 400 });
      }
      order.phone = phone;
      const comboTitles = ["AMRIT URJA — 1 Combo", "AMRIT URJA — 2 Combo", "AMRIT URJA — 3 Combo"];
      if (typeof order.product === "string" && comboTitles.includes(order.product)) {
        order.product = "AMRIT URJA Capsule + Oil Combo";
      }
    }
    const response = await fetch(CRM_INTAKE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true || !result?.order?.orderCode) {
      return NextResponse.json({ ok: false, error: result?.error || "Order save नहीं हुआ। कृपया दोबारा कोशिश करें।" }, { status: response.ok ? 502 : response.status });
    }
    return NextResponse.json({ ok: true, duplicate: result.duplicate === true, order: result.order }, { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, error: "Order save नहीं हुआ। कृपया दोबारा कोशिश करें।" }, { status: 502 });
  }
}
