"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function normalizeIndianMobile(value: string) {
  // Website orders must contain exactly the customer's own ten digits.
  // Never strip +91/0091/0 automatically: that can silently save a wrong number.
  return value.trim();
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
  const submitting = useRef(false);
  const checkoutAttempt = useRef({ fingerprint: "", ref: "", createdAt: 0 });
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [duplicateOrder, setDuplicateOrder] = useState(false);
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
    if (!orderOpen) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const previous = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.left = previous.bodyLeft;
      body.style.right = previous.bodyRight;
      body.style.width = previous.bodyWidth;
      body.style.overflow = previous.bodyOverflow;
      html.style.overflow = previous.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [orderOpen]);

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
    setDuplicateOrder(false);
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
    const mobile = normalizeIndianMobile(customer.mobile);
    if (!/^[6-9]\d{9}$/.test(mobile)) return "सही 10-digit mobile number भरें।";
    if (customer.address.trim().length < 5) return "पूरा delivery address भरें।";
    if (!/^\d{6}$/.test(customer.pincode)) return "सही 6-digit PIN code भरें।";
    return "";
  }

  function openUpiPayment() {
    const ua = navigator.userAgent || "";
    const isMetaInAppBrowser = /FBAN|FBAV|Instagram|Messenger/i.test(ua);

    if (isMetaInAppBrowser) {
      try { navigator.clipboard?.writeText(upiId); } catch {}
      window.alert(`Instagram/Facebook के अंदर UPI app सीधे नहीं खुल रहा है। ऊपर ⋮ से Open in browser चुनें, फिर UPI PAYMENT दबाएँ। UPI ID: ${upiId}`);
      return;
    }

    window.location.assign(upiUrl);
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
          status: "New",
          confirmation_status: paymentMethod === "cod" ? "Order Saved" : "Payment Pending",
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

      // A saved COD order completes checkout; a pending UPI payment does not.
      // Never count a duplicate response as a second purchase.
      if (paymentMethod === "cod" && result.duplicate !== true) {
        try {
          trackPixel("Purchase", {
            content_name: selectedCatalog.title,
            content_ids: [selectedCatalog.id],
            content_type: "product",
            value: payable,
            currency: "INR",
            num_items: pack,
          }, `purchase_${ref}`);
        } catch {
          // Analytics must not turn a saved order into a checkout error.
        }
      }

      const savedOrderCode = String(result.order.orderCode);
      setDuplicateOrder(result.duplicate === true);
      setOrderSuccess(savedOrderCode);
      try {
        localStorage.setItem(phoneDuplicateKey, JSON.stringify({ orderCode: savedOrderCode, orderRef: ref, savedAt: Date.now() } satisfies SavedOrderReceipt));
      } catch {}

    } catch (e) {
      setOrderError(e instanceof Error ? e.message : "Order save नहीं हुआ। कृपया दोबारा कोशिश करें।");
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <main className="premiumSite">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Product\",\"name\":\"Amrit Urja Capsule + Oil Combo\",\"description\":\"Amrit Ayurveda combo containing 30 capsules and 20 ml massage oil.\",\"brand\":{\"@type\":\"Brand\",\"name\":\"Amrit Ayurveda\"},\"sku\":\"hdwo1ljwss\",\"offers\":{\"@type\":\"Offer\",\"url\":\"https://www.amritayurveda.shop/\",\"priceCurrency\":\"INR\",\"price\":\"999\",\"itemCondition\":\"https://schema.org/NewCondition\",\"availability\":\"https://schema.org/InStock\"}}" }} />
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
        <div className="urjaFrontHero">
          <div className="urjaFrontMessage">
            <h2>AMRIT<br/>URJA</h2>
            <p className="urjaHeroSub">CAPSULE + OIL COMBO</p>
            <p>पैक में 30 कैप्सूल और 20 ml मसाज ऑयल। सामग्री, उपयोग और सावधानियाँ पैक के लेबल पर देखें।</p>
          </div>
        </div>
        <div className="urjaFrontCheckout" id="product">
          <h1>AMRIT URJA<br/><span>CAPSULE + OIL COMBO</span></h1>
          <p className="urjaFrontPack">AMRIT AYURVEDA · 30 CAPSULES + 20 ML OIL</p>
          <p className="urjaFrontPrice">₹999 <del>₹1,499</del><span>33% OFF</span></p>
          <div className="urjaFrontButtons">
            <button className="posterCod" onClick={() => openOrder("cod")}><span aria-hidden="true">🛒</span> ORDER NOW <small>(CASH ON DELIVERY)</small></button>
            <button className="posterOnline" onClick={() => openOrder("upi")}><span aria-hidden="true">▣</span> PAY ONLINE / UPI <small>₹999 · UPI Payment</small></button>
          </div>
          <div className="urjaFrontTrust">
            <span><strong>❀</strong><b>Pack<br/>Information</b></span>
            <span><strong>✧</strong><b>Secure<br/>Packaging</b></span>
            <span><strong>♧</strong><b>Shipping<br/>Across India</b></span>
            <span><strong>▣</strong><b>COD / UPI<br/>Available</b></span>
          </div>
          <div className="urjaFrontPolicies">
            <span>🚚 <b>CASH ON DELIVERY</b><small>Available Across India</small></span>
            <span>↩ <b>Return Policy</b><small><a href="mailto:contact@amritayurveda.shop?subject=Amrit%20Urja%20Return%20Policy">Contact for terms</a></small></span>
          </div>
        </div>
      </section>


      <section className="routineSection" id="how">
        <div className="sectionHeading">
          <p className="eyebrow">PRODUCT INFORMATION</p>
          <h2>Amrit Urja कैसे इस्तेमाल करें?</h2>
          <p>आसान स्टेप्स में कैप्सूल और ऑयल की जानकारी — इस्तेमाल से पहले पैक पर दी गई मात्रा, सामग्री और सावधानियाँ ज़रूर पढ़ें।</p>
        </div>
        <div className="routineGrid">
          <article><span className="routineIcon" aria-hidden="true">01</span><b>STEP 01</b><h3>कैप्सूल की जानकारी</h3><p>पैक पर दिए निर्देशों के अनुसार ही कैप्सूल लें। मौजूदा पैक पर खाने के बाद दूध या पानी के साथ लेने की जानकारी देखें।</p></article>
          <article><span className="routineIcon" aria-hidden="true">02</span><b>STEP 02</b><h3>ऑयल इस्तेमाल करने का तरीका</h3><p>मसाज ऑयल केवल पैक के निर्देशों और सावधानियों के अनुसार इस्तेमाल करें। त्वचा पर परेशानी होने पर उपयोग रोकें।</p></article>
          <article><span className="routineIcon" aria-hidden="true">03</span><b>STEP 03</b><h3>पैक और सावधानियाँ देखें</h3><p>सामग्री, उपयोग की मात्रा, उपयुक्तता और अन्य ज़रूरी जानकारी के लिए पैक की लेबलिंग पढ़ें। शंका हो तो योग्य स्वास्थ्य विशेषज्ञ से सलाह लें।</p></article>
        </div>
        <div className="routineDetails">
          <div><span className="routineDetailsEyebrow">WHAT'S INSIDE</span><h3>एक कॉम्बो, दो प्रोडक्ट</h3><p>Amrit Urja पैक में 30 कैप्सूल और 20 ml मसाज ऑयल शामिल है। प्रोडक्ट को इस्तेमाल करने से पहले दोनों के लेबल अलग-अलग पढ़ें।</p><div className="routinePills"><span>30 Capsules</span><span>20 ml Massage Oil</span><span>₹999 Combo</span></div></div>
          <div className="routineHelp"><h3>इस्तेमाल को लेकर कोई सवाल?</h3><p>सही पैक, सामग्री या इस्तेमाल की जानकारी के लिए हमारी सपोर्ट टीम से बात करें।</p><a href="tel:8290695226">☎ सहायता के लिए कॉल करें</a></div>
        </div>
        <button className="howVisualButton" onClick={() => setHowOpen(true)}>उपयोग की जानकारी देखें</button>
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
            <summary>Amrit Urja क्या है?</summary>
            <p>Amrit Urja, Amrit Ayurveda का capsule और massage oil combo है। इसके एक पैक में 30 कैप्सूल और 20 ml मसाज ऑयल मिलता है। इसकी कीमत ₹999 है। ग्राहक Cash on Delivery या Online / UPI से ऑर्डर कर सकते हैं। सामग्री, उपयोग और सावधानियों के लिए पैक पर दी गई जानकारी पढ़ें।</p>
          </details>
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
            <p>कैप्सूल और ऑयल का उपयोग केवल संबंधित पैक के लेबल पर दिए निर्देशों के अनुसार करें।</p>
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
          <span>Product Information & Customer Support</span>
          <a className="footerPhone" href="tel:8290695226">☎ SUPPORT: +91 8290695226</a>
        </div>
        <div><b>Product</b><a href="#product">AMRIT URJA</a><a href="#how">How to use</a></div>
        <div><b>Contact</b><a href="tel:8290695226">Call: 8290695226</a><a href="mailto:contact@amritayurveda.shop">contact@amritayurveda.shop</a><a href="#faq">FAQ</a></div>
        <small>इस्तेमाल से पहले पैक पर दी गई सामग्री, उपयोग और सावधानियाँ पढ़ें। उपयुक्तता को लेकर सवाल होने पर योग्य स्वास्थ्य विशेषज्ञ से सलाह लें।</small>
      </footer>

      {menuOpen && <div className="menuOverlay" role="dialog" aria-modal="true" aria-label="वेबसाइट मेन्यू"><div className="menuDrawer"><button className="menuClose" onClick={() => setMenuOpen(false)} aria-label="मेन्यू बंद करें">×</button><strong>AMRIT AYURVEDA</strong><a href="#home" onClick={() => setMenuOpen(false)}>होम</a><a href="#product" onClick={() => setMenuOpen(false)}>AMRIT URJA Combo</a><button onClick={() => { setMenuOpen(false); setHowOpen(true); }}>How to use — इस्तेमाल कैसे करें</button><a href="#faq" onClick={() => setMenuOpen(false)}>सवाल और जवाब</a><button className="menuBuy" onClick={() => { setMenuOpen(false); openOrder("cod"); }}>ऑर्डर करें</button></div><button className="menuBackdrop" aria-label="मेन्यू बंद करें" onClick={() => setMenuOpen(false)} /></div>}

      {howOpen && <div className="howOverlay" role="dialog" aria-modal="true" aria-labelledby="how-modal-title"><section className="howCard"><button className="howClose" onClick={() => setHowOpen(false)} aria-label="इस्तेमाल की जानकारी बंद करें">×</button><div className="howCardCopy"><small>AMRIT AYURVEDA • HOW TO USE</small><h2 id="how-modal-title">इस्तेमाल कैसे करें</h2><div className="howStep"><b>01 · कैप्सूल</b><p>कैप्सूल की मात्रा और उपयोग के लिए पैक के लेबल पर दिए निर्देश पढ़ें।</p></div><div className="howStep"><b>02 · ऑयल</b><p>ऑयल का उपयोग पैक के लेबल पर दिए निर्देशों के अनुसार करें।</p></div><p className="howCaution">सामग्री और सावधानियों के लिए पैक की जानकारी पढ़ें।</p><button onClick={() => { setHowOpen(false); openOrder("cod"); }}>AMRIT URJA ऑर्डर करें</button></div></section></div>}

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
                    <div><b>{paymentMethod === "cod" ? "COD Amount" : "Online payment"}</b><small>{paymentMethod === "cod" ? `₹${money(payable)} — parcel receive करते समय payment करें।` : `₹${money(payable)} — अभी Payment Pending है। भुगतान की पुष्टि के बाद ही Paid माना जाएगा।`}</small></div>
                  </div>
                </div>

                {paymentMethod === "cod" ? (
                  <>
                    <div className="successCodPill">✓ Cash on Delivery Order received</div>
                    <p className="successLead">आपका ऑर्डर सेव हो गया है। हमारी टीम आपसे संपर्क करेगी।</p>
                  </>
                ) : (
                  <div className="upiEasyPay"><p><b>अगला स्टेप: ₹{money(payable)} का UPI पेमेंट</b></p><p>UPI ऐप खोलें और भुगतान करें। अगर ऐप नहीं खुलता तो नीचे UPI ID कॉपी करके PhonePe / Google Pay / Paytm में भुगतान कर सकते हैं।</p><button className="primaryButton full successPay" type="button" onClick={openUpiPayment}>UPI ऐप में ₹{money(payable)} पेमेंट करें</button><button className="upiCopyButton" type="button" onClick={() => { void navigator.clipboard?.writeText(upiId); }}>UPI ID कॉपी करें: {upiId}</button><p className="upiPendingNote">ऑर्डर सेव है, लेकिन पेमेंट अभी Pending है। UPI में पेमेंट पूरा होने पर ही भुगतान माना जाएगा।</p></div>
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
                <p className="checkoutIntro">अपना नाम, 10 अंकों का मोबाइल नंबर और डिलीवरी पता भरें। फिर पेमेंट का तरीका चुनें।</p><div className="paymentTabs">
                  <button className={paymentMethod === "cod" ? "active" : ""} onClick={() => setPaymentMethod("cod")}>
                    <span>घर पर भुगतान (COD)</span><b>₹{money(payable)}</b>
                  </button>
                  <button className={paymentMethod === "upi" ? "active" : ""} onClick={() => setPaymentMethod("upi")}>
                    <span>अभी ऑनलाइन भुगतान</span><b>₹{money(payable)}</b>
                  </button>
                </div>

                {paymentMethod === "upi" && <p className="onlinePaymentHint">पहले ऑर्डर की जानकारी सेव होगी, उसके बाद UPI Payment का आसान विकल्प खुलेगा। पेमेंट पूरा होने तक Status Pending रहेगा।</p>}
                <div className="orderFields">
                  <label>पूरा नाम<input value={customer.name} onChange={(e) => updateCustomer("name", e.target.value)} autoComplete="name" placeholder="Customer Name" /></label>
                  <label>मोबाइल नंबर (बिना +91)<input type="tel" value={customer.mobile} onChange={(e) => { const next = e.target.value; if (!/^\d*$/.test(next) || next.length > 10) { setOrderError("कृपया +91 या देश कोड न डालें। केवल अपने मोबाइल के 10 अंक भरें।"); return; } updateCustomer("mobile", next); }} onPaste={(e) => { e.preventDefault(); const pasted = e.clipboardData.getData("text").trim(); if (!/^[6-9]\d{9}$/.test(pasted)) { setOrderError("+91, 0 या अतिरिक्त अंक वाला नंबर स्वीकार नहीं है। केवल अपना 10 अंकों का मोबाइल नंबर डालें।"); return; } updateCustomer("mobile", pasted); }} inputMode="numeric" autoComplete="off" minLength={10} maxLength={10} pattern="[6-9][0-9]{9}" required placeholder="केवल 10 अंक, +91 नहीं" /><small style={{ display: "block", marginTop: 6 }}>देश का कोड +91 न जोड़ें। अपने नंबर के पूरे 10 अंक भरें।</small></label>
                  <label>पूरा पता<textarea value={customer.address} onChange={(e) => updateCustomer("address", e.target.value)} autoComplete="street-address" rows={3} placeholder="House, street, area, city" /></label>
                  <label>PIN code<input value={customer.pincode} onChange={(e) => updateCustomer("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="postal-code" placeholder="6 digit PIN code" /></label>
                </div>

                {orderError && <p className="orderError">{orderError}</p>}

                <button className="confirmButton" disabled={saving} onClick={() => void submitOrder()}>
                  {saving ? "ORDER SAVE हो रहा है…" : paymentMethod === "cod" ? `COD ऑर्डर करें • ₹${money(payable)}` : `आगे बढ़ें: UPI पेमेंट • ₹${money(payable)}`}
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

