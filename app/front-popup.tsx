"use client";

import { useEffect, useRef, useState } from "react";

const POPUP_SESSION_KEY = "amrit-scroll-offer-popup-shown";

export default function FrontPopup() {
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.sessionStorage.getItem(POPUP_SESSION_KEY) === "1") {
      shownRef.current = true;
      return;
    }

    const showPopup = () => {
      if (shownRef.current) return;
      if (window.scrollY < 80) return;

      shownRef.current = true;
      window.sessionStorage.setItem(POPUP_SESSION_KEY, "1");
      setOpen(true);
    };

    window.addEventListener("scroll", showPopup, { passive: true });
    return () => window.removeEventListener("scroll", showPopup);
  }, []);

  const closePopup = () => setOpen(false);

  const goToOrder = () => {
    setOpen(false);
    const products = document.getElementById("products");
    if (products) {
      products.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.hash = "products";
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="TAKAT POWER X limited stock offer"
      onClick={closePopup}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        background: "rgba(0,0,0,.72)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          position: "relative",
          width: "min(356px, 92vw)",
          borderRadius: 20,
          border: "2px solid #d2aa43",
          background: "linear-gradient(180deg,#fffdfa 0%,#fffaf0 100%)",
          boxShadow: "0 22px 70px rgba(0,0,0,.42), 0 0 0 1px rgba(255,255,255,.8) inset",
          padding: "29px 19px 20px",
          textAlign: "center",
          color: "#3b3b3b",
        }}
      >
        <button
          type="button"
          aria-label="Close offer popup"
          onClick={closePopup}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 28,
            height: 28,
            border: 0,
            borderRadius: "50%",
            background: "#ece9e3",
            color: "#6d6b68",
            fontSize: 20,
            lineHeight: "28px",
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ×
        </button>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            borderRadius: 999,
            padding: "7px 13px",
            marginBottom: 13,
            background: "linear-gradient(90deg,#ff5a29 0%,#eb2727 100%)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: ".25px",
            boxShadow: "0 4px 12px rgba(230,45,39,.26)",
          }}
        >
          ⚡ LIMITED STOCK
        </div>

        <div
          style={{
            color: "#238347",
            fontSize: 22,
            lineHeight: 1.2,
            fontWeight: 900,
            marginBottom: 3,
          }}
        >
          रुकिए! जाने से पहले
        </div>

        <div
          style={{
            color: "#c79529",
            fontSize: 19,
            lineHeight: 1.25,
            fontWeight: 900,
            marginBottom: 15,
          }}
        >
          यह ऑफर मत छोड़िए
        </div>

        <div
          style={{
            color: "#5b5b5b",
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 5,
          }}
        >
          TAKAT POWER X अभी सिर्फ{" "}
          <strong style={{ color: "#208341", fontSize: 17 }}>₹999</strong> में
        </div>

        <div
          style={{
            color: "#258448",
            fontSize: 13,
            lineHeight: 1.45,
            fontWeight: 800,
            marginBottom: 17,
          }}
        >
          ✅ Cash on Delivery उपलब्ध
        </div>

        <button
          type="button"
          onClick={goToOrder}
          style={{
            width: "100%",
            minHeight: 51,
            border: "1px solid #d1ae4d",
            borderRadius: 13,
            background: "linear-gradient(120deg,#050505 0%,#111 78%,#594312 100%)",
            color: "#fff",
            padding: "13px 14px",
            fontSize: 16,
            lineHeight: 1.2,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 7px 17px rgba(0,0,0,.25)",
          }}
        >
          अभी ऑर्डर करें ₹999 COD
        </button>

        <div
          style={{
            marginTop: 12,
            color: "#8d8b86",
            fontSize: 10.5,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          🔒 100% Discreet Packaging · Free Delivery
        </div>
      </div>
    </div>
  );
}
