"use client";

import { useEffect, useState } from "react";

export default function FrontPopup() {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    setOpen(true);

    let active = true;
    fetch("/front-popup-data.txt", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Popup image could not be loaded");
        return response.text();
      })
      .then((value) => {
        if (active) setImageSrc(value.trim());
      })
      .catch(() => {
        if (active) setImageSrc("");
      });

    return () => {
      active = false;
    };
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
      aria-label="TAKAT POWER X"
      onClick={closePopup}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        background: "rgba(0,0,0,.82)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          position: "relative",
          width: "min(430px, 96vw)",
          maxHeight: "92vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          aria-label="Close popup"
          onClick={closePopup}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            width: 36,
            height: 36,
            border: "2px solid rgba(255,255,255,.9)",
            borderRadius: "50%",
            background: "rgba(0,0,0,.72)",
            color: "#fff",
            fontSize: 25,
            lineHeight: "30px",
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ×
        </button>

        {imageSrc ? (
          <button
            type="button"
            onClick={goToOrder}
            aria-label="TAKAT POWER X offer देखें और order करें"
            style={{
              width: "100%",
              border: 0,
              padding: 0,
              margin: 0,
              background: "transparent",
              cursor: "pointer",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 20px 70px rgba(0,0,0,.45)",
            }}
          >
            <img
              src={imageSrc}
              alt="TAKAT POWER X"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
          </button>
        ) : (
          <div
            style={{
              width: "100%",
              minHeight: 220,
              borderRadius: 18,
              background: "#111",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              padding: 24,
              textAlign: "center",
              fontWeight: 800,
            }}
          >
            TAKAT POWER X
          </div>
        )}
      </div>
    </div>
  );
}
