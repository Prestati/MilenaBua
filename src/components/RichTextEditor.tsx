"use client";
import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, rows = 6, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

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
      }}>
        <button
          type="button"
          title="Fet skrift (Ctrl+B)"
          onMouseDown={(e) => { e.preventDefault(); wrap("**"); }}
          style={{
            padding: "3px 9px",
            borderRadius: 5,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "var(--ink)",
            fontFamily: "inherit",
          }}
        >
          B
        </button>
        <button
          type="button"
          title="Kursiv (Ctrl+I)"
          onMouseDown={(e) => { e.preventDefault(); wrap("*"); }}
          style={{
            padding: "3px 9px",
            borderRadius: 5,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontStyle: "italic",
            fontSize: "0.85rem",
            color: "var(--ink)",
            fontFamily: "inherit",
          }}
        >
          I
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
        }}
      />
      <p style={{ fontSize: "0.7rem", color: "var(--mid)", marginTop: 4 }}>
        Marker tekst og trykk <strong>B</strong> for fet, <strong>I</strong> for kursiv. Eller bruk Ctrl+B / Ctrl+I.
      </p>
    </div>
  );
}
