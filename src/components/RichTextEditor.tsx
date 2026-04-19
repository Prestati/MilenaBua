"use client";
import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, rows = 6, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const wrap = (marker: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + marker + selected + marker + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.selectionStart = start + marker.length;
      el.selectionEnd = end + marker.length;
      el.focus();
    });
  };

  const insertAtCursor = (text: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const before = value.slice(0, start);
    const after = value.slice(start);
    const prefix = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    const suffix = after.startsWith("\n") ? "" : "\n\n";
    const newValue = before + prefix + text + suffix + after;
    onChange(newValue);
    requestAnimationFrame(() => {
      const pos = before.length + prefix.length + text.length + suffix.length;
      el.selectionStart = el.selectionEnd = pos;
      el.focus();
    });
  };

  const insertList = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start === end) {
      const before = value.slice(0, start);
      const after = value.slice(start);
      const prefix = before.length === 0 || before.endsWith("\n") ? "- " : "\n- ";
      const newValue = before + prefix + after;
      onChange(newValue);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + prefix.length;
        el.focus();
      });
    } else {
      const selected = value.slice(start, end);
      const prefixed = selected
        .split("\n")
        .map((l) => (l.startsWith("- ") ? l : "- " + l))
        .join("\n");
      const newValue = value.slice(0, start) + prefixed + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        el.selectionStart = start;
        el.selectionEnd = start + prefixed.length;
        el.focus();
      });
    }
  };

  const compressImage = (file: File, maxWidth = 1200, quality = 0.85): Promise<File> =>
    new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file),
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });

  const handleImageUpload = async (file: File) => {
    setUploadingImg(true);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append("image", compressed);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        insertAtCursor(`![](${data.url})`);
      }
    } finally {
      setUploadingImg(false);
    }
  };

  const btnStyle = {
    padding: "3px 9px",
    borderRadius: 5,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "0.85rem",
    color: "var(--ink)",
    fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        gap: 2,
        padding: "4px 6px",
        background: "var(--bg)",
        border: "1px solid var(--faint)",
        borderBottom: "none",
        borderRadius: "8px 8px 0 0",
        flexWrap: "wrap",
      }}>
        <button type="button" title="Fet skrift (Ctrl+B)"
          onMouseDown={(e) => { e.preventDefault(); wrap("**"); }}
          style={{ ...btnStyle, fontWeight: 700 }}>
          B
        </button>
        <button type="button" title="Kursiv (Ctrl+I)"
          onMouseDown={(e) => { e.preventDefault(); wrap("*"); }}
          style={{ ...btnStyle, fontStyle: "italic" }}>
          I
        </button>
        <div style={{ width: 1, background: "var(--faint)", margin: "4px 4px" }} />
        <button type="button" title="Punktliste"
          onMouseDown={(e) => { e.preventDefault(); insertList(); }}
          style={{ ...btnStyle, letterSpacing: "0.02em" }}>
          • Liste
        </button>
        <div style={{ width: 1, background: "var(--faint)", margin: "4px 4px" }} />
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { handleImageUpload(f); e.target.value = ""; }
          }}
        />
        <button
          type="button"
          title="Sett inn bilde"
          disabled={uploadingImg}
          onMouseDown={(e) => { e.preventDefault(); imgInputRef.current?.click(); }}
          style={{ ...btnStyle, opacity: uploadingImg ? 0.5 : 1, color: "var(--blue)" }}>
          {uploadingImg ? "Laster…" : "📷 Bilde"}
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "0 0 8px 8px",
          border: "1px solid var(--faint)",
          background: "var(--white)",
          color: "var(--ink)",
          fontSize: "0.85rem",
          fontFamily: "inherit",
          lineHeight: 1.6,
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); wrap("**"); }
          if ((e.ctrlKey || e.metaKey) && e.key === "i") { e.preventDefault(); wrap("*"); }

          if (e.key === "Enter") {
            const el = ref.current!;
            const pos = el.selectionStart;
            const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
            const currentLine = value.slice(lineStart, pos);
            if (currentLine === "- ") {
              e.preventDefault();
              const newValue = value.slice(0, lineStart) + "\n" + value.slice(pos);
              onChange(newValue);
              requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = lineStart + 1;
              });
            } else if (currentLine.startsWith("- ")) {
              e.preventDefault();
              const newValue = value.slice(0, pos) + "\n- " + value.slice(pos);
              onChange(newValue);
              requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = pos + 3;
              });
            }
          }
        }}
      />
      <p style={{ fontSize: "0.7rem", color: "var(--mid)", marginTop: 4 }}>
        <strong>B</strong> fet · <strong>I</strong> kursiv · <strong>• Liste</strong> punktliste · <strong>📷 Bilde</strong> setter inn bilde · Lim inn YouTube-lenke på egen linje (dobbelt Enter) for video
      </p>
    </div>
  );
}
