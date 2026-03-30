export const dynamic = "force-dynamic";

import { readContent } from "@/lib/content";
import { renderMarkdown } from "@/lib/renderMarkdown";
import ProductJsonLd from "@/components/JsonLd";
import type { Product } from "@/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuyButton from "./BuyButton";
import ProductGallery from "./ProductGallery";

interface Props { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const products = await readContent<Product[]>("products.json");
  const p = products.find((p) => p.id === id);
  return { title: p?.name ?? "Produkt" };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { success } = await searchParams;
  const products = await readContent<Product[]>("products.json");
  const p = products.find((p) => p.id === id);
  if (!p) notFound();

  const siteUrl = "https://www.milenabua.no";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 80px" }}>
      <ProductJsonLd
        name={p.name}
        description={p.description}
        price={p.price}
        imageUrl={p.imageUrl}
        url={`${siteUrl}/produkter/${p.id}`}
      />
      {/* Back */}
      <Link href="/#butikk"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: "var(--mid)", textDecoration: "none", marginBottom: 40 }}>
        ← Tilbake til butikk
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-14 items-start">
        {/* Left: image */}
        <div>
          <ProductGallery mainImage={p.imageUrl} gallery={p.gallery} name={p.name} />
        </div>

        {/* Right: details */}
        <div>
          <span
            className="inline-flex items-center gap-1 text-[0.65rem] font-bold tracking-[0.1em] uppercase px-[0.7rem] py-[0.3rem] rounded-[6px] mb-5"
            style={p.type === "physical"
              ? { background: "var(--orange-lt)", color: "var(--orange)" }
              : { background: "var(--blue-lt)", color: "var(--blue)" }}>
            {p.type === "pdf" ? "📄 Digital PDF" : p.type === "regneark" ? "📊 Regneark" : "📦 Fysisk · Post"}
          </span>

          <h1 className="font-extrabold tracking-[-0.03em] leading-[1.1] mb-4"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "var(--ink)" }}>
            {p.name}
          </h1>

          <div className="text-[0.95rem] leading-[1.8] mb-6" style={{ color: "var(--mid)" }}>
            {renderMarkdown(p.description || "", "mb-3")}
          </div>

          <div className="flex items-baseline gap-2 mb-8">
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em" }}>{p.price} kr</span>
            {!p.inStock && (
              <span style={{ fontSize: "0.78rem", color: "var(--orange)", fontWeight: 600 }}>Ikke på lager</span>
            )}
          </div>

          {success === "1" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
              <p style={{ color: "#16a34a", fontWeight: 800, fontSize: "1rem", margin: "0 0 4px" }}>
                ✓ Takk for kjøpet!
              </p>
              <p style={{ color: "#15803d", fontWeight: 500, fontSize: "0.88rem", margin: 0 }}>
                {p.type === "physical"
                  ? "Vi har mottatt bestillingen din og sender den til deg snart."
                  : "Sjekk innboksen din — nedlastingslenken er sendt på e-post."}
              </p>
            </div>
          )}

          {p.inStock ? (
            <BuyButton
              productId={p.id}
              label={p.type === "physical" ? "Kjøp nå →" : "Kjøp og last ned →"}
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
          {(p.type === "pdf" || p.type === "regneark") && (
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
            {renderMarkdown(p.pageContent, "text-[0.95rem] leading-[1.85] mb-4")}
          </div>
        </div>
      )}
    </div>
  );
}
