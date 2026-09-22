"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./meta.module.css";

const UPI_ID = "8295820654@okbizaxis";
const ONLINE_PRICE = 1499;
const COD_PRICE = 2500;

type PaymentMethod = "online" | "cod";

type SavedOrder = {
  code: string;
  payment: PaymentMethod;
};

function fireMetaEvent(..._args: unknown[]) {
  // Meta analytics intentionally disabled. Orders continue to the CRM only.
}

function makeOrderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "META-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
}

export default function MetaLandingPage() {
  const [payment, setPayment] = useState<PaymentMethod>("online");
  const [form, setForm] = useState({ name: "", mobile: "", pincode: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedOrder, setSavedOrder] = useState<SavedOrder | null>(null);
  const checkoutTracked = useRef(false);

  const price = payment === "online" ? ONLINE_PRICE : COD_PRICE;

  useEffect(() => {
    const key = "amrit-meta-safe-viewcontent";
    if (sessionStorage.getItem(key) === "sent") return;
    fireMetaEvent("ViewContent", {
      value: ONLINE_PRICE,
      currency: "INR",
      content_name: "TAKAT POWER X",
      content_ids: ["takat-power-x"],
      content_type: "product",
    });
    sessionStorage.setItem(key, "sent");
  }, []);

  function markCheckout() {
    if (checkoutTracked.current) return;
    checkoutTracked.current = true;
    fireMetaEvent("InitiateCheckout", {
      value: price,
      currency: "INR",
      content_name: "TAKAT POWER X",
      content_ids: ["takat-power-x"],
      content_type: "product",
      num_items: 1,
    }, "META-CHECKOUT-" + Date.now());
  }

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markCheckout();

    const name = form.name.trim();
    const mobile = form.mobile.trim();
    const pincode = form.pincode.trim();
    const address = form.address.trim();

    if (name.length < 2) {
      setError("कृपया अपना पूरा नाम भरें।");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("कृपया सही 10-digit mobile number भरें।");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError("कृपया सही 6-digit PIN code भरें।");
      return;
    }
    if (address.length < 8) {
      setError("कृपया पूरा delivery address भरें।");
      return;
    }

    setSaving(true);
    setError("");
    const orderId = makeOrderId();

    try {
      const response = await fetch("/api/website-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: name,
          phone: mobile,
          address,
          state: "Unknown",
          district: "Unknown",
          city: "Unknown",
          pincode,
          product: "TAKAT POWER X",
          quantity: "1",
          pack: "meta-safe-landing",
          payment: payment === "online" ? "Prepaid" : "COD",
          amount: String(price),
          order_id: orderId,
          notes:
            payment === "online"
              ? "Meta landing page • Online payment selected • payment to be completed by customer"
              : "Meta landing page • Cash on Delivery",
          order_type: "Order",
          website: "",
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok !== true || !result?.order?.orderCode) {
        throw new Error(String(result?.error || "Order save failed"));
      }

      setSavedOrder({ code: String(result.order.orderCode), payment });

      if (payment === "cod") {
        fireMetaEvent("Purchase", {
          value: COD_PRICE,
          currency: "INR",
          content_name: "TAKAT POWER X",
          content_ids: ["takat-power-x"],
          content_type: "product",
          num_items: 1,
        }, orderId);
      } else {
        fireMetaEvent("Lead", {
          value: ONLINE_PRICE,
          currency: "INR",
          content_name: "TAKAT POWER X",
          content_ids: ["takat-power-x"],
          content_type: "product",
        }, orderId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order save नहीं हुआ। कृपया दोबारा कोशिश करें।");
    } finally {
      setSaving(false);
    }
  }

  function openUpi() {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: "Amrit Ayurveda",
      tn: "TAKAT POWER X " + (savedOrder?.code || ""),
      am: ONLINE_PRICE.toFixed(2),
      cu: "INR",
    });
    window.location.href = "upi://pay?" + params.toString();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/meta" aria-label="Amrit Ayurveda">
          <span>AMRIT</span>
          <b>AYURVEDA</b>
        </a>
        <a className={styles.headerCta} href="#order">अभी ऑर्डर करें</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>MEN&apos;S DAILY WELLNESS</span>
          <h1>TAKAT POWER X</h1>
          <p className={styles.heroLead}>
            वयस्क पुरुषों की daily wellness, vitality और confidence routine के लिए Ayurvedic formulation.
          </p>

          <div className={styles.priceCard}>
            <div>
              <small>ONLINE OFFER</small>
              <strong>₹1,499</strong>
            </div>
            <div>
              <small>CASH ON DELIVERY</small>
              <strong>₹2,500</strong>
            </div>
          </div>

          <div className={styles.trustRow}>
            <span>✓ Ayurvedic formulation</span>
            <span>✓ Private delivery</span>
            <span>✓ COD available</span>
          </div>

          <a className={styles.primaryCta} href="#order">अपना ऑर्डर शुरू करें</a>
          <p className={styles.micro}>पूरे भारत में delivery • सेवा-योग्य PIN code पर COD</p>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.productStage}>
            <Image
              src="/takat-power-x.jpg"
              alt="TAKAT POWER X by Amrit Ayurveda"
              fill
              priority
              sizes="(max-width: 760px) 88vw, 460px"
            />
          </div>
          <div className={styles.visualBadge}>25 SUPER HERBS • AYURVEDIC WELLNESS</div>
        </div>
      </section>

      <section className={styles.features}>
        <article>
          <span>01</span>
          <h2>Daily Wellness</h2>
          <p>रोज़ की wellness routine में आसानी से शामिल होने वाला पुरुषों के लिए बनाया गया formulation.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Ayurvedic Blend</h2>
          <p>पारंपरिक Ayurvedic ingredients और carefully selected herbal blend पर आधारित product presentation.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Private Delivery</h2>
          <p>Order processing और delivery को simple और discreet रखने पर focus.</p>
        </article>
      </section>

      <section className={styles.details}>
        <div>
          <span className={styles.kicker}>SIMPLE • CLEAR • CONVENIENT</span>
          <h2>आपकी daily routine का आसान हिस्सा</h2>
          <p>
            TAKAT POWER X को सामान्य wellness support के रूप में प्रस्तुत किया गया है। हमेशा pack/label पर दिए गए
            directions का पालन करें और निर्धारित मात्रा से अधिक इस्तेमाल न करें।
          </p>
        </div>
        <ul>
          <li>वयस्क पुरुषों के लिए wellness-focused formulation</li>
          <li>Pack पर दिए ingredients और usage directions को प्राथमिकता</li>
          <li>Online payment और Cash on Delivery दोनों विकल्प</li>
          <li>Order support के लिए customer assistance</li>
        </ul>
      </section>

      <section id="order" className={styles.orderSection}>
        <div className={styles.orderIntro}>
          <span className={styles.kicker}>SECURE ORDER</span>
          <h2>TAKAT POWER X ऑर्डर करें</h2>
          <p>अपनी details भरें और payment option चुनें। आपका order सीधे हमारे CRM में save होगा.</p>
        </div>

        <form className={styles.orderCard} onSubmit={submit}>
          <div className={styles.paymentTabs}>
            <button
              type="button"
              className={payment === "online" ? styles.paymentActive : ""}
              onClick={() => { setPayment("online"); markCheckout(); }}
            >
              <small>Online Payment</small>
              <strong>₹1,499</strong>
              <span>Offer Price</span>
            </button>
            <button
              type="button"
              className={payment === "cod" ? styles.paymentActive : ""}
              onClick={() => { setPayment("cod"); markCheckout(); }}
            >
              <small>Cash on Delivery</small>
              <strong>₹2,500</strong>
              <span>Pay on delivery</span>
            </button>
          </div>

          <div className={styles.fields}>
            <label>
              <span>पूरा नाम</span>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                onFocus={markCheckout}
                placeholder="अपना नाम लिखें"
                autoComplete="name"
              />
            </label>
            <label>
              <span>मोबाइल नंबर</span>
              <input
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                onFocus={markCheckout}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                autoComplete="tel"
              />
            </label>
            <label>
              <span>PIN code</span>
              <input
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                onFocus={markCheckout}
                placeholder="6-digit PIN"
                inputMode="numeric"
                autoComplete="postal-code"
              />
            </label>
            <label className={styles.wide}>
              <span>पूरा delivery address</span>
              <textarea
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                onFocus={markCheckout}
                placeholder="House/Street, Area, City, State"
                autoComplete="street-address"
              />
            </label>
          </div>

          <div className={styles.orderTotal}>
            <span>आज का payable amount</span>
            <strong>₹{price.toLocaleString("en-IN")}</strong>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={saving}>
            {saving ? "Order save हो रहा है…" : payment === "online" ? "ऑर्डर सेव करें और UPI से भुगतान करें" : "COD ऑर्डर कन्फर्म करें"}
          </button>

          <small className={styles.privacyNote}>
            Order करने पर आप हमारी Privacy, Shipping, Refund और Terms information से सहमत होते हैं।
          </small>
        </form>
      </section>

      <section className={styles.notice}>
        <h2>महत्वपूर्ण जानकारी</h2>
        <p>
          यह product सामान्य wellness support के लिए प्रस्तुत किया गया है और किसी बीमारी का diagnosis, treatment,
          prevention या cure करने का दावा नहीं करता। अनुभव व्यक्ति-व्यक्ति में अलग हो सकता है।
        </p>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Amrit Ayurveda</strong>
          <span>TAKAT POWER X • Men&apos;s Daily Wellness</span>
        </div>
        <nav>
          <a href="/meta/policies#privacy">Privacy</a>
          <a href="/meta/policies#shipping">Shipping</a>
          <a href="/meta/policies#refund">Refund</a>
          <a href="/meta/policies#terms">Terms</a>
          <a href="/meta/policies#contact">Contact</a>
        </nav>
        <small>© 2026 Amrit Ayurveda. All rights reserved.</small>
      </footer>

      {savedOrder && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="success-title">
          <div className={styles.modal}>
            <div className={styles.successIcon}>✓</div>
            <h2 id="success-title">ऑर्डर सफलतापूर्वक सेव हो गया</h2>
            <p>
              Order ID: <strong>{savedOrder.code}</strong>
            </p>
            {savedOrder.payment === "cod" ? (
              <>
                <p>आपका Cash on Delivery order प्राप्त हो गया है। Delivery process जल्द शुरू होगा।</p>
                <button onClick={() => setSavedOrder(null)}>ठीक है</button>
              </>
            ) : (
              <>
                <p>Order save हो गया है। अब ₹1,499 का UPI payment पूरा करें।</p>
                <button onClick={openUpi}>UPI ऐप खोलें</button>
                <small>UPI ID: {UPI_ID}</small>
                <button className={styles.secondaryModalButton} onClick={() => setSavedOrder(null)}>बाद में</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
