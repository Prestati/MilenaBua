export const dynamic = "force-dynamic";

import Image from "next/image";
import { readContent } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Om meg" };

interface AboutData {
  name: string;
  tagline: string;
  bio: string;
  bio2: string;
  imageUrl: string;
  portraitUrl: string;
  email: string;
  ctaText: string;
  ctaUrl: string;
}
interface Social { label: string; href: string; }

const wrap = "max-w-[860px] mx-auto px-6";

export default async function AboutPage() {
  const [d, socialsRaw] = await Promise.all([
    readContent<AboutData>("about.json"),
    readContent<Social[]>("socials.json"),
  ]);
  const socials = socialsRaw.filter((s) => s.href);

  return (
    <div className={wrap} style={{ paddingTop: 64, paddingBottom: 80 }}>
      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-10 items-start mb-16 pb-16 border-b" style={{ borderColor: "var(--faint)" }}>
        {d.imageUrl ? (
          <Image
            src={d.imageUrl}
            alt={d.name}
            width={120}
            height={120}
            loading="lazy"
            sizes="120px"
            style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: "var(--blue-lt)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
            👋
          </div>
        )}
        <div>
          <h1 className="font-extrabold tracking-[-0.04em] leading-[1.05] mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--ink)" }}>
            {d.name}
          </h1>
          <p className="text-[1.05rem] font-medium mb-5" style={{ color: "var(--blue)" }}>{d.tagline}</p>
          {d.ctaText && d.ctaUrl && (
            <a href={d.ctaUrl}
              className="inline-flex items-center gap-2 text-[0.88rem] font-bold px-6 py-3 rounded-full text-white no-underline"
              style={{ background: "var(--blue)", boxShadow: "0 4px 16px rgba(59,111,212,0.25)" }}>
              {d.ctaText}
            </a>
          )}
        </div>
      </div>

      {/* Bio + portrait */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 mb-16">
        <div>
          <h2 className="text-[1.2rem] font-extrabold mb-5 tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Om meg</h2>
          {[d.bio, d.bio2].filter(Boolean).flatMap((block) =>
            block.split("\n").filter(Boolean).map((para, i) => (
              <p key={`${block.slice(0,10)}-${i}`} className="text-[0.95rem] leading-[1.85] mb-4" style={{ color: "var(--mid)" }}>{para}</p>
            ))
          )}
        </div>

        {/* Portrait */}
        {d.portraitUrl ? (
          <div style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
            <Image
              src={d.portraitUrl}
              alt={d.name}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 300px"
              style={{ objectFit: "cover", objectPosition: "center top", borderRadius: 20 }}
            />
          </div>
        ) : (
          <div style={{
            width: "100%", aspectRatio: "3/4", borderRadius: 20,
            background: "var(--blue-lt)", border: "2px dashed var(--faint)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}>
            <span style={{ fontSize: 32 }}>🖼</span>
            <span style={{ fontSize: "0.78rem", color: "var(--mid)" }}>Legg til portrettbilde i admin</span>
          </div>
        )}
      </div>

      {/* Kontakt */}
      <div className="pt-16 pb-8 border-t" style={{ borderColor: "var(--faint)" }}>
        <h2 className="text-[1.5rem] font-extrabold mb-6 tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Ta kontakt</h2>
        <p className="text-[0.95rem] leading-[1.7] mb-8" style={{ color: "var(--mid)" }}>
          Har du spørsmål, ønsker å samarbeide, eller bare vil si hei? Send meg en melding så hører du fra meg snart.
        </p>
        <ContactForm />
      </div>

      {/* Prosjekter */}
      <div className="pt-8 border-t" style={{ borderColor: "var(--faint)" }}>
        <p className="text-[0.82rem] font-semibold" style={{ color: "var(--mid)" }}>
          ← <Link href="/" style={{ color: "var(--blue)", textDecoration: "none" }}>Tilbake til forsiden</Link>
        </p>
      </div>
    </div>
  );
}
