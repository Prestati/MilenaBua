"use client";

import { useState } from "react";
import { saveEscapePageAction } from "./actions";

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
  customHtml?: string;
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

const MONTH_TEMPLATES = [
  {
    label: "Kommende måned",
    entry: (): MonthEntry => ({
      id: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
      date: "Kommer neste måned",
      title: "Neste steg",
      visible: false,
      isUpcoming: true,
      introText: "",
      bullets: ["", "", ""],
      aiTag: "",
      stats: null,
    }),
  },
  {
    label: "Gjennomført måned",
    entry: (): MonthEntry => ({
      id: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
      date: `${new Date().toLocaleString("no-NO", { month: "long" })} ${new Date().getFullYear()}`,
      title: "",
      visible: false,
      isUpcoming: false,
      introText: "",
      bullets: ["", "", ""],
      aiTag: "🤖 ",
      stats: { revenue: 0, bookings: 0 },
    }),
  },
];

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--faint)",
  background: "var(--bg)",
  color: "var(--ink)",
  fontSize: "0.85rem",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function EscapePageAdmin({ initial }: { initial: EscapePageData }) {
  const [data, setData] = useState(initial);
  const [openMonthId, setOpenMonthId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await saveEscapePageAction(data);
    setSaving(false);
    setMsg(res.success ? { ok: true, text: "Lagret!" } : { ok: false, text: res.error ?? "Feil" });
    setTimeout(() => setMsg(null), 3000);
  };

  const updateField = (path: string[], value: unknown) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let obj: Record<string, unknown> = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]] as Record<string, unknown>;
      obj[path[path.length - 1]] = value;
      return next;
    });
  };

  const updateMonth = (id: string, field: keyof MonthEntry, value: unknown) => {
    setData((prev) => ({
      ...prev,
      months: prev.months.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };

  const updateBullet = (monthId: string, idx: number, value: string) => {
    setData((prev) => ({
      ...prev,
      months: prev.months.map((m) =>
        m.id === monthId
          ? { ...m, bullets: m.bullets.map((b, i) => (i === idx ? value : b)) }
          : m
      ),
    }));
  };

  const addBullet = (monthId: string) => {
    setData((prev) => ({
      ...prev,
      months: prev.months.map((m) => (m.id === monthId ? { ...m, bullets: [...m.bullets, ""] } : m)),
    }));
  };

  const removeBullet = (monthId: string, idx: number) => {
    setData((prev) => ({
      ...prev,
      months: prev.months.map((m) =>
        m.id === monthId ? { ...m, bullets: m.bullets.filter((_, i) => i !== idx) } : m
      ),
    }));
  };

  const removeMonth = (id: string) => {
    setData((prev) => ({ ...prev, months: prev.months.filter((m) => m.id !== id) }));
    if (openMonthId === id) setOpenMonthId(null);
  };

  const addFromTemplate = (templateFn: () => MonthEntry) => {
    const entry = templateFn();
    setData((prev) => ({ ...prev, months: [entry, ...prev.months] }));
    setOpenMonthId(entry.id);
    setShowTemplates(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Custom HTML override */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>HTML-kode (overstyrer alt innhold)</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--mid)", marginBottom: 12 }}>
          Lim inn ferdig HTML her for å overstyre alle tall og seksjoner nedenfor. Når dette feltet er fylt ut, vises kun denne HTML-en på siden (passordbeskyttelsen gjelder fortsatt). Tøm feltet for å gå tilbake til strukturert innhold.
        </p>
        <div style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, padding: 20 }}>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 200, fontFamily: "monospace", fontSize: "0.8rem" }}
            value={data.customHtml ?? ""}
            onChange={(e) => updateField(["customHtml"], e.target.value || undefined)}
            placeholder="<div>...</div>   ← Lim inn HTML her. Tomt = vis strukturert innhold."
            rows={10}
          />
          {data.customHtml && (
            <button
              type="button"
              onClick={() => updateField(["customHtml"], undefined)}
              style={{
                marginTop: 8,
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Fjern HTML-overstyring
            </button>
          )}
        </div>
      </section>

      {/* General settings */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16, color: "var(--ink)" }}>Generelt</h2>
        <div style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, padding: 20 }}>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 6 }}>
            Sist oppdatert
          </label>
          <input
            style={{ ...inputStyle, maxWidth: 300 }}
            value={data.lastUpdated}
            onChange={(e) => updateField(["lastUpdated"], e.target.value)}
          />
        </div>
      </section>

      {/* Goals */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16, color: "var(--ink)" }}>Mål</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {(["prevYear", "target"] as const).map((key) => (
            <div key={key} style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--mid)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {key === "prevYear" ? "Foregående år" : "Mål"}
              </p>
              {(["label", "revenue", "bookings"] as const).map((f) => (
                <div key={f} style={{ marginBottom: 10 }}>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "var(--mid)", marginBottom: 4 }}>
                    {f === "label" ? "Etikett" : f === "revenue" ? "Omsetning (kr)" : "Bookinger"}
                  </label>
                  <input
                    style={inputStyle}
                    type={f === "label" ? "text" : "number"}
                    value={(data.goals[key] as Record<string, unknown>)[f] as string | number}
                    onChange={(e) =>
                      updateField(["goals", key, f], f === "label" ? e.target.value : Number(e.target.value))
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* KPIs */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16, color: "var(--ink)" }}>KPI-kort</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.kpis.map((kpi, ki) => (
            <div key={kpi.id} style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>{kpi.label}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                {(
                  [
                    ["label", "Etikett", "text"],
                    ["value", "Verdi", "number"],
                    ["unit", "Enhet", "text"],
                    ["context", "Kontekst", "text"],
                    ["periodGoal", "Periodesmål", "number"],
                    ["yearGoal", "Årsmål", "number"],
                    ["statusText", "Statustekst", "text"],
                  ] as const
                ).map(([field, label, type]) => (
                  <div key={field}>
                    <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>{label}</label>
                    <input
                      style={inputStyle}
                      type={type}
                      value={(kpi as unknown as Record<string, unknown>)[field] as string | number}
                      onChange={(e) => {
                        const val = type === "number" ? Number(e.target.value) : e.target.value;
                        setData((prev) => ({
                          ...prev,
                          kpis: prev.kpis.map((k, i) => (i === ki ? { ...k, [field]: val } : k)),
                        }));
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Status</label>
                  <select
                    style={{ ...inputStyle }}
                    value={kpi.status}
                    onChange={(e) => {
                      setData((prev) => ({
                        ...prev,
                        kpis: prev.kpis.map((k, i) =>
                          i === ki ? { ...k, status: e.target.value as KPI["status"] } : k
                        ),
                      }));
                    }}
                  >
                    <option value="on-track">✅ On track</option>
                    <option value="behind">⚠️ Behind</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Months */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)" }}>Månedlige oppdateringer</h2>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowTemplates((v) => !v)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "1px solid var(--faint)",
                background: "var(--white)",
                color: "var(--blue)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              + Legg til måned
            </button>
            {showTemplates && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "var(--white)",
                  border: "1px solid var(--faint)",
                  borderRadius: 10,
                  padding: 8,
                  zIndex: 10,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  minWidth: 200,
                }}
              >
                <p style={{ fontSize: "0.7rem", color: "var(--mid)", padding: "4px 8px 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Velg mal
                </p>
                {MONTH_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => addFromTemplate(t.entry)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "transparent",
                      color: "var(--ink)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--blue-lt)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.months.map((m) => (
            <div key={m.id} style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, overflow: "hidden" }}>
              {/* Row header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Visible toggle */}
                  <button
                    onClick={() => updateMonth(m.id, "visible", !m.visible)}
                    title={m.visible ? "Skjul" : "Vis"}
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 10,
                      border: "none",
                      background: m.visible ? "var(--blue)" : "var(--faint)",
                      cursor: "pointer",
                      position: "relative",
                      flexShrink: 0,
                      transition: "background 0.2s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: m.visible ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "white",
                        transition: "left 0.2s",
                      }}
                    />
                  </button>
                  <span style={{ fontSize: "0.75rem", color: "var(--mid)", fontWeight: 600 }}>
                    {m.visible ? "Synlig" : "Skjult"}
                  </span>
                  {m.isUpcoming && (
                    <span style={{ fontSize: "0.65rem", background: "var(--orange-lt)", color: "var(--orange)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      KOMMENDE
                    </span>
                  )}
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
                    {m.date || <em style={{ color: "var(--mid)" }}>Ingen dato</em>}
                    {m.title && ` — ${m.title}`}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setOpenMonthId(openMonthId === m.id ? null : m.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "var(--blue-lt)",
                      color: "var(--blue)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {openMonthId === m.id ? "Lukk" : "Rediger"}
                  </button>
                  <button
                    onClick={() => removeMonth(m.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#fef2f2",
                      color: "#dc2626",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Slett
                  </button>
                </div>
              </div>

              {/* Edit form */}
              {openMonthId === m.id && (
                <div style={{ borderTop: "1px solid var(--faint)", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Dato / etikett</label>
                      <input style={inputStyle} value={m.date} onChange={(e) => updateMonth(m.id, "date", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Tittel</label>
                      <input style={inputStyle} value={m.title} onChange={(e) => updateMonth(m.id, "title", e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "var(--mid)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={m.isUpcoming}
                        onChange={(e) => updateMonth(m.id, "isUpcoming", e.target.checked)}
                      />
                      Kommende (ikke gjennomført)
                    </label>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Introduksjonstekst</label>
                    <textarea
                      style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                      value={m.introText}
                      onChange={(e) => updateMonth(m.id, "introText", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 8 }}>Punktliste</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {m.bullets.map((b, bi) => (
                        <div key={bi} style={{ display: "flex", gap: 8 }}>
                          <input
                            style={{ ...inputStyle }}
                            value={b}
                            onChange={(e) => updateBullet(m.id, bi, e.target.value)}
                            placeholder={`Punkt ${bi + 1}`}
                          />
                          <button
                            onClick={() => removeBullet(m.id, bi)}
                            style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#fef2f2", color: "#dc2626", cursor: "pointer", flexShrink: 0 }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addBullet(m.id)}
                        style={{
                          alignSelf: "flex-start",
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px dashed var(--faint)",
                          background: "transparent",
                          color: "var(--mid)",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        + Legg til punkt
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>AI-tag (valgfri)</label>
                    <input
                      style={inputStyle}
                      value={m.aiTag}
                      onChange={(e) => updateMonth(m.id, "aiTag", e.target.value)}
                      placeholder="🤖 Foreslått av AI"
                    />
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "var(--mid)", cursor: "pointer", marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={m.stats !== null}
                        onChange={(e) =>
                          updateMonth(m.id, "stats", e.target.checked ? { revenue: 0, bookings: 0 } : null)
                        }
                      />
                      Vis månedstall
                    </label>
                    {m.stats !== null && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Omsetning (kr)</label>
                          <input
                            style={inputStyle}
                            type="number"
                            value={m.stats.revenue}
                            onChange={(e) => updateMonth(m.id, "stats", { ...m.stats!, revenue: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Bookinger</label>
                          <input
                            style={inputStyle}
                            type="number"
                            value={m.stats.bookings}
                            onChange={(e) => updateMonth(m.id, "stats", { ...m.stats!, bookings: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quote & Principle */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16, color: "var(--ink)" }}>Sitat & prinsipp</h2>
        <div style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Sitat</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
              value={data.quote}
              onChange={(e) => updateField(["quote"], e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Prinsipp – tittel</label>
            <input style={inputStyle} value={data.principle.title} onChange={(e) => updateField(["principle", "title"], e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Prinsipp – tekst 1</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              value={data.principle.content}
              onChange={(e) => updateField(["principle", "content"], e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--mid)", marginBottom: 4 }}>Prinsipp – tekst 2</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
              value={data.principle.content2}
              onChange={(e) => updateField(["principle", "content2"], e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Save bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 8 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: "10px 28px",
            borderRadius: 20,
            border: "none",
            background: "var(--blue)",
            color: "white",
            fontSize: "0.88rem",
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
            fontFamily: "inherit",
          }}
        >
          {saving ? "Lagrer…" : "Lagre alle endringer"}
        </button>
        {msg && (
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: msg.ok ? "#16a34a" : "#dc2626" }}>
            {msg.ok ? "✓" : "✕"} {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
