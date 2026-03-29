export const dynamic = "force-dynamic";

import Image from "next/image";
import { Space_Mono } from "next/font/google";
import FadeIn from "@/components/FadeIn";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";

const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono" });
import { readContent } from "@/lib/content";
import type { Project, Product } from "@/types";
import { posts } from "@/data/posts";

interface HeroData {
  badge: string; h1Line1: string; h1Highlight: string; h1Line2: string;
  description: string; primaryBtn: string; secondaryBtn: string; imageUrl: string;
}
interface EscapeData {
  tag: string; heading: string; headingAccent: string; description: string;
  goalLabel: string; goalText: string; primaryBtn: string; secondaryBtn: string; secondaryBtnUrl: string;
}
interface NewsletterData {
  heading: string; description: string; btnText: string; note: string;
}

const wrap = "max-w-[1100px] mx-auto px-6";

function isPublished(post: typeof posts[number]) {
  if (post.status !== "published") return false;
  if (!post.visible) return false;
  const now = new Date();
  const nowDate = now.toISOString().slice(0, 10);
  const nowTime = now.toTimeString().slice(0, 5);
  if (post.publishDate > nowDate) return false;
  if (post.publishDate === nowDate && post.publishTime && post.publishTime > nowTime) return false;
  return true;
}

const SectionHeader = ({ tag, title }: { tag: string; title: string }) => (
  <div className="flex items-center gap-4 mb-10">
    <span className="text-[0.72rem] font-bold tracking-[0.1em] uppercase px-[0.8rem] py-[0.3rem] rounded-[6px]"
      style={{ background: "var(--blue-lt)", color: "var(--blue)" }}>
      {tag}
    </span>
    <h2 className="text-[1.7rem] font-extrabold tracking-[-0.03em]" style={{ color: "var(--ink)" }}
      dangerouslySetInnerHTML={{ __html: title }} />
  </div>
);

