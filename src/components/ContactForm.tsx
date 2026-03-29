"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("https://formspree.io/f/mreobbow", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        setMessage("✓ Takk for beskjeden! Jeg svarer så fort jeg kan.");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 4000);
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-[0.85rem] font-semibold mb-2" style={{ color: "var(--ink)" }}>
          Navn
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={status === "loading" || status === "success"}
          className="w-full border px-4 py-3 rounded-[12px] text-[0.9rem] outline-none focus:border-[var(--blue)] disabled:opacity-50"
          style={{ borderColor: "var(--faint)", background: "white", color: "var(--ink)", fontFamily: "inherit" }}
        />
      </div>

      <div>
        <label className="block text-[0.85rem] font-semibold mb-2" style={{ color: "var(--ink)" }}>
          Epostadresse
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={status === "loading" || status === "success"}
          className="w-full border px-4 py-3 rounded-[12px] text-[0.9rem] outline-none focus:border-[var(--blue)] disabled:opacity-50"
          style={{ borderColor: "var(--faint)", background: "white", color: "var(--ink)", fontFamily: "inherit" }}
        />
      </div>

      <div>
        <label className="block text-[0.85rem] font-semibold mb-2" style={{ color: "var(--ink)" }}>
          Melding
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          disabled={status === "loading" || status === "success"}
          rows={5}
          className="w-full border px-4 py-3 rounded-[12px] text-[0.9rem] outline-none focus:border-[var(--blue)] disabled:opacity-50 resize-none"
          style={{ borderColor: "var(--faint)", background: "white", color: "var(--ink)", fontFamily: "inherit" }}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="px-6 py-3 rounded-[12px] text-[0.88rem] font-bold text-white cursor-pointer border-none transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: status === "success" ? "var(--orange)" : "var(--blue)", boxShadow: "0 4px 16px rgba(59,111,212,0.25)" }}
      >
        {status === "loading" ? "Sender…" : status === "success" ? "✓ Sendt!" : "Send melding"}
      </button>

      {message && (
        <p className={`text-[0.85rem] font-medium ${status === "success" ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
