import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CRM_PROJECT_ID = 26522;
const WP_API = "https://api.websitepublisher.ai";
const CRM_FORM = "website_callback_lead";
const VERIFY_TOKEN = process.env.META_LEADS_VERIFY_TOKEN || "amrit_meta_leads_2026";

type MetaField = { name?: string; values?: unknown[] };
type MetaLead = { id?: string; created_time?: string; field_data?: MetaField[] };

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function normalizeIndianPhone(value: unknown) {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 14 && digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(-10);
}

function normalizeKey(value: unknown) {
  return clean(value, 120).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function fieldMap(fieldData: MetaField[]) {
  const map: Record<string, string> = {};
  for (const field of fieldData || []) {
    const key = normalizeKey(field?.name);
    if (!key) continue;
    const first = Array.isArray(field?.values) ? field.values[0] : "";
    map[key] = clean(first, 300);
  }
  return map;
}

function firstValue(map: Record<string, string>, exact: string[], contains: string[]) {
  for (const key of exact) if (map[key]) return map[key];
  const keys = Object.keys(map);
  for (const needle of contains) {
    const hit = keys.find((key) => key.includes(needle) && map[key]);
    if (hit) return map[hit];
  }
  return "";
}

function extractCustomer(lead: MetaLead) {
  const map = fieldMap(Array.isArray(lead.field_data) ? lead.field_data : []);

  let name = firstValue(
    map,
    ["full_name", "name", "customer_name"],
    ["full_name", "customer_name"],
  );

  if (!name) {
    const first = firstValue(map, ["first_name"], ["first_name"]);
    const last = firstValue(map, ["last_name"], ["last_name"]);
    name = [first, last].filter(Boolean).join(" ").trim();
  }

  const rawPhone = firstValue(
    map,
    ["phone_number", "phone", "mobile_number", "mobile"],
    ["phone", "mobile"],
  );

  const city = firstValue(
    map,
    ["city", "city_name", "customer_city"],
    ["city"],
  );

  return {
    name: clean(name || "Meta Lead", 80),
    mobile: normalizeIndianPhone(rawPhone),
    city: clean(city || "Unknown", 100),
  };
}

async function fetchMetaLead(leadId: string) {
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!accessToken) throw new Error("META_PAGE_ACCESS_TOKEN is not configured");

  const url = new URL("https://graph.facebook.com/" + encodeURIComponent(leadId));
  url.searchParams.set("fields", "id,created_time,field_data");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) {
    throw new Error(data?.error?.message || "Meta lead retrieval failed");
  }
  return data as MetaLead;
}

async function submitToCrm(fields: Record<string, string>) {
  const sessionRes = await fetch(`${WP_API}/sapi/project/${CRM_PROJECT_ID}/session`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const sessionJson = await sessionRes.json().catch(() => ({}));
  const session = sessionJson?.data;
  if (!sessionRes.ok || !session?.session_id || !session?.csrf_token) {
    throw new Error("CRM session could not be created");
  }

  // Existing CRM form has anti-bot timing protection; this keeps server-to-server
  // submissions on the same safe path as the current website lead integration.
  await new Promise((resolve) => setTimeout(resolve, 3200));

  const submitRes = await fetch(`${WP_API}/sapi/project/${CRM_PROJECT_ID}/form/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": session.session_id,
      "X-CSRF-Token": session.csrf_token,
    },
    body: JSON.stringify({
      form_name: CRM_FORM,
      fields: { ...fields, website: "" },
      _csrf: session.csrf_token,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
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
        "CRM lead submission failed",
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.json({ ok: false, error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 250000) {
      return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 });
    }

    const payload = JSON.parse(raw);
    if (!payload || payload.object !== "page" || !Array.isArray(payload.entry)) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const changes: Array<Record<string, unknown>> = [];
    for (const entry of payload.entry) {
      for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
        if (change?.field === "leadgen" && change?.value?.leadgen_id) {
          changes.push(change.value);
        }
      }
    }

    if (!changes.length) {
      return NextResponse.json({ ok: true, received: 0 });
    }

    const results = await Promise.allSettled(
      changes.map(async (value) => {
        const leadId = clean(value.leadgen_id, 120);
        const pageId = clean(value.page_id, 120);
        const formId = clean(value.form_id, 120);
        const adId = clean(value.ad_id, 120);
        const adGroupId = clean(value.adgroup_id, 120);

        const lead = await fetchMetaLead(leadId);
        const customer = extractCustomer(lead);

        if (!/^[6-9]\d{9}$/.test(customer.mobile)) {
          throw new Error("Meta lead does not contain a valid Indian mobile number");
        }

        await submitToCrm({
          name: customer.name,
          mobile: customer.mobile,
          city: customer.city,
          source: "Meta Lead Form",
          session_id: `meta:${leadId}`,
          path: formId ? `/meta-lead/${formId}` : "/meta-lead",
          meta_lead_id: leadId,
          meta_page_id: pageId,
          meta_form_id: formId,
          meta_ad_id: adId,
          meta_adgroup_id: adGroupId,
          meta_created_time: clean(lead.created_time || value.created_time, 80),
        });

        return { leadId, mobile: customer.mobile };
      }),
    );

    const saved = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - saved;

    if (failed) {
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map((r) => clean(r.reason instanceof Error ? r.reason.message : r.reason, 180));
      console.error("Meta lead webhook partial failure", { saved, failed, errors });
      return NextResponse.json({ ok: false, received: results.length, saved, failed }, { status: 502 });
    }

    return NextResponse.json({ ok: true, received: results.length, saved });
  } catch (error) {
    console.error("Meta lead webhook failed", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 502 },
    );
  }
}
