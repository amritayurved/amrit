"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

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

  const [offerOpen, setOfferOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [offerShown, setOfferShown] = useState(false);
  const [pack, setPack] = useState<1 | 2 | 3>(1);
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
  const [leadName, setLeadName] = useState("");
  const [leadMobile, setLeadMobile] = useState("");
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSaved, setLeadSaved] = useState(false);

  const packPrices = { 1: 999, 2: 1499, 3: 1999 } as const;
  const payable = packPrices[pack];

  useEffect(() => {
    if (offerShown || orderOpen) return;
    let lastY = window.scrollY;
    let changedDirection = false;
    function onScroll() {
      const y = window.scrollY;
      if (y > 120 && y < lastY - 8) changedDirection = true;
      if (changedDirection && y > 70) {
        setOfferOpen(true);
        setOfferShown(true);
        window.removeEventListener("scroll", onScroll);
      }
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offerShown, orderOpen]);

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

  async function submitCallbackLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (leadSaving || leadSaved) return;
    if (leadName.trim().length < 2 || !/^[6-9]\\d{9}$/.test(leadMobile)) {
      setLeadMessage("पूरा नाम और सही 10-digit मोबाइल नंबर भरें।");
      return;
    }
    setLeadSaving(true);
    setLeadMessage("");
    try {
      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/website-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName.trim(),
          mobile: leadMobile,
          session_id: window.crypto.randomUUID(),
          path: window.location.pathname,
          source: "Website Call Me Back",
          product: product.name,
          utm_source: params.get("utm_source") || "",
          utm_campaign: params.get("utm_campaign") || "",
          fbclid: params.get("fbclid") || "",
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw new Error("लीड सेव नहीं हुई। कृपया दोबारा कोशिश करें।");
      setLeadSaved(true);
      setLeadMessage("धन्यवाद! आपका नंबर मिल गया है। हमारी टीम आपसे संपर्क करेगी।");
    } catch (error) {
      setLeadMessage(error instanceof Error ? error.message : "लीड सेव नहीं हुई।");
    } finally {
      setLeadSaving(false);
    }
  }

  function openOrder(method: PaymentMethod = "cod") {
    setPaymentMethod(method);
    setOrderError("");
    setOrderSuccess("");
    setOfferOpen(false);
    setOrderOpen(true);
    trackPixel("InitiateCheckout", { content_name: product.name, content_ids: [product.shortName], content_type: "product", value: packPrices[pack], currency: "INR" });
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
          quantity: String(pack),
          product: product.name,
          notes: `${pack} × ${product.detail}`,
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
        trackPixel("Purchase", { value: Number(result.order.amount) || payable, currency: "INR", content_name: product.name, content_ids: [product.shortName], content_type: "product", num_items: 1, order_id: String(result.order.orderCode) });
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
      <div className="announcement">🌿 सुरक्षित पैकिंग <span>•</span> Cash on Delivery उपलब्ध <span>•</span> Amrit Ayurveda</div>
      <header className="topbar">
        <button className="menuToggle" onClick={() => setMenuOpen(true)} aria-label="मेन्यू खोलें" aria-expanded={menuOpen}>☰</button>
        <a className="brand" href="#home" aria-label="Amrit Ayurveda home">
          <span className="brandMark">✦</span>
          <span><strong>AMRIT</strong><small>AYURVEDA</small></span>
        </a>
        <nav>
          <a href="#product">Product</a>
          <a href="#details">Details</a>
          <button className="navHow" onClick={() => setHowOpen(true)}>How to use</button>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="headerOrder" onClick={() => openOrder("cod")}>अभी ऑर्डर करें</button>
      </header>

      <section className="referenceHero" id="home">
        <div className="heroPoster">
          <div className="posterCopy">
            <p className="posterOverline">AMRIT AYURVEDA प्रस्तुत करता है</p>
            <p className="posterHindi">रोज़ की ऊर्जा और वेलनेस के लिए</p>
            <h1>AMRIT<br /><span>URJA</span></h1>
            <p className="posterTag">Ayurvedic Wellness Combo</p>
            <p className="posterSupport">30 Capsules + 20 ml Massage Oil</p>
            <ul className="posterPoints">
              <li>आसान daily routine</li>
              <li>Capsule और oil का combo</li>
              <li>सुरक्षित पैकिंग</li>
            </ul>
          </div>
          <div className="posterProduct">
            <img src={product.image} alt="Amrit Ayurveda AMRIT URJA capsule और oil combo" />
          </div>
          <div className="posterFeatureRow">
            <span>✦<small>AMRIT AYURVEDA</small></span>
            <span>30<small>CAPSULES</small></span>
            <span>20 ml<small>MASSAGE OIL</small></span>
            <span>✓<small>COD AVAILABLE</small></span>
          </div>
        </div>
        <div className="posterOrder">
          <h2>AMRIT URJA — Capsule + Oil Combo</h2>
          <p className="posterPrice">1 combo ₹999 <span>•</span> 2 combo ₹1,499 <span>•</span> 3 combo ₹1,999</p>
          <p className="posterPriceNote">अपना pack चुनें। COD और Online/UPI दोनों उपलब्ध हैं।</p>
          <div className="packChoices" role="group" aria-label="Combo pack चुनें">{([1, 2, 3] as const).map((count) => <button key={count} className={pack === count ? "selected" : ""} onClick={() => setPack(count)}><b>{count} Combo</b><span>₹{money(packPrices[count])}</span></button>)}</div>
          <button className="posterCod" onClick={() => openOrder("cod")}>🛒 अभी ऑर्डर करें — ₹{money(payable)} COD</button>
          <button className="posterOnline" onClick={() => openOrder("upi")}>▣ Online / UPI — ₹{money(payable)}</button>
        </div>
      </section>

      <section className="callbackSection" aria-labelledby="callbackTitle">
        <div><p className="eyebrow">AMRIT AYURVEDA</p><h2 id="callbackTitle">ऑर्डर से पहले बात करना चाहते हैं?</h2><p>अपना नाम और मोबाइल नंबर दें। हमारी टीम आपको कॉल करेगी।</p></div>
        <form onSubmit={submitCallbackLead}>
          <label>आपका नाम<input value={leadName} onChange={(e) => setLeadName(e.target.value)} type="text" autoComplete="name" required minLength={2} maxLength={80} disabled={leadSaved} placeholder="पूरा नाम" /></label>
          <label>मोबाइल नंबर<input value={leadMobile} onChange={(e) => setLeadMobile(e.target.value.replace(/\\D/g, "").slice(0, 10))} type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[6-9][0-9]{9}" required disabled={leadSaved} placeholder="10 अंकों का नंबर" /></label>
          <button type="submit" disabled={leadSaving || leadSaved}>{leadSaved ? "रिक्वेस्ट भेज दी" : leadSaving ? "भेज रहे हैं…" : "मुझे कॉल करें"}</button>
          {leadMessage && <p className={leadSaved ? "callbackSuccess" : "callbackError"} role="status">{leadMessage}</p>}
        </form>
      </section>

      <div className="shopHighlights"><span>✓ Cash on Delivery</span><span>✦ 30 Capsules + 20 ml Oil</span><span>✓ सुरक्षित पैकिंग</span></div>

      <section className="shopSection" id="product">
        <div className="shopHeading"><p className="eyebrow">AMRIT AYURVEDA</p><h2>अपना AMRIT URJA pack चुनें</h2><p>हर combo में 30 capsules और 20 ml massage oil का pack है। ज़रूरत के अनुसार 1, 2 या 3 combo चुनें।</p></div>
        <div className="shopGrid">
          {([1, 2, 3] as const).map((count) => (
            <article className={count === 2 ? "shopCard featured" : "shopCard"} key={count}>
              {count === 2 && <span className="shopRibbon">POPULAR PACK</span>}
              <img src={product.image} alt={`AMRIT URJA ${count} combo pack`} />
              <div className="shopCardBody"><small>AMRIT AYURVEDA</small><h3>{count} {count === 1 ? "Combo" : "Combos"}</h3><p>{count} × 30 capsules + 20 ml massage oil</p><strong>₹{money(packPrices[count])}</strong><button onClick={() => { setPack(count); openOrder("cod"); }}>अभी ऑर्डर करें</button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="storySection" id="details">
        <div className="storyPhoto"><img src={product.image} alt="AMRIT URJA capsule और oil की बोतलें" /></div>
        <div className="storyCopy"><p className="eyebrow">ONE SIMPLE ROUTINE</p><h2>Capsule और oil, एक ही combo में</h2><p>AMRIT URJA को आसान daily wellness routine के लिए साथ रखा गया है। पैक की जानकारी पढ़ें और अपनी पसंद का combo चुनें।</p><div className="storyFacts"><span><b>30</b> Capsules प्रति combo</span><span><b>20 ml</b> Massage oil प्रति combo</span><span><b>COD</b> और Online / UPI</span></div><button className="darkButton" onClick={() => { setPack(1); openOrder("cod"); }}>₹999 से ऑर्डर करें</button></div>
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
          <p>1 combo ₹999 • 2 combo ₹1,499 • 3 combo ₹1,999</p>
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
            <p>1 combo ₹999, 2 combo ₹1,499 और 3 combo ₹1,999 में चुन सकते हैं। Cash on Delivery और Online / UPI दोनों विकल्प उपलब्ध हैं।</p>
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
        <div className="footerBrand"><strong>AMRIT AYURVEDA</strong><span>Premium Ayurvedic Wellness</span></div>
        <div><b>Product</b><a href="#product">AMRIT URJA</a><a href="#how">How to use</a></div>
        <div><b>Support</b><a href={cleanWhatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><a href="#faq">FAQ</a></div>
        <small>यह product general wellness presentation के लिए है। किसी बीमारी के diagnosis, treatment, cure या prevention का दावा नहीं किया गया है।</small>
      </footer>

      {menuOpen && <div className="menuOverlay" role="dialog" aria-modal="true" aria-label="वेबसाइट मेन्यू"><div className="menuDrawer"><button className="menuClose" onClick={() => setMenuOpen(false)} aria-label="मेन्यू बंद करें">×</button><strong>AMRIT AYURVEDA</strong><a href="#home" onClick={() => setMenuOpen(false)}>होम</a><a href="#product" onClick={() => setMenuOpen(false)}>AMRIT URJA Combo</a><button onClick={() => { setMenuOpen(false); setHowOpen(true); }}>How to use — इस्तेमाल कैसे करें</button><a href="#faq" onClick={() => setMenuOpen(false)}>सवाल और जवाब</a><button className="menuBuy" onClick={() => { setMenuOpen(false); openOrder("cod"); }}>ऑर्डर करें</button></div><button className="menuBackdrop" aria-label="मेन्यू बंद करें" onClick={() => setMenuOpen(false)} /></div>}

      {howOpen && <div className="howOverlay" role="dialog" aria-modal="true" aria-labelledby="how-modal-title"><section className="howCard"><button className="howClose" onClick={() => setHowOpen(false)} aria-label="इस्तेमाल की जानकारी बंद करें">×</button><img src={product.image} alt="AMRIT URJA 30 capsules और 20 ml oil का pack" /><div className="howCardCopy"><small>AMRIT AYURVEDA • HOW TO USE</small><h2 id="how-modal-title">इस्तेमाल कैसे करें</h2><div className="howStep"><b>01 · कैप्सूल</b><p>रोज़ एक कैप्सूल खाना खाने के आधे घंटे बाद हल्के दूध या पानी के साथ लें।</p></div><div className="howStep"><b>02 · ऑयल</b><p>ऑयल से प्रतिदिन 1–2 मिनट हल्की मसाज करें।</p></div><p className="howCaution">सामग्री और सावधानियों के लिए पैक की जानकारी पढ़ें।</p><button onClick={() => { setHowOpen(false); openOrder("cod"); }}>AMRIT URJA ऑर्डर करें</button></div></section></div>}

      <button className="mobileOrder" onClick={() => openOrder("cod")}>ORDER NOW • COD AVAILABLE</button>
      <nav className="floatingContact" aria-label="तुरंत संपर्क करें">
        <a className="floatingContactButton floatingWhatsapp" href={cleanWhatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp पर बात करें" title="WhatsApp पर बात करें">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.2 11.6a8.2 8.2 0 0 1-12.1 7.2L3.5 20l1.2-4.5a8.2 8.2 0 1 1 15.5-3.9Z"/><path d="M8.7 8.3c-.5.6-.5 1.2-.2 1.9a10 10 0 0 0 5.2 5.2c.7.3 1.3.3 1.9-.2l.7-.9-2.3-1.2-.8.9a7.2 7.2 0 0 1-2.5-2.5l.9-.8-1.2-2.3-.9.7Z" transform="translate(0 3.7)"/></svg>
        </a>
        <a className="floatingContactButton floatingCall" href={`tel:+${phone}`} aria-label="अभी कॉल करें" title="अभी कॉल करें">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16.2v3a2 2 0 0 1-2.2 2 17.6 17.6 0 0 1-7.7-2.7 17.2 17.2 0 0 1-5.3-5.3A17.6 17.6 0 0 1 3.1 5.4 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7l.5 2.7a2 2 0 0 1-.6 1.8L8.5 10.7a14 14 0 0 0 4.8 4.8l1.5-1.5a2 2 0 0 1 1.8-.6l2.7.5a2 2 0 0 1 1.7 2.3Z"/></svg>
        </a>
      </nav>

      {orderOpen && (
        <div className="orderOverlay" role="dialog" aria-modal="true" aria-labelledby="order-title">
          <section className="orderCard">
            <button className="closeButton" onClick={() => setOrderOpen(false)} aria-label="Close">×</button>
            <div className="orderProduct">
              <img src={product.image} alt="AMRIT URJA" />
              <div><small>AMRIT AYURVEDA</small><strong id="order-title">AMRIT URJA</strong><span>{pack} × {product.detail}</span></div>
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
                <div className="packChoices compact" role="group" aria-label="Combo pack चुनें">{([1, 2, 3] as const).map((count) => <button key={count} className={pack === count ? "selected" : ""} onClick={() => setPack(count)}><b>{count} Combo</b><span>₹{money(packPrices[count])}</span></button>)}</div>
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
