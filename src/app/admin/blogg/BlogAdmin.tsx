"use client";

import { useState } from "react";
import { savePostsAction } from "./actions";
import { saveCategoriesAction } from "./categoryActions";
import { generateImageAction } from "./imageActions";
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
  category: "",
  status: "draft",
  publishDate: new Date().toISOString().slice(0, 10),
  publishTime: "10:00",
  visible: true,
  metaTitle: "",
  metaDescription: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Kladd", color: "#e5e7eb" },
  scheduled: { label: "Planlagt", color: "#fef3c7" },
  published: { label: "Publisert", color: "#d1fae5" },
  hidden: { label: "Skjult", color: "#fee2e2" },
};

export default function BlogAdmin({ initial, categories: initialCategories }: { initial: BlogPost[]; categories: string[] }) {
  const [items, setItems] = useState(initial);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text?: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [previews, setPreviews] = useState<Record<string, string>>(
    initial.reduce((acc, p) => ({ ...acc, [p.slug]: p.imageUrl || "" }), {})
  );
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/save-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      const data = await res.json();
      setMsg(data.success ? { ok: true, text: "Lagret!" } : { ok: false, text: data.error ?? "Ukjent feil" });
    } catch (e) {
      setMsg({ ok: false, text: `Feil: ${e instanceof Error ? e.message : String(e)}` });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const saveCategories = async () => {
    const res = await saveCategoriesAction(categories);
    setMsg(res.success ? { ok: true, text: "Kategorier lagret" } : { ok: false, text: res.error });
    setTimeout(() => setMsg(null), 3000);
  };

  const addCategory = async () => {
    const value = newCategory.trim();
    if (!value) return;
    const next = Array.from(new Set([...categories, value]));
    setCategories(next);
    setNewCategory("");
    await saveCategories();
  };

  const removeCategory = async (category: string) => {
    const next = categories.filter((c) => c !== category);
    setCategories(next);
    // Ikke fjern kategori fra eksisterende innlegg automatisk; la admin gjøre det med status.
    await saveCategories();
  };

  const generateImage = async () => {
    if (!imagePrompt.trim()) return;
    setGeneratingImage(true);
    const res = await generateImageAction(imagePrompt);
    setGeneratingImage(false);
    if (res.success && res.url) {
      setMsg({ ok: true, text: `Bilde generert: ${res.url}` });
      setImagePrompt(""); // Tøm prompt etter suksess
      // Kan legge til logikk for å sette som imageUrl for et innlegg her senere
    } else {
      setMsg({ ok: false, text: res.error || "Feil ved generering" });
    }
    setTimeout(() => setMsg(null), 5000); // Lengre tid for å se URL
  };

  const update = (slug: string, field: keyof BlogPost, value: unknown) => {
    setItems((prev) =>
      prev.map((p) =>
        p.slug === slug ? { ...p, [field]: value, updatedAt: new Date().toISOString() } : p
      )
    );
  };

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

  // Filtrering
  const filteredItems = items.filter((p) => {
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Søk og filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Søk etter tittel, slug eller kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
            style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
            style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
          >
            <option value="all">Alle statuser</option>
            <option value="draft">Kladd</option>
            <option value="scheduled">Planlagt</option>
            <option value="published">Publisert</option>
            <option value="hidden">Skjult</option>
          </select>
        </div>
        <button
          onClick={add}
          className="px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border transition-colors hover:bg-[var(--blue-lt)]"
          style={{ borderColor: "var(--faint)", color: "var(--blue)" }}
        >
          + Nytt innlegg
        </button>
      </div>

      {/* Kategori-styring */}
      <div className="rounded-[12px] border p-4" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <label className="text-[0.85rem] font-semibold" style={{ color: "var(--ink)" }}>
            Kategorier
          </label>
          <span className="text-[0.72rem]" style={{ color: "var(--mid)" }}>
            (Velg kategori i hvert innlegg og legg til nye her)
          </span>
        </div>

        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Ny kategori"
            className="flex-1 px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
            style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
          />
          <button
            onClick={addCategory}
            className="px-3 py-2 rounded-[8px] font-semibold text-white"
            style={{ background: "var(--blue)" }}
          >
            Legg til kategori
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <span className="text-[0.8rem]" style={{ color: "var(--mid)" }}>Ingen kategorier enda.</span>
          ) : (
            categories.map((category) => (
              <span key={category} className="px-2.5 py-1.5 rounded-full border text-[0.75rem] flex items-center gap-2" style={{ borderColor: "var(--faint)", background: "var(--bg)" }}>
                {category}
                <button
                  onClick={() => removeCategory(category)}
                  className="text-xs text-red-600 font-bold"
                  aria-label={`Fjern kategori ${category}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Bildegenerator */}
      <div className="rounded-[12px] border p-4" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <label className="text-[0.85rem] font-semibold" style={{ color: "var(--ink)" }}>
            Bildegenerator (OpenAI DALL-E)
          </label>
          <span className="text-[0.72rem]" style={{ color: "var(--mid)" }}>
            (Generer bilder basert på tekstbeskrivelse)
          </span>
        </div>

        <div className="space-y-3">
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Beskriv bildet du vil generere, f.eks. 'En moderne webutvikler som koder ved et skrivebord med en laptop og kaffe'"
            className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)] resize-none"
            style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
            rows={3}
          />
          <button
            onClick={generateImage}
            disabled={generatingImage || !imagePrompt.trim()}
            className="px-4 py-2 rounded-[8px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--blue)" }}
          >
            {generatingImage ? "Genererer…" : "Generer bilde"}
          </button>
          <p className="text-[0.7rem]" style={{ color: "var(--mid)" }}>
            Bruker OpenAI DALL-E 3. Bildet lastes opp automatisk til ditt galleri. Kostnad: ~$0.08 per bilde.
          </p>
        </div>
      </div>

      {/* Innlegg liste */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div style={{ color: "var(--mid)", textAlign: "center", padding: "2rem" }}>
            Ingen innlegg funnet
          </div>
        ) : (
          filteredItems.map((p) => (
            <div
              key={p.slug}
              className="rounded-[12px] border overflow-hidden"
              style={{ background: "var(--white)", borderColor: "var(--faint)" }}
            >
              {/* Header med oversikt */}
              <div className="flex items-center justify-between px-5 py-3 gap-3 flex-wrap">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center min-w-0">
                  {/* Tittel */}
                  <div className="sm:col-span-2 min-w-0">
                    <div className="font-semibold truncate" style={{ color: "var(--ink)" }}>
                      {p.title || <em style={{ color: "var(--mid)" }}>Nytt innlegg</em>}
                    </div>
                    <div className="text-[0.72rem] truncate" style={{ color: "var(--mid)" }}>
                      {p.slug}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="hidden sm:block">
                    <span
                      className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full inline-block"
                      style={{ background: STATUS_LABELS[p.status]?.color || STATUS_LABELS.draft.color }}
                    >
                      {STATUS_LABELS[p.status]?.label || "Unknown"}
                    </span>
                  </div>

                  {/* Kategori */}
                  <div className="hidden sm:block text-[0.75rem]" style={{ color: "var(--mid)" }}>
                    {p.category || "—"}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {/* Synlig toggle */}
                  <button
                    onClick={() => update(p.slug, "visible", !p.visible)}
                    className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full border transition-colors"
                    style={{
                      borderColor: p.visible ? "var(--blue)" : "var(--faint)",
                      background: p.visible ? "var(--blue-lt)" : "var(--bg)",
                      color: p.visible ? "var(--blue)" : "var(--mid)",
                    }}
                  >
                    {p.visible ? "✓" : "✕"}
                  </button>

                  {/* Rediger */}
                  <button
                    onClick={() => setEditingSlug(editingSlug === p.slug ? null : p.slug)}
                    className="text-[0.75rem] font-semibold px-3 py-1.5 rounded-[6px]"
                    style={{ background: "var(--blue-lt)", color: "var(--blue)" }}
                  >
                    {editingSlug === p.slug ? "Lukk" : "Rediger"}
                  </button>

                  {/* Slett */}
                  <button
                    onClick={() => remove(p.slug)}
                    className="text-[0.75rem] font-semibold px-3 py-1.5 rounded-[6px]"
                    style={{ background: "#fef2f2", color: "#dc2626" }}
                  >
                    Slett
                  </button>
                </div>
              </div>

              {/* Redigeringsform */}
              {editingSlug === p.slug && (
                <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: "var(--faint)" }}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* BILDE */}
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
                        JPG, PNG eller WebP. Anbefalt: 800×500px for beste kvalitet og lastetid.
                        <br />
                        Bruk JPG for foto, PNG for grafikk med gjennomsiktighet, WebP for moderne nettlesere.
                      </p>
                    </div>

                    {/* BASISKUNNSKAP */}
                    <div>
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Tittel
                      </label>
                      <input
                        value={p.title}
                        onChange={(e) => update(p.slug, "title", e.target.value)}
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Slug (URL)
                      </label>
                      <input
                        value={p.slug}
                        onChange={(e) => update(p.slug, "slug", e.target.value)}
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Kategori
                      </label>
                      <select
                        value={p.category}
                        onChange={(e) => update(p.slug, "category", e.target.value)}
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      >
                        <option value="">— Velg kategori —</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Tags (komma-separert)
                      </label>
                      <input
                        value={p.tags.join(", ")}
                        onChange={(e) =>
                          update(
                            p.slug,
                            "tags",
                            e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      />
                    </div>

                    {/* PUBLISERING */}
                    <div className="sm:col-span-2 border-t pt-4" style={{ borderColor: "var(--faint)" }}>
                      <h3 className="text-[0.85rem] font-semibold mb-3" style={{ color: "var(--ink)" }}>
                        Publisering
                      </h3>
                    </div>

                    <div>
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Status
                      </label>
                      <select
                        value={p.status}
                        onChange={(e) =>
                          update(p.slug, "status", e.target.value as "draft" | "scheduled" | "published" | "hidden")
                        }
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      >
                        <option value="draft">Kladd</option>
                        <option value="scheduled">Planlagt</option>
                        <option value="published">Publisert</option>
                        <option value="hidden">Skjult</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Publiseringsdato
                      </label>
                      <input
                        type="date"
                        value={p.publishDate}
                        onChange={(e) => update(p.slug, "publishDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Publiseringstidspunkt
                      </label>
                      <input
                        type="time"
                        value={p.publishTime || "10:00"}
                        onChange={(e) => update(p.slug, "publishTime", e.target.value)}
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.visible}
                          onChange={(e) => update(p.slug, "visible", e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-[0.72rem] font-semibold" style={{ color: "var(--mid)" }}>
                          Synlig på nettsiden
                        </span>
                      </label>
                    </div>

                    {/* INNHOLD */}
                    <div className="sm:col-span-2 border-t pt-4" style={{ borderColor: "var(--faint)" }}>
                      <h3 className="text-[0.85rem] font-semibold mb-3" style={{ color: "var(--ink)" }}>
                        Innhold
                      </h3>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Ingress
                      </label>
                      <textarea
                        value={p.excerpt}
                        onChange={(e) => update(p.slug, "excerpt", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none resize-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Hovedinnhold
                      </label>
                      <textarea
                        value={p.content}
                        onChange={(e) => update(p.slug, "content", e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none resize-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      />
                    </div>

                    {/* SEO */}
                    <div className="sm:col-span-2 border-t pt-4" style={{ borderColor: "var(--faint)" }}>
                      <h3 className="text-[0.85rem] font-semibold mb-3" style={{ color: "var(--ink)" }}>
                        SEO
                      </h3>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Meta Title
                      </label>
                      <input
                        value={p.metaTitle || ""}
                        onChange={(e) => update(p.slug, "metaTitle", e.target.value)}
                        placeholder={p.title}
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      />
                      <p className="text-[0.7rem] mt-1" style={{ color: "var(--mid)" }}>
                        La stå tomt = bruker tittel
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[0.72rem] font-semibold mb-1" style={{ color: "var(--mid)" }}>
                        Meta Description
                      </label>
                      <textarea
                        value={p.metaDescription || ""}
                        onChange={(e) => update(p.slug, "metaDescription", e.target.value)}
                        placeholder={p.excerpt}
                        rows={2}
                        className="w-full px-3 py-2 rounded-[8px] border text-[0.85rem] outline-none resize-none focus:border-[var(--blue)]"
                        style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)" }}
                      />
                      <p className="text-[0.7rem] mt-1" style={{ color: "var(--mid)" }}>
                        La stå tomt = bruker ingress. Max 160 tegn.
                      </p>
                    </div>

                    {/* METADATA */}
                    <div className="sm:col-span-2 border-t pt-4 text-[0.7rem]" style={{ borderColor: "var(--faint)", color: "var(--mid)" }}>
                      <div>
                        Opprettet: {new Date(p.createdAt).toLocaleDateString("no-NO")}
                      </div>
                      <div>
                        Oppdatert: {new Date(p.updatedAt).toLocaleDateString("no-NO")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lagre-knapp */}
      <div className="flex items-center gap-4 sticky bottom-0 bg-white pt-4 border-t" style={{ borderColor: "var(--faint)" }}>
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 rounded-full text-[0.88rem] font-bold text-white disabled:opacity-60"
          style={{ background: "var(--blue)", fontFamily: "inherit" }}
        >
          {saving ? "Lagrer…" : "Lagre alle endringer"}
        </button>
        {msg && (
          <span className={`text-[0.82rem] font-medium ${msg.ok ? "text-green-600" : "text-red-600"}`}>
            {msg.ok ? "✓" : "✕"} {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
