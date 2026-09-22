import { NextResponse } from "next/server";

const CRM_INTAKE = "https://amrit-ayurveda-crm-new.amritayurveda.chatgpt.site/api/website-order";

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 12000) return NextResponse.json({ ok: false, error: "Request too large" }, { status: 413 });
    let fields: unknown;
    try { fields = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); }
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
