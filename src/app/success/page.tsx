import Link from "next/link";

export const metadata = { title: "Takk for kjøpet!" };

export default function SuccessPage() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>🎉</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em", marginBottom: 16 }}>
          Takk for kjøpet!
        </h1>
        <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "var(--mid)", marginBottom: 32 }}>
          Betalingen er gjennomført. Du vil motta en bekreftelse på e-post med det samme.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: "0.9rem", fontWeight: 700,
            padding: "12px 28px", borderRadius: 999,
            background: "var(--blue)", color: "white",
            textDecoration: "none",
          }}
        >
          Tilbake til forsiden
        </Link>
      </div>
    </div>
  );
}
