"use client";

import { useState, useRef } from "react";
import RichTextEditor from "@/components/RichTextEditor";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  active: boolean;
  source: string | null;
}

interface Buyer {
  email: string;
  name: string | null;
  product_name: string;
  created_at: string;
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Props {
  subscribers: Subscriber[];
  buyers: Buyer[];
  posts: BlogPost[];
  products: Product[];
}

type Tab = "subscribers" | "compose";
type Template = "standard" | "blogproducts" | "short";
type PreviewMode = "mobile" | "desktop";

// ── HTML preview builder ───────────────────────────────────────────────────────

function inlineHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function mdToHtml(text: string): string {
  if (!text.trim()) return "";
  const paras = text.split(/\n\n+/).filter(Boolean);

  return paras.map((para) => {
    const trimmed = para.trim();

    // Image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      return `<div style="margin:16px 0;"><img src="${imgMatch[2]}" alt="${imgMatch[1]}" style="display:block;width:100%;max-width:500px;border-radius:8px;" /></div>`;
    }

    // YouTube video
    const ytId = getYouTubeId(trimmed);
    if (ytId) {
      const thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      return `<div style="margin:16px 0;text-align:center;"><a href="${trimmed}" style="display:block;text-decoration:none;"><img src="${thumb}" alt="Se video" style="display:block;width:100%;max-width:500px;border-radius:8px;border:3px solid #e8e6e1;" /><p style="color:#3b6fd4;font-weight:700;font-size:14px;margin:8px 0 0;">▶ Se video på YouTube</p></a></div>`;
    }

    // List items
    if (para.includes("\n- ") || para.startsWith("- ")) {
      const lines = para.split("\n");
      const items = lines.filter(l => l.startsWith("- ")).map(l => `<li style="margin-bottom:4px;color:#444240;font-size:15px;line-height:1.75;">${inlineHtml(l.slice(2))}</li>`).join("");
      return `<ul style="padding-left:20px;margin:0 0 16px;">${items}</ul>`;
    }

    // Regular paragraph
    const lines = para.split("\n");
    const content = lines.map((l, i) => inlineHtml(l) + (i < lines.length - 1 ? "<br/>" : "")).join("");
    return `<p style="color:#444240;font-size:15px;line-height:1.75;margin:0 0 16px;">${content}</p>`;
  }).join("");
}

