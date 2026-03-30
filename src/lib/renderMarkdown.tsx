import React from "react";

/** Parses inline **bold** and *italic* markdown into React elements. */
function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

type Segment =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; items: string[] };

/**
 * Renders markdown with **bold**, *italic* and - bullet lists.
 * Blank lines separate blocks. Lines starting with "- " become <ul><li>.
 */
export function renderMarkdown(text: string, className?: string) {
  if (!text?.trim()) return null;

  const lines = text.split("\n");
  const segments: Segment[] = [];
  let current: Segment | null = null;

  for (const line of lines) {
    if (line.startsWith("- ")) {
      if (current?.type === "list") {
        current.items.push(line.slice(2));
      } else {
        current = { type: "list", items: [line.slice(2)] };
        segments.push(current);
      }
    } else if (line.trim() === "") {
      current = null;
    } else {
      if (current?.type === "paragraph") {
        current.lines.push(line);
      } else {
        current = { type: "paragraph", lines: [line] };
        segments.push(current);
      }
    }
  }

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "list") {
          return (
            <ul key={i} style={{ paddingLeft: "1.4rem", margin: "0 0 12px" }}>
              {seg.items.map((item, j) => (
                <li key={j} style={{ marginBottom: 4 }}>
                  {parseInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        const content = seg.lines.flatMap((line, j) => [
          ...parseInline(line),
          j < seg.lines.length - 1 ? <br key={`br-${j}`} /> : null,
        ]).filter(Boolean);

        return (
          <p key={i} className={className} style={{ margin: "0 0 12px" }}>
            {content}
          </p>
        );
      })}
    </>
  );
}
