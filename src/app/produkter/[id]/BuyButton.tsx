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

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
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