function buildEmailHtml(
  template: Template,
  content: string,
  posts: BlogPost[],
  products: Product[],
  headerImageUrl?: string
): string {
  const SITE = "https://www.milenabua.no";
  const year = new Date().getFullYear();
  const contentHtml = mdToHtml(content);
  const headerImg = headerImageUrl
    ? `<img src="${headerImageUrl}" alt="" style="display:block;width:100%;max-width:580px;border-radius:12px 12px 0 0;" />`
    : "";

  const footer = `
    <hr style="border:none;border-top:1px solid #e8e6e1;margin:0 40px;"/>
    <div style="padding:20px 40px;text-align:center;">
      <p style="color:#b0aead;font-size:12px;line-height:1.6;margin:0 0 4px;">
        Du mottar denne e-posten fordi du har kjøpt et produkt eller meldt deg på nyhetsbrev fra milenabua.no.
        <a href="#" style="color:#b0aead;text-decoration:underline;">Meld deg av her</a>.
      </p>
      <p style="color:#b0aead;font-size:12px;line-height:1.6;margin:0;">© ${year} Milena Bua · milenabua.no</p>
    </div>`;

  const navyHeader = `
    ${headerImg}
    <div style="background:#1a1a2e;padding:24px 40px;">
      <div style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.5px;margin:0;">Milena Bua</div>
    </div>`;

  let body = "";

  if (template === "short") {
    body = `
      <div style="padding:28px 40px 8px;">
        <div style="font-size:14px;font-weight:800;color:#1a1a2e;letter-spacing:-0.3px;">Milena Bua</div>
      </div>
      <hr style="border:none;border-top:1px solid #e8e6e1;margin:0 40px 28px;"/>
      <div style="padding:0 40px 24px;">${contentHtml || '<p style="color:#999;font-size:15px;">Innhold vises her…</p>'}</div>
      <hr style="border:none;border-top:1px solid #e8e6e1;margin:0 40px;"/>
      <div style="padding:16px 40px;text-align:center;">
        <p style="color:#b0aead;font-size:11px;margin:0;">
          <a href="#" style="color:#b0aead;text-decoration:underline;">Meld deg av</a> · milenabua.no · © ${year} Milena Bua
        </p>
      </div>`;
  } else if (template === "blogproducts") {
    const postsHtml =
      posts.length > 0
        ? `<div style="margin:24px 0 0;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;margin:0 0 12px;">Fra bloggen</div>
            ${posts
              .map(
                (p) => `
              <div style="border:1px solid #e8e6e1;border-radius:8px;padding:16px 20px;margin:0 0 10px;">
                <div style="font-size:14px;font-weight:700;color:#1a1a2e;margin:0 0 6px;">${inlineHtml(p.title)}</div>
                ${p.excerpt ? `<div style="font-size:13px;color:#6b7280;margin:0 0 10px;line-height:1.5;">${inlineHtml(p.excerpt)}</div>` : ""}
                <a href="${SITE}/blogg/${p.slug}" style="font-size:13px;color:#3b6fd4;font-weight:600;text-decoration:none;">Les innlegget →</a>
              </div>`
              )
              .join("")}
          </div>`
        : "";

    const productsHtml =
      products.length > 0
        ? `<div style="margin:24px 0 0;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;margin:0 0 12px;">Produkter</div>
            ${products
              .map(
                (p) => `
              <div style="border:1px solid #e8e6e1;border-radius:8px;padding:16px 20px;margin:0 0 10px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-size:14px;font-weight:700;color:#1a1a2e;margin:0 0 4px;">${inlineHtml(p.name)}</div>
                  <div style="font-size:13px;color:#6b7280;">${p.price} kr</div>
                </div>
                <a href="${SITE}/produkter/${p.id}" style="background:#1a1a2e;color:#fff;font-size:12px;font-weight:600;padding:8px 16px;border-radius:6px;text-decoration:none;">Kjøp →</a>
              </div>`
              )
              .join("")}
          </div>`
        : "";

    body = `
      ${navyHeader}
      <div style="padding:36px 40px 24px;">
        ${contentHtml || '<p style="color:#999;font-size:15px;">Personlig melding vises her…</p>'}
        ${postsHtml}
        ${productsHtml}
      </div>
      ${footer}`;
  } else {
    // standard — also show header image for short template
    const shortHeaderImg = headerImageUrl
      ? `<img src="${headerImageUrl}" alt="" style="display:block;width:100%;max-width:580px;border-radius:12px 12px 0 0;" />`
      : "";
    if (template === "short") {
      body = `
        ${shortHeaderImg}
        <div style="padding:28px 40px 20px;">
          <div style="font-size:14px;font-weight:800;color:#1a1a2e;letter-spacing:-0.3px;">Milena Bua</div>
        </div>
        <hr style="border:none;border-top:1px solid #e8e6e1;margin:0 40px 28px;"/>
        <div style="padding:0 40px 24px;">${contentHtml || '<p style="color:#999;font-size:15px;">Innhold vises her…</p>'}</div>
        <hr style="border:none;border-top:1px solid #e8e6e1;margin:0 40px;"/>
        <div style="padding:16px 40px;text-align:center;">
          <p style="color:#b0aead;font-size:11px;margin:0;">
            <a href="#" style="color:#b0aead;text-decoration:underline;">Meld deg av</a> · milenabua.no · © ${year} Milena Bua
          </p>
        </div>`;
    } else {
      body = `
        ${navyHeader}
        <div style="padding:36px 40px 24px;">
          ${contentHtml || '<p style="color:#999;font-size:15px;">Innhold vises her…</p>'}
        </div>
        ${footer}`;
    }
  }

  return `<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:0;background:#f5f4f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e6e1;">${body}</div></body></html>`;
}

