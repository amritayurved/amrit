import { NextResponse } from "next/server";
const endpoint = "https://amrit-ayurveda-crm-new.amritayurveda.chatgpt.site/api/checkout-draft";
export async function POST(request: Request) {
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ok:false},{status:403});
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ok:false},{status:415});
  try {
    const raw = await request.text();
    if (raw.length > 4000) return NextResponse.json({ok:false},{status:413});
    const response = await fetch(endpoint, { method:"POST", headers:{"Content-Type":"application/json"}, body:raw, cache:"no-store", signal:AbortSignal.timeout(10000) });
    return NextResponse.json({ok:response.ok},{status:response.ok ? 200 : 502,headers:{"Cache-Control":"no-store"}});
  } catch { return NextResponse.json({ok:false},{status:502,headers:{"Cache-Control":"no-store"}}); }
}
