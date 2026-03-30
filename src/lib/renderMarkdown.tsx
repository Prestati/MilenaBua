import React from "react";

/** Parses inline **bold** and *italic* markdown into React elements. */
function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

/**
 * Renders a markdown string with **bold** and *italic* support.
 * Splits on blank lines to create paragraphs.
 */
export function renderMarkdown(text: string, className?: string) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <>
      {paragraphs.map((para, i) => {
        // Handle single newlines within a paragraph as <br>
        const lines = para.split("\n");
        const content = lines.flatMap((line, j) => [
          ...parseInline(line),
          j < lines.length - 1 ? <br key={`br-${j}`} /> : null,
        ]).filter(Boolean);

        return (
          <p key={i} className={className}>
            {content}
          </p>
        );
      })}
    </>
  );
}
