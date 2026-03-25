export const dynamic = "force-dynamic";

import { Space_Mono } from "next/font/google";
import { readContent } from "@/lib/content";
import Link from "next/link";
import type { Metadata } from "next";
import EscapeGate from "./EscapeGate";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AI Styrer Escape Room | Escape Haugesund 2026",
  description:
    "Hva skjer når en escape room-bedrift lar kunstig intelligens ta alle strategiske beslutninger? Vi tester det i 2026.",
};

interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  context: string;
  periodGoal: number;
  yearGoal: number;
  status: "on-track" | "behind" | "critical";
  statusText: string;
}

interface MonthEntry {
  id: string;
  date: string;
  title: string;
  visible: boolean;
  isUpcoming: boolean;
  introText: string;
  bullets: string[];
  aiTag: string;
  stats: { revenue: number; bookings: number } | null;
}

interface EscapePageData {
  lastUpdated: string;
  goals: {
    prevYear: { revenue: number; bookings: number; label: string };
    target: { revenue: number; bookings: number; label: string };
  };
  kpis: KPI[];
  months: MonthEntry[];
  tools: { id: string; icon: string; name: string; role: string; description: string }[];
  quote: string;
  principle: { title: string; content: string; content2: string };
}

const C = {
  bg: "#0a0a0a",
  card: "#141414",
  cardHover: "#1a1a1a",
  green: "#00ff88",
  yellow: "#ffcc00",
  red: "#ff4444",
  white: "#ffffff",
  mid: "#888888",
  muted: "#555555",
  border: "#2a2a2a",
};

function fmt(n: number) {
  return n.toLocaleString("no-NO");
}

function statusColor(s: string) {
  if (s === "on-track") return C.green;
  if (s === "behind") return C.yellow;
  return C.red;
}

function progressColor(s: string) {
  if (s === "on-track") return C.green;
  if (s === "behind") return C.yellow;
  return C.red;
}

