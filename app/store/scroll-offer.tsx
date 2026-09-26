"use client";

import { useEffect, useState } from "react";

export default function ScrollOffer() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      if (window.scrollY < 90) return;
      setOpen(true);
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setDismissed(true);
  }

  if (!open) return null;
  return (
    <div className="storeOfferOverlay" role="presentation" onClick={close}>
      <section className="storeOfferCard" role="dialog" aria-modal="true" aria-labelledby="store-offer-title" onClick={event => event.stopPropagation()}>
        <button className="storeOfferClose" type="button" aria-label="ऑफर बंद करें" onClick={close}>×</button>
        <span className="storeOfferBadge">आज का ऑफर</span>
        <p className="storeOfferLead">रुकिए! जाने से पहले</p>
        <h2 id="store-offer-title">यह ऑफर मत छोड़िए</h2>
        <p className="storeOfferPrice"><strong>TAKAT POWER X</strong> अब सिर्फ <b>₹999</b> में</p>
        <p className="storeOfferCod">Cash on Delivery उपलब्ध</p>
        <a className="storeOfferButton" href="/checkout?product=takat-power-x&qty=1&payment=COD">अभी ऑर्डर करें ₹999 COD</a>
        <small className="storeOfferTrust">सुरक्षित पैकिंग · उपलब्ध पिन कोड पर डिलीवरी</small>
      </section>
    </div>
  );
}
