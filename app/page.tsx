"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

const phone = "918290695226";
const upiId = "8295820654@okbizaxis";
const siteUrl = "https://amrit-ayurveda.rohitsangwan517.chatgpt.site";
const metaPixelId = "1720516185901735";
const supportWhatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("नमस्ते, मुझे Amrit Ayurveda के products के बारे में जानकारी चाहिए।")}`;

type ProductId = "takat-power-x" | "max-x7-x100-combo";
const comboOfferDurationMs = 3 * 24 * 60 * 60 * 1000;
const comboOfferStorageKey = "amrit-combo-offer-ends-at";
const customGalleryPhotos = [
  "/my-photos/photo-1.jpg",
  "/my-photos/photo-2.jpg",
  "/my-photos/photo-3.jpg",
  "https://raw.githubusercontent.com/amritayurved/amrit/315d07b4d947a30f32a2a11c8f7143fe8cb55139/public/my-photos/photo-4.jpg",
] as const;

const wellnessBenefitCards = [
  {
    image: "/hero-man.webp",
    title: "Daily Energy Support",
    text: "व्यस्त दिनचर्या में रोज़ की ऊर्जा और active lifestyle को support करें।",
  },
  {
    image: "/hero-herbs.webp",
    title: "Ayurvedic Wellness",
    text: "25 Super Herbs और Pure Shilajit वाला thoughtfully crafted blend।",
  },
  {
    image: "/romantic-couple-premium.webp",
    title: "Confidence & Connection",
    text: "Positive mindset और partner के साथ comfortable connection पर focus करें।",
  },
  {
    image: "/takat-power-x.jpg",
    title: "Simple Daily Routine",
    text: "रोज़ शाम भोजन के 30 मिनट बाद 1 चम्मच पानी या हल्के गर्म दूध के साथ।",
  },
] as const;

const storeProducts = {
  "takat-power-x": {
    name: "TAKAT POWER X",
    shortName: "TAKAT POWER X",
    primaryImage: "/takat-power-x.jpg",
    secondaryImage: "",
    cartDetail: "150g Bottle",
    mrp: 2500,
    codPrice: 1499,
    onlinePrice: 1349.10,
    offerLabel: "10% OFF",
    orderPrefix: "TPX",
  },
  "max-x7-x100-combo": {
    name: "MAX X7 Capsule + MAX X100 Oil Combo",
    shortName: "MAX X7 + X100 COMBO",
    primaryImage: "/max-x7-capsule.webp",
    secondaryImage: "/max-x100-oil.webp",
    cartDetail: "30 Capsule Bottle + Massage Oil",
    mrp: 2500,
    codPrice: 2500,
    onlinePrice: 1499,
    offerLabel: "LIMITED TIME OFFER",
    orderPrefix: "MAX",
  },
} as const;
const upiAppTargets = {
  googlePay: {
    packageName: "com.google.android.apps.nbu.paisa.user",
    storeUrl: "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user",
  },
  phonePe: {
    packageName: "com.phonepe.app",
    storeUrl: "https://play.google.com/store/apps/details?id=com.phonepe.app",
  },
  paytm: {
    packageName: "net.one97.paytm",
    storeUrl: "https://play.google.com/store/apps/details?id=net.one97.paytm",
  },
  bharatPe: {
    packageName: "com.postpe.app",
    storeUrl: "https://play.google.com/store/apps/details?id=com.postpe.app",
  },
  bhim: {
    packageName: "in.org.npci.upiapp",
    storeUrl: "https://play.google.com/store/apps/details?id=in.org.npci.upiapp",
  },
} as const;

type UpiAppTarget = keyof typeof upiAppTargets;

function formatPrice(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

type CustomerDetails = {
  name: string;
  mobile: string;
  address: string;
  pincode: string;
};

type ConfirmedOrder = {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  total: number;
  method: "COD" | "UPI";
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Amrit Ayurveda",
      url: siteUrl,
      telephone: "+91 82906 95226",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Amrit Ayurveda",
      inLanguage: "hi-IN",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Product",
      "@id": `${siteUrl}/#takat-power-x`,
      name: "TAKAT POWER X",
      image: [`${siteUrl}/takat-power-x.jpg`, `${siteUrl}/takat-lifestyle.png`],
      description: "25 super herbs और pure shilajit वाला पुरुषों का आयुर्वेदिक वेलनेस सपोर्ट।",
      brand: { "@type": "Brand", name: "Amrit Ayurveda" },
      category: "Ayurvedic Men's Wellness Support",
      weight: { "@type": "QuantitativeValue", value: 150, unitCode: "GRM" },
      offers: {
        "@type": "Offer",
        url: siteUrl,
        priceCurrency: "INR",
        price: "999",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    },
    {
      "@type": "Product",
      "@id": `${siteUrl}/#max-x7-x100-combo`,
      name: "MAX X7 Capsule + MAX X100 Oil Combo",
      image: [`${siteUrl}/max-x7-capsule.webp`, `${siteUrl}/max-x100-oil.webp`],
      description: "MAX X7 Ayurvedic capsule और MAX X100 massage oil का daily wellness combo।",
      brand: { "@type": "Brand", name: "Amrit Ayurveda" },
      category: "Ayurvedic Men's Wellness Combo",
      offers: {
        "@type": "Offer",
        url: `${siteUrl}/#products`,
        priceCurrency: "INR",
        price: "1499",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        priceValidUntil: "2026-12-31",
      },
    },
  ],
};

const courses = [
  { qty: 1, title: "TAKAT POWER X", detail: "1 × 150g Bottle", price: 999, mrp: 1500 },
  { qty: 2, title: "2-Month Course", detail: "2 × 150g Bottles", price: 1500, mrp: 2500 },
  { qty: 3, title: "3-Month Course", detail: "3 × 150g Bottles", price: 2500, mrp: 5000 },
];

const trustPoints = [
  { index: "01", title: "25 Super Herbs Blend", text: "अफ़्रीकन हर्ब्स, शिलाजीत और चुनी हुई पारंपरिक सामग्री का पुरुष वेलनेस फॉर्मूला।" },
  { index: "02", title: "Made for Modern Men", text: "व्यस्त दिनचर्या में रोज़ की एनर्जी, स्टैमिना और कॉन्फिडेंस को सपोर्ट करने के लिए।" },
  { index: "03", title: "Discreet Delivery", text: "पूरे भारत में सुरक्षित और गोपनीय पैकिंग के साथ डिलीवरी।" },
  { index: "04", title: "WhatsApp Assistance", text: "ऑर्डर, उपयोग और डिलीवरी से जुड़ी जानकारी के लिए सीधी सहायता।" },
];

const faqs = [
  ["TAKAT POWER X क्या है?", "TAKAT POWER X वयस्क पुरुषों के लिए एक सामान्य आयुर्वेदिक वेलनेस सपोर्ट है। पैक पर 25 सुपर हर्ब्स और शुद्ध शिलाजीत का उल्लेख है।"],
  ["TAKAT POWER X का सेवन कैसे करें?", "रोज़ शाम खाना खाने के 30 मिनट बाद 1 चम्मच लें। इसे पानी में अच्छी तरह घोलकर या हल्के गर्म दूध के साथ पिएँ। रोज़ाना नियमित रूप से सेवन करें और निर्धारित मात्रा से अधिक न लें।"],
  ["इसकी कीमत क्या है?", "एक 150g बोतल का offer price ₹999 है। Online Payment पर 10% discount उपलब्ध है।"],
  ["ऑर्डर कैसे करें?", "अपना course चुनें और BUY NOW दबाएँ। आप Google Pay, PhonePe, Paytm, BharatPe, BHIM UPI, किसी अन्य UPI app या Cash on Delivery से ऑर्डर कर सकते हैं। UPI payment के बाद receipt या UTR WhatsApp पर भेजें।"],
  ["क्या Cash on Delivery उपलब्ध है?", "हाँ, सेवा-योग्य पिन कोड पर Cash on Delivery उपलब्ध है। उपलब्धता WhatsApp पर confirm की जाएगी।"],
  ["पैकिंग कैसी होगी?", "ऑर्डर सादा, सुरक्षित और गोपनीय पैकिंग में भेजा जाएगा।"],
  ["क्या यह किसी बीमारी का इलाज है?", "नहीं। यह सामान्य वेलनेस सपोर्ट के लिए प्रस्तुत प्रोडक्ट है और किसी बीमारी के इलाज, रोकथाम या cure का दावा नहीं करता।"],
  ["MAX X7 Capsule + MAX X100 Oil Combo का उपयोग कैसे करें?", "रोज़ खाना खाने के बाद 1 MAX X7 capsule लें। MAX X100 oil से रोज़ नियमित रूप से हल्की मालिश करें। Product label पर दिए निर्देशों को प्राथमिकता दें।"],
  ["MAX Combo की कीमत क्या है?", "MRP ₹2,500 है। Limited Time Online Payment Offer में MAX X7 Capsule + MAX X100 Oil Combo ₹1,499 में उपलब्ध है।"],
];

