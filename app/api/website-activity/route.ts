import { NextResponse } from "next/server";

const CRM_PROJECT_ID = 26522;
const WP_API = "https://api.websitepublisher.ai";

type ActivityInput = {
  event_type?: string;
  session_id?: string;
  label?: string;
  path?: string;
  product?: string;
  quantity?: string | number;
  order_ref?: string;
};

async function submitWpForm(formName: string, fields: Record<string, string>) {
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
      form_name: formName,
      fields: { ...fields, website: "" },
      _csrf: session.csrf_token,
    }),
    cache: "no-store",
  });

  const submitJson = await submitRes.json().catch(() => ({}));
  const actionStatus = submitJson?.data?.action_result?.status;

  if (
    !submitRes.ok ||
    submitJson?.success === false ||
    (actionStatus && actionStatus !== "completed")
  ) {
    throw new Error(
      submitJson?.error?.message ||
      submitJson?.message ||
      "CRM activity submission failed"
    );
  }

  return submitJson;
}

function clean(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ActivityInput;
    const eventType = clean(input.event_type, 80);
    const sessionId = clean(input.session_id, 120);
    const label = clean(input.label, 160);
    const path = clean(input.path, 255);

    if (!eventType || !sessionId || !label || !path) {
      throw new Error("Activity fields are incomplete");
    }

    const result = await submitWpForm("website_activity", {
      event_type: eventType,
      session_id: sessionId,
      label,
      path,
      product: clean(input.product, 160),
      quantity: clean(input.quantity, 20),
      order_ref: clean(input.order_ref, 120),
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Activity save failed",
      },
      { status: 502 },
    );
  }
}

// Temporary live self-test; removed after verification.
export async function GET() {
  try {
    const result = await submitWpForm("website_activity_test", {
      event_type: "system_test",
      session_id: "crm-self-test",
      label: "Server-side CRM bridge verification",
      path: "/api/website-activity",
      product: "",
      quantity: "0",
      order_ref: "",
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Self-test failed",
      },
      { status: 502 },
    );
  }
}
