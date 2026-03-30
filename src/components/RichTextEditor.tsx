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

  const insertList = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start === end) {
      // Ingen markering — legg til nytt punkt på ny linje
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
      // Markering — sett "- " foran hver linje
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

          // Enter på en "- "-linje → fortsett listen automatisk
          if (e.key === "Enter") {
            const el = ref.current!;
            const pos = el.selectionStart;
            const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
            const currentLine = value.slice(lineStart, pos);
            if (currentLine === "- ") {
              // Tom listepunkt → avslutt listen
              e.preventDefault();
              const newValue = value.slice(0, lineStart) + "\n" + value.slice(pos);
              onChange(newValue);
              requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = lineStart + 1;
              });
            } else if (currentLine.startsWith("- ")) {
              // Fortsett listen
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
        <strong>B</strong> fet · <strong>I</strong> kursiv · <strong>• Liste</strong> punktliste · Enter fortsetter listen, dobbelt Enter avslutter
      </p>
    </div>
  );
}
