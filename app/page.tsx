"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const upiId = "8295820654@okbizaxis";
const crmOrderEndpoint = "/api/website-order";

const product = {
  name: "AMRIT URJA Capsule + Oil Combo",
  shortName: "AMRIT URJA",
  catalogId: "hdwo1ljwss",
  image: "/amrit-urja-product.png",
  detail: "30 Capsules + 20 ml Massage Oil",
  codPrice: 999,
  onlinePrice: 999,
} as const;

type PixelEvent = "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
function trackPixel(
  event: PixelEvent,
  data: Record<string, string | number | string[]>,
  eventId?: string,
) {
  const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq !== "function") return;
  const id = eventId || `${event.toLowerCase()}_${window.crypto.randomUUID()}`;
  fbq("track", event, data, { eventID: id });
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  const part = document.cookie.split("; ").find((item) => item.startsWith(prefix));
  return part ? decodeURIComponent(part.slice(prefix.length)) : "";
}

type PaymentMethod = "cod" | "upi";

type CustomerDetails = {
  name: string;
  mobile: string;
  address: string;
  pincode: string;
};

function money(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function Home() {

  const [offerOpen, setOfferOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [offerShown, setOfferShown] = useState(false);
  const pack = 1 as const;
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

  const packCatalog = {
    1: { id: "hdwo1ljwss", title: "AMRIT URJA — 1 Combo", price: 999 },
  } as const;
  const packPrices = { 1: 999 } as const;
  const selectedCatalog = packCatalog[pack];
  const basePayable = packPrices[pack];
  const payable = basePayable;

  useEffect(() => {
    if (offerShown || orderOpen) return;
    const timer = window.setTimeout(() => {
      setOfferOpen(true);
      setOfferShown(true);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [offerShown, orderOpen]);


  useEffect(() => {
    const section = document.getElementById("product");
    if (!section) return;
    let sent = false;
    let visible = false;
    const sendView = () => {
      const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
      if (sent || !visible || typeof fbq !== "function") return;
      sent = true;
      trackPixel("ViewContent", {
        content_name: packCatalog[1].title,
        content_ids: [packCatalog[1].id],
        content_type: "product",
        value: packCatalog[1].price,
        currency: "INR",
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sendView();
    }, { threshold: 0.1 });
    observer.observe(section);
    const retry = window.setInterval(sendView, 500);
    return () => {
      observer.disconnect();
      window.clearInterval(retry);
    };
  }, []);

  const upiUrl = useMemo(() => {
    const ref = orderRef || "AMRIT-URJA";
    const params = new URLSearchParams({
      pa: upiId,
      pn: "AMRIT AYURVEDA",
      tn: `${product.shortName} ${ref}`,
      am: payable.toFixed(2),
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  }, [orderRef, payable]);

  function openOrder(method: PaymentMethod = "cod", orderPack: 1 = pack) {
    const catalog = packCatalog[orderPack];
    setPaymentMethod(method);
    setOrderError("");
    setOrderSuccess("");
    setOfferOpen(false);
    setOrderOpen(true);
    const eventData = {
      content_name: catalog.title,
      content_ids: [catalog.id],
      content_type: "product",
      value: catalog.price,
      currency: "INR",
    };
    trackPixel("ViewContent", eventData);
    trackPixel("AddToCart", eventData);
    trackPixel("InitiateCheckout", eventData);
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
    const metaEventId = `purchase_${ref}`;
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
          quantity: String(pack),
          product: selectedCatalog.title,
          content_ids: [selectedCatalog.id],
          content_type: "product",
          currency: "INR",
          contents: [{ id: selectedCatalog.id, quantity: 1, item_price: payable }],
          notes: `${pack} × ${product.detail}`,
          amount: String(payable),
          payment: paymentMethod === "upi" ? "Prepaid" : "COD",
          order_type: "Order",
          website: window.location.hostname,
          meta_event_name: "Purchase",
          meta_event_id: metaEventId,
          event_id: metaEventId,
          event_source_url: window.location.href,
          client_user_agent: navigator.userAgent,
          fbp: readCookie("_fbp"),
          fbc: readCookie("_fbc"),
          fbclid: new URLSearchParams(window.location.search).get("fbclid") || "",
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true || !result?.order?.orderCode) {
        throw new Error(result?.error || "Order save नहीं हुआ।");
      }

      setOrderSuccess(String(result.order.orderCode));
      if (paymentMethod === "cod") {
        trackPixel(
          "Purchase",
          { value: Number(result.order.amount) || payable, currency: "INR", content_name: selectedCatalog.title, content_ids: [selectedCatalog.id], content_type: "product", num_items: 1, order_id: String(result.order.orderCode) },
          metaEventId,
        );
      }

      if (paymentMethod === "upi") {
        const params = new URLSearchParams({
          pa: upiId,
          pn: "AMRIT AYURVEDA",
          tn: `${product.shortName} ${ref}`,
          am: payable.toFixed(2),
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
      <div className="announcement">🌿 सुरक्षित पैकिंग <span>•</span> Cash on Delivery उपलब्ध <span>•</span> Amrit Ayurveda</div>
      <header className="topbar">
        <button className="menuToggle" onClick={() => setMenuOpen(true)} aria-label="मेन्यू खोलें" aria-expanded={menuOpen}>☰</button>
        <a className="brand" href="#home" aria-label="Amrit Ayurveda home">
          <span className="brandMark">✦</span>
          <span><strong>AMRIT</strong><small>AYURVEDA</small></span>
        </a>
        <nav>
          <a href="#product">Product</a>
          <button className="navHow" onClick={() => setHowOpen(true)}>How to use</button>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="headerOrder" onClick={() => openOrder("cod")}>अभी ऑर्डर करें</button>
      </header>

      <section className="referenceHero" id="home">
        <a href="#product" aria-label="AMRIT URJA के pack और ऑर्डर विकल्प देखें" style={{ display: "block", width: "100%", borderRadius: "0", overflow: "hidden" }}>
          <Image sizes="100vw" preload src="/amrit-urja-front-no-phone.webp" alt="AMRIT URJA — 30 Capsules + 20 ml Oil, Amrit Ayurveda" width={853} height={1844} fetchPriority="high" style={{ display: "block", width: "100%", height: "auto" }} />
        </a>
        <div className="posterOrder" id="product">
          <h2>AMRIT URJA — Capsule + Oil Combo</h2>
          <p className="posterPrice">Only ₹999</p>
          <p className="posterPriceNote">कैश ऑन डिलीवरी उपलब्ध है। Online/UPI से भी भुगतान कर सकते हैं।</p>
          <button className="posterCod" onClick={() => openOrder("cod")}>अभी ऑर्डर करें — कैश ऑन डिलीवरी ₹999</button>
          <button className="posterOnline" onClick={() => openOrder("upi")}>▣ Online / UPI — ₹{money(payable)}</button>
        </div>
      </section>

      <section className="benefitsShowcase" aria-label="AMRIT URJA information gallery">
        <div className="benefitsPhotoGrid">
          <Image width={1010} height={1600} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" src="/my-photos/photo-1.jpg" alt="AMRIT URJA information 1" />
          <Image width={1067} height={1600} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" src="/my-photos/photo-2.jpg" alt="AMRIT URJA information 2" />
          <Image width={915} height={1600} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" src="/my-photos/photo-3.jpg" alt="AMRIT URJA information 3" />
        </div>
      </section>

      <section className="routineSection" id="how">
        <div className="sectionHeading">
          <p className="eyebrow">HOW TO USE</p>
          <h2>AMRIT URJA कैसे इस्तेमाल करें</h2>
          <p>Pack पर लिखी जानकारी भी पढ़ें।</p>
        </div>
        <div className="routineGrid">
          <article><b>01</b><h3>रोज़ एक कैप्सूल</h3><p>खाना खाने के आधे घंटे बाद हल्के दूध या पानी के साथ लें।</p></article>
          <article><b>02</b><h3>रोज़ ऑयल मसाज</h3><p>ऑयल से प्रतिदिन 1–2 मिनट हल्की मसाज करें।</p></article>
          <article><b>03</b><h3>Pack देखें</h3><p>मात्रा, सावधानियों और सामग्री के लिए पैक पर दी जानकारी पढ़ें।</p></article>
        </div>
        <button className="howVisualButton" onClick={() => setHowOpen(true)}>चित्र के साथ इस्तेमाल देखें</button>
      </section>

      <section className="orderBand">
        <div>
          <p className="eyebrow light">AMRIT URJA COMBO</p>
          <h2>30 Capsules + 20 ml Oil</h2>
          <p>Only ₹999</p>
        </div>
        <div className="orderBandActions">
          <button onClick={() => openOrder("upi")}>ONLINE PAYMENT</button>
          <button onClick={() => openOrder("cod")}>अभी ऑर्डर करें — कैश ऑन डिलीवरी ₹999</button>
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
            <p>Only ₹999 में उपलब्ध है। Cash on Delivery और Online / UPI दोनों विकल्प उपलब्ध हैं।</p>
          </details>
          <details>
            <summary>Product कैसे use करना है?</summary>
            <p>रोज़ एक कैप्सूल खाना खाने के आधे घंटे बाद हल्के दूध या पानी के साथ लें। ऑयल से प्रतिदिन 1–2 मिनट हल्की मसाज करें। पैक पर दी सावधानियाँ पढ़ें।</p>
          </details>
          <details>
            <summary>Delivery packing कैसी होगी?</summary>
            <p>Order को secure outer packing में भेजा जाता है।</p>
          </details>
        </div>
      </section>

      <footer>
        <div className="footerBrand">
          <strong>AMRIT AYURVEDA</strong>
          <span>Premium Ayurvedic Wellness</span>
          <a className="footerPhone" href="tel:8290695226">☎ SUPPORT: +91 8290695226</a>
        </div>
        <div><b>Product</b><a href="#product">AMRIT URJA</a><a href="#how">How to use</a></div>
        <div><b>Contact</b><a href="tel:8290695226">Call: 8290695226</a><a href="#faq">FAQ</a></div>
        <small>यह product general wellness presentation के लिए है। किसी बीमारी के diagnosis, treatment, cure या prevention का दावा नहीं किया गया है।</small>
      </footer>

      {menuOpen && <div className="menuOverlay" role="dialog" aria-modal="true" aria-label="वेबसाइट मेन्यू"><div className="menuDrawer"><button className="menuClose" onClick={() => setMenuOpen(false)} aria-label="मेन्यू बंद करें">×</button><strong>AMRIT AYURVEDA</strong><a href="#home" onClick={() => setMenuOpen(false)}>होम</a><a href="#product" onClick={() => setMenuOpen(false)}>AMRIT URJA Combo</a><button onClick={() => { setMenuOpen(false); setHowOpen(true); }}>How to use — इस्तेमाल कैसे करें</button><a href="#faq" onClick={() => setMenuOpen(false)}>सवाल और जवाब</a><button className="menuBuy" onClick={() => { setMenuOpen(false); openOrder("cod"); }}>ऑर्डर करें</button></div><button className="menuBackdrop" aria-label="मेन्यू बंद करें" onClick={() => setMenuOpen(false)} /></div>}

      {howOpen && <div className="howOverlay" role="dialog" aria-modal="true" aria-labelledby="how-modal-title"><section className="howCard"><button className="howClose" onClick={() => setHowOpen(false)} aria-label="इस्तेमाल की जानकारी बंद करें">×</button><Image width={941} height={1672} sizes="(max-width: 768px) 160px, 400px" src={product.image} alt="AMRIT URJA 30 capsules और 20 ml oil का pack" /><div className="howCardCopy"><small>AMRIT AYURVEDA • HOW TO USE</small><h2 id="how-modal-title">इस्तेमाल कैसे करें</h2><div className="howStep"><b>01 · कैप्सूल</b><p>रोज़ एक कैप्सूल खाना खाने के आधे घंटे बाद हल्के दूध या पानी के साथ लें।</p></div><div className="howStep"><b>02 · ऑयल</b><p>ऑयल से प्रतिदिन 1–2 मिनट हल्की मसाज करें।</p></div><p className="howCaution">सामग्री और सावधानियों के लिए पैक की जानकारी पढ़ें।</p><button onClick={() => { setHowOpen(false); openOrder("cod"); }}>AMRIT URJA ऑर्डर करें</button></div></section></div>}

      {offerOpen && !orderOpen && (
        <div className="offerOverlay" role="dialog" aria-modal="true" aria-labelledby="quick-offer-title">
          <section className="offerCard">
            <button className="offerClose" onClick={() => setOfferOpen(false)} aria-label="ऑफर बंद करें">×</button>
            <span className="offerBadge">⚡ SPECIAL OFFER</span>
            <h2 id="quick-offer-title">रुकिए! जाने से पहले<br /><span>यह ऑफर देखिए</span></h2>
            <p>AMRIT URJA — Only <b>₹999</b> में</p>
            <strong className="offerCodLine">✅ Cash on Delivery उपलब्ध</strong>
            <button className="offerAction" onClick={() => { openOrder("cod", 1); }}>अभी ऑर्डर करें — कैश ऑन डिलीवरी ₹999</button>
            <small>🔒 सुरक्षित पैकिंग • आसान ऑर्डर</small>
          </section>
        </div>
      )}


      {orderOpen && (
        <div className="orderOverlay" role="dialog" aria-modal="true" aria-labelledby="order-title">
          <section className="orderCard">
            <button className="closeButton" onClick={() => setOrderOpen(false)} aria-label="Close">×</button>
            <div className="orderProduct">
              <Image width={941} height={1672} sizes="(max-width: 768px) 160px, 400px" src={product.image} alt="AMRIT URJA" />
              <div><small>AMRIT AYURVEDA</small><strong id="order-title">AMRIT URJA</strong><span>{pack} × {product.detail}</span></div>
            </div>

            {orderSuccess ? (
              <div className="successBox">
                <div className="successHalo" aria-hidden="true">
                  <div className="successTick">✓</div>
                </div>
                <p className="successEyebrow">AMRIT AYURVEDA</p>
                <h3>Order successfully saved</h3>
                <p className="successLead">धन्यवाद! आपका ऑर्डर हमें मिल गया है।</p>

                <div className="successJourney" aria-label="Order next steps">
                  <div className="successStep">
                    <span>1</span>
                    <div><b>ऑर्डर प्राप्त हुआ</b><small>आपकी order request सुरक्षित रूप से दर्ज हो गई है।</small></div>
                  </div>
                  <div className="successStep">
                    <span>2</span>
                    <div><b>हमारी टीम आपसे संपर्क करेगी</b><small>हम जल्द ही कॉल करके आपका नाम, पता और ऑर्डर confirm करेंगे।</small></div>
                  </div>
                  <div className="successStep">
                    <span>3</span>
                    <div><b>पैकिंग और डिलीवरी</b><small>Confirmation के बाद आपका parcel delivery के लिए process किया जाएगा।</small></div>
                  </div>
                </div>

                {paymentMethod === "cod" ? (
                  <div className="successCodPill">✓ Cash on Delivery selected</div>
                ) : (
                  <a className="primaryButton full successPay" href={upiUrl}>UPI PAYMENT खोलें</a>
                )}

                <a className="successCall" href="tel:8290695226">
                  <span>☎</span>
                  <div><small>किसी मदद के लिए कॉल करें</small><strong>8290695226</strong></div>
                </a>

                <button className="secondaryButton full successClose" onClick={() => setOrderOpen(false)}>DONE</button>
                <small className="successFoot">AMRIT AYURVEDA • सुरक्षित पैकिंग • Customer Support</small>
              </div>
            ) : (
              <>
                <div className="paymentTabs">
                  <button className={paymentMethod === "cod" ? "active" : ""} onClick={() => setPaymentMethod("cod")}>
                    <span>COD</span><b>₹{money(payable)}</b>
                  </button>
                  <button className={paymentMethod === "upi" ? "active" : ""} onClick={() => setPaymentMethod("upi")}>
                    <span>ONLINE / UPI</span><b>₹{money(payable)}</b>
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
