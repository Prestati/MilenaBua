"use client";
import { useState, useRef } from "react";

interface EmailSettings {
  thankYouMessage: string;
  projectMessage: string;
  signoff: string;
  welcomeSubject: string;
  welcomeBody: string;
  welcomePdfUrl: string;
  welcomePdfButtonText: string;
  welcomeHeaderImageUrl: string;
}

const inp = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid var(--faint)",
  background: "var(--bg)",
  color: "var(--ink)",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  lineHeight: 1.6,
  outline: "none",
  boxSizing: "border-box" as const,
};

const label = (text: string) => (
  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--mid)", marginBottom: 6 }}>
    {text}
  </span>
);

const hint = (text: string) => (
  <span style={{ fontSize: "0.72rem", color: "var(--mid)" }}>{text}</span>
);

/** Builds a standalone HTML string that previews the welcome email */
function buildPreviewHtml(s: EmailSettings): string {
  const bodyHtml = (s.welcomeBody || "")
    .split(/\n\n+/)
    .filter(Boolean)
    .map((para) => {
      const html = para
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
      return `<p style="color:#444240;font-size:15px;line-height:1.8;margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;">${html}</p>`;
    })
    .join("");

  const imgHtml = s.welcomeHeaderImageUrl
    ? `<img src="${s.welcomeHeaderImageUrl}" alt="" style="display:block;width:100%;max-width:580px;border-radius:12px 12px 0 0;" />`
    : "";

  const btnHtml = s.welcomePdfUrl
    ? `<div style="text-align:center;margin:28px 0 8px;">
        <a href="${s.welcomePdfUrl}" style="display:inline-block;background:#3b6fd4;color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;font-family:Helvetica,Arial,sans-serif;">
          ${(s.welcomePdfButtonText || "Last ned gratis PDF →").replace(/</g, "&lt;")}
        </a>
        <p style="color:#9ca3af;font-size:12px;margin:12px 0 0;text-align:center;font-family:Helvetica,Arial,sans-serif;">Knappen tar deg direkte til nedlastingen. Lagre den gjerne!</p>
      </div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#f5f4f2;margin:0;padding:20px 0;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e6e1;">
    ${imgHtml}
    <div style="background:#1a1a2e;padding:28px 40px;">
      <div style="color:#fff;font-size:20px;font-weight:800;margin:0 0 4px;letter-spacing:-0.5px;">Milena Bua</div>
      <div style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;line-height:1.4;">4 timer om dagen er nok til å bygge noe du er stolt av</div>
    </div>
    <div style="padding:36px 40px 24px;">
      <p style="color:#1a1a2e;font-size:18px;font-weight:700;margin:0 0 20px;font-family:Helvetica,Arial,sans-serif;">Hei! 👋</p>
      ${bodyHtml}
      ${btnHtml}
    </div>
    <hr style="border:none;border-top:1px solid #e8e6e1;margin:0 40px;" />
    <div style="padding:20px 40px;text-align:center;">
      <p style="color:#b0aead;font-size:12px;line-height:1.6;margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;">
        Du mottar denne e-posten fordi du meldte deg på nyhetsbrevet fra milenabua.no.
        <a href="#" style="color:#b0aead;">Meld deg av her</a>.
      </p>
      <p style="color:#b0aead;font-size:12px;margin:0;font-family:Helvetica,Arial,sans-serif;">© ${new Date().getFullYear()} Milena Bua · milenabua.no</p>
    </div>
  </div>
</body></html>`;
}