const testimonialSamples = [
  { name: "Rahul S.", city: "Delhi", text: "Packing पूरी तरह private थी और WhatsApp पर order process बहुत आसान रहा।" },
  { name: "Amit K.", city: "Jaipur", text: "Product सही condition में मिला। इस्तेमाल की जानकारी भी साफ़ तरीके से समझाई गई।" },
  { name: "Vikas R.", city: "Lucknow", text: "Daily wellness routine में शामिल करना आसान लगा और support team ने जल्दी जवाब दिया।" },
  { name: "Mohit P.", city: "Chandigarh", text: "Delivery discreet थी। पैक पर Amrit Ayurveda branding और seal सही मिली।" },
  { name: "Sandeep N.", city: "Gurugram", text: "Course चुनने और payment करने में कोई परेशानी नहीं हुई। अच्छा buying experience रहा।" },
  { name: "Arjun M.", city: "Pune", text: "Routine, balanced diet और sleep के साथ wellness पर focus करना आसान हुआ।" },
  { name: "Deepak T.", city: "Bhopal", text: "Product presentation premium लगी और WhatsApp assistance काफी helpful रही।" },
  { name: "Nitin J.", city: "Surat", text: "Private parcel समय पर मिला। Order से delivery तक communication clear रहा।" },
  { name: "Harish K.", city: "Indore", text: "Instructions simple हैं और daily routine में इसे manage करना convenient लगा।" },
  { name: "Akash D.", city: "New Delhi", text: "COD confirm करने से लेकर parcel मिलने तक पूरा process smooth रहा।" },
  { name: "Manoj L.", city: "Patna", text: "Packaging भरोसेमंद लगी और product के बारे में पूछे सवालों का जवाब जल्दी मिला।" },
  { name: "Gaurav B.", city: "Noida", text: "Wellness support के लिए एक straightforward option लगा। Service experience अच्छा रहा।" },
];

const heroSlides = [
  {
    src: "/product-model-premium.webp",
    alt: "TAKAT POWER X के साथ adult Indian wellness model",
    eyebrow: "BOLD • PREMIUM • PRIVATE",
    title: "Confidence, Presented Beautifully",
    text: "Amrit Ayurveda का premium पुरुष wellness experience",
    tone: "ruby",
  },
  {
    src: "/romantic-couple-premium.webp",
    alt: "खुश adult Indian couple की romantic wellness lifestyle",
    eyebrow: "ROMANCE • WELLNESS",
    title: "Closer Moments, Better Confidence",
    text: "Couple wellness को tasteful, private और premium अंदाज़ में",
    tone: "gold",
  },
  {
    src: "/couple-silhouette-premium.webp",
    alt: "adult romantic couple की elegant silhouette",
    eyebrow: "PRIVATE MOMENTS",
    title: "A Quiet Spark Between Two",
    text: "Discreet delivery, personal support और confident wellness",
    tone: "ruby",
  },
  {
    src: "/hero-premium.webp",
    alt: "TAKAT POWER X का प्रीमियम आयुर्वेदिक product display",
    eyebrow: "25 SUPER HERBS",
    title: "Premium Ayurvedic Wellness",
    text: "अफ़्रीकन हर्ब्स और शुद्ध शिलाजीत का thoughtfully crafted blend",
    tone: "gold",
  },
];

