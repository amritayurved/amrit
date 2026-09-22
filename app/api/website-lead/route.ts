import { NextResponse } from "next/server";

const CRM_PROJECT_ID = 26522;
const WP_API = "https://api.websitepublisher.ai";

type CallbackLeadInput = {
  name?: string;
  mobile?: string;
  session_id?: string;
  path?: string;
  source?: string;
  product?: string;
  utm_source?: string;
  utm_campaign?: string;
  fbclid?: string;
};

function clean(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

async function submitWpForm(fields: Record<string, string>) {
  const sessionRes = await fetch(`${WP_API}/sapi/project/${CRM_PROJECT_ID}/session`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const sessionJson = await sessionRes.json().catch(() => ({}));
  const session = sessionJson?.data;
  if (!sessionRes.ok || !session?.session_id || !session?.csrf_token) {
    throw new Error("CRM session could not be created");
  }

  await new Promise((resolve) => setTimeout(resolve, 3200));

  const submitRes = await fetch(`${WP_API}/sapi/project/${CRM_PROJECT_ID}/form/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": session.session_id,
      "X-CSRF-Token": session.csrf_token,
    },
    body: JSON.stringify({
      form_name: "website_callback_lead",
      fields: { ...fields, website: "" },
      _csrf: session.csrf_token,
    }),
    cache: "no-store",
  });

  const submitJson = await submitRes.json().catch(() => ({}));
  const actionStatus = submitJson?.data?.action_result?.status;
  if (!submitRes.ok || submitJson?.success === false || (actionStatus && actionStatus !== "completed")) {
    throw new Error(submitJson?.error?.message || submitJson?.message || "Lead submission failed");
  }
  return submitJson;
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CallbackLeadInput;
    const mobile = clean(input.mobile, 10).replace(/\D/g, "");
    const sessionId = clean(input.session_id, 120);
    const path = clean(input.path, 255);
    const source = clean(input.source, 80) || "Website Callback Lead";

    if (!/^[6-9]\d{9}$/.test(mobile) || !sessionId || !path) {
      return NextResponse.json({ ok: false, error: "Invalid callback lead" }, { status: 400 });
    }

    const result = await submitWpForm({
      name: clean(input.name, 80),
      mobile,
      session_id: sessionId,
      path,
      source,
      product: clean(input.product, 160),
      utm_source: clean(input.utm_source, 120),
      utm_campaign: clean(input.utm_campaign, 160),
      fbclid: clean(input.fbclid, 255),
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Lead save failed" },
      { status: 502 },
    );
  }
}