export default function EmailAdmin({ initial }: { initial: EmailSettings }) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof EmailSettings, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleHeaderImageUpload = async (file: File) => {
    setUploadingImg(true);
    setUploadErr(null);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        setUploadErr(`HTTP ${res.status} — fikk ikke JSON-svar fra server`);
        setUploadingImg(false);
        return;
      }
      if (data.url) {
        set("welcomeHeaderImageUrl", data.url);
      } else {
        setUploadErr(data.error ?? `Feil ${res.status}`);
      }
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Nettverksfeil");
    } finally {
      setUploadingImg(false);
    }
  };

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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Ordrebekreftelse ── */}
      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          {label("Takkehilsen")}
          <textarea rows={3} style={{ ...inp, resize: "vertical" }}
            value={settings.thankYouMessage} onChange={(e) => set("thankYouMessage", e.target.value)} />
          {hint("Vises etter ordredetaljer i e-posten til kunden.")}
        </div>
        <div>
          {label("Hvorfor kjøpet betyr noe")}
          <textarea rows={3} style={{ ...inp, resize: "vertical" }}
            value={settings.projectMessage} onChange={(e) => set("projectMessage", e.target.value)} />
        </div>
        <div>
          {label("Avslutning / signatur")}
          <textarea rows={2} style={{ ...inp, resize: "vertical" }}
            value={settings.signoff} onChange={(e) => set("signoff", e.target.value)} />
          {hint("Linjeskift separerer linjene i signaturen.")}
        </div>
      </div>

      {/* ── Velkomst-e-post ── */}
      <div style={{ borderTop: "1px solid var(--faint)", paddingTop: 28 }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--blue)", margin: "0 0 24px" }}>
          Velkomst-e-post til nye abonnenter
        </p>

        {/* Split: form left, preview right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left: form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Header image upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {label("Headerbilde (øverst i e-posten)")}
              {settings.welcomeHeaderImageUrl && (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={settings.welcomeHeaderImageUrl} alt=""
                    style={{ width: "100%", maxWidth: 360, borderRadius: 8, display: "block", border: "1px solid var(--faint)" }} />
                  <button type="button" onClick={() => set("welcomeHeaderImageUrl", "")}
                    style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: "0.85rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ✕
                  </button>
                </div>
              )}
              {uploadErr && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, padding: "8px 12px", fontSize: "0.78rem", color: "#dc2626", fontWeight: 600 }}>
                  ✕ {uploadErr}
                </div>
              )}
              <input type="file" accept="image/*" ref={imgRef} style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleHeaderImageUpload(f); e.target.value = ""; } }} />
              <button type="button" onClick={() => imgRef.current?.click()} disabled={uploadingImg}
                style={{ alignSelf: "flex-start", padding: "8px 18px", borderRadius: 8, border: "1px solid var(--faint)", background: "var(--white)", color: "var(--ink)", fontSize: "0.82rem", fontWeight: 600, cursor: uploadingImg ? "default" : "pointer", fontFamily: "inherit", opacity: uploadingImg ? 0.6 : 1 }}>
                {uploadingImg ? "Laster opp…" : settings.welcomeHeaderImageUrl ? "Bytt bilde" : "Last opp bilde"}
              </button>
              {hint("Anbefalt: 580px bred. JPG eller PNG.")}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {label("Emne")}
              <input type="text" style={inp} value={settings.welcomeSubject}
                onChange={(e) => set("welcomeSubject", e.target.value)}
                placeholder="Velkommen — her er gaven din! 🎁" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {label("Innhold")}
              <textarea rows={7} style={{ ...inp, resize: "vertical" }}
                value={settings.welcomeBody} onChange={(e) => set("welcomeBody", e.target.value)}
                placeholder={"Tusen takk for at du meldte deg på!\n\nDobbelt linjeskift = nytt avsnitt."} />
              {hint("Dobbelt linjeskift = nytt avsnitt. **Bold** og *kursiv* støttes.")}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {label("Gratis PDF — nedlastingslenke")}
              <input type="url" style={inp} value={settings.welcomePdfUrl}
                onChange={(e) => set("welcomePdfUrl", e.target.value)}
                placeholder="https://... (tom = ingen knapp)" />
              {hint("Lim inn lenken til PDF-en — vises som stor blå knapp i e-posten.")}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {label("Tekst på knappen")}
              <input type="text" style={inp} value={settings.welcomePdfButtonText}
                onChange={(e) => set("welcomePdfButtonText", e.target.value)}
                placeholder="Last ned gratis PDF →" />
            </div>
          </div>

          {/* Right: live preview */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mid)", marginBottom: 8 }}>
              Forhåndsvisning
            </p>
            <div style={{ border: "1px solid var(--faint)", borderRadius: 12, overflow: "hidden", background: "#f5f4f2" }}>
              <iframe
                srcDoc={buildPreviewHtml(settings)}
                style={{ width: "100%", height: 520, border: "none", display: "block" }}
                title="E-post forhåndsvisning"
              />
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--mid)", marginTop: 6 }}>
              Oppdateres automatisk mens du skriver
            </p>
          </div>

        </div>
      </div>

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 8 }}>
        <button onClick={save} disabled={saving}
          style={{ padding: "9px 24px", borderRadius: 20, border: "none", background: "var(--blue)", color: "white", fontSize: "0.88rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: "inherit" }}>
          {saving ? "Lagrer…" : "Lagre alt"}
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
