"use client";

import { useState } from "react";
import RichTextEditor from "@/components/RichTextEditor";

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

interface Props {
  subscribers: Subscriber[];
  buyers: Buyer[];
}

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

export default function NewsletterAdmin({ subscribers, buyers }: Props) {
  const [tab, setTab] = useState<"subscribers" | "send">("subscribers");

  // Send form
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Recipient groups
  const [includeSubscribers, setIncludeSubscribers] = useState(true);
  const [includeBuyers, setIncludeBuyers] = useState(false);

  // Combine and deduplicate emails
  const selectedEmails = Array.from(new Set([
    ...(includeSubscribers ? subscribers.filter((s) => s.active).map((s) => s.email) : []),
    ...(includeBuyers ? buyers.map((b) => b.email) : []),
  ]));

  const sendNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      setSendMsg({ ok: false, text: "Emne og innhold er påkrevd" });
      return;
    }
    if (selectedEmails.length === 0) {
      setSendMsg({ ok: false, text: "Velg minst én mottakergruppe" });
      return;
    }
    setSending(true);
    setSendMsg(null);
    try {
      const res = await fetch("/api/admin/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, emails: selectedEmails }),
      });
      const data = await res.json();
      if (data.success) {
        setSendMsg({ ok: true, text: `Sendt til ${data.sent} mottakere!` });
        setSubject("");
        setContent("");
      } else {
        setSendMsg({ ok: false, text: data.error ?? "Noe gikk galt" });
      }
    } catch (e) {
      setSendMsg({ ok: false, text: e instanceof Error ? e.message : "Noe gikk galt" });
    } finally {
      setSending(false);
    }
  };

  const tabBtn = (id: "subscribers" | "send", label: string) => (
    <button
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "4px", background: "var(--faint)", borderRadius: 24, width: "fit-content" }}>
        {tabBtn("subscribers", `Abonnenter (${subscribers.filter(s => s.active).length})`)}
        {tabBtn("send", "Send nyhetsbrev")}
      </div>

      {/* Tab: Abonnenter */}
      {tab === "subscribers" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{subscribers.filter(s => s.active).length}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--mid)", marginTop: 4 }}>Aktive abonnenter</div>
            </div>
            <div style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{buyers.length}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--mid)", marginTop: 4 }}>Kjøpere (med samtykke)</div>
            </div>
          </div>

          {/* Subscribers table */}
          <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Nyhetsbrev-abonnenter</h3>
          <div style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
            {subscribers.length === 0 ? (
              <div style={{ padding: "24px", color: "var(--mid)", fontSize: "0.85rem", textAlign: "center" }}>Ingen abonnenter enda.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg)" }}>
                    {["E-post", "Navn", "Kilde", "Dato", "Status"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "var(--mid)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--faint)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: i < subscribers.length - 1 ? "1px solid var(--faint)" : "none" }}>
                      <td style={{ padding: "10px 16px", color: "var(--ink)" }}>{s.email}</td>
                      <td style={{ padding: "10px 16px", color: "var(--mid)" }}>{s.name || "—"}</td>
                      <td style={{ padding: "10px 16px", color: "var(--mid)" }}>{s.source || "—"}</td>
                      <td style={{ padding: "10px 16px", color: "var(--mid)" }}>{new Date(s.subscribed_at).toLocaleDateString("nb-NO")}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
                          background: s.active ? "#d1fae5" : "#fee2e2",
                          color: s.active ? "#065f46" : "#991b1b",
                        }}>
                          {s.active ? "Aktiv" : "Avmeldt"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Buyers table */}
          <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Kjøpere med nyhetsbrev-samtykke</h3>
          <div style={{ background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, overflow: "hidden" }}>
            {buyers.length === 0 ? (
              <div style={{ padding: "24px", color: "var(--mid)", fontSize: "0.85rem", textAlign: "center" }}>Ingen kjøpere med samtykke enda.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg)" }}>
                    {["E-post", "Navn", "Produkt", "Dato"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "var(--mid)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--faint)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((b, i) => (
                    <tr key={b.email} style={{ borderBottom: i < buyers.length - 1 ? "1px solid var(--faint)" : "none" }}>
                      <td style={{ padding: "10px 16px", color: "var(--ink)" }}>{b.email}</td>
                      <td style={{ padding: "10px 16px", color: "var(--mid)" }}>{b.name || "—"}</td>
                      <td style={{ padding: "10px 16px", color: "var(--mid)" }}>{b.product_name}</td>
                      <td style={{ padding: "10px 16px", color: "var(--mid)" }}>{new Date(b.created_at).toLocaleDateString("nb-NO")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab: Send nyhetsbrev */}
      {tab === "send" && (
        <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Recipient groups */}
          <div>
            <label style={labelStyle}>Mottakere</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12, padding: "16px 20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.88rem", color: "var(--ink)" }}>
                <input type="checkbox" checked={includeSubscribers} onChange={(e) => setIncludeSubscribers(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--blue)" }} />
                <span>Nyhetsbrev-abonnenter <span style={{ color: "var(--mid)", fontSize: "0.78rem" }}>({subscribers.filter(s => s.active).length} aktive)</span></span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.88rem", color: "var(--ink)" }}>
                <input type="checkbox" checked={includeBuyers} onChange={(e) => setIncludeBuyers(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--blue)" }} />
                <span>Kjøpere med samtykke <span style={{ color: "var(--mid)", fontSize: "0.78rem" }}>({buyers.length} totalt)</span></span>
              </label>
              {selectedEmails.length > 0 && (
                <div style={{ marginTop: 4, fontSize: "0.78rem", color: "var(--blue)", fontWeight: 600 }}>
                  → {selectedEmails.length} unike mottakere valgt
                </div>
              )}
            </div>
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

          {/* Content */}
          <div>
            <label style={labelStyle}>Innhold</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              rows={12}
              placeholder={"Skriv nyhetsbrevet her.\n\nDobbelt linjeskift gir nytt avsnitt.\nBruk **fet** og *kursiv* for formatering."}
            />
          </div>

          {/* Preview */}
          {content.trim() && (
            <div>
              <label style={labelStyle}>Forhåndsvisning</label>
              <div style={{
                background: "var(--white)", border: "1px solid var(--faint)", borderRadius: 12,
                padding: "20px 24px", fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.75,
              }}>
                {content.split(/\n\n+/).filter(Boolean).map((para, i) => (
                  <p key={i} style={{ margin: "0 0 14px" }}>
                    {para.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, j) => {
                      if (part.startsWith("**") && part.endsWith("**")) return <strong key={j}>{part.slice(2, -2)}</strong>;
                      if (part.startsWith("*") && part.endsWith("*")) return <em key={j}>{part.slice(1, -1)}</em>;
                      return part;
                    })}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Send */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={sendNewsletter}
              disabled={sending || selectedEmails.length === 0 || !subject.trim() || !content.trim()}
              style={{
                padding: "10px 28px",
                borderRadius: 20,
                border: "none",
                background: "var(--blue)",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: sending ? "not-allowed" : "pointer",
                opacity: (sending || selectedEmails.length === 0 || !subject.trim() || !content.trim()) ? 0.5 : 1,
                fontFamily: "inherit",
              }}
            >
              {sending ? `Sender til ${selectedEmails.length}…` : `Send til ${selectedEmails.length} mottakere`}
            </button>
            {sendMsg && (
              <span style={{ fontSize: "0.83rem", fontWeight: 500, color: sendMsg.ok ? "#16a34a" : "#dc2626" }}>
                {sendMsg.ok ? "✓" : "✕"} {sendMsg.text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
