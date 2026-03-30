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

/** Extracts YouTube video ID from a URL, or null if not a YouTube URL. */
function extractYouTubeId(line: string): string | null {
  const t = line.trim();
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) return m[1];
  }
  return null;
}

type Segment =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; items: string[] }
  | { type: "youtube"; videoId: string };

/**
 * Renders markdown with **bold**, *italic*, - bullet lists, and YouTube embeds.
 * Paste a YouTube URL on its own line to embed a video.
 * Blank lines separate blocks. Lines starting with "- " become <ul><li>.
 */
export function renderMarkdown(text: string, className?: string) {
  if (!text?.trim()) return null;

  const lines = text.split("\n");
  const segments: Segment[] = [];
  let current: Segment | null = null;

  for (const line of lines) {
    const ytId = extractYouTubeId(line);
    if (ytId) {
      current = null;
      segments.push({ type: "youtube", videoId: ytId });
    } else if (line.startsWith("- ")) {
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
        if (seg.type === "youtube") {
          return (
            <div
              key={i}
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
                borderRadius: 12,
                margin: "0 0 20px",
                background: "#000",
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${seg.videoId}`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          );
        }

        if (seg.type === "list") {
          return (
            <ul key={i} style={{ paddingLeft: "1.4rem", margin: "0 0 12px", listStyleType: "disc" }}>
              {seg.items.map((item, j) => (
                <li key={j} style={{ marginBottom: 4 }}>
                  {parseInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        const content = seg.lines
          .flatMap((line, j) => [
            ...parseInline(line),
            j < seg.lines.length - 1 ? <br key={`br-${j}`} /> : null,
          ])
          .filter(Boolean);

        return (
          <p key={i} className={className} style={{ margin: "0 0 12px" }}>
            {content}
          </p>
        );
      })}
    </>
  );
}