export default function EscapePage() {
  const d = readContent<EscapePageData>("escape-page.json");
  const visibleMonths = d.months.filter((m) => m.visible);

  return (
    <div
      className={spaceMono.variable}
      style={{ background: C.bg, color: C.white, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 1 }}>
        {/* Back link */}
        <Link
          href="/#escape"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: C.muted,
            textDecoration: "none",
            marginBottom: 40,
            letterSpacing: "0.05em",
          }}
        >
          ← TILBAKE
        </Link>

        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 60, paddingBottom: 40, borderBottom: `1px solid ${C.border}`, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, right: 0, fontFamily: "var(--font-mono)", fontSize: 11, color: C.muted }}>
            Sist oppdatert: {d.lastUpdated}
          </div>
          <div
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: C.green,
              textTransform: "uppercase",
              letterSpacing: "3px",
              marginBottom: 16,
              padding: "6px 12px",
              border: `1px solid ${C.green}`,
              borderRadius: 4,
            }}
          >
            Eksperiment 2026
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            AI Styrer <span style={{ color: C.green }}>Escape Room</span>
          </h1>
          <p style={{ fontSize: 18, color: C.mid, maxWidth: 600, margin: "0 auto" }}>
            Hva skjer når en escape room-bedrift lar kunstig intelligens ta alle strategiske beslutninger? Vi tester det i 2026.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 20,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: C.green,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: C.green,
                borderRadius: "50%",
                animation: "pulse 2s infinite",
                display: "inline-block",
              }}
            />
            Prosjektet er aktivt
          </div>
        </header>

        <EscapeGate>
        {/* Goals comparison */}
        <section style={{ marginBottom: 50 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              textAlign: "center",
            }}
          >
            <div style={{ padding: 24, border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                {d.goals.prevYear.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{fmt(d.goals.prevYear.revenue)} kr</div>
              <div style={{ fontSize: 13, color: C.mid, marginTop: 4 }}>{d.goals.prevYear.bookings} bookinger</div>
            </div>
            <div style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 32, color: C.green }}>→</div>
            </div>
            <div
              style={{
                padding: 24,
                border: `1px solid ${C.green}`,
                borderRadius: 12,
                background: "rgba(0, 255, 136, 0.05)",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: C.green, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                {d.goals.target.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.green }}>{fmt(d.goals.target.revenue)} kr</div>
              <div style={{ fontSize: 13, color: C.mid, marginTop: 4 }}>
                {d.goals.target.bookings} bookinger (+{Math.round((d.goals.target.bookings / d.goals.prevYear.bookings - 1) * 100)}%)
              </div>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section style={{ marginBottom: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: C.muted }}>01</span>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>Nøkkeltall hittil i år</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {d.kpis.map((kpi) => {
              const pct = Math.min(100, Math.round((kpi.value / kpi.yearGoal) * 100));
              const col = progressColor(kpi.status);
              return (
                <div key={kpi.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: C.mid, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
                    {fmt(kpi.value)} <span style={{ fontSize: 18, color: C.mid, fontWeight: 400 }}>{kpi.unit}</span>
                  </div>
                  <div style={{ fontSize: 14, color: C.mid, marginBottom: 16 }}>{kpi.context}</div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, marginBottom: 8 }}>
                      <span style={{ color: C.muted }}>Start: 0</span>
                      <span style={{ color: col }}>→ {fmt(kpi.value)}</span>
                      <span style={{ color: C.mid }}>Mål: {kpi.yearGoal >= 1000 ? `${kpi.yearGoal / 1000}k` : kpi.yearGoal}</span>
                    </div>
                    <div style={{ height: 8, background: "#0a0a0a", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 4 }} />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 4,
                      marginTop: 12,
                      background: `${statusColor(kpi.status)}1a`,
                      color: statusColor(kpi.status),
                    }}
                  >
                    {kpi.status === "on-track" ? "●" : "⚠"} {kpi.statusText}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Monthly updates */}
        {visibleMonths.length > 0 && (
          <section style={{ marginBottom: 50 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: C.muted }}>02</span>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>Hva har vi gjort?</h2>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32 }}>
              {visibleMonths.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    padding: "24px 0",
                    borderBottom: i < visibleMonths.length - 1 ? `1px solid ${C.border}` : "none",
                    ...(i === 0 && m.isUpcoming
                      ? {
                          background: "rgba(0, 255, 136, 0.05)",
                          margin: "-32px -32px 0 -32px",
                          padding: "32px 32px 24px 32px",
                          borderRadius: "12px 12px 0 0",
                          borderBottom: `1px solid ${C.border}`,
                        }
                      : {}),
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: m.isUpcoming ? C.yellow : C.green,
                      marginBottom: 8,
                    }}
                  >
                    {m.date}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{m.title}</div>
                  <div style={{ color: C.mid, fontSize: 15 }}>
                    {m.introText && <p style={{ marginBottom: 12 }}>{m.introText}</p>}
                    {m.bullets.length > 0 && (
                      <ul style={{ paddingLeft: 20, marginTop: 12 }}>
                        {m.bullets.map((b, bi) => (
                          <li key={bi} style={{ marginBottom: 6 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {m.aiTag && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: C.green,
                        background: "rgba(0, 255, 136, 0.1)",
                        padding: "4px 10px",
                        borderRadius: 4,
                        marginTop: 16,
                      }}
                    >
                      {m.aiTag}
                    </div>
                  )}
                  {m.stats && (
                    <div
                      style={{
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: 16,
                        marginTop: 16,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: C.muted,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: 8,
                        }}
                      >
                        {m.date.replace("Kommer i ", "")} i tall
                      </div>
                      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 14 }}>
                          <strong style={{ color: C.green }}>{fmt(m.stats.revenue)} kr</strong> omsetning
                        </div>
                        <div style={{ fontSize: 14 }}>
                          <strong style={{ color: C.green }}>{m.stats.bookings}</strong> bookinger
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {d.quote && (
              <blockquote
                style={{
                  borderLeft: `3px solid ${C.green}`,
                  paddingLeft: 24,
                  margin: "30px 0",
                  fontSize: 20,
                  fontStyle: "italic",
                  color: C.mid,
                }}
              >
                {d.quote}
              </blockquote>
            )}
          </section>
        )}

        {/* AI Tools */}
        <section style={{ marginBottom: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: C.muted }}>03</span>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>AI-verktøy vi bruker</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {d.tools.map((t) => (
              <div key={t.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: C.bg,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    marginBottom: 16,
                  }}
                >
                  {t.icon}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{t.name}</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: C.green,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 12,
                  }}
                >
                  {t.role}
                </div>
                <div style={{ color: C.mid, fontSize: 14 }}>{t.description}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0) 100%)",
              border: "1px solid rgba(0, 255, 136, 0.2)",
              borderRadius: 12,
              padding: 32,
              marginTop: 30,
            }}
          >
            <h3 style={{ fontSize: 18, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              {d.principle.title}
            </h3>
            <p style={{ color: C.mid, fontSize: 15, marginBottom: 12 }}>{d.principle.content}</p>
            <p style={{ color: C.mid, fontSize: 15 }}>{d.principle.content2}</p>
          </div>
        </section>

        </EscapeGate>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            paddingTop: 50,
            marginTop: 50,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: C.muted }}>
            ESCAPE HAUGESUND × AI EKSPERIMENT 2026
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: C.mid }}>
            Sist oppdatert: {d.lastUpdated}
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
