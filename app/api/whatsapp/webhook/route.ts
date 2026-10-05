export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CALLBACK_KEY = "6bnMHCNNnj_tOrEH4gn4N_31qj5YYuR0";
const VERIFY_TOKEN = "jgu3Llhq2zdQQkyz33EXkdIr";
const CRM_PROJECT_ID = 26522;
const WP_API = "https://api.websitepublisher.ai";

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function extractText(message: any) {
  if (!message || typeof message !== "object") return "";
  if (message.type === "text") return String(message.text?.body || "");
  if (message.type === "button") return String(message.button?.text || "");
  if (message.type === "interactive") {
    return String(
      message.interactive?.button_reply?.title ||
      message.interactive?.list_reply?.title ||
      ""
    );
  }
  return `[${String(message.type || "message")}]`;
}


async function submitWpLead(lead: Record<string, unknown>) {
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
      fields: {
        name: String(lead.name || "WhatsApp Customer").slice(0, 100),
        mobile: String(lead.phone || "").replace(/\D/g, "").slice(-10),
        session_id: String(lead.whatsapp_message_id || (String(lead.whatsapp_timestamp || "") + "-" + String(lead.phone || ""))).slice(0, 120),
        path: "whatsapp",
        source: "WhatsApp",
        message: String(lead.message || "").slice(0, 1000),
        whatsapp_from: String(lead.whatsapp_from || "").slice(0, 32),
        whatsapp_type: String(lead.whatsapp_type || "").slice(0, 40),
        whatsapp_timestamp: String(lead.whatsapp_timestamp || "").slice(0, 40),
        ad_id: String(lead.ad_id || "").slice(0, 120),
        ad_source_url: String(lead.ad_source_url || "").slice(0, 500),
        ad_headline: String(lead.ad_headline || "").slice(0, 300),
        ad_body: String(lead.ad_body || "").slice(0, 500),
        website: "",
      },
      _csrf: session.csrf_token,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const submitJson = await submitRes.json().catch(() => ({}));
  const actionStatus = submitJson?.data?.action_result?.status;
  if (!submitRes.ok || submitJson?.success === false || (actionStatus && actionStatus !== "completed")) {
    throw new Error(submitJson?.error?.message || submitJson?.message || "CRM lead submission failed");
  }
  return submitJson;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (url.searchParams.get("key") !== CALLBACK_KEY) {
    return new Response("Forbidden", { status: 403 });
  }

  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  if (url.searchParams.get("key") !== CALLBACK_KEY) {
    return json({ ok: false }, 403);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  if (body?.object !== "whatsapp_business_account") {
    return json({ ok: true, ignored: true });
  }

  const leads: any[] = [];

  for (const entry of body.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value || {};
      const contacts = Array.isArray(value.contacts) ? value.contacts : [];

      for (const message of value.messages || []) {
        const from = String(message?.from || "").replace(/\D/g, "");
        if (!from) continue;

        const contact = contacts.find((c: any) => String(c?.wa_id || "") === from) || contacts[0] || {};
        const name = String(contact?.profile?.name || "WhatsApp Customer").slice(0, 100);
        const phone = from.slice(-10);
        const referral = message?.referral || {};
        const messageText = extractText(message).slice(0, 1000);

        leads.push({
          name,
          phone,
          consent: true,
          website: "",
          source: "WhatsApp",
          message: messageText,
          whatsapp_message_id: String(message?.id || ""),
          whatsapp_from: from,
          whatsapp_type: String(message?.type || ""),
          whatsapp_timestamp: String(message?.timestamp || ""),
          ad_id: String(referral?.source_id || ""),
          ad_source_url: String(referral?.source_url || ""),
          ad_headline: String(referral?.headline || ""),
          ad_body: String(referral?.body || ""),
        });
      }
    }
  }

  if (!leads.length) {
    return json({ ok: true, received: 0 });
  }

  const results = await Promise.allSettled(
    leads.map((lead) => submitWpLead(lead))
  );

  const saved = results.filter(
    (r) => r.status === "fulfilled"
  ).length;

  return json({ ok: true, received: leads.length, forwarded: saved });
}
