export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CALLBACK_KEY = "6bnMHCNNnj_tOrEH4gn4N_31qj5YYuR0";
const VERIFY_TOKEN = "jgu3Llhq2zdQQkyz33EXkdIr";
const CRM_ENDPOINT = "https://amrit-ayurveda-crm-new.amritayurveda.chatgpt.site/api/enquiry";

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
    leads.map((lead) =>
      fetch(CRM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      })
    )
  );

  const saved = results.filter(
    (r) => r.status === "fulfilled" && r.value.ok
  ).length;

  return json({ ok: true, received: leads.length, forwarded: saved });
}
