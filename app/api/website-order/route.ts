import { NextResponse } from "next/server";

const CRM_PROJECT_ID = 26522;
const WP_API = "https://api.websitepublisher.ai";
const CRM_FORM = "website_order_v2";

type OrderInput = {
  customer?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  quantity?: string | number;
  product?: string;
  payment?: string;
  state?: string;
  district?: string;
  city?: string;
  notes?: string;
  order_type?: string;
};

function normalize(input: OrderInput) {
  const customer = String(input.customer || "").trim();
  const phone = String(input.phone || "").replace(/\D/g, "").slice(-10);
  const address = String(input.address || "").trim();
  const pincode = String(input.pincode || "").replace(/\D/g, "").slice(0, 6);
  const quantity = Math.max(1, Math.min(10, Number(input.quantity || 1)));
  const product = String(input.product || "TAKAT POWER X").trim();
  const payment = String(input.payment || "COD").trim() === "Prepaid" ? "Prepaid" : "COD";
  const state = String(input.state || "Unknown").trim() || "Unknown";
  const district = String(input.district || "Unknown").trim() || "Unknown";
  const city = String(input.city || "Unknown").trim() || "Unknown";
  const notes = String(input.notes || "").trim();
  const orderType = String(input.order_type || "Order").trim() || "Order";

  if (customer.length < 2) throw new Error("Customer name is required");
  if (!/^[6-9]\d{9}$/.test(phone)) throw new Error("Valid 10-digit mobile is required");
  if (address.length < 5) throw new Error("Valid address is required");
  if (!/^\d{6}$/.test(pincode)) throw new Error("Valid 6-digit pincode is required");

  let unitAmount: number;
  let prefix: string;

  if (product === "MAX X7 Capsule + MAX X100 Oil Combo") {
    unitAmount = payment === "Prepaid" ? 1499 : 2500;
    prefix = "MX";
  } else if (product === "TAKAT POWER X") {
    unitAmount = payment === "Prepaid" ? 899.1 : 999;
    prefix = "TPX";
  } else {
    throw new Error("Unknown product");
  }

  const amount = Number((unitAmount * quantity).toFixed(2));
  const orderCode = `${prefix}${Date.now()}`;

  return {
    orderCode,
    fields: {
      customer,
      phone,
      address,
      state,
      district,
      city,
      pincode,
      product,
      quantity: String(quantity),
      payment,
      amount: String(amount),
      order_id: orderCode,
      notes,
      order_type: orderType,
      website: "amrit-kohl.vercel.app",
    },
  };
}

async function submitToCrm(fields: Record<string, string>) {
  const sessionResponse = await fetch(
    `${WP_API}/sapi/project/${CRM_PROJECT_ID}/session?fresh=${Date.now()}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  const sessionCookie = sessionResponse.headers.get("set-cookie")?.split(";")[0] || "";
  const sessionJson = await sessionResponse.json().catch(() => ({}));
  const session = sessionJson?.data;

  if (!sessionResponse.ok || !session?.session_id || !session?.csrf_token) {
    throw new Error("CRM session unavailable");
  }

  // WebsitePublisher form sessions may need a short readiness window before submit.
  await new Promise((resolve) => setTimeout(resolve, 3200));

  const submitResponse = await fetch(
    `${WP_API}/sapi/project/${CRM_PROJECT_ID}/form/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Session-Id": String(session.session_id),
        "X-CSRF-Token": String(session.csrf_token),
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      },
      body: JSON.stringify({
        form_name: CRM_FORM,
        fields,
        _csrf: session.csrf_token,
      }),
      cache: "no-store",
    },
  );

  const submitJson = await submitResponse.json().catch(() => ({}));
  const actionStatus = submitJson?.data?.action_result?.status;
  const submitsRemaining = submitJson?.data?.submits_remaining;

  if (
    !submitResponse.ok ||
    submitJson?.success === false ||
    submitJson?.ok === false ||
    (actionStatus && actionStatus !== "completed") ||
    submitsRemaining === 0
  ) {
    throw new Error("CRM order submission failed");
  }

  return submitJson;
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as OrderInput;
    const { orderCode, fields } = normalize(input);
    const crmResult = await submitToCrm(fields);

    return NextResponse.json({
      ok: true,
      order: { orderCode },
      destination: "amrit-crm",
      crmResult,
    });
  } catch (error) {
    console.error(
      "website-order failed:",
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Order save नहीं हुआ। कृपया दोबारा कोशिश करें।",
      },
      { status: 502 },
    );
  }
}
