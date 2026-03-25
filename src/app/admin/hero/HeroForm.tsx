"use client";

import { useActionState, useState } from "react";
import { saveHeroAction } from "./actions";
import Image from "next/image";

interface HeroData {
  badge: string;
  h1Line1: string;
  h1Highlight: string;
  h1Line2: string;
  description: string;
  primaryBtn: string;
  secondaryBtn: string;
  imageUrl: string;
}

export default function HeroForm({ data }: { data: HeroData }) {
  const [state, action, pending] = useActionState(saveHeroAction, null);
  const [preview, setPreview] = useState<string>(data.imageUrl);

  return (
    <form action={action} className="flex flex-col gap-6 max-w-xl">
      <input type="hidden" name="currentImageUrl" value={preview} />

      {/* Image upload */}
      <div>
        <label className="block text-[0.78rem] font-semibold mb-2" style={{ color: "var(--ink)" }}>
          Hero-bilde
        </label>
        {preview && (
          <div className="relative mb-3 rounded-[12px] overflow-hidden border" style={{ borderColor: "var(--faint)", height: 180 }}>
            <Image src={preview} alt="Hero" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setPreview("")}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-sm flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
          className="w-full text-[0.82rem] file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-[0.78rem] file:font-semibold file:cursor-pointer"
          style={{
            color: "var(--mid)",
          }}
        />
        <p className="text-[0.72rem] mt-1" style={{ color: "var(--mid)" }}>
          JPG, PNG eller WebP. Anbefalt: 1200×630px.
        </p>
      </div>

      {[
        { name: "badge", label: "Badge-tekst", value: data.badge },
        { name: "h1Line1", label: "Overskrift linje 1", value: data.h1Line1 },
        { name: "h1Highlight", label: "Fremhevet ord (linje 2)", value: data.h1Highlight },
        { name: "h1Line2", label: "Overskrift linje 3", value: data.h1Line2 },
        { name: "primaryBtn", label: "Primærknapp", value: data.primaryBtn },
        { name: "secondaryBtn", label: "Sekundærknapp", value: data.secondaryBtn },
      ].map(({ name, label, value }) => (
        <Field key={name} name={name} label={label} defaultValue={value} />
      ))}

      <div>
        <label className="block text-[0.78rem] font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
          Beskrivelse
        </label>
        <textarea
          name="description"
          defaultValue={data.description}
          rows={3}
          className="w-full px-4 py-3 rounded-[10px] border text-[0.9rem] outline-none resize-none focus:border-[var(--blue)]"
          style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", transition: "border-color 0.2s" }}
        />
      </div>

      <SaveBar pending={pending} state={state} />
    </form>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div>
      <label className="block text-[0.78rem] font-semibold mb-1.5" style={{ color: "var(--ink)" }}>{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full px-4 py-3 rounded-[10px] border text-[0.9rem] outline-none focus:border-[var(--blue)]"
        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", transition: "border-color 0.2s" }}
      />
    </div>
  );
}

function SaveBar({ pending, state }: { pending: boolean; state: { success?: boolean; error?: string } | null }) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 rounded-full text-[0.88rem] font-bold text-white transition-all disabled:opacity-60"
        style={{ background: "var(--blue)", fontFamily: "inherit" }}
      >
        {pending ? "Lagrer…" : "Lagre endringer"}
      </button>
      {state?.success && (
        <span className="text-[0.82rem] font-medium text-green-600">✓ Lagret!</span>
      )}
      {state?.error && (
        <span className="text-[0.82rem] font-medium text-red-600">{state.error}</span>
      )}
    </div>
  );
}
