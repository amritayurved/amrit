import { NextRequest, NextResponse } from "next/server";

const PIXEL_ID = "849242441547365";

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "";
  return request.headers.get("x-real-ip") || "";
}

export async function GET(request: NextRequest) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const probeMode = request.nextUrl.searchParams.get("probe");
  const probe = probeMode === "1" || probeMode === "event";

  if (!probe) {
    return NextResponse.json({
      ok: true,
      configured: Boolean(accessToken),
      testMode: Boolean(process.env.META_TEST_EVENT_CODE),
      pixelId: PIXEL_ID,
    });
  }

  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "META_CAPI_ACCESS_TOKEN is not configured." }, { status: 503 });
  }

  try {
    if (probeMode === "event") {
      const testEventCode = request.nextUrl.searchParams.get("testCode") || process.env.META_TEST_EVENT_CODE;
      if (!testEventCode) {
        return NextResponse.json({ ok: false, error: "META_TEST_EVENT_CODE is not configured." }, { status: 503 });
      }
      const payload = {
        data: [{
          event_name: "PageView",
          event_time: Math.floor(Date.now() / 1000),
          event_id: `capi-probe-${Date.now()}`,
          action_source: "website",
          event_source_url: "https://amrit-kohl.vercel.app/",
          user_data: {
            client_ip_address: getClientIp(request),
            client_user_agent: request.headers.get("user-agent") || "",
          },
        }],
        test_event_code: testEventCode,
      };
      const response = await fetch(
        `https://graph.facebook.com/${PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        }
      );
      const result = await response.json().catch(() => ({}));
      return NextResponse.json({ ok: response.ok, status: response.status, result }, { status: response.ok ? 200 : 502 });
    }

    const response = await fetch(
      `https://graph.facebook.com/${PIXEL_ID}?fields=id,name&access_token=${encodeURIComponent(accessToken)}`,
      { cache: "no-store" }
    );
    const result = await response.json().catch(() => ({}));
    return NextResponse.json({ ok: response.ok, status: response.status, result }, { status: response.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown Meta probe error" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { ok: false, error: "META_CAPI_ACCESS_TOKEN is not configured in Vercel." },
      { status: 503 }
    );
  }

  let body: {
    eventId?: string;
    value?: number;
    currency?: string;
    contentName?: string;
    contentIds?: string[];
    numItems?: number;
    sourceUrl?: string;
  } = {};

  try {
    body = await request.json();
  } catch {}

  const eventId = body.eventId || crypto.randomUUID();
  const sourceUrl =
    body.sourceUrl ||
    request.headers.get("referer") ||
    "https://amrit-kohl.vercel.app/order-success";

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: sourceUrl,
        user_data: {
          client_ip_address: getClientIp(request),
          client_user_agent: request.headers.get("user-agent") || "",
        },
        custom_data: {
          value: Number(body.value || 0),
          currency: body.currency || "INR",
          content_name: body.contentName || "TAKAT POWER X",
          content_ids: Array.isArray(body.contentIds) ? body.contentIds : [],
          content_type: "product",
          num_items: Number(body.numItems || 1),
        },
      },
    ],
  };


  try {
    const response = await fetch(
      `https://graph.facebook.com/${PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, status: response.status, result },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      eventId,
      testMode: false,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown Meta request error",
      },
      { status: 502 }
    );
  }
}
