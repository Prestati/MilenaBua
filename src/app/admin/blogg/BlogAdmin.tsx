"use client";

import { useState } from "react";
import { savePostsAction } from "./actions";
import Image from "next/image";
import type { BlogPost } from "@/types";

const empty = (): BlogPost => ({
  slug: `innlegg-${Date.now()}`,
  title: "",
  excerpt: "",
  date: new Date().toISOString().slice(0, 10),
  author: "Milena Bua",
  tags: [],
  content: "",
  imageUrl: "",
});

export default function BlogAdmin({ initial }: { initial: BlogPost[] }) {
  const [items, setItems] = useState(initial);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text?: string } | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>(
    initial.reduce((acc, p) => ({ ...acc, [p.slug]: p.imageUrl || "" }), {})
  );

  const save = async () => {
    setSaving(true);
    const res = await savePostsAction(items);
    setSaving(false);
    setMsg(res.success ? { ok: true, text: "Lagret!" } : { ok: false, text: res.error });
    setTimeout(() => setMsg(null), 3000);
  };

  const update = (slug: string, field: keyof BlogPost, value: unknown) =>
    setItems((prev) => prev.map((p) => (p.slug === slug ? { ...p, [field]: value } : p)));

  const remove = (slug: string) => setItems((prev) => prev.filter((p) => p.slug !== slug));

  const add = () => {
    const p = empty();
    setItems((prev) => [p, ...prev]);
    setEditingSlug(p.slug);
  };

  const handleImageChange = async (slug: string, file: File) => {
    const preview = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [slug]: preview }));

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const { url } = await response.json();
      update(slug, "imageUrl", url);
      setPreviews((prev) => ({ ...prev, [slug]: url }));
    } else {
      console.error("Bildeopplasting feilet", await response.text());
      update(slug, "imageUrl", "");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((p) => (
        <div key={p.slug} className="rounded-[12px] border overflow-hidden" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="text-[0.9rem] font-semibold" style={{ color: "var(--ink)" }}>
                {p.title || <em style={{ color: "var(--mid)" }}>Nytt innlegg</em>}
              </span>
              <span className="text-[0.75rem]" style={{ color: "var(--mid)" }}>{p.date}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingSlug(editingSlug === p.slug ? null : p.slug)}
                className="text-[0.75rem] font-semibold px-3 py-1.5 rounded-[6px]"
                style={{ background: "var(--blue-lt)", color: "var(--blue)" }}
              >
                {editingSlug === p.slug ? "Lukk" : "Rediger"}
              </button>
              <button
                onClick={() => remove(p.slug)}
                className="text-[0.75rem] font-semibold px-3 py-1.5 rounded-[6px]"
                style={{ background: "#fef2f2", color: "#dc2626" }}
              >
                Slett
              </button>
            </div>
          </div>

          {editingSlug === p.slug && (
            <div className="px-5 pb-5 pt-2 border-t grid sm:grid-cols-2 gap-4" style={{ borderColor: "var(--faint)" }}>
              {/* Bilde upload */}
              <div className="sm:col-span-2">
                <label className="block text-[0.72rem] font-semibold mb-2" style={{ color: "var(--mid)" }}>
                  Blogg-bilde
                </label>
                {previews[p.slug] && (
                  <div className="relative mb-3 rounded-[12px] overflow-hidden border" style={{ borderColor: "var(--faint)", height: 150 }}>
                    <Image
                      src={previews[p.slug]}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviews((prev) => ({ ...prev, [p.slug]: "" }));
                        update(p.slug, "imageUrl", "");
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-sm flex items-center justify-center hover:bg-black/70"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageChange(p.slug, file);
                  }}
                  className="w-full text-[0.82rem] file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-[0.78rem] file:font-semibold file:cursor-pointer"
                  style={{ color: "var(--mid)" }}
                />
                <p className="text-[0.72rem] mt-1" style={{ color: "var(--mid)" }}>
                  JPG, PNG eller WebP. Anbefalt: 800×500px.
                </p>
              </div>

              {([
                ["title", "Tittel"],
                ["slug", "Slug (URL)"],
                ["date", "Dato (YYYY-MM-DD)"],
                ["author", "Forfatter"],
              ] as [keyof BlogPost, string][]).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>{label}</label>
                  <input
                    value={(p[field] ?? "") as string}
                    onChange={(e) => update(p.slug, field, e.target.value)}
                    className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                    style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit" }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>Tags (kommaseparert)</label>
                <input
                  value={p.tags.join(", ")}
                  onChange={(e) => update(p.slug, "tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                  style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit" }}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>Ingress / sammendrag</label>
                <textarea
                  value={p.excerpt}
                  onChange={(e) => update(p.slug, "excerpt", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none resize-none focus:border-[var(--blue)]"
                  style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit" }}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>Innhold</label>
                <textarea
                  value={p.content}
                  onChange={(e) => update(p.slug, "content", e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none resize-none focus:border-[var(--blue)]"
                  style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit" }}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-4 mt-2">
        <button onClick={add} className="px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border transition-colors hover:bg-[var(--blue-lt)]" style={{ borderColor: "var(--faint)", color: "var(--blue)" }}>
          + Nytt innlegg
        </button>
        <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-full text-[0.88rem] font-bold text-white disabled:opacity-60" style={{ background: "var(--blue)", fontFamily: "inherit" }}>
          {saving ? "Lagrer…" : "Lagre alle"}
        </button>
        {msg && <span className={`text-[0.82rem] font-medium ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.ok ? "✓" : "✕"} {msg.text}</span>}
      </div>
    </div>
  );
}