export default function Home() {
  const formStartedRef = useRef(false);
  const [ageGateOpen, setAgeGateOpen] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const [cartQty, setCartQty] = useState(0);
  const [cartProductId, setCartProductId] = useState<ProductId>("takat-power-x");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");
  const [paymentRef, setPaymentRef] = useState("TPX-PENDING");
  const [reviewStart, setReviewStart] = useState(0);
  const [detailsError, setDetailsError] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [savedOrderId, setSavedOrderId] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [offerTimeLeft, setOfferTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    mobile: "",
    address: "",
    pincode: "",
  });

  useEffect(() => {
    if (localStorage.getItem("amrit-age-confirmed") === "yes") setAgeGateOpen(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    ["fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(key => {
      const value = params.get(key);
      if (value) sessionStorage.setItem(`amrit-${key}`, value);
    });
  }, []);

  useEffect(() => {
    if (!ageGateOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [ageGateOpen]);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setReviewStart(current => (current + 1) % testimonialSamples.length);
    }, 4000);
    return () => window.clearInterval(rotation);
  }, []);

  useEffect(() => {
    const eventKey = "amrit-meta-viewcontent-home";
    if (sessionStorage.getItem(eventKey) === "sent") return;
    const timer = window.setTimeout(() => {
      sendMetaBrowserEvent("ViewContent", {
        value: storeProducts["takat-power-x"].codPrice,
        currency: "INR",
        content_name: storeProducts["takat-power-x"].name,
        content_ids: ["takat-power-x"],
        content_type: "product",
      });
      sessionStorage.setItem(eventKey, "sent");
    }, 800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (carouselPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rotation = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % heroSlides.length);
    }, 4600);
    return () => window.clearInterval(rotation);
  }, [carouselPaused]);

  useEffect(() => {
    const saved = Number(localStorage.getItem("amrit-cart-qty") || 0);
    if (Number.isFinite(saved) && saved > 0) setCartQty(saved);
    const savedProduct = localStorage.getItem("amrit-cart-product");
    if (savedProduct === "takat-power-x" || savedProduct === "max-x7-x100-combo") setCartProductId(savedProduct);
  }, []);

  useEffect(() => {
    localStorage.setItem("amrit-cart-qty", String(cartQty));
    localStorage.setItem("amrit-cart-product", cartProductId);
    if (cartQty > 0) setPaymentRef(`${storeProducts[cartProductId].orderPrefix}${Date.now()}`);
  }, [cartProductId, cartQty]);

  useEffect(() => {
    if (!cartOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [cartOpen]);

  useEffect(() => {
    if (cartOpen && cartQty > 0) {
      trackActivity("cart_open", "Cart opened");
    }
  }, [cartOpen]);

  useEffect(() => {
    const now = Date.now();
    const savedEndsAt = Number(localStorage.getItem(comboOfferStorageKey));
    let offerEndsAt = Number.isFinite(savedEndsAt)
      && savedEndsAt > now
      && savedEndsAt - now <= comboOfferDurationMs
      ? savedEndsAt
      : now + comboOfferDurationMs;

    localStorage.setItem(comboOfferStorageKey, String(offerEndsAt));

    const updateOfferTimer = () => {
      let remaining = offerEndsAt - Date.now();

      if (remaining <= 0) {
        offerEndsAt = Date.now() + comboOfferDurationMs;
        localStorage.setItem(comboOfferStorageKey, String(offerEndsAt));
        remaining = offerEndsAt - Date.now();
      }

      setOfferTimeLeft({
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining % 86400000) / 3600000),
        minutes: Math.floor((remaining % 3600000) / 60000),
        seconds: Math.floor((remaining % 60000) / 1000),
      });
    };
    updateOfferTimer();
    const timer = window.setInterval(updateOfferTimer, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedCourse = courses.find(course => course.qty === selectedQty) ?? courses[0];
  const activeProduct = storeProducts[cartProductId];
  const codTotal = cartQty * activeProduct.codPrice;
  const onlineTotal = Number((cartQty * activeProduct.onlinePrice).toFixed(2));
  const onlineSavings = Number((codTotal - onlineTotal).toFixed(2));
  const payableTotal = paymentMethod === "upi" ? onlineTotal : codTotal;
  const customerDetailsValid = customer.name.trim().length >= 2
    && /^[6-9]\d{9}$/.test(customer.mobile)
    && customer.address.trim().length >= 5
    && /^\d{6}$/.test(customer.pincode);
  const customerMessage = `Customer Name: ${customer.name}\nMobile: ${customer.mobile}\nHome Address: ${customer.address}\nPIN Code: ${customer.pincode}`;
  const whatsappUrl = useMemo(() => {
    const qty = cartQty || selectedQty;
    const regularTotal = qty * activeProduct.codPrice;
    const discountedTotal = Number((qty * activeProduct.onlinePrice).toFixed(2));
    const paymentLabel = paymentMethod === "cod" ? "Cash on Delivery (parcel मिलने पर payment)" : "UPI payment";
    const orderTotal = paymentMethod === "upi" ? discountedTotal : regularTotal;
    const discountLine = paymentMethod === "upi" ? `\nOnline Offer: ${activeProduct.offerLabel}` : "";
    const message = `नमस्ते, मुझे ${activeProduct.name} ऑर्डर करना है।\n\n${customerMessage}\n\nQuantity: ${qty}\nPack: ${activeProduct.cartDetail}\nTotal: ₹${formatPrice(orderTotal)}${discountLine}\nPayment: ${paymentLabel}\nकृपया ऑर्डर confirm करें।`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [activeProduct, cartQty, customerMessage, paymentMethod, selectedQty]);
  const paymentWhatsappUrl = useMemo(() => {
    const message = `नमस्ते, मैंने ${activeProduct.name} के लिए UPI payment किया है।\n\n${customerMessage}\n\nQuantity: ${cartQty}\nPack: ${activeProduct.cartDetail}\nMRP/COD Amount: ₹${formatPrice(codTotal)}\nOnline Offer: ${activeProduct.offerLabel}\nPaid Amount: ₹${formatPrice(onlineTotal)}\nPayment reference: ${paymentRef}\nमैं payment screenshot/UTR भेज रहा हूँ। कृपया order confirm करें।`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [activeProduct, cartQty, codTotal, customerMessage, onlineTotal, paymentRef]);
  const upiPaymentUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: "AMRIT AYURVEDA",
      tn: `Amrit Ayurveda ${activeProduct.shortName} ${paymentRef} - Qty ${cartQty}`,
      am: onlineTotal.toFixed(2),
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  }, [activeProduct.shortName, cartQty, onlineTotal, paymentRef]);

  function sendMetaBrowserEvent(
    eventName: "ViewContent" | "AddToCart" | "InitiateCheckout" | "Contact",
    data: Record<string, unknown> = {},
    eventId?: string,
  ) {
    const tryFbq = () => {
      const metaFbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq;
      if (typeof metaFbq !== "function") return false;
      if (eventId) metaFbq("track", eventName, data, { eventID: eventId });
      else metaFbq("track", eventName, data);
      return true;
    };

    const sendBeaconFallback = () => {
      const params = new URLSearchParams({
        id: metaPixelId,
        ev: eventName,
        noscript: "1",
        dl: window.location.href,
        rl: document.referrer || "",
        ts: String(Date.now()),
      });
      if (eventId) params.set("eid", eventId);
      Object.entries(data).forEach(([key, value]) => {
        const serialized = Array.isArray(value) || (value && typeof value === "object")
          ? JSON.stringify(value)
          : String(value ?? "");
        params.set(`cd[${key}]`, serialized);
      });
      const beacon = new window.Image(1, 1);
      beacon.referrerPolicy = "no-referrer-when-downgrade";
      beacon.src = `https://www.facebook.com/tr?${params.toString()}`;
    };

    if (tryFbq()) return;

    let attempts = 0;
    const retryTimer = window.setInterval(() => {
      attempts += 1;
      if (tryFbq()) {
        window.clearInterval(retryTimer);
        return;
      }
      if (attempts >= 12) {
        window.clearInterval(retryTimer);
        sendBeaconFallback();
      }
    }, 250);
  }

  function buyCourse(qty: number) {
    const safeQty = Math.max(1, Math.min(10, Number(qty) || 1));
    window.location.assign(`/checkout?product=takat-power-x&qty=${safeQty}`);
  }

  function buyCombo() {
    window.location.assign("/checkout?product=max-x7-x100-combo&qty=1");
  }

  function confirmAdultEntry() {
    localStorage.setItem("amrit-age-confirmed", "yes");
    setAgeGateOpen(false);
  }

  function leaveAdultStore() {
    if (window.history.length > 1) window.history.back();
    else window.location.replace("https://www.google.com/");
  }

  function activitySessionId() {
    const key = "amrit-website-activity-session";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : "sess-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(key, id);
    }
    return id;
  }

  async function submitCrmForm(formName: string, fields: Record<string, unknown>) {
    if (formName === "website_order") {
      try {
        const sessionResponse = await fetch("/sapi/project/26522/session", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const sessionJson = await sessionResponse.json().catch(() => ({}));
        const session = sessionJson?.data;

        if (sessionResponse.ok && session?.session_id && session?.csrf_token) {
          await new Promise(resolve => window.setTimeout(resolve, 3200));

          const directResponse = await fetch("/sapi/project/26522/form/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Session-Id": String(session.session_id),
              "X-CSRF-Token": String(session.csrf_token),
            },
            body: JSON.stringify({
              form_name: formName,
              fields: { ...fields, website: "" },
              _csrf: session.csrf_token,
            }),
          });
          const directResult = await directResponse.json().catch(() => ({}));
          const actionStatus = directResult?.data?.action_result?.status;

          if (
            directResponse.ok &&
            directResult?.success !== false &&
            (!actionStatus || actionStatus === "completed")
          ) {
            return { ok: true, result: directResult, route: "direct-sapi" };
          }
        }
      } catch {
        // Fall through to the same-origin API route below.
      }
    }

    const endpoint = formName === "website_order" ? "/api/website-order" : "/api/website-activity";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.ok === false) {
      throw new Error(String(result?.error || "CRM save failed"));
    }
    return result;
  }

  function trackActivity(
    eventType: string,
    label: string,
    product = activeProduct.shortName,
    quantity = Math.max(1, cartQty || 1),
    orderRef = paymentRef,
  ) {
    void submitCrmForm("website_activity", {
      event_type: eventType,
      session_id: activitySessionId(),
      label,
      path: window.location.pathname,
      product,
      quantity: String(quantity),
      order_ref: orderRef,
      website: "",
    }).catch(() => undefined);
  }

  function sendMetaPurchase(value: number, eventId: string) {
    const purchaseEventKey = `amrit-meta-purchase-${eventId}`;
    if (localStorage.getItem(purchaseEventKey) === "sent") return;

    const eventData = {
      value,
      currency: "INR",
      content_name: activeProduct.name,
      content_ids: [cartProductId],
      content_type: "product",
      num_items: cartQty,
    };

    const tryFbq = () => {
      const metaFbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq;
      if (typeof metaFbq !== "function") return false;
      metaFbq("track", "Purchase", eventData, { eventID: eventId });
      localStorage.setItem(purchaseEventKey, "sent");
      return true;
    };

    if (tryFbq()) return;

    let attempts = 0;
    const retryTimer = window.setInterval(() => {
      attempts += 1;
      if (tryFbq()) {
        window.clearInterval(retryTimer);
        return;
      }

      if (attempts >= 12) {
        window.clearInterval(retryTimer);
        const params = new URLSearchParams({
          id: metaPixelId,
          ev: "Purchase",
          noscript: "1",
          eid: eventId,
          dl: window.location.href,
          "cd[value]": value.toFixed(2),
          "cd[currency]": "INR",
          "cd[content_name]": activeProduct.name,
          "cd[content_type]": "product",
          "cd[num_items]": String(cartQty),
        });
        const beacon = new window.Image(1, 1);
        beacon.referrerPolicy = "no-referrer-when-downgrade";
        beacon.src = `https://www.facebook.com/tr?${params.toString()}`;
        localStorage.setItem(purchaseEventKey, "sent");
      }
    }, 250);
  }

  function updateCustomer(field: keyof CustomerDetails, value: string) {
    if (!formStartedRef.current) {
      formStartedRef.current = true;
      sendMetaBrowserEvent("InitiateCheckout", {
        value: payableTotal,
        currency: "INR",
        content_name: activeProduct.name,
        content_ids: [cartProductId],
        content_type: "product",
        num_items: Math.max(1, cartQty),
      }, `${paymentRef}-checkout`);
      trackActivity("form_start", "Checkout delivery form started");
    }
    setCustomer(current => ({ ...current, [field]: value }));
    setDetailsError(false);
    setOrderError("");
  }

  async function submitWebsiteOrder(method: "cod" | "upi") {
    if (savedOrderId === paymentRef) {
      setOrderSuccessOpen(true);
      return true;
    }
    setOrderSaving(true);
    setOrderError("");
    try {
      const isReorder = localStorage.getItem("amrit-last-order-phone") === customer.mobile;
      const result = await submitCrmForm("website_order", {
        customer: customer.name.trim(),
        phone: customer.mobile,
        address: customer.address.trim(),
        state: "Unknown",
        district: "Unknown",
        city: "Unknown",
        pincode: customer.pincode,
        product: activeProduct.name,
        quantity: String(cartQty),
        payment: method === "upi" ? "Prepaid" : "COD",
        amount: String(method === "upi" ? onlineTotal : codTotal),
        order_id: paymentRef,
        notes: activeProduct.cartDetail,
        order_type: isReorder ? "Reorder" : "Order",
        website: "",
      });
      if (!result.ok) throw new Error("Order CRM में save नहीं हुआ");

      const purchaseValue = method === "upi" ? onlineTotal : codTotal;
      sendMetaPurchase(purchaseValue, paymentRef);

      localStorage.setItem("amrit-last-order-phone", customer.mobile);
      trackActivity(isReorder ? "reorder_submit" : "order_submit", isReorder ? "Reorder submitted" : "Order submitted");
      setSavedOrderId(paymentRef);
      setConfirmedOrder({
        id: paymentRef,
        customerName: customer.name.trim(),
        productName: activeProduct.shortName,
        quantity: cartQty,
        total: method === "upi" ? onlineTotal : codTotal,
        method: method.toUpperCase() as "COD" | "UPI",
      });
      setOrderSuccessOpen(true);
      return true;
    } catch {
      setOrderError("Order save नहीं हुआ। Internet check करके दोबारा try करें।");
      return false;
    } finally {
      setOrderSaving(false);
    }
  }

  async function confirmCodOrder(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.location.assign(`/checkout?product=${cartProductId}&qty=${Math.max(1, cartQty || selectedQty)}`);
  }

  function requireCustomerDetails(event: MouseEvent<HTMLAnchorElement>) {
    if (customerDetailsValid) return;
    event.preventDefault();
    setDetailsError(true);
    document.querySelector("#delivery-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function openSpecificUpiApp(event: MouseEvent<HTMLAnchorElement>, app: UpiAppTarget) {
    if (!customerDetailsValid) {
      requireCustomerDetails(event);
      return;
    }

    event.preventDefault();
    if (!(await submitWebsiteOrder("upi"))) return;
    if (!/Android/i.test(window.navigator.userAgent)) {
      window.location.assign(upiPaymentUrl);
      return;
    }
    const target = upiAppTargets[app];
    const paymentQuery = upiPaymentUrl.slice("upi://pay?".length);
    const appIntentUrl = `intent://pay?${paymentQuery}#Intent;scheme=upi;package=${target.packageName};S.browser_fallback_url=${encodeURIComponent(target.storeUrl)};end`;
    window.location.assign(appIntentUrl);
  }

  async function beginUpiOrder(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (!customerDetailsValid) {
      requireCustomerDetails(event);
      return;
    }
    if (await submitWebsiteOrder("upi")) window.location.assign(upiPaymentUrl);
  }

  function showPreviousSlide() {
    setActiveSlide(current => (current - 1 + heroSlides.length) % heroSlides.length);
  }

  function showNextSlide() {
    setActiveSlide(current => (current + 1) % heroSlides.length);
  }

  return (
    <main className="siteRoot">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {ageGateOpen && <div className="ageGateOverlay" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
        <section className="ageGateCard">
          <span className="ageSeal">18+</span>
          <p className="sectionKicker center">PRIVATE ADULT WELLNESS</p>
          <h2 id="age-gate-title">यह website केवल वयस्कों के लिए है</h2>
          <p>आगे बढ़कर आप पुष्टि करते हैं कि आपकी उम्र 18 वर्ष या उससे अधिक है। सभी visuals tasteful wellness presentation हैं।</p>
          <button className="redButton" onClick={confirmAdultEntry}>हाँ, मेरी उम्र 18+ है — ENTER</button>
          <button className="ageExit" onClick={leaveAdultStore}>अभी बाहर जाएँ</button>
          <small>PRIVATE • DISCREET • RESPONSIBLE</small>
        </section>
      </div>}
      {orderSuccessOpen && confirmedOrder && <div className="orderSuccessOverlay" role="dialog" aria-modal="true" aria-labelledby="order-success-title">
        <section className="orderSuccessCard">
          <span className="orderSuccessCheck" aria-hidden="true">✓</span>
          <p className="sectionKicker center">AMRIT AYURVEDA</p>
          <h2 id="order-success-title">ऑर्डर कन्फर्म!</h2>
          <p className="orderCustomerThanks">धन्यवाद, <strong>{confirmedOrder.customerName} जी</strong></p>
          <p className="orderSuccessMessage">आपका {confirmedOrder.method} ऑर्डर सफलतापूर्वक प्राप्त हो गया है।</p>
          <div className="confirmedOrderSummary">
            <p><strong>{confirmedOrder.quantity} {confirmedOrder.quantity === 1 ? "Pack" : "Packs"}</strong><span>₹{formatPrice(confirmedOrder.total)}</span></p>
            <small>{confirmedOrder.productName}</small>
          </div>
          <p className="orderConfirmationCode"><span>CONFIRMATION CODE / ORDER ID</span><strong>{confirmedOrder.id}</strong></p>
          <div className="orderContactMessage">
            <strong>Amrit Ayurveda टीम जल्द ही आपसे संपर्क करेगी।</strong>
            <p>हम आपके दिए हुए mobile number पर ऑर्डर की पुष्टि के लिए संपर्क करेंगे। कृपया अपना फोन उपलब्ध रखें।</p>
          </div>
          <p className="orderDispatchMessage">ऑर्डर की पुष्टि होने के बाद आपका parcel सुरक्षित तरीके से pack करके भेजा जाएगा।</p>
          <div className="orderTrustRow"><span>100% गोपनीय पैकेजिंग</span><span>सुरक्षित डिलीवरी</span></div>
          <button className="redButton" onClick={() => { setOrderSuccessOpen(false); setCartOpen(false); }}>ठीक है</button>
          <small className="orderHelpNote">सहायता के लिए WhatsApp विकल्प वेबसाइट पर उपलब्ध है।</small>
        </section>
      </div>}
      <div className="saleTicker" aria-label="वर्तमान ऑफर">
        <div><span>MAX X7 + X100 COMBO • ONLINE ₹1,499 • LIMITED TIME OFFER • PRIVATE DELIVERY</span><span>MAX X7 + X100 COMBO • ONLINE ₹1,499 • LIMITED TIME OFFER • PRIVATE DELIVERY</span></div>
      </div>

      <header className="siteHeader">
        <div className="siteShell navRow">
          <a className="wordmark" href="#home" aria-label="Amrit Ayurveda home"><strong>AMRIT</strong><span>AYURVEDA</span></a>
          <nav className={`mainNav ${menuOpen ? "open" : ""}`} aria-label="मुख्य नेविगेशन">
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#products" onClick={() => setMenuOpen(false)}>Products</a>
            <a href="#private-store" onClick={() => setMenuOpen(false)}>Private Store</a>
            <a href="#why" onClick={() => setMenuOpen(false)}>Why Choose</a>
            <a href="#how-to-use" onClick={() => setMenuOpen(false)}>How To Use</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
          <div className="navActions">
            <a className="headerWhatsApp" href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")} target="_blank" rel="noreferrer"><span>WA</span> CHAT</a>
            <button className="menuButton" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen}>MENU</button>
            <a className="cartTrigger" href={`/checkout?product=${cartProductId}&qty=${Math.max(1, cartQty || selectedQty)}`} aria-label={`Cart में ${cartQty} item`}>CART <span>{cartQty}</span></a>
          </div>
        </div>
      </header>

      <section className="heroDark" id="home">
        <div className="heroAurora heroAuroraOne" aria-hidden="true" />
        <div className="heroAurora heroAuroraTwo" aria-hidden="true" />
        <div className="siteShell heroStorefront">
          <div className="visualColumn">
            <div
              className={`carouselFrame tone-${heroSlides[activeSlide].tone}`}
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
              onFocusCapture={() => setCarouselPaused(true)}
              onBlurCapture={() => setCarouselPaused(false)}
              aria-roledescription="carousel"
              aria-label="TAKAT POWER X highlights"
            >
              {heroSlides.map((slide, index) => (
                <article
                  className={`carouselSlide ${activeSlide === index ? "active" : ""}`}
                  key={slide.src}
                  aria-hidden={activeSlide !== index}
                >
                  <img src={slide.src} alt={slide.alt} fetchPriority={index === 0 ? "high" : "auto"} />
                  <div className="slideShade" />
                  <div className="slideCaption">
                    <span>{slide.eyebrow}</span>
                    <strong>{slide.title}</strong>
                    <p>{slide.text}</p>
                  </div>
                </article>
              ))}
              <button className="slideArrow prev" onClick={showPreviousSlide} aria-label="पिछली फोटो">‹</button>
              <button className="slideArrow next" onClick={showNextSlide} aria-label="अगली फोटो">›</button>
              <div className="slideCounter" aria-live="polite"><b>0{activeSlide + 1}</b><span>/ 0{heroSlides.length}</span></div>
              <div className="slideDots" aria-label="फोटो चुनें">
                {heroSlides.map((slide, index) => (
                  <button
                    className={activeSlide === index ? "active" : ""}
                    key={slide.src}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`फोटो ${index + 1}`}
                    aria-current={activeSlide === index ? "true" : undefined}
                  />
                ))}
              </div>
              {!carouselPaused && <div className="slideProgress" key={activeSlide} aria-hidden="true" />}
            </div>
            <p className="offerNote">OFFER: MRP ₹2,500 से ₹1,001 की बचत • आज केवल ₹1,499</p>
            <div className="heroMiniTrust" aria-label="खरीदने के फायदे">
              <span><b>40%</b> बचत</span><span><b>COD</b> उपलब्ध</span><span><b>100%</b> निजी पैकिंग</span>
            </div>
          </div>

          <div className="courseColumn">
            <span className="formulaPill">100% HERBAL FORMULA</span>
            <h1><span className="heroTitleLine">Original <em>TAKAT POWER X</em></span>African Herbs</h1>
            <p className="heroIntro">अफ़्रीकन हर्ब्स और आयुर्वेद का शक्तिशाली मिश्रण—रोज़ की एनर्जी, स्टैमिना और कॉन्फिडेंस को सपोर्ट करने के लिए।</p>
            <span className="courseLabel">RECOMMENDED COURSE</span>
            <div className="courseList">
              {courses.map(course => <button className={`courseCard ${selectedQty === course.qty ? "selected" : ""}`} key={course.qty} onClick={() => setSelectedQty(course.qty)}>
                <img src="/takat-power-x.jpg" alt=""/>
                <span className="courseName"><strong>{course.title}</strong><small>{course.detail}</small><b>Save 40%</b></span>
                <span className="coursePrice"><strong>₹{course.price.toLocaleString("en-IN")}/-</strong><s>₹{course.mrp.toLocaleString("en-IN")}/-</s><small>incl. of all taxes</small></span>
              </button>)}
            </div>
            <div className="heroActions">
              <a className="redButton heroBuy" href={`/checkout?product=takat-power-x&qty=${selectedQty}`}>BUY NOW • ₹{selectedCourse.price.toLocaleString("en-IN")}</a>
              <a className="whatsappButton heroWhatsApp" href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")} target="_blank" rel="noreferrer"><span>WA</span><b>WhatsApp पर सीधे बात करें</b></a>
            </div>
            <div className="checkoutTrust"><strong>SAFE CHECKOUT</strong><span>Google Pay • PhonePe • UPI • COD</span></div>
          </div>
        </div>
      </section>

      <div className="privacyStrip"><div className="siteShell"><strong>सुरक्षित और गोपनीय डिलीवरी</strong><span>आपकी जानकारी और पैकिंग पूरी तरह private रखी जाती है।</span></div></div>

      <section className="benefitProofSection" aria-labelledby="benefit-proof-title">
        <div className="siteShell">
          <span className="sectionKicker center">TAKAT POWER X • BENEFITS</span>
          <h2 className="centerTitle" id="benefit-proof-title">रोज़ की ताकत, स्टैमिना और कॉन्फिडेंस के लिए Wellness Support</h2>
          <p className="benefitProofIntro">TAKAT POWER X एक आयुर्वेदिक wellness formulation है, जिसे पुरुषों की daily energy, stamina और confidence को support करने के लिए तैयार किया गया है।</p>

          <div className="benefitProofLabels" aria-hidden="true"><strong>DAILY ROUTINE</strong><strong>WELLNESS SUPPORT</strong></div>
          <div className="benefitProofGrid">
            {wellnessBenefitCards.map(benefit => (
              <article className="benefitProofCard" key={benefit.title}>
                <div className="benefitProofImage">
                  <Image src={benefit.image} alt="" fill sizes="(max-width: 720px) 50vw, 25vw" />
                </div>
                <div><strong>{benefit.title}</strong><p>{benefit.text}</p></div>
              </article>
            ))}
          </div>

          <div className="benefitFormulaPanel">
            <div className="benefitProductVisual"><Image src="/takat-power-x.jpg" alt="TAKAT POWER X product pack" fill sizes="(max-width: 720px) 42vw, 260px" /></div>
            <div>
              <span>AMRIT AYURVEDA</span>
              <h3>TAKAT POWER X</h3>
              <p>अफ़्रीकन हर्ब्स, 25 Super Herbs और Pure Shilajit के साथ premium पुरुष wellness support।</p>
              <ul><li>Daily energy और stamina support</li><li>Confidence-focused wellness routine</li><li>Private packing और WhatsApp assistance</li></ul>
            </div>
          </div>
          <p className="benefitProofDisclaimer">यह सामान्य wellness support है। परिणाम व्यक्ति के अनुसार अलग हो सकते हैं।</p>
        </div>
      </section>

      <section className="customGallerySection" aria-labelledby="custom-gallery-title">
        <div className="siteShell">
          <span className="sectionKicker center">YOUR PHOTO SPACE</span>
          <h2 className="centerTitle" id="custom-gallery-title">आपकी फोटो गैलरी</h2>
          <p className="customGalleryIntro">आपकी 4 photos फिर से website पर दिखाई जाएँगी।</p>
          <div className="customGalleryGrid">
            {customGalleryPhotos.map((src, index) => (
              <div className="customGallerySlot hasPhoto" key={src}>
                <img
                  src={src}
                  alt={`Amrit Ayurveda gallery photo ${index + 1}`}
                  loading="lazy"
                />
                <span className="customGalleryPlaceholder"><b>{String(index + 1).padStart(2, "0")}</b>PHOTO SLOT</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="featuredProductsSection" id="products" aria-labelledby="products-title">
        <div className="siteShell">
          <span className="sectionKicker center">AMRIT AYURVEDA • PRODUCT STORE</span>
          <h2 className="centerTitle" id="products-title">अपनी daily wellness routine चुनें</h2>
          <p className="productsIntro">दोनों products के उपयोग, price और payment offer साफ़ देखें। Order करते समय चुना हुआ product CRM में अलग नाम से save होगा।</p>

          <div className="productShowcaseGrid">
            <article className="productShowcaseCard takatShowcase">
              <div className="singleProductVisual"><img src="/takat-power-x.jpg" alt="TAKAT POWER X 150g bottle" loading="lazy"/></div>
              <div className="productShowcaseContent">
                <span className="productType">POWDER • DAILY WELLNESS</span>
                <h3>TAKAT POWER X</h3>
                <p>25 Super Herbs और Pure Shilajit वाला 150g पुरुष wellness support.</p>
                <div className="showcaseUse"><b>रोज़ाना उपयोग</b><span>भोजन के 30 मिनट बाद 1 चम्मच पानी या हल्के गर्म दूध के साथ।</span></div>
                <div className="showcasePrice"><s>MRP ₹1,500</s><strong>COD ₹999</strong><small>Online payment पर extra 10% off</small></div>
                <button className="redButton productOrderButton" onClick={() => buyCourse(1)}>TAKAT POWER X ORDER करें</button>
              </div>
            </article>

            <article className="productShowcaseCard comboShowcase">
              <span className="limitedBadge">LIMITED TIME OFFER</span>
              <span className="comboShine" aria-hidden="true" />
              <div className="comboVisualStage" aria-label="MAX X7 capsule और MAX X100 oil combo">
                <span className="comboGlowOrb" aria-hidden="true" />
                <figure className="comboBottle capsuleFloat"><img src="/max-x7-capsule.webp" alt="MAX X7 Ayurvedic capsule bottle" loading="lazy"/><figcaption>30 CAPSULE</figcaption></figure>
                <figure className="comboBottle oilFloat"><img src="/max-x100-oil.webp" alt="MAX X100 massage oil bottle" loading="lazy"/><figcaption>MASSAGE OIL</figcaption></figure>
              </div>
              <div className="productShowcaseContent comboContent">
                <span className="productType">CAPSULE + OIL • COMBO PACK</span>
                <h3>MAX X7 + MAX X100</h3>
                <p>Capsule और massage oil की complete daily routine—एक ही combo pack में।</p>
                <div className="comboRoutine">
                  <article><b>01</b><span><strong>MAX X7 Capsule</strong><small>रोज़ खाना खाने के बाद 1 capsule लें।</small></span></article>
                  <article><b>02</b><span><strong>MAX X100 Oil</strong><small>Oil से रोज़ नियमित रूप से हल्की मालिश करें।</small></span></article>
                </div>
                <div className="comboPaymentOptions" aria-label="Combo payment prices">
                  <article><small>CASH ON DELIVERY</small><strong>₹2,500</strong><span>Parcel मिलने पर payment</span></article>
                  <article className="onlineOfferOption"><small>ONLINE PAYMENT</small><strong>₹1,499</strong><span>Limited time offer</span></article>
                </div>
                <div className="showcasePrice comboPrice"><s>MRP ₹2,500</s><strong>ONLINE ₹1,499</strong><small>Limited time online payment offer • Save ₹1,001</small></div>
                <div className="offerCountdown" role="timer" aria-live="off" aria-label="Limited time offer countdown">
                  <span className="timerLabel">OFFER ENDS IN</span>
                  <span className="timeBox"><b>{String(offerTimeLeft.days).padStart(2, "0")}</b><small>DAYS</small></span>
                  <i>:</i>
                  <span className="timeBox"><b>{String(offerTimeLeft.hours).padStart(2, "0")}</b><small>HRS</small></span>
                  <i>:</i>
                  <span className="timeBox"><b>{String(offerTimeLeft.minutes).padStart(2, "0")}</b><small>MIN</small></span>
                  <i>:</i>
                  <span className="timeBox"><b>{String(offerTimeLeft.seconds).padStart(2, "0")}</b><small>SEC</small></span>
                </div>
                <a className="redButton productOrderButton comboOrderButton" href="/checkout?product=max-x7-x100-combo&qty=1">COMBO ORDER करें • ₹1,499</a>
              </div>
            </article>
          </div>
          <p className="comboSafety">18+ वयस्कों के लिए। निर्धारित मात्रा से अधिक उपयोग न करें। कोई medical condition, allergy या दवा चल रही हो तो योग्य स्वास्थ्य विशेषज्ञ से सलाह लें। Product label के निर्देश प्राथमिक हैं।</p>
        </div>
      </section>

      <section className="whatsappStrip" aria-label="WhatsApp सहायता">
        <div className="siteShell whatsappStripInner">
          <span className="liveDot" aria-hidden="true" />
          <div><strong>कोई सवाल है? अभी सीधे WhatsApp पर बात करें</strong><small>Product, COD, use और delivery की private सहायता</small></div>
          <a href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")} target="_blank" rel="noreferrer">WHATSAPP पर CHAT करें →</a>
        </div>
      </section>

      <section className="authenticityAlert">
        <div className="siteShell"><h2>असली TAKAT POWER X की पहचान करें</h2><p>Original product पर <strong>AMRIT AYURVEDA</strong> branding, TAKAT POWER X label, 25 Super Herbs और With Pure Shilajit की जानकारी देखें। केवल verified Amrit Ayurveda order channel से खरीदें।</p></div>
      </section>

      <section className="privateStoreSection" id="private-store">
        <div className="siteShell">
          <span className="sectionKicker center">PRIVATE ADULT WELLNESS • 18+</span>
          <h2 className="centerTitle">Bold wellness. Private shopping.</h2>
          <p className="privateStoreIntro">Men&apos;s wellness, couple care और intimate lifestyle से जुड़े products के लिए discreet guidance और private ordering.</p>
          <div className="wellnessCategories">
            <a href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")} target="_blank" rel="noreferrer"><b>01</b><strong>Men&apos;s Performance</strong><span>Stamina • Energy • Confidence</span></a>
            <a href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")} target="_blank" rel="noreferrer"><b>02</b><strong>Couple Wellness</strong><span>Connection • Comfort • Care</span></a>
            <a href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")} target="_blank" rel="noreferrer"><b>03</b><strong>Intimate Care</strong><span>Private advice on WhatsApp</span></a>
            <a href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")} target="_blank" rel="noreferrer"><b>04</b><strong>Ayurvedic Vitality</strong><span>Herbal daily wellness</span></a>
          </div>

          <div className="productGalleryHeading">
            <div><span className="sectionKicker">GENUINE PRODUCT VIEW</span><h3>हर angle से product देखें</h3></div>
            <span>Swipe / scroll करके पैक और delivery view देखें</span>
          </div>
          <div className="productGallery">
            <figure><img src="/gallery-angle.webp" alt="TAKAT POWER X premium three-quarter product view" loading="lazy"/><figcaption><b>Premium Pack</b><span>Original 250g bottle</span></figcaption></figure>
            <figure><img src="/gallery-detail.webp" alt="TAKAT POWER X cap और label का close-up" loading="lazy"/><figcaption><b>Label & Seal</b><span>पैक और branding ध्यान से देखें</span></figcaption></figure>
            <figure><img src="/gallery-delivery.webp" alt="TAKAT POWER X discreet parcel delivery view" loading="lazy"/><figcaption><b>Discreet Delivery</b><span>Plain, private parcel packing</span></figcaption></figure>
          </div>
        </div>
      </section>

      <section className="darkSection whySection" id="why">
        <div className="siteShell whyGrid">
          <div>
            <span className="sectionKicker">WHY CHOOSE US</span>
            <h2>Why Choose<br/><em>TAKAT POWER X?</em></h2>
            <p className="sectionLead">एक प्रीमियम आयुर्वेदिक पुरुष वेलनेस सपोर्ट, जिसे रोज़ की एनर्जी, स्टैमिना और शरीर की ताकत को सपोर्ट करने के लिए बनाया गया है।</p>
            <div className="trustCards">{trustPoints.map(item => <article key={item.index}><b>{item.index}</b><span><strong>{item.title}</strong><p>{item.text}</p></span></article>)}</div>
            <a className="redButton sectionBuy" href={`/checkout?product=takat-power-x&qty=${selectedQty}`}>BUY NOW</a>
          </div>
          <div className="whyProduct"><img src="/takat-power-x.jpg" alt="TAKAT POWER X product packaging" loading="lazy"/><span>AMRIT AYURVEDA</span></div>
        </div>
      </section>

      <section className="guideSection" id="guide">
        <div className="siteShell">
          <span className="sectionKicker center">BUYER&apos;S GUIDE</span>
          <h2 className="centerTitle">असली प्रोडक्ट की पहचान कैसे करें?</h2>
          <div className="guideGrid"><article><span>01</span><h3>Official Source से खरीदें</h3><p>Original TAKAT POWER X केवल Amrit Ayurveda के verified order channel से खरीदें।</p></article><article><span>02</span><h3>Branding और Seal Check करें</h3><p>पैक पर AMRIT AYURVEDA नाम, सही label और सुरक्षित seal ज़रूर देखें।</p></article></div>

          <div className="howToUseBlock" id="how-to-use">
            <span className="sectionKicker center howKicker">HOW TO USE • सेवन विधि</span>
            <h2 className="centerTitle">रोज़ाना 1 चम्मच—सही तरीके से लें</h2>
            <p className="howToUseIntro">TAKAT POWER X को अपनी शाम की daily wellness routine में इस आसान तरीके से शामिल करें।</p>
            <div className="useSteps" aria-label="TAKAT POWER X सेवन विधि">
              <article><b>01</b><span><small>सही समय</small><strong>शाम को भोजन के 30 मिनट बाद</strong><p>दिन में एक बार, रोज़ एक ही समय पर सेवन करें।</p></span></article>
              <article><b>02</b><span><small>सही मात्रा</small><strong>रोज़ाना 1 चम्मच</strong><p>निर्धारित मात्रा से अधिक सेवन न करें।</p></span></article>
              <article><b>03</b><span><small>विकल्प 1</small><strong>पानी में घोलकर</strong><p>1 चम्मच पानी में अच्छी तरह घोलकर पिएँ।</p></span></article>
              <article><b>04</b><span><small>विकल्प 2</small><strong>हल्के गर्म दूध के साथ</strong><p>चाहें तो 1 चम्मच हल्के गर्म दूध के साथ लें।</p></span></article>
            </div>
            <div className="dailyUseReminder"><span>DAILY ROUTINE</span><strong>बेहतर नियमितता के लिए इसका सेवन रोज़ाना करें।</strong></div>
            <p className="safetyNote">18+ वयस्कों के लिए। कोई दवा चल रही हो, एलर्जी या medical condition हो तो सेवन से पहले योग्य स्वास्थ्य विशेषज्ञ की सलाह लें। Product label पर दिए निर्देशों को प्राथमिकता दें।</p>
            <a className="redButton sectionBuy centered" href={`/checkout?product=takat-power-x&qty=${selectedQty}`}>BUY NOW</a>
          </div>
        </div>
      </section>

      <section className="faqDark" id="faq">
        <div className="siteShell faqWrap">
          <span className="sectionKicker center">GOT QUESTIONS?</span>
          <h2>Frequently Asked Questions</h2>
          <div className="faqAccordion">{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="promiseSection">
        <div className="siteShell">
          <span className="sectionKicker center">CUSTOMER PROMISE</span>
          <h2 className="centerTitle">Clear Product. Private Delivery. Direct Support.</h2>
          <div className="promiseGrid"><article><strong>Original Product</strong><p>आपको वही pack मिलेगा जो order के समय दिखाया गया है।</p></article><article><strong>Private Packaging</strong><p>बाहर से सादा और सुरक्षित पैकेजिंग रखी जाती है।</p></article><article><strong>Order Assistance</strong><p>WhatsApp पर quantity, address और delivery status की मदद।</p></article></div>
          <a className="redButton sectionBuy centered" href={`/checkout?product=takat-power-x&qty=${selectedQty}`}>ORDER NOW</a>
        </div>
      </section>

      <section className="resultStorySection" aria-labelledby="result-story-title">
        <div className="siteShell">
          <span className="sectionKicker center">BEFORE • AFTER</span>
          <h2 className="centerTitle" id="result-story-title">Confidence और Connection की Wellness Journey</h2>
          <p className="resultIntro">एक बेहतर daily routine, balanced lifestyle और premium Ayurvedic wellness support के साथ अपने confidence पर काम करें।</p>
          <div className="resultVisual">
            <img src="/before-after-wellness.png" alt="एक adult couple की illustrative before and after confidence journey" loading="lazy"/>
            <article className="resultPanel resultBefore"><span>BEFORE</span><strong>Low Energy</strong><p>थकान • कम confidence • दूरी</p></article>
            <article className="resultPanel resultAfter"><span>AFTER</span><strong>Better Confidence</strong><p>Active routine • closer connection • positive mindset</p></article>
          </div>
          <div className="resultHighlights">
            <article><b>01</b><strong>Daily Energy Support</strong><span>अपनी रोज़ की active lifestyle और routine को बेहतर support दें।</span></article>
            <article><b>02</b><strong>Confidence & Connection</strong><span>बेहतर mindset और partner के साथ comfortable communication पर focus करें।</span></article>
            <article><b>03</b><strong>Private Wellness Choice</strong><span>Discreet delivery और WhatsApp assistance के साथ आसान order।</span></article>
          </div>
          <p className="resultDisclaimer">यह visual केवल illustrative lifestyle representation है—किसी व्यक्ति के actual medical या sexual before/after result का दावा नहीं। परिणाम व्यक्ति के अनुसार अलग हो सकते हैं।</p>
          <a className="redButton sectionBuy centered" href={`/checkout?product=takat-power-x&qty=${selectedQty}`}>START YOUR WELLNESS ROUTINE</a>
        </div>
      </section>

      <section className="testimonialsSection" aria-labelledby="testimonial-title">
        <div className="siteShell">
          <span className="sectionKicker center">EXPERIENCE EXAMPLES</span>
          <h2 className="centerTitle" id="testimonial-title">लोग क्या जानना चाहते हैं</h2>
          <p className="testimonialIntro">नीचे दिए गए cards illustrative sample experiences हैं। Verified customer feedback मिलने पर इन्हें असली reviews से update किया जा सकता है।</p>
          <div className="testimonialStage" aria-live="polite">
            {Array.from({ length: 3 }, (_, offset) => testimonialSamples[(reviewStart + offset) % testimonialSamples.length]).map((review, index) => (
              <article className="testimonialCard" key={`${review.name}-${reviewStart}-${index}`}>
                <div className="reviewTopline"><span className="reviewAvatar">{review.name.charAt(0)}</span><span><strong>{review.name}</strong><small>{review.city}</small></span><b>SAMPLE</b></div>
                <div className="reviewStars" aria-label="5 star visual">★★★★★</div>
                <p>“{review.text}”</p>
              </article>
            ))}
          </div>
          <div className="reviewControls" aria-label="Sample experience controls">
            <button type="button" onClick={() => setReviewStart(current => (current - 1 + testimonialSamples.length) % testimonialSamples.length)} aria-label="पिछला experience">PREV</button>
            <span>{String(reviewStart + 1).padStart(2, "0")} / {testimonialSamples.length}</span>
            <button type="button" onClick={() => setReviewStart(current => (current + 1) % testimonialSamples.length)} aria-label="अगला experience">NEXT</button>
          </div>
          <p className="testimonialDisclaimer">ये वास्तविक verified customer reviews नहीं हैं। अनुभव और परिणाम हर व्यक्ति के लिए अलग हो सकते हैं।</p>
        </div>
      </section>

      <footer id="contact">
        <div className="siteShell footerGrid">
          <div><a className="wordmark footerMark" href="#home"><strong>AMRIT</strong><span>AYURVEDA</span></a><p>Men&apos;s wellness support inspired by Ayurveda and African herbs.</p></div>
          <div><h3>Quick Links</h3><a href="#home">Home</a><a href="#why">Why Choose</a><a href="#how-to-use">How To Use</a><a href="#faq">FAQ</a></div>
          <div><h3>Support</h3><a href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")}>WhatsApp Order</a><a href="#faq">Shipping</a><a href="#faq">Privacy</a><a href="#faq">Disclaimer</a></div>
          <div><h3>Contact</h3><a href={`tel:+${phone}`} onClick={() => trackActivity("call_click", "Call click")}>+91 82906 95226</a><a href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")}>Chat on WhatsApp</a></div>
        </div>
        <div className="siteShell disclaimer">डिस्क्लेमर: यह प्रोडक्ट किसी बीमारी का निदान, इलाज, cure या रोकथाम करने के लिए प्रस्तुत नहीं किया गया है। परिणाम व्यक्ति के अनुसार अलग हो सकते हैं। © 2026 Amrit Ayurveda.</div>
      </footer>

      <a className="stickyBuy" href={`/checkout?product=takat-power-x&qty=${selectedQty}`}>BUY NOW • ₹{selectedCourse.price.toLocaleString("en-IN")}</a>
      <a className="floatingWhatsapp" href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")} target="_blank" rel="noreferrer" aria-label="WhatsApp पर सीधे चैट करें"><span>WA</span><b>WhatsApp Chat</b></a>

      {cartOpen && <div className="cartOverlay" onMouseDown={() => setCartOpen(false)}>
        <aside className="cartDrawer" onMouseDown={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Shopping cart and payment">
          <button className="cartClose" onClick={() => setCartOpen(false)} aria-label="Close cart">CLOSE</button>
          <span className="sectionKicker">YOUR ORDER</span>
          <h2>{activeProduct.name}</h2>
          {cartQty > 0 ? <>
            <div className="cartItem">
              <span className={`cartProductThumb ${activeProduct.secondaryImage ? "double" : ""}`}><img src={activeProduct.primaryImage} alt={activeProduct.shortName}/>{activeProduct.secondaryImage && <img src={activeProduct.secondaryImage} alt=""/>}</span>
              <span><strong>{cartQty} × {activeProduct.cartDetail}</strong><small>MRP ₹{formatPrice(activeProduct.mrp)} • Online ₹{formatPrice(activeProduct.onlinePrice)}</small></span>
              <button onClick={() => { trackActivity("cart_remove", "Cart item removed"); setCartQty(0); }}>REMOVE</button>
            </div>
            <div className={`cartTotal ${paymentMethod === "upi" ? "discounted" : ""}`}>
              <span>{paymentMethod === "upi" ? "Online Payment Total" : "Cash on Delivery Total"}</span>
              <strong>{paymentMethod === "upi" && <s>₹{formatPrice(codTotal)}</s>}₹{formatPrice(payableTotal)}</strong>
            </div>

            <section className="customerDetails" id="delivery-details" aria-labelledby="delivery-details-title">
              <span className="detailsStep">STEP 1 • DELIVERY DETAILS</span>
              <small style={{display:"block",fontWeight:800,letterSpacing:"0.08em",marginBottom:"8px"}}>CRM CONNECTED • V2</small>
              <h3 id="delivery-details-title">Parcel कहाँ भेजना है?</h3>
              <p>Payment या COD चुनने से पहले नीचे customer की सही जानकारी भरें।</p>
              <div className="customerFields">
                <label className="fieldWide"><span>Customer Name *</span><input type="text" autoComplete="name" value={customer.name} onChange={event => updateCustomer("name", event.target.value)} placeholder="पूरा नाम"/></label>
                <label><span>Mobile Number *</span><input type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} value={customer.mobile} onChange={event => updateCustomer("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digit mobile"/></label>
                <label><span>PIN Code *</span><input type="text" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={customer.pincode} onChange={event => updateCustomer("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6 digit PIN"/></label>
                <label className="fieldWide"><span>Home Address *</span><textarea rows={3} autoComplete="street-address" value={customer.address} onChange={event => updateCustomer("address", event.target.value)} placeholder="मकान नंबर, गली, मोहल्ला, गाँव या शहर"/></label>
              </div>
              {detailsError && <p className="detailsError" role="alert">कृपया नाम, 10-digit mobile, home address और 6-digit PIN code सही भरें।</p>}
              {orderError && <p className="detailsError" role="alert">{orderError}</p>}
              {savedOrderId === paymentRef && <p className="orderSaved" role="status">✓ Order CRM में सुरक्षित save हो गया। Order ID: {paymentRef}</p>}
              <small>आपकी details Amrit Ayurveda CRM में केवल order processing और delivery के लिए सुरक्षित रखी जाती हैं।</small>
            </section>

            <section className="paymentChoice" aria-labelledby="payment-choice-title">
              <span className="detailsStep">STEP 2 • PAYMENT METHOD</span>
              <h3 id="payment-choice-title">Payment कैसे करना है?</h3>
              <div className="paymentChoiceGrid">
                <button className={paymentMethod === "cod" ? "selected" : ""} onClick={() => { trackActivity("payment_method", "COD selected"); setPaymentMethod("cod"); }} aria-pressed={paymentMethod === "cod"}>
                  <span className="methodIcon">COD</span><strong>Cash on Delivery</strong><small>Parcel मिलने पर payment</small><b>PAY ₹{formatPrice(codTotal)} ON DELIVERY</b>
                </button>
                <button className={paymentMethod === "upi" ? "selected" : ""} onClick={() => { trackActivity("payment_method", "UPI selected"); setPaymentMethod("upi"); }} aria-pressed={paymentMethod === "upi"}>
                  <span className="methodIcon">UPI</span><strong>Online Payment</strong><small>GPay • PhonePe • Paytm • BHIM</small><b>{activeProduct.offerLabel} • SAVE ₹{formatPrice(onlineSavings)}</b>
                </button>
              </div>
            </section>

            {paymentMethod === "cod" ? <section className={`codBlock ${customerDetailsValid ? "" : "checkoutLocked"}`} aria-labelledby="cod-title">
              <span className="codBadge">MOST POPULAR • CASH ON DELIVERY</span>
              <h3 id="cod-title">अभी ₹0 दें—parcel मिलने पर payment करें</h3>
              <ul><li>Advance payment की जरूरत नहीं</li><li>Plain और private parcel packing</li><li>Order सीधे Amrit Ayurveda CRM में save होगा</li></ul>
              <a className="codConfirmButton" href="#delivery-details" onClick={event => void confirmCodOrder(event)} aria-disabled={!customerDetailsValid || orderSaving || savedOrderId === paymentRef}>{orderSaving ? "ORDER SAVING…" : savedOrderId === paymentRef ? "✓ ORDER CRM में SAVE हो गया" : "COD ORDER CONFIRM करें →"}</a>
              <small>WhatsApp अपने-आप नहीं खुलेगा। जरूरत हो तो नीचे WhatsApp Chat का अलग option इस्तेमाल करें।</small>
            </section> : <>
              <section className={`paymentBlock ${customerDetailsValid ? "" : "checkoutLocked"}`} aria-labelledby="upi-payment-title">
                <span className="paymentBadge">{activeProduct.offerLabel} • ONLINE PAYMENT</span>
                <h3 id="upi-payment-title">Online Pay करें और ₹{formatPrice(onlineSavings)} बचाएँ</h3>
                <div className="onlineDiscountSummary">
                  <span><small>Regular Total</small><s>₹{formatPrice(codTotal)}</s></span>
                  <span><small>Online Offer Saving</small><b>− ₹{formatPrice(onlineSavings)}</b></span>
                  <span><small>You Pay</small><strong>₹{formatPrice(onlineTotal)}</strong></span>
                </div>
                <p className="upiSectionIntro">अपना UPI app चुनें। Discounted रकम ₹{formatPrice(onlineTotal)} payment screen पर अपने-आप भरी मिलेगी।</p>
                <div className="paymentApps">
                  <a className="upiAppButton gpayButton" href={customerDetailsValid ? upiPaymentUrl : "#delivery-details"} onClick={event => openSpecificUpiApp(event, "googlePay")} aria-disabled={!customerDetailsValid} aria-label={`सिर्फ Google Pay में ₹${formatPrice(onlineTotal)} भुगतान खोलें`}><span>G</span><b>Google Pay Only</b></a>
                  <a className="upiAppButton phonePeButton" href={customerDetailsValid ? upiPaymentUrl : "#delivery-details"} onClick={event => openSpecificUpiApp(event, "phonePe")} aria-disabled={!customerDetailsValid} aria-label={`सिर्फ PhonePe में ₹${formatPrice(onlineTotal)} भुगतान खोलें`}><span>पे</span><b>PhonePe Only</b></a>
                  <a className="upiAppButton paytmButton" href={customerDetailsValid ? upiPaymentUrl : "#delivery-details"} onClick={event => openSpecificUpiApp(event, "paytm")} aria-disabled={!customerDetailsValid} aria-label={`सिर्फ Paytm में ₹${formatPrice(onlineTotal)} भुगतान खोलें`}><span>PT</span><b>Paytm Only</b></a>
                  <a className="upiAppButton bharatPeButton" href={customerDetailsValid ? upiPaymentUrl : "#delivery-details"} onClick={event => openSpecificUpiApp(event, "bharatPe")} aria-disabled={!customerDetailsValid} aria-label={`सिर्फ BharatPe में ₹${formatPrice(onlineTotal)} भुगतान खोलें`}><span>BP</span><b>BharatPe Only</b></a>
                  <a className="upiAppButton bhimButton" href={customerDetailsValid ? upiPaymentUrl : "#delivery-details"} onClick={event => openSpecificUpiApp(event, "bhim")} aria-disabled={!customerDetailsValid} aria-label={`सिर्फ BHIM UPI में ₹${formatPrice(onlineTotal)} भुगतान खोलें`}><span>BH</span><b>BHIM UPI Only</b></a>
                  <a className="upiAppButton otherUpiButton" href={customerDetailsValid ? upiPaymentUrl : "#delivery-details"} onClick={event => void beginUpiOrder(event)} aria-disabled={!customerDetailsValid || orderSaving} aria-label={`किसी अन्य UPI app से ₹${formatPrice(onlineTotal)} भुगतान करें`}><span>UPI</span><b>{orderSaving ? "Saving Order…" : "Choose Other App"}</b></a>
                </div>
                <p className="appOpenNote">Android पर चुना हुआ app ही खुलेगा। सभी apps की list केवल “Choose Other App” में दिखेगी।</p>
                <div className="paymentPrivacyNote"><span>VERIFIED BUSINESS UPI</span><p>Payment आपके चुने हुए UPI app में Amrit Ayurveda के business account पर पूरा होगा। Website आपका UPI PIN या bank details कभी नहीं देखती।</p></div>
                <small>UPI PIN केवल अपने payment app में डालें—वेबसाइट या WhatsApp पर कभी share न करें।</small>
              </section>
              <a className="receiptButton" href={customerDetailsValid ? paymentWhatsappUrl : "#delivery-details"} onClick={requireCustomerDetails} aria-disabled={!customerDetailsValid}>PAYMENT के बाद RECEIPT / UTR भेजें</a>
            </>}
            <a className="directCartChat" href={supportWhatsappUrl} onClick={() => trackActivity("whatsapp_click", "WhatsApp click")} target="_blank" rel="noreferrer"><span>WA</span><b>Order से पहले WhatsApp पर बात करें</b></a>
            <small className="cartNote">UPI payment अपने-आप confirm नहीं होता। Payment के बाद screenshot या UTR WhatsApp पर भेजें।</small>
          </> : <div className="emptyCart"><h3>Your cart is empty</h3><p>अपना product या combo चुनें।</p><button className="redButton" onClick={() => { setCartOpen(false); document.querySelector("#products")?.scrollIntoView(); }}>CHOOSE PRODUCT</button></div>}
        </aside>
      </div>}
    </main>
  );
}