export default async function HomePage() {
  const [hero, escape, nl, allProjects, allProducts, shop] = await Promise.all([
    readContent<HeroData>("hero.json"),
    readContent<EscapeData>("escape.json"),
    readContent<NewsletterData>("newsletter.json"),
    readContent<Project[]>("projects.json"),
    readContent<Product[]>("products.json"),
    readContent<{ description: string }>("shop.json"),
  ]);
  const otherProjects = allProjects.filter((p) => p.slug !== "escape-haugesund");
  const products = allProducts.filter((p) => p.visible !== false);

  return (
    <div>
      {/* ── HERO ── */}
      <div className={wrap}>
        <FadeIn>
          <section className="py-[70px] border-b" style={{ borderColor: "var(--faint)" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "48px", flexWrap: "wrap" }}>
              {/* Venstre: tekst */}
              <div style={{ flex: 1, minWidth: "280px" }}>
                <span className="inline-flex items-center gap-2 text-[0.75rem] font-semibold tracking-[0.04em] px-[0.9rem] py-[0.35rem] rounded-full border mb-7 leading-none"
                  style={{ background: "var(--orange-lt)", color: "var(--orange)", borderColor: "rgba(240,123,63,0.2)" }}>
                  <span className="text-[0.6rem]">✦</span>{hero.badge}
                </span>
                <h1 className="font-extrabold leading-[1.05] tracking-[-0.04em] mb-6"
                  style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.8rem)", color: "var(--ink)" }}>
                  {hero.h1Line1}<br />
                  <span className="relative inline-block" style={{ color: "var(--blue)" }}>
                    {hero.h1Highlight}
                    <span className="absolute left-0 right-0 rounded-sm"
                      style={{ bottom: "2px", height: "4px", background: "var(--orange)", opacity: 0.6 }} />
                  </span><br />
                  {hero.h1Line2}
                </h1>
                <p className="text-base leading-[1.75] mb-9 max-w-[46ch]" style={{ color: "var(--mid)" }}>
                  {hero.description}
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <a href="#nyhetsbrev"
                    className="inline-flex items-center gap-2 text-[0.88rem] font-bold px-7 py-[0.85rem] rounded-full text-white no-underline transition-all hover:-translate-y-0.5"
                    style={{ background: "var(--blue)", boxShadow: "0 4px 16px rgba(59,111,212,0.25)" }}>
                    {hero.primaryBtn}
                  </a>
                  <a href="#escape"
                    className="inline-flex items-center gap-2 text-[0.88rem] font-semibold px-7 py-[0.85rem] rounded-full no-underline border transition-all hover:-translate-y-0.5"
                    style={{ background: "var(--white)", color: "var(--ink)", borderColor: "var(--faint)" }}>
                    {hero.secondaryBtn}
                  </a>
                </div>
              </div>

              {/* Høyre: bilde eller stats-kort */}
              {hero.imageUrl ? (
                <div style={{ width: "480px", flexShrink: 0 }}>
                  <img src={hero.imageUrl} alt="Hero" style={{ width: "100%", borderRadius: "16px", display: "block" }} />
                </div>
              ) : (
                <div style={{ width: "480px", flexShrink: 0 }}>
                  <div className="rounded-[20px] p-8 border"
                    style={{ background: "var(--white)", borderColor: "var(--faint)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
                    <p className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase mb-6" style={{ color: "var(--mid)" }}>
                      Eksperimentet i tall
                    </p>
                    <div className="flex flex-col gap-5">
                      {[
                        { icon: "🚀", val: "3", lbl: "Aktive prosjekter", bg: "var(--blue-lt)" },
                        { icon: "💰", val: "1 000 000 kr", lbl: "Omsetni.mål Escape", bg: "var(--orange-lt)" },
                        { icon: "⏱️", val: "3 timer", lbl: "Fritid per dag", bg: "#f0eeff" },
                      ].map(({ icon, val, lbl, bg }) => (
                        <div key={lbl} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[1.1rem] shrink-0" style={{ background: bg }}>{icon}</div>
                          <div>
                            <div className="text-[1.3rem] font-extrabold leading-none tracking-[-0.03em]" style={{ color: "var(--ink)" }}>{val}</div>
                            <div className="text-[0.72rem] mt-0.5" style={{ color: "var(--mid)" }}>{lbl}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </FadeIn>
      </div>

      {/* ── EKSPERIMENT ── */}
      <div className={wrap}>
        <section id="eksperiment" className="py-[70px] border-b" style={{ borderColor: "var(--faint)" }}>
          <SectionHeader tag="Bakgrunnen" title="Hvorfor la AI bestemme?" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <FadeIn>
              <div>
                <h2 className="font-extrabold tracking-[-0.04em] leading-[1.1] mb-5"
                  style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "var(--ink)" }}>
                  4 timer.<br /><span style={{ color: "var(--blue)" }}>Hva gjør du med dem?</span>
                </h2>
                <p className="text-[0.93rem] leading-[1.85]" style={{ color: "var(--mid)" }}>
                  Du har faktisk nok tid. Alle har 24 timer, og når hverdagen er unnagjort sitter du igjen med rundt 4. Det er mer enn nok til å bygge noe du er stolt av.
                  <br /><br />
                  Hvis du bruker dem på det som faktisk betyr noe. Drømmene dine er ikke for store. De venter bare på at du prioriterer dem!
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="rounded-[20px] border overflow-hidden" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
                <div className="px-[1.6rem] py-[1.2rem] text-[0.75rem] font-bold tracking-[0.08em] uppercase text-white" style={{ background: "var(--ink)" }}>
                  Et typisk døgn
                </div>
                <div className="px-[1.6rem]">
                  {[
                    ["😴", "Søvn", "8 timer"], ["💼", "Arbeid", "8 timer"], ["🚗", "Transport", "1 time"],
                    ["🍽️", "Matlaging", "1 time"], ["🥗", "Spising", "1 time"], ["🏠", "Husarbeid", "1 time"],
                  ].map(([icon, label, val], i, arr) => (
                    <div key={label} className={`flex justify-between items-center py-[0.9rem] text-[0.88rem] ${i < arr.length - 1 ? "border-b" : ""}`}
                      style={{ borderColor: "var(--faint)", color: "var(--mid)" }}>
                      <span>{icon} {label}</span>
                      <span className="font-bold text-[0.9rem]" style={{ color: "var(--ink)" }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="px-[1.6rem] py-[1.2rem] flex justify-between items-center border-t"
                  style={{ background: "var(--orange-lt)", borderColor: "rgba(240,123,63,0.15)" }}>
                  <span className="text-[0.85rem] font-bold" style={{ color: "var(--ink)" }}>→ Fritid igjen</span>
                  <span className="text-[1.4rem] font-extrabold tracking-[-0.03em]" style={{ color: "var(--orange)" }}>4 timer</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>

      {/* ── ESCAPE ── */}
      <div className={wrap}>
        <section id="escape" className="py-[70px] border-b" style={{ borderColor: "var(--faint)" }}>
          <SectionHeader tag="Prosjekt 01" title="Escape Haugesund" />
          <FadeIn>
            <div
              className={`rounded-[24px] overflow-hidden relative ${spaceMono.variable}`}
              style={{ background: "#0a0a0a", border: "1px solid #2a2a2a" }}
            >
              {/* Grid background */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }} />

              <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-0">
                {/* Left */}
                <div style={{ padding: "48px 48px 48px 48px", borderRight: "1px solid #2a2a2a" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontFamily: "var(--font-mono)", fontSize: 11, color: "#00ff88",
                    background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)",
                    padding: "5px 12px", borderRadius: 4, letterSpacing: "2px",
                    textTransform: "uppercase", marginBottom: 24,
                  }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#00ff88", animation: "pulse 2s infinite" }} />
                    {escape.tag}
                  </div>
                  <h2 className="font-extrabold tracking-[-0.04em] leading-[1.05] text-white mb-5"
                    style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
                    {escape.heading}<br />
                    <span style={{ color: "#00ff88" }}>{escape.headingAccent}</span>
                  </h2>
                  <p className="text-[0.93rem] leading-[1.8] mb-8" style={{ color: "#888" }}>
                    {escape.description}
                  </p>
                  <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 10, padding: "16px 20px", marginBottom: 28 }}>
                    <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>
                      {escape.goalLabel}
                    </span>
                    <span className="text-[1rem] font-medium text-white leading-[1.4]">{escape.goalText}</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <a href="/escape-haugesund"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#00ff88", color: "#0a0a0a", fontSize: "0.82rem", fontWeight: 700, padding: "10px 22px", borderRadius: 20, textDecoration: "none" }}>
                      {escape.primaryBtn}
                    </a>
                    <a href={escape.secondaryBtnUrl || "#"}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", fontWeight: 600, padding: "10px 22px", borderRadius: 20, textDecoration: "none", border: "1px solid #2a2a2a" }}>
                      {escape.secondaryBtn}
                    </a>
                  </div>
                </div>

                {/* Right: stats */}
                <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                  {[
                    { icon: "🤖", val: "AI-styrt", lbl: "ChatGPT som prosjektleder", color: "#00ff88" },
                    { icon: "📈", val: "1 000 000 kr", lbl: "Omsetningmål 2026", color: "#00ff88" },
                    { icon: "⏰", val: "8 t/uken", lbl: "Tilgjengelig tid", color: "#00ff88" },
                  ].map(({ icon, val, lbl, color }) => (
                    <div key={lbl} style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: "0.75rem", color: "#555", marginTop: 4 }}>{lbl}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      </div>

      {/* ── BUTIKK ── */}
      <div className={wrap}>
        <section id="butikk" className="py-[70px] border-b" style={{ borderColor: "var(--faint)" }}>
          <SectionHeader tag="Butikk" title="Produkter &amp; ressurser" />
          {shop.description && (
            <p className="text-[0.95rem] leading-[1.75] mb-8 max-w-[60ch]" style={{ color: "var(--mid)", marginTop: -16 }}>
              {shop.description}
            </p>
          )}
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <a key={p.id} href={`/produkter/${p.id}`}
                  className="flex flex-col rounded-[16px] border no-underline transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(59,111,212,0.1)] hover:border-[var(--blue)] overflow-hidden"
                  style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "16/9", background: "var(--blue-lt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                      {p.type === "pdf" ? "📄" : "📦"}
                    </div>
                  )}
                  <div className="p-[1.4rem] flex flex-col flex-1">
                    <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold tracking-[0.1em] uppercase px-[0.6rem] py-[0.25rem] rounded-[6px] w-fit mb-[0.9rem]"
                      style={p.type === "pdf" ? { background: "var(--blue-lt)", color: "var(--blue)" } : { background: "var(--orange-lt)", color: "var(--orange)" }}>
                      {p.type === "pdf" ? "📄 Digital PDF" : "📦 Fysisk · Post"}
                    </span>
                    <div className="text-[1rem] font-bold leading-[1.3] tracking-[-0.02em] mb-[0.5rem] flex-1" style={{ color: "var(--ink)" }}>{p.name}</div>
                    <div className="text-[0.8rem] leading-[1.65] mb-[1.2rem]" style={{ color: "var(--mid)" }}>{p.description}</div>
                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--faint)" }}>
                      <span className="text-[1.2rem] font-extrabold tracking-[-0.03em]" style={{ color: "var(--ink)" }}>{p.price} kr</span>
                      <span className="text-[0.75rem] font-bold px-[0.9rem] py-[0.4rem] rounded-[8px]"
                        style={{ background: "var(--blue-lt)", color: "var(--blue)" }}>
                        Se mer →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </FadeIn>
        </section>
      </div>

      {/* ── ANDRE PROSJEKTER ── */}
      <div className={wrap}>
        <section id="prosjekter" className="py-[70px] border-b" style={{ borderColor: "var(--faint)" }}>
          <SectionHeader tag="Andre prosjekter" title="Andre prosjekter jeg jobber med" />
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otherProjects.map((proj) => (
                <a key={proj.slug} href={proj.liveUrl || "#"}
                  target={proj.liveUrl ? "_blank" : undefined}
                  rel={proj.liveUrl ? "noopener noreferrer" : undefined}
                  className="group relative flex items-center gap-4 rounded-[16px] px-5 py-4 border no-underline transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(59,111,212,0.08)] hover:border-[var(--blue)]"
                  style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl shrink-0"
                    style={{ background: "var(--blue-lt)" }}>{proj.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.72rem] font-semibold tracking-[0.06em] uppercase mb-0.5" style={{ color: "var(--mid)" }}>{proj.subtitle}</div>
                    <div className="text-[1rem] font-extrabold tracking-[-0.02em] mb-0.5" style={{ color: "var(--ink)" }}>{proj.title}</div>
                    <p className="text-[0.82rem] leading-[1.6] truncate" style={{ color: "var(--mid)" }}>{proj.description}</p>
                  </div>
                  <span className="shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--blue)]"
                    style={{ color: "var(--faint)", fontSize: "1rem" }}>↗</span>
                </a>
              ))}
            </div>
          </FadeIn>
        </section>
      </div>

      {/* ── NYESTE INNBLIKK ── */}
      <div className={wrap}>
        <section className="py-[70px] border-b" style={{ borderColor: "var(--faint)" }}>
          <SectionHeader tag="Innblikk" title="Nyeste innblikk" />
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts
                .filter(isPublished)
                .sort((a, b) => ((a.publishDate || a.date) < (b.publishDate || b.date) ? 1 : -1))
                .slice(0, 3)
                .map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blogg/${post.slug}`}
                    className="group block rounded-[16px] border overflow-hidden no-underline transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(59,111,212,0.1)] hover:border-[var(--blue)]"
                    style={{ background: "var(--white)", borderColor: "var(--faint)" }}
                  >
                    {post.imageUrl && (
                      <div className="relative w-full h-40 overflow-hidden">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[0.7rem] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {post.category || "Uten kategori"}
                        </span>
                        <span className="text-[0.7rem] text-gray-400">
                          {new Date(post.publishDate || post.date).toLocaleDateString("no-NO")}
                        </span>
                      </div>
                      <h3 className="text-[1.1rem] font-bold leading-[1.3] mb-2 group-hover:text-[var(--blue)] transition-colors" style={{ color: "var(--ink)" }}>
                        {post.title}
                      </h3>
                      <p className="text-[0.85rem] leading-[1.6] mb-4" style={{ color: "var(--mid)" }}>
                        {post.excerpt}
                      </p>
                      <span className="text-[0.8rem] font-semibold text-[var(--blue)] group-hover:underline">
                        Les mer →
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/blogg"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold no-underline transition-all hover:-translate-y-0.5"
                style={{ background: "var(--blue-lt)", color: "var(--blue)" }}
              >
                Se alle innblikk →
              </Link>
            </div>
          </FadeIn>
        </section>
      </div>

      {/* ── NYHETSBREV ── */}
      <div className={wrap}>
        <section id="nyhetsbrev" className="py-20 border-b" style={{ borderColor: "var(--faint)" }}>
          <FadeIn>
            <NewsletterForm 
              heading={nl.heading} 
              description={nl.description} 
              btnText={nl.btnText} 
              note={nl.note} 
            />
          </FadeIn>
        </section>
      </div>
    </div>
  );
}
