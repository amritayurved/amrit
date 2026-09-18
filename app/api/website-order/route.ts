import { NextResponse } from "next/server";

const CRM_PROJECT_ID = 26522;
const WP_API = "https://api.websitepublisher.ai";

type OrderInput = {
  orderId?: string;
  name?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  quantity?: number;
  product?: string;
  notes?: string;
  paymentMethod?: string;
};

async function submitWpForm(formName: string, fields: Record<string, string>) {
  const sessionRes = await fetch(`${WP_API}/sapi/project/${CRM_PROJECT_ID}/session`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const sessionJson = await sessionRes.json();
  const session = sessionJson?.data;
  if (!sessionRes.ok || !session?.session_id || !session?.csrf_token) {
    throw new Error("CRM session could not be created");
  }

  // WebsitePublisher applies a short time-to-submit anti-bot floor.
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
  const actionCompleted = submitJson?.data?.action_result?.status === "completed";
  if (!submitRes.ok || submitJson?.success === false || !actionCompleted) {
    throw new Error(submitJson?.error?.message || "CRM form submission failed");
  }
  return submitJson;
}

function normalizeOrder(input: OrderInput) {
  const customer = String(input.name || "").trim();
  const phone = String(input.phone || "").replace(/\D/g, "").slice(-10);
  const address = String(input.address || "").trim();
  const pincode = String(input.pincode || "").replace(/\D/g, "").slice(0, 6);
  const quantity = Math.max(1, Math.min(10, Number(input.quantity || 1)));
  const product = String(input.product || "TAKAT POWER X").trim();
  const method = String(input.paymentMethod || "COD").toUpperCase();

  if (customer.length < 2) throw new Error("Customer name is required");
  if (!/^[6-9]\d{9}$/.test(phone)) throw new Error("Valid mobile number is required");
  if (address.length < 5) throw new Error("Valid address is required");
  if (!/^\d{6}$/.test(pincode)) throw new Error("Valid pincode is required");

  let unitAmount: number;
  if (product === "MAX X7 Capsule + MAX X100 Oil Combo") {
    unitAmount = method === "UPI" ? 1499 : 2500;
  } else if (product === "TAKAT POWER X") {
    unitAmount = method === "UPI" ? 1349.1 : 1499;
  } else {
    throw new Error("Unknown product");
  }

  const amount = Number((unitAmount * quantity).toFixed(2));

  return {
    customer,
    phone,
    address,
    pincode,
    product,
    quantity: String(quantity),
    payment: method === "UPI" ? "Prepaid" : "COD",
    amount: String(amount),
    order_id: String(input.orderId || "").trim(),
    notes: String(input.notes || "").trim(),
    state: "",
    district: "",
    city: "",
  };
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as OrderInput;
    const fields = normalizeOrder(input);
    const result = await submitWpForm("website_order", fields);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Order save failed" },
      { status: 502 },
    );
  }
}



export async function GET() {
  try {
    const result = await submitWpForm("website_order_test", {
      customer: "TEST-CHECK",
      phone: "9876543210",
      address: "Backend integration test",
      pincode: "141001",
      product: "TAKAT POWER X",
      quantity: "1",
      payment: "COD",
      amount: "1499",
      order_id: "TEST-CHECK",
      notes: "Temporary backend verification",
      state: "",
      district: "",
      city: "",
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Self-test failed" },
      { status: 502 },
    );
  }
}
