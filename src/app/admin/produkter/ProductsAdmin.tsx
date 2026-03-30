"use client";

import { useState, useRef, useCallback } from "react";
import { saveProductsAction, uploadProductImageAction, saveShopAction } from "./actions";
import type { Product } from "@/types";

const empty = (): Product => ({
  id: Date.now().toString(),
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  category: "",
  inStock: true,
  type: "pdf",
  buyUrl: "",
  pageContent: "",
});

const input = {
  width: "100%", padding: "8px 12px", borderRadius: 8,
  border: "1px solid var(--faint)", background: "var(--bg)",
  color: "var(--ink)", fontSize: "0.85rem", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box" as const,
};

export default function ProductsAdmin({ initial, initialShopDesc }: { initial: Product[]; initialShopDesc: string }) {
  const [items, setItems] = useState(initial);
  const [shopDesc, setShopDesc] = useState(initialShopDesc);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text?: string } | null>(null);
  const [shopMsg, setShopMsg] = useState<{ ok?: boolean; text?: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pdfRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const save = async () => {
    setSaving(true);
    const res = await saveProductsAction(items);
    setSaving(false);
    setMsg(res.success ? { ok: true, text: "Lagret!" } : { ok: false, text: res.error });
    setTimeout(() => setMsg(null), 3000);
  };

  const saveShop = async () => {
    const res = await saveShopAction({ description: shopDesc });
    setShopMsg(res.success ? { ok: true, text: "Lagret!" } : { ok: false, text: res.error });
    setTimeout(() => setShopMsg(null), 3000);
  };

  const update = (id: string, field: keyof Product, value: unknown) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

  const toggleVisible = async (id: string, current: boolean | undefined) => {
    const newValue = current === false ? true : false;
    const updated = items.map((p) => (p.id === id ? { ...p, visible: newValue } : p));
    setItems(updated);
    const res = await saveProductsAction(updated);
    if (res.error) {
      setMsg({ ok: false, text: `Kunne ikke lagre: ${res.error}` });
    } else {
      setMsg({ ok: true, text: "Lagret!" });
      setTimeout(() => setMsg(null), 2000);
    }
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const add = () => {
    const p = empty();
    setItems((prev) => [...prev, p]);
    setEditingId(p.id);
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploading(id);
    const fd = new FormData();
    fd.append("image", file);
    const res = await uploadProductImageAction(null, fd);
    setUploading(null);
    if (res.url) update(id, "imageUrl", res.url);
  };

  const handlePdfUpload = async (id: string, file: File) => {
    setUploadingPdf(id);
    const fd = new FormData();
    fd.append("pdf", file);
    fd.append("productId", id);
    const res = await fetch("/api/admin/upload-pdf", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingPdf(null);
    if (data.url) {
      update(id, "file_url", data.url);
      setMsg({ ok: true, text: "PDF lastet opp! Husk å trykke Lagre." });
      setTimeout(() => setMsg(null), 4000);
    } else {
      setMsg({ ok: false, text: data.error ?? "PDF-opplasting feilet" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Butikkbeskrivelse */}
      <div className="rounded-[12px] border p-5" style={{ background: "var(--white)", borderColor: "var(--faint)" }}>
        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 6 }}>
          Beskrivelse under «Butikk»-overskriften
        </label>
        <textarea
          style={{ ...input, resize: "vertical", minHeight: 72 }}
          rows={3}
          value={shopDesc}
          onChange={(e) => setShopDesc(e.target.value)}
        />
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <button onClick={saveShop}
            style={{ padding: "8px 20px", borderRadius: 20, border: "none", background: "var(--blue)", color: "white", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Lagre beskrivelse
          </button>
          {shopMsg && <span style={{ fontSize: "0.82rem", color: shopMsg.ok ? "#16a34a" : "#dc2626" }}>{shopMsg.ok ? "✓" : "✕"} {shopMsg.text}</span>}
        </div>
      </div>

      {items.map((p) => (
        <div key={p.id} className="rounded-[12px] border overflow-hidden"
          style={{ background: "var(--white)", borderColor: "var(--faint)" }}>

          {/* Header row */}
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              {p.imageUrl && (
                <img src={p.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
              )}
              <span className="text-[0.65rem] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded"
                style={p.type === "pdf"
                  ? { background: "var(--blue-lt)", color: "var(--blue)" }
                  : { background: "var(--orange-lt)", color: "var(--orange)" }}>
                {p.type === "pdf" ? "PDF" : "Fysisk"}
              </span>
              <span className="text-[0.9rem] font-semibold" style={{ color: "var(--ink)" }}>
                {p.name || <em style={{ color: "var(--mid)" }}>Nytt produkt</em>}
              </span>
              <span className="text-[0.85rem] font-bold" style={{ color: "var(--mid)" }}>{p.price} kr</span>
            </div>
            <div className="flex gap-2 items-center">
              {/* Aktiv/inaktiv toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
                <div
                  onClick={() => toggleVisible(p.id, p.visible)}
                  style={{
                    width: 36, height: 20, borderRadius: 10, position: "relative", cursor: "pointer",
                    background: p.visible === false ? "#e5e7eb" : "var(--blue)",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}>
                  <div style={{
                    position: "absolute", top: 2, left: p.visible === false ? 2 : 18,
                    width: 16, height: 16, borderRadius: "50%", background: "white",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: p.visible === false ? "var(--mid)" : "var(--ink)" }}>
                  {p.visible === false ? "Inaktiv" : "Aktiv"}
                </span>
              </label>
              <div style={{ width: 1, height: 20, background: "var(--faint)" }} />
              <a href={`/produkter/${p.id}`} target="_blank"
                style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", textDecoration: "none", padding: "4px 10px", borderRadius: 6, border: "1px solid var(--faint)" }}>
                Se side ↗
              </a>
              <button onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                className="text-[0.75rem] font-semibold px-3 py-1.5 rounded-[6px] transition-colors"
                style={{ background: "var(--blue-lt)", color: "var(--blue)" }}>
                {editingId === p.id ? "Lukk" : "Rediger"}
              </button>
              <button onClick={() => remove(p.id)}
                className="text-[0.75rem] font-semibold px-3 py-1.5 rounded-[6px]"
                style={{ background: "#fef2f2", color: "#dc2626" }}>
                Slett
              </button>
            </div>
          </div>

          {/* Edit form */}
          {editingId === p.id && (
            <div className="px-5 pb-5 pt-3 border-t flex flex-col gap-4" style={{ borderColor: "var(--faint)" }}>

              {/* Image upload */}
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 8 }}>
                  Produktbilde (vises på kortet og produktsiden)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", border: "1px solid var(--faint)" }} />
                  )}
                  <div>
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      ref={(el) => { fileRefs.current[p.id] = el; }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(p.id, f); }} />
                    <button onClick={() => fileRefs.current[p.id]?.click()}
                      disabled={uploading === p.id}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--faint)", background: "var(--white)", color: "var(--ink)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {uploading === p.id ? "Laster opp…" : p.imageUrl ? "Bytt bilde" : "Last opp bilde"}
                    </button>
                    {p.imageUrl && (
                      <button onClick={() => update(p.id, "imageUrl", "")}
                        style={{ marginLeft: 8, padding: "8px 10px", borderRadius: 8, border: "none", background: "#fef2f2", color: "#dc2626", fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit" }}>
                        Fjern
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* PDF upload — kun for digitale produkter */}
              {p.type === "pdf" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 8 }}>
                    PDF-fil (sendes til kunden etter kjøp)
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {p.file_url && (
                      <a href={p.file_url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "0.78rem", color: "var(--blue)", textDecoration: "none", padding: "6px 12px", borderRadius: 6, border: "1px solid var(--blue-lt)", background: "var(--blue-lt)" }}>
                        📄 Vis gjeldende PDF ↗
                      </a>
                    )}
                    <input type="file" accept="application/pdf" style={{ display: "none" }}
                      ref={(el) => { pdfRefs.current[p.id] = el; }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(p.id, f); }} />
                    <button onClick={() => pdfRefs.current[p.id]?.click()}
                      disabled={uploadingPdf === p.id}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--faint)", background: "var(--white)", color: "var(--ink)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {uploadingPdf === p.id ? "Laster opp…" : p.file_url ? "Bytt PDF" : "Last opp PDF"}
                    </button>
                    {p.file_url && (
                      <button onClick={() => update(p.id, "file_url", "")}
                        style={{ padding: "8px 10px", borderRadius: 8, border: "none", background: "#fef2f2", color: "#dc2626", fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit" }}>
                        Fjern
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  ["name", "Navn", "text"],
                  ["category", "Kategori", "text"],
                  ["price", "Pris (kr)", "number"],
                  ["buyUrl", "Stripe / kjøpslenke", "url"],
                ] as const).map(([field, label, type]) => (
                  <div key={field}>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 4 }}>{label}</label>
                    <input type={type}
                      value={(p as unknown as Record<string, unknown>)[field] as string}
                      onChange={(e) => update(p.id, field, type === "number" ? Number(e.target.value) : e.target.value)}
                      style={input} />
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 4 }}>Kortbeskrivelse (vises på kortet)</label>
                <textarea value={p.description} onChange={(e) => update(p.id, "description", e.target.value)}
                  rows={2} style={{ ...input, resize: "vertical" as const }} />
              </div>

              {/* Page content */}
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 4 }}>
                  Utfyllende beskrivelse (vises på produktsiden)
                </label>
                <textarea value={p.pageContent ?? ""} onChange={(e) => update(p.id, "pageContent", e.target.value)}
                  rows={5} placeholder={"Skriv mer om produktet her. Hvert avsnitt skilles med linjeskift."}
                  style={{ ...input, resize: "vertical" as const }} />
              </div>

              {/* Type + stock */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--mid)", marginBottom: 4 }}>Type</label>
                  <select value={p.type} onChange={(e) => update(p.id, "type", e.target.value as "pdf" | "physical")}
                    style={{ ...input, width: "auto" }}>
                    <option value="pdf">PDF / Digital</option>
                    <option value="physical">Fysisk / Post</option>
                  </select>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", fontWeight: 600, color: "var(--mid)", cursor: "pointer", marginTop: 18 }}>
                  <input type="checkbox" checked={p.inStock}
                    onChange={(e) => update(p.id, "inStock", e.target.checked)} className="w-4 h-4 rounded" />
                  På lager
                </label>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-4 mt-2">
        <button onClick={add}
          className="px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border transition-colors hover:bg-[var(--blue-lt)]"
          style={{ borderColor: "var(--faint)", color: "var(--blue)" }}>
          + Legg til produkt
        </button>
        <button onClick={save} disabled={saving}
          className="px-6 py-2.5 rounded-full text-[0.88rem] font-bold text-white disabled:opacity-60"
          style={{ background: "var(--blue)", fontFamily: "inherit" }}>
          {saving ? "Lagrer…" : "Lagre alle"}
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
