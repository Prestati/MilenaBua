"use client";
import { useState } from "react";
import { saveSocialsAction } from "./actions";

interface Social { label: string; href: string; }

const inputStyle = {
  width: "100%", padding: "8px 12px", borderRadius: 8,
  border: "1px solid var(--faint)", background: "var(--bg)",
  color: "var(--ink)", fontSize: "0.85rem", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box" as const,
};

export default function SocialsAdmin({ initial }: { initial: Social[] }) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    setSaving(true);
    const res = await saveSocialsAction(items);
    setSaving(false);
    setMsg(res.success ? { ok: true, text: "Lagret!" } : { ok: false, text: res.error ?? "Feil" });
    setTimeout(() => setMsg(null), 3000);
  };

  const update = (i: number, field: keyof Social, value: string) =>
    setItems((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const add = () => setItems((prev) => [...prev, { label: "", href: "" }]);
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, alignItems: "center" }}>
          <input style={inputStyle} placeholder="Plattform (f.eks. Instagram)" value={s.label}
            onChange={(e) => update(i, "label", e.target.value)} />
          <input style={inputStyle} placeholder="URL (https://...)" value={s.href} type="url"
            onChange={(e) => update(i, "href", e.target.value)} />
          <button onClick={() => remove(i)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit" }}>
            Slett
          </button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 4 }}>
        <button onClick={add}
          style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid var(--faint)", background: "var(--white)", color: "var(--blue)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          + Legg til kanal
        </button>
        <button onClick={save} disabled={saving}
          style={{ padding: "8px 20px", borderRadius: 20, border: "none", background: "var(--blue)", color: "white", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1, fontFamily: "inherit" }}>
          {saving ? "Lagrer…" : "Lagre"}
        </button>
        {msg && <span style={{ fontSize: "0.82rem", fontWeight: 500, color: msg.ok ? "#16a34a" : "#dc2626" }}>{msg.ok ? "✓" : "✕"} {msg.text}</span>}
      </div>
    </div>
  );
}
