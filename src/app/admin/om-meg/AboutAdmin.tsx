"use client";
import { useState } from "react";
import { saveAboutAction } from "./actions";

interface AboutData {
  name: string; tagline: string; bio: string; bio2: string;
  imageUrl: string; portraitUrl: string; email: string; ctaText: string; ctaUrl: string;
}

const inputStyle = {
  width: "100%", padding: "8px 12px", borderRadius: 8,
  border: "1px solid var(--faint)", background: "var(--bg)",
  color: "var(--ink)", fontSize: "0.85rem", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box" as const,
};

export default function AboutAdmin({ initial }: { initial: AboutData }) {
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (field: keyof AboutData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const save = async () => {
    setSaving(true);
    const res = await saveAboutAction(data);
    setSaving(false);
    setMsg(res.success ? { ok: true, text: "Lagret!" } : { ok: false, text: res.error ?? "Feil" });
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
      {([
        ["name", "Navn", "text"],
        ["tagline", "Tagline", "text"],
        ["imageUrl", "Profilbilde URL (rundt, øverst)", "url"],
        ["portraitUrl", "Portrettbilde URL (stående, ved siden av bio)", "url"],
        ["email", "E-post (vises på siden)", "email"],
        ["ctaText", "CTA-knapp tekst", "text"],
        ["ctaUrl", "CTA-knapp lenke", "text"],
      ] as [keyof AboutData, string, string][]).map(([field, label]) => (
        <div key={field}>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 6 }}>{label}</label>
          <input style={inputStyle} value={data[field]} onChange={(e) => set(field, e.target.value)} />
        </div>
      ))}
      {(["bio", "bio2"] as const).map((field) => (
        <div key={field}>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 6 }}>
            {field === "bio" ? "Bio (avsnitt 1)" : "Bio (avsnitt 2, valgfri)"}
          </label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 90 }} rows={3}
            value={data[field]} onChange={(e) => set(field, e.target.value)} />
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 4 }}>
        <button onClick={save} disabled={saving}
          style={{ padding: "10px 28px", borderRadius: 20, border: "none", background: "var(--blue)", color: "white", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1, fontFamily: "inherit" }}>
          {saving ? "Lagrer…" : "Lagre endringer"}
        </button>
        {msg && <span style={{ fontSize: "0.82rem", fontWeight: 500, color: msg.ok ? "#16a34a" : "#dc2626" }}>{msg.ok ? "✓" : "✕"} {msg.text}</span>}
      </div>
    </div>
  );
}
