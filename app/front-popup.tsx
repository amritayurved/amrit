"use client";

import { useEffect, useState } from "react";

export default function FrontPopup() {
  const [open, setOpen] = useState(true);
  const [src, setSrc] = useState("");

  useEffect(() => {
    fetch("/front-popup-data.txt")
      .then((r) => r.text())
      .then((t) => setSrc(t.trim()))
      .catch(() => {});
  }, []);

  if (!open || !src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Amrit Ayurveda wellness banner"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          position: "relative",
          width: "min(1100px, 96vw)",
          maxHeight: "92vh",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,.45)",
          background: "#fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close popup"
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 2,
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,.72)",
            color: "#fff",
            fontSize: 24,
            lineHeight: "38px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <img
          src={src}
          alt="Amrit Ayurveda TAKAT POWER X natural herbal wellness banner"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            maxHeight: "92vh",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}
