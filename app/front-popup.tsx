"use client";

import { useEffect, useState } from "react";

export default function FrontPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="TAKAT POWER X"
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        background: "rgba(0,0,0,.82)",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          position: "relative",
          width: "min(430px, 96vw)",
          maxHeight: "92vh",
        }}
      >
        <button
          type="button"
          aria-label="पॉपअप बंद करें"
          onClick={() => setOpen(false)}
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

        <a
          href="/checkout?product=takat-power-x&qty=1"
          aria-label="TAKAT POWER X order करें"
          style={{
            display: "block",
            width: "100%",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 20px 70px rgba(0,0,0,.45)",
          }}
        >
          <img
            src="/takat-opening-popup.webp"
            alt="TAKAT POWER X"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
          />
        </a>
      </div>
    </div>
  );
}
