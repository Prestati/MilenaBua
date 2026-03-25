"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "escape_unlocked";

async function verifyPassword(pw: string): Promise<boolean> {
  const res = await fetch("/api/escape-verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw }),
  });
  const data = await res.json();
  return data.ok === true;
}

export default function EscapeGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === "1");
    setChecked(true);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setPwError(false);
    const ok = await verifyPassword(password);
    setVerifying(false);
    if (ok) {
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setPwError(true);
    }
  };

  if (!checked) return null;

  if (unlocked) return <>{children}</>;

  return (
    <div style={{ position: "relative" }}>
      {/* Blurred content behind */}
      <div style={{ filter: "blur(8px)", pointerEvents: "none", userSelect: "none", opacity: 0.4 }}>
        {children}
      </div>

      {/* Overlay */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "flex-start",
        justifyContent: "center", paddingTop: 80, zIndex: 10,
      }}>
        <div style={{
          background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 20,
          padding: "40px 36px", maxWidth: 440, width: "90%",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>
            🔒 Tilgang kreves
          </div>
          <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, marginBottom: 10, letterSpacing: "-0.02em" }}>
            Statistikkene er skjult
          </h2>
          <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 28 }}>
            Meld deg på nyhetsbrevet for å få passordet og se alle tall og oppdateringer fra eksperimentet.
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              <input
                type="email" required placeholder="din@epost.no"
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #2a2a2a", background: "#141414", color: "#fff", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }}
              />
              <button type="submit"
                style={{ padding: "12px", borderRadius: 10, border: "none", background: "#00ff88", color: "#0a0a0a", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Send meg passordet →
              </button>
            </form>
          ) : (
            <div style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 28 }}>
              <p style={{ color: "#00ff88", fontSize: "0.88rem", fontWeight: 600, margin: 0 }}>
                ✓ Takk! Du vil motta passordet på e-post når du er meldt på nyhetsbrevet.
              </p>
            </div>
          )}

          <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 24 }}>
            <p style={{ color: "#555", fontSize: "0.78rem", marginBottom: 10, fontFamily: "monospace" }}>
              HAR DU ALLEREDE PASSORDET?
            </p>
            <form onSubmit={handlePassword} style={{ display: "flex", gap: 8 }}>
              <input
                type="password" placeholder="Skriv inn passord"
                value={password} onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
                style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: `1px solid ${pwError ? "#ff4444" : "#2a2a2a"}`, background: "#141414", color: "#fff", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }}
              />
              <button type="submit" disabled={verifying}
                style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#1a1a1a", color: "#fff", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {verifying ? "…" : "Lås opp"}
              </button>
            </form>
            {pwError && <p style={{ color: "#ff4444", fontSize: "0.78rem", marginTop: 6, fontFamily: "monospace" }}>Feil passord. Prøv igjen.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
