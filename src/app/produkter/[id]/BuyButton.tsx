"use client";

import { useState } from "react";

interface Props {
  productId: string;
  label: string;
  disabled?: boolean;
}

export default function BuyButton({ productId, label, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, newsletterConsent }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Noe gikk galt");
        setLoading(false);
      }
    } catch {
      setError("Kunne ikke koble til betalingstjenesten");
      setLoading(false);
    }
  };

  return (
    <div>
      {/* GDPR newsletter consent */}
      <label style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 16,
        cursor: "pointer",
        userSelect: "none",
      }}>
        <input
          type="checkbox"
          checked={newsletterConsent}
          onChange={(e) => setNewsletterConsent(e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, cursor: "pointer", accentColor: "var(--blue)" }}
        />
        <span style={{ fontSize: "0.78rem", color: "var(--mid)", lineHeight: 1.5 }}>
          Ja, jeg vil gjerne motta nyhetsbrev fra Milena Bua. Du kan melde deg av når som helst.
        </span>
      </label>

      <button
        onClick={handleClick}
        disabled={disabled || loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.92rem",
          fontWeight: 700,
          padding: "14px 32px",
          borderRadius: 999,
          border: "none",
          color: "white",
          background: "var(--blue)",
          boxShadow: "0 4px 20px rgba(59,111,212,0.3)",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          fontFamily: "inherit",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
      >
        {loading ? "Sender til betaling…" : label}
      </button>
      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
}
