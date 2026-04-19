"use client";

import { useActionState, useState } from "react";
import { saveTimerAction } from "./actions";

interface TimerRow {
  icon: string;
  label: string;
  value: string;
}

interface TimerData {
  sectionTag: string;
  sectionTitle: string;
  heading: string;
  headingAccent: string;
  body: string;
  cardHeaderText: string;
  cardHeaderBg: string;
  cardFooterLabel: string;
  cardFooterValue: string;
  cardFooterBg: string;
  rows: TimerRow[];
}

const inp = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid var(--faint)", background: "var(--bg)",
  color: "var(--ink)", fontSize: "0.88rem", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box" as const,
  transition: "border-color 0.2s",
};

function Field({ label, name, value, onChange, hint }: {
  label: string; name: string; value: string;
  onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{label}</label>
      <input name={name} value={value} onChange={(e) => onChange(e.target.value)} style={inp} />
      {hint && <p style={{ fontSize: "0.7rem", color: "var(--mid)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function ColorField({ label, name, value, onChange }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 44, height: 38, borderRadius: 8, border: "1px solid var(--faint)", padding: 2, cursor: "pointer", background: "var(--bg)" }}
        />
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inp, flex: 1 }}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export default function TimerForm({ data }: { data: TimerData }) {
  const [state, action, pending] = useActionState(saveTimerAction, null);

  const [sectionTag, setSectionTag] = useState(data.sectionTag);
  const [sectionTitle, setSectionTitle] = useState(data.sectionTitle);
  const [heading, setHeading] = useState(data.heading);
  const [headingAccent, setHeadingAccent] = useState(data.headingAccent);
  const [body, setBody] = useState(data.body);
  const [cardHeaderText, setCardHeaderText] = useState(data.cardHeaderText);
  const [cardHeaderBg, setCardHeaderBg] = useState(data.cardHeaderBg);
  const [cardFooterLabel, setCardFooterLabel] = useState(data.cardFooterLabel);
  const [cardFooterValue, setCardFooterValue] = useState(data.cardFooterValue);
  const [cardFooterBg, setCardFooterBg] = useState(data.cardFooterBg);
  const [rows, setRows] = useState<TimerRow[]>(data.rows);

  const updateRow = (i: number, field: keyof TimerRow, val: string) =>
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const addRow = () => setRows((prev) => [...prev, { icon: "⏰", label: "", value: "" }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const moveRow = (i: number, dir: -1 | 1) => {
    const next = [...rows];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };

  return (
    <form action={action} className="flex flex-col gap-8 max-w-2xl">
      {/* Hidden fields */}
      <input type="hidden" name="sectionTag" value={sectionTag} />
      <input type="hidden" name="sectionTitle" value={sectionTitle} />
      <input type="hidden" name="heading" value={heading} />
      <input type="hidden" name="headingAccent" value={headingAccent} />
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="cardHeaderText" value={cardHeaderText} />
      <input type="hidden" name="cardHeaderBg" value={cardHeaderBg} />
      <input type="hidden" name="cardFooterLabel" value={cardFooterLabel} />
      <input type="hidden" name="cardFooterValue" value={cardFooterValue} />
      <input type="hidden" name="cardFooterBg" value={cardFooterBg} />
      <input type="hidden" name="rows" value={JSON.stringify(rows)} />

      {/* Section label */}
      <div className="rounded-[14px] border p-6 flex flex-col gap-4" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mid)", marginBottom: -4 }}>Seksjon</p>
        <Field label="Seksjonsetikett (liten tekst over overskrift)" name="_sectionTag" value={sectionTag} onChange={setSectionTag} />
        <Field label="Seksjonstittel" name="_sectionTitle" value={sectionTitle} onChange={setSectionTitle} />
      </div>

      {/* Left side text */}
      <div className="rounded-[14px] border p-6 flex flex-col gap-4" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mid)", marginBottom: -4 }}>Venstretekst</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Overskrift linje 1" name="_heading" value={heading} onChange={setHeading} hint='F.eks. "4 timer."' />
          <Field label="Overskrift linje 2 (blå)" name="_headingAccent" value={headingAccent} onChange={setHeadingAccent} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>Brødtekst</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            style={{ ...inp, resize: "vertical", lineHeight: 1.7 }}
            placeholder="Dobbelt linjeskift = nytt avsnitt"
          />
          <p style={{ fontSize: "0.7rem", color: "var(--mid)", marginTop: 4 }}>
            Enter = linjeskift · Dobbelt Enter = nytt avsnitt
          </p>
        </div>
      </div>

      {/* Card header */}
      <div className="rounded-[14px] border p-6 flex flex-col gap-4" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mid)", marginBottom: -4 }}>Kortets topplinje</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tekst (øverst i kortet)" name="_cardHeaderText" value={cardHeaderText} onChange={setCardHeaderText} />
          <ColorField label="Bakgrunnsfarge" name="_cardHeaderBg" value={cardHeaderBg} onChange={setCardHeaderBg} />
        </div>

        {/* Preview */}
        <div style={{ borderRadius: 8, padding: "10px 18px", background: cardHeaderBg, color: "#fff", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.95 }}>
          {cardHeaderText || "—"}
        </div>
      </div>

      {/* Rows */}
      <div className="rounded-[14px] border p-6 flex flex-col gap-4" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mid)", marginBottom: -4 }}>Rader i tabellen</p>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr auto", gap: 8, alignItems: "center" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, color: "var(--mid)", marginBottom: 4 }}>Ikon</label>
              <input
                value={row.icon}
                onChange={(e) => updateRow(i, "icon", e.target.value)}
                style={{ ...inp, textAlign: "center", fontSize: "1.1rem" }}
                placeholder="😴"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, color: "var(--mid)", marginBottom: 4 }}>Etikett</label>
              <input value={row.label} onChange={(e) => updateRow(i, "label", e.target.value)} style={inp} placeholder="Søvn" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, color: "var(--mid)", marginBottom: 4 }}>Verdi</label>
              <input value={row.value} onChange={(e) => updateRow(i, "value", e.target.value)} style={inp} placeholder="8 timer" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 20 }}>
              <button type="button" onClick={() => moveRow(i, -1)} disabled={i === 0}
                style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid var(--faint)", background: "var(--bg)", color: "var(--mid)", fontSize: "0.75rem", cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.3 : 1 }}>↑</button>
              <button type="button" onClick={() => moveRow(i, 1)} disabled={i === rows.length - 1}
                style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid var(--faint)", background: "var(--bg)", color: "var(--mid)", fontSize: "0.75rem", cursor: i === rows.length - 1 ? "default" : "pointer", opacity: i === rows.length - 1 ? 0.3 : 1 }}>↓</button>
              <button type="button" onClick={() => removeRow(i)}
                style={{ padding: "3px 8px", borderRadius: 5, border: "none", background: "#fef2f2", color: "#dc2626", fontSize: "0.75rem", cursor: "pointer" }}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addRow}
          style={{ alignSelf: "flex-start", padding: "8px 18px", borderRadius: 20, border: "1px solid var(--faint)", background: "var(--white)", color: "var(--blue)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          + Legg til rad
        </button>
      </div>

      {/* Card footer */}
      <div className="rounded-[14px] border p-6 flex flex-col gap-4" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mid)", marginBottom: -4 }}>Kortets bunnlinje</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Etikett (venstre)" name="_cardFooterLabel" value={cardFooterLabel} onChange={setCardFooterLabel} />
          <Field label="Verdi (høyre, stor tekst)" name="_cardFooterValue" value={cardFooterValue} onChange={setCardFooterValue} />
          <ColorField label="Bakgrunnsfarge" name="_cardFooterBg" value={cardFooterBg} onChange={setCardFooterBg} />
        </div>

        {/* Preview */}
        <div style={{ borderRadius: 8, padding: "12px 18px", background: cardFooterBg, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>{cardFooterLabel || "—"}</span>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--orange)", letterSpacing: "-0.03em" }}>{cardFooterValue || "—"}</span>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 4 }}>
        <button
          type="submit"
          disabled={pending}
          style={{ padding: "10px 28px", borderRadius: 20, border: "none", background: "var(--blue)", color: "white", fontSize: "0.88rem", fontWeight: 700, cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1, fontFamily: "inherit" }}>
          {pending ? "Lagrer…" : "Lagre endringer"}
        </button>
        {state?.success && <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#16a34a" }}>✓ Lagret!</span>}
        {state?.error && <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#dc2626" }}>{state.error}</span>}
      </div>
    </form>
  );
}
