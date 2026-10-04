"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

const upiId = "8295820654@okbizaxis";
const whatsappBusinessNumber = "918290695226";
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

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function normalizeIndianMobile(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 14 && digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function duplicateStorageKey(mobile: string) {
  return `amrit-order-24h:${product.catalogId}:${mobile}`;
}

type SavedOrderReceipt = {
  orderCode: string;
  orderRef?: string;
  savedAt: number;
  confirmed?: boolean;
};

function money(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

type Pack = 1 | 2 | 3;

export default function Home() {

  const [offerOpen, setOfferOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [offerShown, setOfferShown] = useState(false);
  const [pack, setPack] = useState<Pack>(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    mobile: "",
    address: "",
    pincode: "",
  });
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const checkoutAttempt = useRef({ fingerprint: "", ref: "", createdAt: 0 });
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [duplicateOrder, setDuplicateOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmCountdown, setConfirmCountdown] = useState(8);
  const [confirmSaving, setConfirmSaving] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [orderRef, setOrderRef] = useState("");

  const packCatalog = {
    1: { id: "hdwo1ljwss", title: "AMRIT URJA — 1 Combo", price: 999 },
    2: { id: "amrit-urja-2-combo", title: "AMRIT URJA — 2 Combo", price: 1499 },
    3: { id: "amrit-urja-3-combo", title: "AMRIT URJA — 3 Combo", price: 1999 },
  } as const;
  const packPrices = { 1: 999, 2: 1499, 3: 1999 } as const;
  const selectedCatalog = packCatalog[pack];
  const basePayable = packPrices[pack];
  const payable = basePayable;

  useEffect(() => {
    if (offerShown || orderOpen || cartOpen) return;
    const timer = window.setTimeout(() => {
      setOfferOpen(true);
      setOfferShown(true);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [offerShown, orderOpen, cartOpen]);


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

  const whatsappConfirmUrl = useMemo(() => {
    const orderCode = orderSuccess || orderRef || "AMRIT-URJA";
    const message = [
      "YES, मेरा AMRIT URJA COD ऑर्डर Confirm है।",
      `Order ID: ${orderCode}`,
      `नाम: ${customer.name.trim()}`,
      `मोबाइल: ${normalizeIndianMobile(customer.mobile)}`,
      "मैं यह parcel receive करूँगा।",
    ].join("\n");
    return `https://wa.me/${whatsappBusinessNumber}?text=${encodeURIComponent(message)}`;
  }, [orderSuccess, orderRef, customer.name, customer.mobile]);

  useEffect(() => {
    if (!orderSuccess || paymentMethod !== "cod" || orderConfirmed) return;
    setConfirmCountdown(8);
    const timer = window.setInterval(() => {
      setConfirmCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [orderSuccess, paymentMethod, orderConfirmed]);

  function commerceEventData(orderPack: Pack) {
    const catalog = packCatalog[orderPack];
    return {
      content_name: catalog.title,
      content_ids: [catalog.id],
      content_type: "product",
      value: catalog.price,
      currency: "INR",
    };
  }

  function openCart(method: PaymentMethod = "cod", orderPack: Pack = pack) {
    setPack(orderPack);
    setPaymentMethod(method);
    setOrderError("");
    setOrderSuccess("");
    setDuplicateOrder(false);
    setOrderConfirmed(false);
    setConfirmError("");
    setConfirmCountdown(8);
    setOfferOpen(false);
    setOrderOpen(false);
    setCartOpen(true);
    const eventData = commerceEventData(orderPack);
    trackPixel("ViewContent", eventData);
    trackPixel("AddToCart", eventData);
  }

  function choosePack(nextPack: Pack) {
    setPack(nextPack);
    setOrderError("");
    trackPixel("AddToCart", commerceEventData(nextPack));
  }

  function openOrder(method: PaymentMethod = paymentMethod, orderPack: Pack = pack) {
    setPack(orderPack);
    setPaymentMethod(method);
    setOrderError("");
    setOrderSuccess("");
    setDuplicateOrder(false);
    setOrderConfirmed(false);
    setConfirmError("");
    setConfirmCountdown(8);
    setOfferOpen(false);
    setCartOpen(false);
    setOrderOpen(true);
    trackPixel("InitiateCheckout", commerceEventData(orderPack));
  }

  function updateCustomer(field: keyof CustomerDetails, value: string) {
    setOrderError("");
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    if (customer.name.trim().length < 2) return "कृपया पूरा नाम भरें।";
    const mobile = normalizeIndianMobile(customer.mobile);
    if (!/^[6-9]\d{9}$/.test(mobile)) return "सही 10-digit mobile number भरें।";
    if (customer.address.trim().length < 5) return "पूरा delivery address भरें।";
    if (!/^\d{6}$/.test(customer.pincode)) return "सही 6-digit PIN code भरें।";
    return "";
  }

  async function submitOrder() {
    if (submitting.current || saving || orderSuccess) return;
    const error = validate();
    if (error) {
      setOrderError(error);
      return;
    }

    const normalizedMobile = normalizeIndianMobile(customer.mobile);
    const phoneDuplicateKey = duplicateStorageKey(normalizedMobile);
    try {
      const receipt = JSON.parse(localStorage.getItem(phoneDuplicateKey) || "null") as SavedOrderReceipt | null;
      if (receipt?.orderCode && typeof receipt.savedAt === "number" && Date.now() - receipt.savedAt < DUPLICATE_WINDOW_MS) {
        setDuplicateOrder(true);
        setOrderSuccess(receipt.orderCode);
        setOrderRef(receipt.orderRef || receipt.orderCode);
        setOrderConfirmed(receipt.confirmed === true);
        return;
      }
      if (receipt) localStorage.removeItem(phoneDuplicateKey);
    } catch {}

    submitting.current = true;
    setSaving(true);
    setOrderError("");

    const fingerprint = JSON.stringify([customer.name.trim(), normalizedMobile, customer.address.trim(), customer.pincode, pack, payable, paymentMethod]);
    let attempt = checkoutAttempt.current;
    try {
      const cached = JSON.parse(sessionStorage.getItem("amrit-checkout-attempt") || "null");
      if (cached?.fingerprint === fingerprint && typeof cached.ref === "string" && Date.now() - cached.createdAt < 86400000) attempt = cached;
    } catch {}
    const ref = attempt.fingerprint === fingerprint && attempt.ref && Date.now() - attempt.createdAt < 86400000 ? attempt.ref : `AUR${window.crypto.randomUUID().replaceAll("-", "")}`;
    checkoutAttempt.current = { fingerprint, ref, createdAt: attempt.ref === ref ? attempt.createdAt : Date.now() };
    try { sessionStorage.setItem("amrit-checkout-attempt", JSON.stringify(checkoutAttempt.current)); } catch {}
    const metaEventId = `lead_${ref}`;
    setOrderRef(ref);

    try {
      const response = await fetch(crmOrderEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: ref,
          customer: customer.name.trim(),
          phone: normalizedMobile,
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
          status: "Pending Confirm",
          confirmation_status: paymentMethod === "cod" ? "WhatsApp Pending" : "Payment Pending",
          source: "Website",
          website: window.location.hostname,
          meta_event_name: "Lead",
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

      const savedOrderCode = String(result.order.orderCode);
      setDuplicateOrder(result.duplicate === true);
      setOrderSuccess(savedOrderCode);
      try {
        localStorage.setItem(phoneDuplicateKey, JSON.stringify({ orderCode: savedOrderCode, orderRef: ref, savedAt: Date.now(), confirmed: false } satisfies SavedOrderReceipt));
      } catch {}

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
      submitting.current = false;
      setSaving(false);
    }
  }

  async function submitDoubleConfirmation() {
    if (!orderSuccess || paymentMethod !== "cod" || orderConfirmed || confirmSaving || confirmCountdown > 0) return;
    setConfirmSaving(true);
    setConfirmError("");
    try {
      const wp = (window as Window & {
        WP?: {
          sapi: (projectId: number) => {
            submitForm: (formName: string, fields: Record<string, string>) => Promise<{
              ok: boolean;
              data?: { success?: boolean; error?: { message?: string }; message?: string };
            }>;
          };
        };
      }).WP;
      if (!wp?.sapi) throw new Error("Confirmation system अभी load हो रहा है। 2 सेकंड बाद दोबारा दबाएँ।");
      const sapi = wp.sapi(26522);
      const result = await sapi.submitForm("website_order_v2", {
        order_id: orderRef || orderSuccess,
        crm_order_code: orderSuccess,
        phone: normalizeIndianMobile(customer.mobile),
        customer: customer.name.trim(),
        confirmation: "YES",
        payment: "COD",
        amount: String(payable),
        product: selectedCatalog.title,
        confirmed_at: new Date().toISOString(),
        website: "",
      });
      const payload = result?.data || {};
      if (!result?.ok || payload.success === false) {
        throw new Error(payload.error?.message || payload.message || "Order confirmation save नहीं हुई।");
      }

      setOrderConfirmed(true);
      const normalizedMobile = normalizeIndianMobile(customer.mobile);
      try {
        localStorage.setItem(
          duplicateStorageKey(normalizedMobile),
          JSON.stringify({ orderCode: orderSuccess, orderRef: orderRef || orderSuccess, savedAt: Date.now(), confirmed: true } satisfies SavedOrderReceipt),
        );
      } catch {}

      trackPixel(
        "Purchase",
        { value: payable, currency: "INR", content_name: selectedCatalog.title, content_ids: [selectedCatalog.id], content_type: "product", num_items: 1, order_id: orderSuccess },
        `purchase_${orderRef || orderSuccess}`,
      );
    } catch (e) {
      setConfirmError(e instanceof Error ? e.message : "Confirmation save नहीं हुई। कृपया दोबारा कोशिश करें।");
    } finally {
      setConfirmSaving(false);
    }
  }

  return (
    <main className="premiumSite">
      <Script src="https://cdn.websitepublisher.ai/js/sapi-client.js" strategy="afterInteractive" />
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
        <button className="headerOrder" onClick={() => openCart("cod")}>अभी ऑर्डर करें</button>
      </header>

      <section className="referenceHero" id="home">
        <a href="#product" aria-label="AMRIT URJA के pack और ऑर्डर विकल्प देखें" style={{ display: "block", width: "100%", borderRadius: "0", overflow: "hidden" }}>
          <Image sizes="100vw" preload src="/amrit-urja-front-no-phone.webp" alt="AMRIT URJA — 30 Capsules + 20 ml Oil, Amrit Ayurveda" width={853} height={1844} fetchPriority="high" style={{ display: "block", width: "100%", height: "auto" }} />
        </a>
        <div className="posterOrder" id="product">
          <h2>AMRIT URJA — Capsule + Oil Combo</h2>
          <p className="posterPrice">Only ₹999</p>
          <p className="posterPriceNote">कैश ऑन डिलीवरी उपलब्ध है। Online/UPI से भी भुगतान कर सकते हैं।</p>
          <button className="posterCod" onClick={() => openCart("cod")}>अभी ऑर्डर करें — कैश ऑन डिलीवरी ₹999</button>
          <button className="posterOnline" onClick={() => openCart("upi")}>▣ Online / UPI — ₹{money(payable)}</button>
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
          <button onClick={() => openCart("upi")}>ONLINE PAYMENT</button>
          <button onClick={() => openCart("cod")}>अभी ऑर्डर करें — कैश ऑन डिलीवरी ₹999</button>
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

      {menuOpen && <div className="menuOverlay" role="dialog" aria-modal="true" aria-label="वेबसाइट मेन्यू"><div className="menuDrawer"><button className="menuClose" onClick={() => setMenuOpen(false)} aria-label="मेन्यू बंद करें">×</button><strong>AMRIT AYURVEDA</strong><a href="#home" onClick={() => setMenuOpen(false)}>होम</a><a href="#product" onClick={() => setMenuOpen(false)}>AMRIT URJA Combo</a><button onClick={() => { setMenuOpen(false); setHowOpen(true); }}>How to use — इस्तेमाल कैसे करें</button><a href="#faq" onClick={() => setMenuOpen(false)}>सवाल और जवाब</a><button className="menuBuy" onClick={() => { setMenuOpen(false); openCart("cod"); }}>ऑर्डर करें</button></div><button className="menuBackdrop" aria-label="मेन्यू बंद करें" onClick={() => setMenuOpen(false)} /></div>}

      {howOpen && <div className="howOverlay" role="dialog" aria-modal="true" aria-labelledby="how-modal-title"><section className="howCard"><button className="howClose" onClick={() => setHowOpen(false)} aria-label="इस्तेमाल की जानकारी बंद करें">×</button><Image width={941} height={1672} sizes="(max-width: 768px) 160px, 400px" src={product.image} alt="AMRIT URJA 30 capsules और 20 ml oil का pack" /><div className="howCardCopy"><small>AMRIT AYURVEDA • HOW TO USE</small><h2 id="how-modal-title">इस्तेमाल कैसे करें</h2><div className="howStep"><b>01 · कैप्सूल</b><p>रोज़ एक कैप्सूल खाना खाने के आधे घंटे बाद हल्के दूध या पानी के साथ लें।</p></div><div className="howStep"><b>02 · ऑयल</b><p>ऑयल से प्रतिदिन 1–2 मिनट हल्की मसाज करें।</p></div><p className="howCaution">सामग्री और सावधानियों के लिए पैक की जानकारी पढ़ें।</p><button onClick={() => { setHowOpen(false); openCart("cod"); }}>AMRIT URJA ऑर्डर करें</button></div></section></div>}

      {offerOpen && !orderOpen && !cartOpen && (
        <div className="offerOverlay" role="dialog" aria-modal="true" aria-labelledby="quick-offer-title">
          <section className="offerCard">
            <button className="offerClose" onClick={() => setOfferOpen(false)} aria-label="ऑफर बंद करें">×</button>
            <span className="offerBadge">⚡ SPECIAL OFFER</span>
            <h2 id="quick-offer-title">रुकिए! जाने से पहले<br /><span>यह ऑफर देखिए</span></h2>
            <p>AMRIT URJA — Only <b>₹999</b> में</p>
            <strong className="offerCodLine">✅ Cash on Delivery उपलब्ध</strong>
            <button className="offerAction" onClick={() => { openCart("cod", 1); }}>अभी ऑर्डर करें — कैश ऑन डिलीवरी ₹999</button>
            <small>🔒 सुरक्षित पैकिंग • आसान ऑर्डर</small>
          </section>
        </div>
      )}



      {cartOpen && (
        <div className="cartOverlay" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <section className="cartCard">
            <button className="cartClose" onClick={() => setCartOpen(false)} aria-label="Cart बंद करें">×</button>
            <div className="cartHeader">
              <p>AMRIT AYURVEDA</p>
              <h2 id="cart-title">Shopping Cart</h2>
              <span>Home <b>›</b> Your Shopping Cart</span>
            </div>

            <div className="cartColumns"><b>Product</b><b>Price</b></div>
            <div className="cartProductRow">
              <Image width={941} height={1672} sizes="92px" src={product.image} alt="AMRIT URJA" />
              <div className="cartProductCopy">
                <strong>{product.name}</strong>
                <span>Pack: {pack} Combo{pack > 1 ? "s" : ""}</span>
                <button type="button" onClick={() => setCartOpen(false)}>Remove</button>
              </div>
              <strong className="cartPrice">₹{money(payable)}</strong>
            </div>

            <div className="cartQtyLine">
              <div className="cartQty" aria-label="Quantity">
                <button type="button" disabled={pack === 1} onClick={() => choosePack((pack - 1) as Pack)}>−</button>
                <span>{pack}</span>
                <button type="button" disabled={pack === 3} onClick={() => choosePack((pack + 1) as Pack)}>+</button>
              </div>
              <small>1 = ₹999 · 2 = ₹1,499 · 3 = ₹1,999</small>
            </div>

            <div className="cartTools" aria-label="Order benefits">
              <span>✎<small>Address at checkout</small></span>
              <span>🚚<small>Secure delivery</small></span>
              <span>🎟<small>COD / UPI</small></span>
            </div>

            <div className="cartSubtotal">
              <div><strong>Subtotal</strong><small>Shipping details checkout पर confirm होंगी</small></div>
              <strong>₹{money(payable)}</strong>
            </div>
            <button className="cartCheckout" onClick={() => openOrder(paymentMethod, pack)}>CHECKOUT</button>
            <button className="cartContinue" onClick={() => setCartOpen(false)}>← Shopping जारी रखें</button>
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
                <h3>{duplicateOrder ? "Order already received" : "Order successfully saved"}</h3>
                <p className="successLead">{duplicateOrder ? "इस मोबाइल नंबर से पिछले 24 घंटे में ऑर्डर पहले से मौजूद है। नया duplicate order नहीं बनाया गया।" : "धन्यवाद! आपका ऑर्डर हमें मिल गया है।"}</p>

                <div className="successJourney" aria-label="Order confirmation details">
                  <div className="successStep">
                    <span>1</span>
                    <div><b>नाम और मोबाइल</b><small>{customer.name.trim()} • {normalizeIndianMobile(customer.mobile)}</small></div>
                  </div>
                  <div className="successStep">
                    <span>2</span>
                    <div><b>Delivery address</b><small>{customer.address.trim()} • PIN {customer.pincode}</small></div>
                  </div>
                  <div className="successStep">
                    <span>3</span>
                    <div><b>COD Amount</b><small>₹{money(payable)} — parcel receive करते समय payment करें।</small></div>
                  </div>
                </div>

                {paymentMethod === "cod" ? (
                  <>
                    {orderConfirmed ? (
                      <>
                        <div className="successCodPill">✓ आपका COD Order CONFIRMED है</div>
                        <p className="successLead">धन्यवाद। अब यह order CRM में Confirm होकर dispatch के लिए तैयार रहेगा।</p>
                      </>
                    ) : (
                      <>
                        <div className="successCodPill">Cash on Delivery • अभी Pending Confirm</div>
                        <button
                          className="primaryButton full successPay"
                          type="button"
                          disabled={confirmSaving || confirmCountdown > 0}
                          onClick={() => void submitDoubleConfirmation()}
                        >
                          {confirmSaving
                            ? "CONFIRM हो रहा है…"
                            : confirmCountdown > 0
                              ? `${confirmCountdown} सेकंड बाद Order Confirm करें`
                              : `हाँ, मैं ₹${money(payable)} COD parcel लूँगा — CONFIRM ORDER`}
                        </button>
                        <small className="successFoot">ऊपर नाम, नंबर, पता और amount देखकर ही Confirm करें।</small>
                        {confirmError && <p className="orderError">{confirmError}</p>}
                      </>
                    )}
                  </>
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
                  <label>मोबाइल नंबर<input type="tel" value={customer.mobile} onChange={(e) => updateCustomer("mobile", normalizeIndianMobile(e.target.value).slice(0, 10))} onPaste={(e) => { e.preventDefault(); let digits = e.clipboardData.getData("text").replace(/\D/g, ""); if (digits.length === 14 && digits.startsWith("0091")) digits = digits.slice(4); else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2); else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1); if (digits.length > 10) { setOrderError("केवल 10 अंकों का मोबाइल नंबर भरें।"); return; } updateCustomer("mobile", digits); }} inputMode="numeric" autoComplete="tel-national" minLength={10} maxLength={10} pattern="[6-9][0-9]{9}" required placeholder="10 अंकों का मोबाइल नंबर" /></label>
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

      <style>{`
        .cartOverlay{position:fixed;inset:0;z-index:165;display:grid;place-items:center;padding:12px;background:#0009;backdrop-filter:blur(5px)}
        .cartCard{position:relative;width:min(100%,620px);max-height:calc(100dvh - 24px);overflow:auto;padding:24px 24px 20px;background:#fff;color:#1f211f;border-radius:18px;box-shadow:0 28px 90px #0007}
        .cartClose{position:absolute;right:14px;top:14px;width:38px;height:38px;border:0;border-radius:50%;background:#f0f0ed;color:#202520;font-size:26px;line-height:1}
        .cartHeader{text-align:center;padding:8px 36px 25px}.cartHeader p{margin:0 0 8px;color:#946f28;font-size:9px;font-weight:900;letter-spacing:.18em}.cartHeader h2{margin:0;font-family:Georgia,serif;font-size:38px;font-weight:500}.cartHeader span{display:block;margin-top:18px;color:#5c625d;font-size:13px}.cartHeader b{padding:0 9px;color:#9a9d98}
        .cartColumns{display:grid;grid-template-columns:1fr auto;padding:0 0 12px;border-bottom:1px solid #e4e4df;font-size:13px}.cartColumns b:last-child{text-align:right}
        .cartProductRow{display:grid;grid-template-columns:92px 1fr auto;gap:14px;align-items:start;padding:22px 0 18px;border-bottom:1px solid #ecece8}.cartProductRow>img{width:92px;height:112px;object-fit:contain;background:#faf8f1;border-radius:10px}.cartProductCopy{display:grid;gap:7px}.cartProductCopy strong{font-size:18px;line-height:1.35}.cartProductCopy span{color:#727772;font-size:12px}.cartProductCopy button{width:max-content;padding:0;border:0;border-bottom:1px solid currentColor;background:transparent;color:#646963;font-size:12px}.cartPrice{font-size:18px;white-space:nowrap;padding-top:36px}
        .cartQtyLine{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:17px 0;border-bottom:1px solid #ededeb}.cartQty{display:grid;grid-template-columns:44px 56px 44px;border:1px solid #d9dad5}.cartQty button,.cartQty span{height:44px;display:grid;place-items:center;border:0;background:#fff;color:#202420;font-size:20px}.cartQty button:disabled{opacity:.25;cursor:default}.cartQty span{font-size:16px;font-weight:800}.cartQtyLine>small{color:#767b76;font-size:10px;text-align:right}
        .cartTools{display:flex;gap:8px;padding:18px 0}.cartTools>span{flex:1;min-height:58px;display:grid;place-items:center;padding:7px;background:#f8f8f5;font-size:20px}.cartTools small{display:block;color:#6f756f;font-size:8px;text-align:center}
        .cartSubtotal{display:flex;align-items:start;justify-content:space-between;gap:20px;padding:13px 0 18px}.cartSubtotal>div{display:grid;gap:5px}.cartSubtotal strong{font-size:22px}.cartSubtotal small{color:#737873;font-size:11px}.cartSubtotal>strong{white-space:nowrap}
        .cartCheckout{width:100%;min-height:56px;border:0;background:#070807;color:#fff;font-size:16px;font-weight:900;letter-spacing:.17em}.cartContinue{width:100%;margin-top:10px;padding:10px;border:0;background:transparent;color:#536056;font-weight:700}
        @media(max-width:560px){.cartOverlay{padding:0;background:#fff}.cartCard{width:100%;height:100dvh;max-height:none;border-radius:0;padding:18px 16px 22px}.cartHeader{padding:12px 34px 23px}.cartHeader h2{font-size:34px}.cartProductRow{grid-template-columns:82px 1fr auto;gap:10px}.cartProductRow>img{width:82px;height:105px}.cartProductCopy strong{font-size:16px}.cartPrice{font-size:16px;padding-top:34px}.cartQtyLine{align-items:flex-start;flex-direction:column}.cartQtyLine>small{text-align:left}.cartTools{gap:5px}.cartSubtotal strong{font-size:20px}.cartCheckout{min-height:58px}}
      `}</style>
    </main>
  );
}
