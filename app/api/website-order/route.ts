import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

const CRM_PROJECT_ID = 26522;
const WP_API = "https://api.websitepublisher.ai";
const META_PIXEL_ID = "1720516185901735";

type OrderInput = {
  customer?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  quantity?: string | number;
  product?: string;
  notes?: string;
  payment?: string;
  order_id?: string;
  order_type?: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function getCookie(header: string, name: string) {
  const match = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

async function sendMetaPurchase(request: Request, fields: ReturnType<typeof normalizeOrder>) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) return { sent: false, reason: "META_CAPI_ACCESS_TOKEN missing" };

  const cookieHeader = request.headers.get("cookie") || "";
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const clientIp = forwardedFor.split(",")[0]?.trim() || undefined;
  const userAgent = request.headers.get("user-agent") || undefined;
  const origin = request.headers.get("origin") || "https://amrit-kohl.vercel.app";

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: fields.order_id || undefined,
        action_source: "website",
        event_source_url: origin,
        user_data: {
          ph: [sha256("91" + fields.phone)],
          client_ip_address: clientIp,
          client_user_agent: userAgent,
          fbp: getCookie(cookieHeader, "_fbp") || undefined,
          fbc: getCookie(cookieHeader, "_fbc") || undefined,
        },
        custom_data: {
          value: Number(fields.amount),
          currency: "INR",
          content_name: fields.product,
          content_type: "product",
          num_items: Number(fields.quantity),
        },
      },
    ],
  };

  const testEventCode = process.env.META_TEST_EVENT_CODE;
  if (testEventCode) payload.test_event_code = testEventCode;

  const response = await fetch(
    `https://graph.facebook.com/v22.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(json?.error?.message || "Meta CAPI request failed"));
  }
  return { sent: true, result: json };
}

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
      "CRM form submission failed"
    );
  }

  return submitJson;
}

function normalizeOrder(input: OrderInput) {
  const customer = String(input.customer || "").trim();
  const phone = String(input.phone || "").replace(/\D/g, "").slice(-10);
  const address = String(input.address || "").trim();
  const pincode = String(input.pincode || "").replace(/\D/g, "").slice(0, 6);
  const quantity = Math.max(1, Math.min(10, Number(input.quantity || 1)));
  const product = String(input.product || "TAKAT POWER X").trim();
  const payment = String(input.payment || "COD").trim() === "Prepaid" ? "Prepaid" : "COD";
  const orderType = String(input.order_type || "").toLowerCase() === "reorder" ? "Reorder" : "Order";

  if (customer.length < 2) throw new Error("Customer name is required");
  if (!/^[6-9]\d{9}$/.test(phone)) throw new Error("Valid mobile number is required");
  if (address.length < 5) throw new Error("Valid address is required");
  if (!/^\d{6}$/.test(pincode)) throw new Error("Valid pincode is required");

  let unitAmount: number;
  if (product === "MAX X7 Capsule + MAX X100 Oil Combo") {
    unitAmount = payment === "Prepaid" ? 1499 : 2500;
  } else if (product === "TAKAT POWER X") {
    unitAmount = payment === "Prepaid" ? 1349.1 : 1499;
  } else {
    throw new Error("Unknown product");
  }

  const amount = Number((unitAmount * quantity).toFixed(2));
  const orderId = String(input.order_id || "").trim();
  const notes = String(input.notes || "").trim();
  const now = new Date();
  const orderDate = now.toISOString().slice(0, 10);
  const timestamp = now.toISOString();

  return {
    customer,
    customer_name: customer,
    phone,
    mobile: phone,
    address,
    pincode,
    product,
    quantity: String(quantity),
    payment,
    payment_mode: payment,
    amount: String(amount),
    order_value: String(amount),
    unit_price: String(unitAmount),
    total_amount: String(amount),
    online_paid: payment === "Prepaid" ? String(amount) : "0",
    balance_cod: payment === "Prepaid" ? "0" : String(amount),
    payment_status: payment === "Prepaid" ? "Paid" : "Pending",
    order_id: orderId,
    order_code: orderId,
    website_order_id: orderId,
    order_date: orderDate,
    created_at: timestamp,
    updated_at: timestamp,
    notes,
    remark: notes,
    order_type: orderType,
    source: orderType === "Reorder" ? "Website Reorder" : "Website",
    status: "New",
    sync_action: "create",
    action: "create",
    state: "Unknown",
    district: "Unknown",
    city: "Unknown",
  };
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as OrderInput;
    const fields = normalizeOrder(input);
    const result = await submitWpForm("website_order", fields);

    let sheetBackup: unknown = { sent: false, reason: "not attempted" };
    try {
      sheetBackup = await submitWpForm("order_sheet_sync", {
        order_code: fields.order_code || fields.order_id,
        customer_name: fields.customer,
        mobile: fields.phone,
        address: fields.address,
        state: fields.state,
        district: fields.district,
        city: fields.city,
        pincode: fields.pincode,
        payment_mode: fields.payment,
        status: fields.status,
        amount: fields.amount,
        product: fields.product,
        quantity: fields.quantity,
        order_id: fields.order_id,
        order_date: fields.order_date,
        order_type: fields.order_type,
        notes: fields.notes,
      });
    } catch (error) {
      sheetBackup = {
        sent: false,
        error: error instanceof Error ? error.message : "Sheet backup failed",
      };
    }

    let metaCapi: unknown = { sent: false, reason: "not attempted" };
    try {
      metaCapi = await sendMetaPurchase(request, fields);
    } catch (error) {
      metaCapi = {
        sent: false,
        error: error instanceof Error ? error.message : "Meta CAPI failed",
      };
    }

    return NextResponse.json({ ok: true, result, sheetBackup, metaCapi });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Order save failed",
      },
      { status: 502 },
    );
  }
}
