"use client";

import { useState } from "react";

export default function NewsletterForm({ heading, description, btnText, note }: { heading: string; description: string; btnText: string; note: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        setMessage("✓ Takk! Du er nå påmeldt!");
        setEmail("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setMessage("Noe gikk galt. Prøv igjen.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Kunne ikke koble til. Prøv igjen.");
    }
  };

  return (
    <div className="rounded-[24px] px-8 py-12 md:px-14 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center border"
      style={{ background: "linear-gradient(135deg, #eef2fb 0%, #fff1ea 100%)", borderColor: "var(--faint)" }}>
      <div>
        <h2 className="font-extrabold tracking-[-0.04em] leading-[1.05] mb-3"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "var(--ink)" }}>
          {heading.includes("innenfra") ? (
            <>Følg med<br /><span style={{ color: "var(--blue)" }}>innenfra</span> 👀</>
          ) : heading}
        </h2>
        <p className="text-[0.92rem] leading-[1.8]" style={{ color: "var(--mid)" }}>{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@epost.no"
          required
          disabled={status === "loading" || status === "success"}
          className="border px-[1.1rem] py-[0.9rem] rounded-[12px] text-[0.9rem] outline-none focus:border-[var(--blue)] disabled:opacity-50"
          style={{ borderColor: "var(--faint)", background: "white", color: "var(--ink)", fontFamily: "inherit", transition: "border-color 0.2s" }}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="py-[0.95rem] rounded-[12px] text-[0.88rem] font-bold text-white cursor-pointer border-none transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: status === "success" ? "var(--orange)" : "var(--blue)", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(59,111,212,0.25)" }}
        >
          {status === "loading" ? "Sender…" : status === "success" ? "✓ Påmeldt!" : btnText}
        </button>
        {message && (
          <p className={`text-[0.72rem] ${status === "success" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <p className="text-[0.72rem]" style={{ color: "var(--mid)" }}>{note}</p>
      </form>
    </div>
  );
}
