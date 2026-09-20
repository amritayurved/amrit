import { NextResponse } from "next/server";

const CRM_INTAKE_URL =
  "https://amrit-ayurveda-crm-new.amritayurveda.chatgpt.site/crm/api/public/website-order";

// The CRM currently allow-lists this legacy Amrit storefront origin.
// This request is server-to-server, so browsers never call the CRM directly.
const CRM_ALLOWED_ORIGIN = "https://takat-delta.vercel.app";

type OrderInput = {
  customer?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  quantity?: string | number;
  product?: string;
  payment?: string;
  state?: string;
  city?: string;
};

function normalize(input: OrderInput) {
  const customer = String(input.customer || "").trim();
  const phone = String(input.phone || "").replace(/\D/g, "").slice(-10);
  const address = String(input.address || "").trim();
  const pincode = String(input.pincode || "").replace(/\D/g, "").slice(0, 6);
  const quantity = Math.max(1, Math.min(10, Number(input.quantity || 1)));
  const product = String(input.product || "TAKAT POWER X").trim();
  const payment = String(input.payment || "COD").trim();

  if (customer.length < 2) throw new Error("Customer name is required");
  if (!/^[6-9]\d{9}$/.test(phone)) throw new Error("Valid 10-digit mobile is required");
  if (address.length < 5) throw new Error("Valid address is required");
  if (!/^\d{6}$/.test(pincode)) throw new Error("Valid 6-digit pincode is required");
  if (payment !== "COD") throw new Error("Direct CRM checkout currently supports COD only");

  let productName: string;
  let price: number;

  if (product === "MAX X7 Capsule + MAX X100 Oil Combo") {
    productName = product;
    price = 2500;
  } else if (product === "TAKAT POWER X") {
    productName = product;
    price = 1499;
  } else {
    throw new Error("Unknown product");
  }

  return {
    customerName: customer,
    contactNumber: phone,
    address,
    pincode,
    state: String(input.state || "").trim(),
    city: String(input.city || "").trim(),
    productName,
    quantity,
    price,
  };
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as OrderInput;
    const payload = normalize(input);

    const response = await fetch(CRM_INTAKE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": CRM_ALLOWED_ORIGIN,
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result?.ok !== true) {
      throw new Error(String(result?.error || `Main CRM rejected order (HTTP ${response.status})`));
    }

    return NextResponse.json({
      ok: true,
      order: result.order,
      duplicate: Boolean(result.duplicate),
      destination: "main-crm",
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