// ── CSV parser ─────────────────────────────────────────────────────────────────

function parseCsv(text: string): { email: string; name?: string }[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes("email") ||
    firstLine.includes("e-post") ||
    firstLine.includes("epost");

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const header = hasHeader ? firstLine.split(",").map((h) => h.trim()) : null;
  const emailIdx = header ? Math.max(header.indexOf("email"), header.indexOf("e-post"), header.indexOf("epost")) : 0;
  const nameIdx = header ? header.indexOf("name") : -1;

  return dataLines
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      const email = parts[emailIdx >= 0 ? emailIdx : 0] ?? "";
      const name = nameIdx >= 0 ? parts[nameIdx] : parts[1];
      return { email: email.toLowerCase(), name: name || undefined };
    })
    .filter((r) => r.email.includes("@"));
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 13px",
  borderRadius: 8,
  border: "1px solid var(--faint)",
  background: "var(--bg)",
  color: "var(--ink)",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--mid)",
  marginBottom: 6,
};

const card: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--faint)",
  borderRadius: 12,
  padding: "20px 24px",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewsletterAdmin({
  subscribers,
  buyers,
  posts,
  products,
}: Props) {
  const [tab, setTab] = useState<Tab>("subscribers");

  // ── Compose state ──
  const [template, setTemplate] = useState<Template>("standard");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [headerUploadErr, setHeaderUploadErr] = useState<string | null>(null);
  const headerImgRef = useRef<HTMLInputElement>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [includeSubscribers, setIncludeSubscribers] = useState(true);
  const [includeBuyers, setIncludeBuyers] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");

  // ── Send state ──
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── Import state ──
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<{ email: string; name?: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    duplicates: number;
    errors: string[];
  } | null>(null);

  // ── Derived ──
  const activeSubscribers = subscribers.filter((s) => s.active);
  const selectedEmails = Array.from(
    new Set([
      ...(includeSubscribers ? activeSubscribers.map((s) => s.email) : []),
      ...(includeBuyers ? buyers.map((b) => b.email) : []),
    ])
  );

  const chosenPosts = posts.filter((p) => selectedPosts.includes(p.slug));
  const chosenProducts = products.filter((p) => selectedProducts.includes(p.id));

  const previewHtml = buildEmailHtml(template, content, chosenPosts, chosenProducts, headerImageUrl || undefined);

  // ── Header image upload ──
  const handleHeaderImageUpload = async (file: File) => {
    setUploadingHeader(true);
    setHeaderUploadErr(null);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      let data: { url?: string; error?: string };
      try { data = await res.json(); }
      catch { setHeaderUploadErr(`HTTP ${res.status} – fikk ikke svar fra server`); setUploadingHeader(false); return; }
      if (data.url) setHeaderImageUrl(data.url);
      else setHeaderUploadErr(data.error ?? `Feil ${res.status}`);
    } catch (e) {
      setHeaderUploadErr(e instanceof Error ? e.message : "Nettverksfeil");
    } finally {
      setUploadingHeader(false);
    }
  };

  // ── Handlers ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvPreview(parseCsv(text));
      setImportResult(null);
    };
    reader.readAsText(file, "utf-8");
  };

  const handleImport = async () => {
    if (!csvPreview.length) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/admin/import-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: csvPreview }),
      });
      const data = await res.json();
      setImportResult(data);
      if (data.imported > 0) setCsvPreview([]);
    } catch {
      setImportResult({ imported: 0, duplicates: 0, errors: ["Noe gikk galt"] });
    } finally {
      setImporting(false);
    }
  };

  const sendTestEmail = async () => {
    if (!subject.trim() || !content.trim()) {
      setTestMsg({ ok: false, text: "Fyll inn emne og innhold først" });
      return;
    }
    setTestSending(true);
    setTestMsg(null);
    try {
      const res = await fetch("/api/admin/send-test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          subject,
          content,
          headerImageUrl: headerImageUrl || undefined,
          posts: chosenPosts,
          products: chosenProducts,
        }),
      });
      const data = await res.json();
      setTestMsg(
        data.success
          ? { ok: true, text: "Testmail sendt til deg!" }
          : { ok: false, text: data.error ?? "Noe gikk galt" }
      );
    } catch {
      setTestMsg({ ok: false, text: "Noe gikk galt" });
    } finally {
      setTestSending(false);
    }
  };

  const doSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setSendMsg(null);
    try {
      const res = await fetch("/api/admin/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          subject,
          content,
          headerImageUrl: headerImageUrl || undefined,
          emails: selectedEmails,
          posts: chosenPosts,
          products: chosenProducts,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendMsg({ ok: true, text: `Sendt til ${data.sent} mottakere!` });
        setSubject("");
        setContent("");
        setSelectedPosts([]);
        setSelectedProducts([]);
      } else {
        setSendMsg({ ok: false, text: data.error ?? "Noe gikk galt" });
      }
    } catch {
      setSendMsg({ ok: false, text: "Noe gikk galt" });
    } finally {
      setSending(false);
    }
  };

  const togglePost = (slug: string) =>
    setSelectedPosts((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );

  const toggleProduct = (id: string) =>
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  // ── UI helpers ──
  const tabBtn = (id: Tab, label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      style={{
        padding: "8px 20px",
        borderRadius: 20,
        border: "none",
        fontFamily: "inherit",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        background: tab === id ? "var(--blue)" : "transparent",
        color: tab === id ? "white" : "var(--mid)",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "4px",
          background: "var(--faint)",
          borderRadius: 24,
          width: "fit-content",
        }}
      >
        {tabBtn("subscribers", `Abonnenter (${activeSubscribers.length})`)}
        {tabBtn("compose", "Send nyhetsbrev")}
      </div>

      {/* ── TAB: Abonnenter ──────────────────────────────────────────────────── */}
      {tab === "subscribers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={card}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
                {activeSubscribers.length}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--mid)", marginTop: 4 }}>
                Aktive abonnenter
              </div>
            </div>
            <div style={card}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
                {buyers.length}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--mid)", marginTop: 4 }}>
                Kjøpere (med samtykke)
              </div>
            </div>
          </div>

          {/* CSV Import */}
          <div style={card}>
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--ink)",
                margin: "0 0 4px",
              }}
            >
              Importer abonnenter fra CSV
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--mid)", margin: "0 0 14px" }}>
              Format: <code style={{ background: "var(--faint)", padding: "1px 5px", borderRadius: 4 }}>email,name</code>{" "}
              (name er valgfritt). Første linje kan være header.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid var(--faint)",
                background: "var(--bg)",
                color: "var(--ink)",
                fontSize: "0.85rem",
                fontFamily: "inherit",
                cursor: "pointer",
                marginBottom: csvPreview.length > 0 ? 12 : 0,
              }}
            >
              Velg CSV-fil
            </button>

            {csvPreview.length > 0 && (
              <>
                <p style={{ fontSize: "0.78rem", color: "var(--mid)", margin: "0 0 10px" }}>
                  {csvPreview.length} rader lest:{" "}
                  {csvPreview
                    .slice(0, 3)
                    .map((r) => r.email)
                    .join(", ")}
                  {csvPreview.length > 3 && ` … og ${csvPreview.length - 3} til`}
                </p>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--blue)",
                    color: "white",
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                    fontWeight: 600,
                    cursor: importing ? "not-allowed" : "pointer",
                    opacity: importing ? 0.6 : 1,
                  }}
                >
                  {importing ? "Importerer…" : `Importer ${csvPreview.length} abonnenter`}
                </button>
              </>
            )}

            {importResult && (
              <div
                style={{
                  marginTop: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: importResult.errors.length === 0 ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${importResult.errors.length === 0 ? "#86efac" : "#fca5a5"}`,
                  fontSize: "0.83rem",
                }}
              >
                <strong>
                  ✓ {importResult.imported} importert · {importResult.duplicates} duplikater
                </strong>
                {importResult.errors.length > 0 && (
                  <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                    {importResult.errors.map((e, i) => (
                      <li key={i} style={{ color: "#dc2626" }}>
                        {e}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Subscribers table */}
          <div>
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--ink)",
                marginBottom: 8,
              }}
            >
              Nyhetsbrev-abonnenter
            </h3>
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--faint)",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              {subscribers.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    color: "var(--mid)",
                    fontSize: "0.85rem",
                    textAlign: "center",
                  }}
                >
                  Ingen abonnenter enda.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg)" }}>
                      {["E-post", "Navn", "Kilde", "Dato", "Status"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 16px",
                            textAlign: "left",
                            fontWeight: 700,
                            color: "var(--mid)",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            borderBottom: "1px solid var(--faint)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s, i) => (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom:
                            i < subscribers.length - 1
                              ? "1px solid var(--faint)"
                              : "none",
                        }}
                      >
                        <td style={{ padding: "10px 16px", color: "var(--ink)" }}>{s.email}</td>
                        <td style={{ padding: "10px 16px", color: "var(--mid)" }}>
                          {s.name || "—"}
                        </td>
                        <td style={{ padding: "10px 16px", color: "var(--mid)" }}>
                          {s.source || "—"}
                        </td>
                        <td style={{ padding: "10px 16px", color: "var(--mid)" }}>
                          {new Date(s.subscribed_at).toLocaleDateString("nb-NO")}
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 10px",
                              borderRadius: 20,
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              background: s.active ? "#d1fae5" : "#fee2e2",
                              color: s.active ? "#065f46" : "#991b1b",
                            }}
                          >
                            {s.active ? "Aktiv" : "Avmeldt"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Buyers table */}
          <div>
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--ink)",
                marginBottom: 8,
              }}
            >
              Kjøpere med nyhetsbrev-samtykke
            </h3>
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--faint)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {buyers.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    color: "var(--mid)",
                    fontSize: "0.85rem",
                    textAlign: "center",
                  }}
                >
                  Ingen kjøpere med samtykke enda.
                </div>
              ) : (
                <table
                  style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}
                >
                  <thead>
                    <tr style={{ background: "var(--bg)" }}>
                      {["E-post", "Navn", "Produkt", "Dato"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 16px",
                            textAlign: "left",
                            fontWeight: 700,
                            color: "var(--mid)",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            borderBottom: "1px solid var(--faint)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {buyers.map((b, i) => (
                      <tr
                        key={b.email}
                        style={{
                          borderBottom:
                            i < buyers.length - 1 ? "1px solid var(--faint)" : "none",
                        }}
                      >
                        <td style={{ padding: "10px 16px", color: "var(--ink)" }}>{b.email}</td>
                        <td style={{ padding: "10px 16px", color: "var(--mid)" }}>
                          {b.name || "—"}
                        </td>
                        <td style={{ padding: "10px 16px", color: "var(--mid)" }}>
                          {b.product_name}
                        </td>
                        <td style={{ padding: "10px 16px", color: "var(--mid)" }}>
                          {new Date(b.created_at).toLocaleDateString("nb-NO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Komponér ────────────────────────────────────────────────────── */}
      {tab === "compose" && (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Left: Editor */}
          <div
            style={{
              flex: "0 0 420px",
              maxWidth: 420,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Header image */}
            <div>
              <label style={labelStyle}>Headerbilde (valgfritt)</label>
              {headerImageUrl && (
                <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
                  <img src={headerImageUrl} alt="" style={{ width: "100%", maxWidth: 360, borderRadius: 8, display: "block", border: "1px solid var(--faint)" }} />
                  <button type="button" onClick={() => setHeaderImageUrl("")}
                    style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: "0.85rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ✕
                  </button>
                </div>
              )}
              {headerUploadErr && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, padding: "6px 10px", fontSize: "0.78rem", color: "#dc2626", marginBottom: 6 }}>
                  ✕ {headerUploadErr}
                </div>
              )}
              <input type="file" accept="image/*" ref={headerImgRef} style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleHeaderImageUpload(f); e.target.value = ""; } }} />
              <button type="button" onClick={() => headerImgRef.current?.click()} disabled={uploadingHeader}
                style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid var(--faint)", background: "var(--white)", color: "var(--ink)", fontSize: "0.82rem", fontWeight: 600, cursor: uploadingHeader ? "default" : "pointer", fontFamily: "inherit", opacity: uploadingHeader ? 0.6 : 1 }}>
                {uploadingHeader ? "Laster opp…" : headerImageUrl ? "Bytt bilde" : "Last opp headerbilde"}
              </button>
              <p style={{ fontSize: "0.7rem", color: "var(--mid)", marginTop: 4 }}>Anbefalt: 580px bred. Vises øverst i e-posten.</p>
            </div>

            {/* Template selector */}
            <div>
              <label style={labelStyle}>Mal</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as Template)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="standard">Standard nyhetsbrev</option>
                <option value="blogproducts">Blogg + produkter</option>
                <option value="short">Kort oppdatering</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label style={labelStyle}>Emne</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Hva handler nyhetsbrevet om?"
                style={inputStyle}
              />
            </div>

            {/* Blog post checkboxes (blogproducts only) */}
            {template === "blogproducts" && posts.length > 0 && (
              <div>
                <label style={labelStyle}>
                  Blogginnlegg ({selectedPosts.length} valgt)
                </label>
                <div
                  style={{
                    ...card,
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {posts.map((p) => (
                    <label
                      key={p.slug}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        color: "var(--ink)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(p.slug)}
                        onChange={() => togglePost(p.slug)}
                        style={{ marginTop: 2, accentColor: "var(--blue)" }}
                      />
                      <span>
                        <span style={{ fontWeight: 600 }}>{p.title}</span>
                        {p.excerpt && (
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.75rem",
                              color: "var(--mid)",
                              marginTop: 2,
                            }}
                          >
                            {p.excerpt.slice(0, 60)}
                            {p.excerpt.length > 60 ? "…" : ""}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Product checkboxes (blogproducts only) */}
            {template === "blogproducts" && products.length > 0 && (
              <div>
                <label style={labelStyle}>
                  Produkter ({selectedProducts.length} valgt)
                </label>
                <div
                  style={{
                    ...card,
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {products.map((p) => (
                    <label
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        color: "var(--ink)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(p.id)}
                        onChange={() => toggleProduct(p.id)}
                        style={{ accentColor: "var(--blue)" }}
                      />
                      <span>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        <span style={{ color: "var(--mid)", marginLeft: 6 }}>
                          {p.price} kr
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div>
              <label style={labelStyle}>
                {template === "blogproducts" ? "Personlig melding" : "Innhold"}
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                rows={10}
                placeholder={
                  template === "short"
                    ? "Skriv en kort og konsis melding…"
                    : "Skriv nyhetsbrevet her.\n\nDobbelt linjeskift = nytt avsnitt.\n**Fet** og *kursiv* støttes."
                }
              />
            </div>

            {/* Recipient groups */}
            <div>
              <label style={labelStyle}>Mottakere</label>
              <div
                style={{
                  ...card,
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    color: "var(--ink)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includeSubscribers}
                    onChange={(e) => setIncludeSubscribers(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "var(--blue)" }}
                  />
                  <span>
                    Nyhetsbrev-abonnenter{" "}
                    <span style={{ color: "var(--mid)", fontSize: "0.78rem" }}>
                      ({activeSubscribers.length} aktive)
                    </span>
                  </span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    color: "var(--ink)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includeBuyers}
                    onChange={(e) => setIncludeBuyers(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "var(--blue)" }}
                  />
                  <span>
                    Kjøpere med samtykke{" "}
                    <span style={{ color: "var(--mid)", fontSize: "0.78rem" }}>
                      ({buyers.length} totalt)
                    </span>
                  </span>
                </label>
                {selectedEmails.length > 0 && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: "0.78rem",
                      color: "var(--blue)",
                      fontWeight: 600,
                    }}
                  >
                    → {selectedEmails.length} unike mottakere
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Test email */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={sendTestEmail}
                  disabled={testSending}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 20,
                    border: "1px solid var(--faint)",
                    background: "var(--bg)",
                    color: "var(--ink)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: testSending ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    opacity: testSending ? 0.6 : 1,
                  }}
                >
                  {testSending ? "Sender…" : "Send testmail til meg"}
                </button>
                {testMsg && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: testMsg.ok ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {testMsg.ok ? "✓" : "✕"} {testMsg.text}
                  </span>
                )}
              </div>

              {/* Send */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => {
                    if (!subject.trim() || !content.trim()) {
                      setSendMsg({ ok: false, text: "Emne og innhold er påkrevd" });
                      return;
                    }
                    if (selectedEmails.length === 0) {
                      setSendMsg({ ok: false, text: "Velg minst én mottakergruppe" });
                      return;
                    }
                    setSendMsg(null);
                    setShowConfirm(true);
                  }}
                  disabled={sending}
                  style={{
                    padding: "10px 28px",
                    borderRadius: 20,
                    border: "none",
                    background: "var(--blue)",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: sending ? "not-allowed" : "pointer",
                    opacity: sending ? 0.5 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {sending
                    ? `Sender til ${selectedEmails.length}…`
                    : `Send til ${selectedEmails.length} mottakere`}
                </button>
                {sendMsg && (
                  <span
                    style={{
                      fontSize: "0.83rem",
                      fontWeight: 500,
                      color: sendMsg.ok ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {sendMsg.ok ? "✓" : "✕"} {sendMsg.text}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div style={{ flex: 1, minWidth: 0, position: "sticky", top: 24 }}>
            {/* Toggle */}
            <div
              style={{
                display: "flex",
                gap: 4,
                marginBottom: 12,
                padding: "4px",
                background: "var(--faint)",
                borderRadius: 20,
                width: "fit-content",
              }}
            >
              {(["desktop", "mobile"] as PreviewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 16,
                    border: "none",
                    fontFamily: "inherit",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: previewMode === mode ? "var(--white)" : "transparent",
                    color: previewMode === mode ? "var(--ink)" : "var(--mid)",
                    boxShadow: previewMode === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {mode === "desktop" ? "Desktop" : "Mobil (375px)"}
                </button>
              ))}
            </div>

            {/* Preview iframe */}
            <div
              style={{
                border: "1px solid var(--faint)",
                borderRadius: 12,
                overflow: "hidden",
                background: "#f5f4f2",
                display: "flex",
                justifyContent: "center",
                padding: previewMode === "mobile" ? "20px 0" : "0",
              }}
            >
              <iframe
                srcDoc={previewHtml}
                style={{
                  width: previewMode === "mobile" ? 375 : "100%",
                  height: 640,
                  border: "none",
                  display: "block",
                }}
                title="E-post forhåndsvisning"
              />
            </div>
            <p
              style={{
                fontSize: "0.72rem",
                color: "var(--mid)",
                textAlign: "center",
                marginTop: 6,
              }}
            >
              Forhåndsvisning oppdateres i sanntid
            </p>
          </div>
        </div>
      )}

      {/* ── Confirmation dialog ───────────────────────────────────────────────── */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{
              background: "var(--white)",
              borderRadius: 16,
              padding: "32px 36px",
              maxWidth: 440,
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--ink)",
              }}
            >
              Bekreft utsending
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: "0.9rem", color: "var(--mid)", lineHeight: 1.6 }}>
              Du er i ferd med å sende{" "}
              <strong style={{ color: "var(--ink)" }}>«{subject}»</strong> til{" "}
              <strong style={{ color: "var(--ink)" }}>
                {selectedEmails.length} mottakere
              </strong>
              . Dette kan ikke angres.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid var(--faint)",
                  background: "var(--bg)",
                  color: "var(--ink)",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Avbryt
              </button>
              <button
                onClick={doSend}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--blue)",
                  color: "white",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Send nå
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
