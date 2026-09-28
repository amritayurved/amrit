"use client";

import { useMemo, useState } from "react";

const phone = "918290695226";
const upiId = "8295820654@okbizaxis";
const crmOrderEndpoint = "/api/website-order";

const product = {
  name: "AMRIT URJA Capsule + Oil Combo",
  shortName: "AMRIT URJA",
  image: "/amrit-urja-product.png",
  detail: "30 Capsules + 20 ml Massage Oil",
  codPrice: 2500,
  onlinePrice: 1499,
} as const;

type PixelEvent = "InitiateCheckout" | "Purchase";
function trackPixel(event: PixelEvent, data: Record<string, string | number | string[]>) {
  const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === "function") fbq("track", event, data);
}

type PaymentMethod = "cod" | "upi";

type CustomerDetails = {
  name: string;
  mobile: string;
  address: string;
  pincode: string;
};

const cleanWhatsappUrl =
  `https://wa.me/${phone}?text=${encodeURIComponent(
    "नमस्ते, मुझे AMRIT URJA Capsule + Oil Combo के बारे में जानकारी चाहिए।"
  )}`;

function money(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function Home() {
  const [introOpen, setIntroOpen] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    mobile: "",
    address: "",
    pincode: "",
  });
  const [saving, setSaving] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [orderRef, setOrderRef] = useState("");

  const payable = paymentMethod === "upi" ? product.onlinePrice : product.codPrice;

  const upiUrl = useMemo(() => {
    const ref = orderRef || "AMRIT-URJA";
    const params = new URLSearchParams({
      pa: upiId,
      pn: "AMRIT AYURVEDA",
      tn: `${product.shortName} ${ref}`,
      am: product.onlinePrice.toFixed(2),
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  }, [orderRef]);

  function openOrder(method: PaymentMethod = "cod") {
    setPaymentMethod(method);
    setOrderError("");
    setOrderSuccess("");
    setOrderOpen(true);
    trackPixel("InitiateCheckout", { content_name: product.name, content_ids: [product.shortName], content_type: "product", value: method === "cod" ? product.codPrice : product.onlinePrice, currency: "INR" });
  }

  function updateCustomer(field: keyof CustomerDetails, value: string) {
    setOrderError("");
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    if (customer.name.trim().length < 2) return "कृपया पूरा नाम भरें।";
    if (!/^[6-9]\d{9}$/.test(customer.mobile)) return "सही 10-digit mobile number भरें।";
    if (customer.address.trim().length < 5) return "पूरा delivery address भरें।";
    if (!/^\d{6}$/.test(customer.pincode)) return "सही 6-digit PIN code भरें।";
    return "";
  }

  async function submitOrder() {
    const error = validate();
    if (error) {
      setOrderError(error);
      return;
    }

    setSaving(true);
    setOrderError("");

    const ref = `AUR${Date.now()}`;
    setOrderRef(ref);

    try {
      const response = await fetch(crmOrderEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: ref,
          customer: customer.name.trim(),
          phone: customer.mobile,
          address: customer.address.trim(),
          city: "Unknown",
          district: "Unknown",
          state: "Unknown",
          pincode: customer.pincode,
          quantity: "1",
          product: product.name,
          notes: product.detail,
          amount: String(payable),
          payment: paymentMethod === "upi" ? "Prepaid" : "COD",
          order_type: "Order",
          website: window.location.hostname,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true || !result?.order?.orderCode) {
        throw new Error(result?.error || "Order save नहीं हुआ।");
      }

      setOrderSuccess(String(result.order.orderCode));
      if (paymentMethod === "cod") {
        trackPixel("Purchase", { value: Number(result.order.amount) || product.codPrice, currency: "INR", content_name: product.name, content_ids: [product.shortName], content_type: "product", num_items: 1, order_id: String(result.order.orderCode) });
      }

      if (paymentMethod === "upi") {
        const params = new URLSearchParams({
          pa: upiId,
          pn: "AMRIT AYURVEDA",
          tn: `${product.shortName} ${ref}`,
          am: product.onlinePrice.toFixed(2),
          cu: "INR",
        });
        window.location.assign(`upi://pay?${params.toString()}`);
      }
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : "Order save नहीं हुआ। कृपया दोबारा कोशिश करें।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="premiumSite">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Amrit Ayurveda home">
          <span className="brandMark">✦</span>
          <span><strong>AMRIT</strong><small>AYURVEDA</small></span>
        </a>
        <nav>
          <a href="#product">Product</a>
          <a href="#details">Details</a>
          <a href="#how">How to use</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="waButton" href={cleanWhatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
      </header>

      <section className="hero" id="home">
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />
        <div className="heroCopy">
          <p className="eyebrow">AMRIT AYURVEDA • PREMIUM WELLNESS</p>
          <h1>AMRIT <em>URJA</em></h1>
          <p className="heroLead">
            30 Capsules और 20 ml Massage Oil का premium Ayurvedic wellness combo,
            एक साफ़ और आसान daily routine के लिए।
          </p>
          <div className="heroBadges">
            <span>30 Capsules</span>
            <span>20 ml Oil</span>
            <span>Secure Packing</span>
          </div>
          <div className="pricePanel">
            <div><small>ONLINE PAYMENT</small><strong>₹{money(product.onlinePrice)}</strong></div>
            <div><small>CASH ON DELIVERY</small><strong>₹{money(product.codPrice)}</strong></div>
          </div>
          <div className="heroActions">
            <button className="primaryButton" onClick={() => openOrder("cod")}>ORDER NOW</button>
            <a className="secondaryButton" href="#details">VIEW DETAILS</a>
          </div>
          <p className="microCopy">Product information और usage guidance के लिए pack label को प्राथमिकता दें।</p>
        </div>

        <div className="heroVisual" aria-label="AMRIT URJA product image">
          <div className="productFrame">
            <div className="frameLine" />
            <img src={product.image} alt="AMRIT URJA capsule bottle और 20 ml massage oil bottle" />
            <div className="frameCaption">
              <span>AMRIT URJA</span>
              <small>Capsule + Oil Combo</small>
            </div>
          </div>
        </div>
      </section>

      <section className="trustStrip">
        <article><b>01</b><strong>Premium Presentation</strong><span>Green, cream और gold inspired packaging</span></article>
        <article><b>02</b><strong>Simple Routine</strong><span>Capsule और oil को एक combo में रखा गया है</span></article>
        <article><b>03</b><strong>Private Packing</strong><span>Order को साफ़ और सुरक्षित packing में भेजा जाता है</span></article>
        <article><b>04</b><strong>Direct Support</strong><span>Order और delivery assistance WhatsApp पर</span></article>
      </section>

      <section className="productSection" id="product">
        <div className="productCard">
          <div className="miniLabel">AMRIT AYURVEDA</div>
          <img src={product.image} alt="AMRIT URJA combo pack" />
          <div className="productCardFoot">
            <span>30 CAPSULES + 20 ml OIL</span>
            <strong>AMRIT URJA</strong>
          </div>
        </div>

        <div className="sectionCopy" id="details">
          <p className="eyebrow">ONE CLEAN COMBO</p>
          <h2>एक premium box-style presentation में capsule और oil</h2>
          <p>
            Website को अब AMRIT URJA की packaging के green, cream और gold look के हिसाब से रखा गया है।
            Product presentation simple है ताकि customer को एक ही combo साफ़ दिखाई दे।
          </p>
          <div className="detailGrid">
            <article><span>Capsules</span><b>30</b><small>Pack quantity</small></article>
            <article><span>Oil</span><b>20 ml</b><small>Massage oil</small></article>
            <article><span>Brand</span><b>AMRIT URJA</b><small>by Amrit Ayurveda</small></article>
            <article><span>Order</span><b>COD / UPI</b><small>Two payment options</small></article>
          </div>
          <button className="darkButton" onClick={() => openOrder("cod")}>BUY AMRIT URJA</button>
        </div>
      </section>

      <section className="routineSection" id="how">
        <div className="sectionHeading">
          <p className="eyebrow">DAILY ROUTINE</p>
          <h2>Use the product only as directed on the label</h2>
          <p>
            Capsule और oil के उपयोग की final instructions हमेशा product label पर दी गई directions के अनुसार follow करें।
          </p>
        </div>
        <div className="routineGrid">
          <article><b>1</b><h3>Read the label</h3><p>Pack पर ingredient और usage information check करें।</p></article>
          <article><b>2</b><h3>Follow directions</h3><p>Recommended amount और method से अधिक उपयोग न करें।</p></article>
          <article><b>3</b><h3>Store carefully</h3><p>Product को cool, dry place में और बच्चों की पहुँच से दूर रखें।</p></article>
        </div>
      </section>

      <section className="orderBand">
        <div>
          <p className="eyebrow light">AMRIT URJA COMBO</p>
          <h2>30 Capsules + 20 ml Oil</h2>
          <p>Online ₹{money(product.onlinePrice)} • COD ₹{money(product.codPrice)}</p>
        </div>
        <div className="orderBandActions">
          <button onClick={() => openOrder("upi")}>ONLINE PAYMENT</button>
          <button onClick={() => openOrder("cod")}>CASH ON DELIVERY</button>
        </div>
      </section>

      <section className="faqSection" id="faq">
        <div className="sectionHeading">
          <p className="eyebrow">FAQ</p>
          <h2>Common questions</h2>
        </div>
        <div className="faqList">
          <details>
            <summary>AMRIT URJA combo में क्या मिलता है?</summary>
            <p>एक 30-capsule bottle और एक 20 ml massage oil bottle।</p>
          </details>
          <details>
            <summary>Payment options क्या हैं?</summary>
            <p>Cash on Delivery और UPI / Online Payment दोनों options available हैं।</p>
          </details>
          <details>
            <summary>Product कैसे use करना है?</summary>
            <p>Product label पर लिखी usage directions को follow करें। किसी medical condition या medicine के साथ use करने से पहले qualified professional से सलाह लेना उचित है।</p>
          </details>
          <details>
            <summary>Delivery packing कैसी होगी?</summary>
            <p>Order को secure outer packing में भेजा जाता है।</p>
          </details>
        </div>
      </section>

      <footer>
        <div className="footerBrand"><strong>AMRIT AYURVEDA</strong><span>Premium Ayurvedic Wellness</span></div>
        <div><b>Product</b><a href="#product">AMRIT URJA</a><a href="#how">How to use</a></div>
        <div><b>Support</b><a href={cleanWhatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><a href="#faq">FAQ</a></div>
        <small>यह product general wellness presentation के लिए है। किसी बीमारी के diagnosis, treatment, cure या prevention का दावा नहीं किया गया है।</small>
      </footer>

      <button className="mobileOrder" onClick={() => openOrder("cod")}>ORDER NOW • COD AVAILABLE</button>
      <nav className="floatingContact" aria-label="तुरंत संपर्क करें">
        <a className="floatingContactButton floatingWhatsapp" href={cleanWhatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp पर बात करें" title="WhatsApp पर बात करें">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.2 11.6a8.2 8.2 0 0 1-12.1 7.2L3.5 20l1.2-4.5a8.2 8.2 0 1 1 15.5-3.9Z"/><path d="M8.7 8.3c-.5.6-.5 1.2-.2 1.9a10 10 0 0 0 5.2 5.2c.7.3 1.3.3 1.9-.2l.7-.9-2.3-1.2-.8.9a7.2 7.2 0 0 1-2.5-2.5l.9-.8-1.2-2.3-.9.7Z" transform="translate(0 3.7)"/></svg>
        </a>
        <a className="floatingContactButton floatingCall" href={`tel:+${phone}`} aria-label="अभी कॉल करें" title="अभी कॉल करें">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16.2v3a2 2 0 0 1-2.2 2 17.6 17.6 0 0 1-7.7-2.7 17.2 17.2 0 0 1-5.3-5.3A17.6 17.6 0 0 1 3.1 5.4 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7l.5 2.7a2 2 0 0 1-.6 1.8L8.5 10.7a14 14 0 0 0 4.8 4.8l1.5-1.5a2 2 0 0 1 1.8-.6l2.7.5a2 2 0 0 1 1.7 2.3Z"/></svg>
        </a>
      </nav>

      {introOpen && (
        <div className="introOverlay" role="dialog" aria-modal="true" aria-label="AMRIT URJA product">
          <section className="introCard">
            <button className="introClose" onClick={() => setIntroOpen(false)} aria-label="Close">×</button>
            <img
              src={product.image}
              alt="AMRIT URJA 30 capsules and 20 ml massage oil"
              className="introImage"
            />
            <div className="introActions">
              <button onClick={() => { setIntroOpen(false); openOrder("cod"); }}>ORDER NOW</button>
              <button className="introSecondary" onClick={() => setIntroOpen(false)}>VIEW WEBSITE</button>
            </div>
          </section>
        </div>
      )}

      {orderOpen && (
        <div className="orderOverlay" role="dialog" aria-modal="true" aria-labelledby="order-title">
          <section className="orderCard">
            <button className="closeButton" onClick={() => setOrderOpen(false)} aria-label="Close">×</button>
            <div className="orderProduct">
              <img src={product.image} alt="AMRIT URJA" />
              <div><small>AMRIT AYURVEDA</small><strong id="order-title">AMRIT URJA</strong><span>{product.detail}</span></div>
            </div>

            {orderSuccess ? (
              <div className="successBox">
                <div className="successTick">✓</div>
                <h3>Order successfully saved</h3>
                <p>Order ID: <b>{orderSuccess}</b></p>
                {paymentMethod === "cod" ? (
                  <p>Cash on Delivery order CRM में save हो गया है।</p>
                ) : (
                  <a className="primaryButton full" href={upiUrl}>UPI PAYMENT खोलें</a>
                )}
                <button className="secondaryButton full" onClick={() => setOrderOpen(false)}>CLOSE</button>
              </div>
            ) : (
              <>
                <div className="paymentTabs">
                  <button className={paymentMethod === "cod" ? "active" : ""} onClick={() => setPaymentMethod("cod")}>
                    <span>COD</span><b>₹{money(product.codPrice)}</b>
                  </button>
                  <button className={paymentMethod === "upi" ? "active" : ""} onClick={() => setPaymentMethod("upi")}>
                    <span>ONLINE / UPI</span><b>₹{money(product.onlinePrice)}</b>
                  </button>
                </div>

                <div className="orderFields">
                  <label>पूरा नाम<input value={customer.name} onChange={(e) => updateCustomer("name", e.target.value)} autoComplete="name" placeholder="Customer Name" /></label>
                  <label>मोबाइल नंबर<input value={customer.mobile} onChange={(e) => updateCustomer("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" placeholder="10 digit mobile number" /></label>
                  <label>पूरा पता<textarea value={customer.address} onChange={(e) => updateCustomer("address", e.target.value)} autoComplete="street-address" rows={3} placeholder="House, street, area, city" /></label>
                  <label>PIN code<input value={customer.pincode} onChange={(e) => updateCustomer("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="postal-code" placeholder="6 digit PIN code" /></label>
                </div>

                {orderError && <p className="orderError">{orderError}</p>}

                <button className="confirmButton" disabled={saving} onClick={() => void submitOrder()}>
                  {saving ? "ORDER SAVE हो रहा है…" : paymentMethod === "cod" ? `COD ORDER CONFIRM • ₹${money(payable)}` : `ONLINE ORDER CONFIRM • ₹${money(payable)}`}
                </button>
                <small className="privacyLine">आपकी details केवल order processing और delivery के लिए उपयोग होंगी।</small>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
