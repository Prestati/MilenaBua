"use client";
import { useState } from "react";

interface EmailSettings {
  thankYouMessage: string;
  projectMessage: string;
  signoff: string;
  welcomeSubject: string;
  welcomeBody: string;
  welcomePdfUrl: string;
  welcomePdfButtonText: string;
}

const labelStyle = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  color: "var(--mid)",
  marginBottom: 6,
};

const textareaStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid var(--faint)",
  background: "var(--bg)",
  color: "var(--ink)",
  fontSize: "0.9rem",
  fontFamily: "inherit",
  lineHeight: 1.6,
  resize: "vertical" as const,
  outline: "none",
  boxSizing: "border-box" as const,
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
};

const hintStyle = {
  fontSize: "0.75rem",
  color: "var(--mid)",
  marginTop: 2,
};

export default function EmailAdmin({ initial }: { initial: EmailSettings }) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (key: keyof EmailSettings, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/save-email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      setMsg(data.success ? { ok: true, text: "Lagret!" } : { ok: false, text: data.error ?? "Feil" });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Noe gikk galt" });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  return (
    <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={fieldStyle}>
        <label style={labelStyle}>Takkehilsen</label>
        <textarea
          rows={3}
          style={textareaStyle}
          value={settings.thankYouMessage}
          onChange={(e) => set("thankYouMessage", e.target.value)}
        />
        <span style={hintStyle}>Vises rett etter ordredetalj-tabellen i e-posten til kunden.</span>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Hvorfor kjøpet betyr noe</label>
        <textarea
          rows={3}
          style={textareaStyle}
          value={settings.projectMessage}
          onChange={(e) => set("projectMessage", e.target.value)}
        />
        <span style={hintStyle}>En linje om prosjektene og motivasjonen din.</span>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Avslutning / signatur</label>
        <textarea
          rows={2}
          style={textareaStyle}
          value={settings.signoff}
          onChange={(e) => set("signoff", e.target.value)}
        />
        <span style={hintStyle}>Bruk linjeskift for å dele opp (f.eks. «Varm hilsen,» og «Milena» på hver sin linje).</span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--faint)", paddingTop: 24, marginTop: 8 }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--blue)", margin: "0 0 20px" }}>
          Velkomst-e-post til nye abonnenter
        </p>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Emne</label>
            <input
              type="text"
              style={{ ...textareaStyle, resize: undefined, padding: "10px 14px" }}
              value={settings.welcomeSubject}
              onChange={(e) => set("welcomeSubject", e.target.value)}
              placeholder="Velkommen — her er gaven din! 🎁"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Innhold i e-posten</label>
            <textarea
              rows={6}
              style={textareaStyle}
              value={settings.welcomeBody}
              onChange={(e) => set("welcomeBody", e.target.value)}
              placeholder="Tusen takk for at du meldte deg på!&#10;&#10;Dobbelt linjeskift = nytt avsnitt. **Bold** og *kursiv* støttes."
            />
            <span style={hintStyle}>Dobbelt linjeskift = nytt avsnitt. **Bold** og *kursiv* støttes.</span>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Gratis PDF — nedlastingslenke</label>
            <input
              type="url"
              style={{ ...textareaStyle, resize: undefined, padding: "10px 14px" }}
              value={settings.welcomePdfUrl}
              onChange={(e) => set("welcomePdfUrl", e.target.value)}
              placeholder="https://... (la stå tom for ingen nedlastingsknapp)"
            />
            <span style={hintStyle}>Lim inn lenken til PDF-en. En stor blå knapp vises i e-posten.</span>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Tekst på nedlastingsknappen</label>
            <input
              type="text"
              style={{ ...textareaStyle, resize: undefined, padding: "10px 14px" }}
              value={settings.welcomePdfButtonText}
              onChange={(e) => set("welcomePdfButtonText", e.target.value)}
              placeholder="Last ned gratis PDF →"
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: "9px 24px",
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
          {saving ? "Lagrer…" : "Lagre"}
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
