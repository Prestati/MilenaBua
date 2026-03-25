"use client";

import { useActionState } from "react";
import { saveEscapeAction } from "./actions";

interface EscapeData {
  tag: string; heading: string; headingAccent: string; description: string;
  goalLabel: string; goalText: string; primaryBtn: string; secondaryBtn: string;
  secondaryBtnUrl: string;
}

export default function EscapeForm({ data }: { data: EscapeData }) {
  const [state, action, pending] = useActionState(saveEscapeAction, null);

  const fields: { name: keyof EscapeData; label: string }[] = [
    { name: "tag", label: "Merkelapp (badge)" },
    { name: "heading", label: "Overskrift" },
    { name: "headingAccent", label: "Fremhevet del av overskrift" },
    { name: "goalLabel", label: "Mål-etikett" },
    { name: "goalText", label: "Mål-tekst" },
    { name: "primaryBtn", label: "Primærknapp" },
    { name: "secondaryBtn", label: "Sekundærknapp tekst" },
    { name: "secondaryBtnUrl", label: "Sekundærknapp lenke" },
  ];

  return (
    <form action={action} className="flex flex-col gap-5 max-w-xl">
      {fields.map(({ name, label }) => (
        <div key={name}>
          <label className="block text-[0.78rem] font-semibold mb-1.5" style={{ color: "var(--ink)" }}>{label}</label>
          <input name={name} defaultValue={data[name]}
            className="w-full px-4 py-3 rounded-[10px] border text-[0.9rem] outline-none focus:border-[var(--blue)]"
            style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", transition: "border-color 0.2s" }} />
        </div>
      ))}
      <div>
        <label className="block text-[0.78rem] font-semibold mb-1.5" style={{ color: "var(--ink)" }}>Beskrivelse</label>
        <textarea name="description" defaultValue={data.description} rows={4}
          className="w-full px-4 py-3 rounded-[10px] border text-[0.9rem] outline-none resize-none focus:border-[var(--blue)]"
          style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", transition: "border-color 0.2s" }} />
      </div>
      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending}
          className="px-6 py-2.5 rounded-full text-[0.88rem] font-bold text-white disabled:opacity-60"
          style={{ background: "var(--blue)", fontFamily: "inherit" }}>
          {pending ? "Lagrer…" : "Lagre endringer"}
        </button>
        {state?.success && <span className="text-[0.82rem] font-medium text-green-600">✓ Lagret!</span>}
        {state?.error && <span className="text-[0.82rem] font-medium text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
