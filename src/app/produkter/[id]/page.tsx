export const dynamic = "force-dynamic";

import { readContent } from "@/lib/content";
import type { Product } from "@/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuyButton from "./BuyButton";

interface Props { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const products = readContent<Product[]>("products.json");
  const p = products.find((p) => p.id === id);
  return { title: p?.name ?? "Produkt" };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { success } = await searchParams;
  const products = readContent<Product[]>("products.json");
  const p = products.find((p) => p.id === id);
  if (!p) notFound();

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 80px" }}>
      {/* Back */}
      <Link href="/#butikk"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: "var(--mid)", textDecoration: "none", marginBottom: 40 }}>
        ← Tilbake til butikk
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-14 items-start">
        {/* Left: image */}
        <div>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name}
              style={{ width: "100%", borderRadius: 20, display: "block", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }} />
          ) : (
            <div style={{
              width: "100%", aspectRatio: "4/3", borderRadius: 20,
              background: "var(--blue-lt)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 56,
            }}>
              {p.type === "pdf" ? "📄" : "📦"}
            </div>
          )}
        </div>

        {/* Right: details */}
        <div>
          <span
            className="inline-flex items-center gap-1 text-[0.65rem] font-bold tracking-[0.1em] uppercase px-[0.7rem] py-[0.3rem] rounded-[6px] mb-5"
            style={p.type === "pdf"
              ? { background: "var(--blue-lt)", color: "var(--blue)" }
              : { background: "var(--orange-lt)", color: "var(--orange)" }}>
            {p.type === "pdf" ? "📄 Digital PDF" : "📦 Fysisk · Post"}
          </span>

          <h1 className="font-extrabold tracking-[-0.03em] leading-[1.1] mb-4"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "var(--ink)" }}>
            {p.name}
          </h1>

          <p className="text-[0.95rem] leading-[1.8] mb-6" style={{ color: "var(--mid)" }}>
            {p.description}
          </p>

          <div className="flex items-baseline gap-2 mb-8">
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em" }}>{p.price} kr</span>
            {!p.inStock && (
              <span style={{ fontSize: "0.78rem", color: "var(--orange)", fontWeight: 600 }}>Ikke på lager</span>
            )}
          </div>

          {success === "1" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
              <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
                ✓ Betaling fullført — takk for kjøpet!
              </p>
            </div>
          )}

          {p.inStock ? (
            <BuyButton
              productId={p.id}
              label={p.type === "pdf" ? "Kjøp og last ned →" : "Kjøp nå →"}
            />
          ) : (
            <div className="inline-flex items-center gap-2 text-[0.92rem] font-bold px-8 py-4 rounded-full"
              style={{ background: "var(--faint)", color: "var(--mid)", cursor: "default" }}>
              Ikke tilgjengelig
            </div>
          )}

          {p.type === "physical" && (
            <p style={{ fontSize: "0.78rem", color: "var(--mid)", marginTop: 12 }}>
              🚚 Leveres per post til din adresse
            </p>
          )}
          {p.type === "pdf" && (
            <p style={{ fontSize: "0.78rem", color: "var(--mid)", marginTop: 12 }}>
              ⚡ Øyeblikkelig nedlasting etter kjøp
            </p>
          )}
        </div>
      </div>

      {/* Long description */}
      {p.pageContent && (
        <div className="mt-16 pt-12 border-t" style={{ borderColor: "var(--faint)" }}>
          <h2 className="text-[1.2rem] font-extrabold mb-6 tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
            Om produktet
          </h2>
          <div style={{ maxWidth: 680 }}>
            {p.pageContent.split("\n").filter(Boolean).map((para, i) => (
              <p key={i} className="text-[0.95rem] leading-[1.85] mb-4" style={{ color: "var(--mid)" }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
