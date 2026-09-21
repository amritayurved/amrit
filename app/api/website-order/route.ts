import { NextResponse } from "next/server";

const CRM_SHEET_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbwJjF425vLFuwXylNLUGywy__0qqHdGEp0LRS7I1sekSYSrimgnFou6gS9a9Ae6h4qVCA/exec";

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
  const now = new Date().toISOString();

  return {
    order_code: orderCode,
    order_id: orderCode,
    customer_name: customer,
    customer,
    mobile: phone,
    phone,
    address,
    state,
    district,
    city,
    village: city,
    pincode,
    payment_mode: payment,
    payment,
    payment_status: "Pending",
    status: "New",
    amount: String(amount),
    order_value: String(amount),
    product,
    quantity: String(quantity),
    notes,
    remark: notes,
    order_type: "Order",
    source: "Website",
    created_at: now,
    updated_at: now,
  };
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as OrderInput;
    const payload = normalize(input);

    const response = await fetch(CRM_SHEET_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json,text/plain,*/*",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
    });

    const text = await response.text();
    let result: any = {};
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { message: text };
    }

    if (!response.ok || result?.ok === false || result?.success === false) {
      throw new Error(
        String(result?.error || result?.message || `CRM Sheet webhook failed (HTTP ${response.status})`)
      );
    }

    return NextResponse.json({
      ok: true,
      order: {
        orderCode: payload.order_code,
      },
      destination: "amrit-crm-google-sheet",
      webhookResult: result,
    });
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
