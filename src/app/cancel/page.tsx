import Link from "next/link";

export const metadata = { title: "Betaling avbrutt" };

export default function CancelPage() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>😕</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em", marginBottom: 16 }}>
          Betalingen ble avbrutt
        </h1>
        <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "var(--mid)", marginBottom: 32 }}>
          Ingen penger er trukket. Du kan prøve igjen når du vil.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/#butikk"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: "0.9rem", fontWeight: 700,
              padding: "12px 28px", borderRadius: 999,
              background: "var(--blue)", color: "white",
              textDecoration: "none",
            }}
          >
            Prøv igjen
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: "0.9rem", fontWeight: 600,
              padding: "12px 28px", borderRadius: 999,
              border: "1px solid var(--faint)", color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
}
