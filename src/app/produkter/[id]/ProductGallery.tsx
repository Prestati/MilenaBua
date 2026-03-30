"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  mainImage: string;
  gallery?: string[];
  name: string;
}

export default function ProductGallery({ mainImage, gallery = [], name }: Props) {
  const all = [mainImage, ...gallery].filter(Boolean);
  const [current, setCurrent] = useState(0);

  if (all.length === 0) {
    return (
      <div style={{
        width: "100%", aspectRatio: "1", borderRadius: 20,
        background: "var(--blue-lt)", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 56,
      }}>
        📦
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div style={{ position: "relative", width: "100%", paddingTop: "100%", borderRadius: 20, overflow: "hidden", marginBottom: 12, boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <Image
          src={all[current]}
          alt={name}
          fill
          priority={current === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Thumbnails — only shown when multiple images */}
      {all.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {all.map((url, i) => (
            <button
              key={`${url}-${i}`}
              onClick={() => setCurrent(i)}
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                overflow: "hidden",
                border: i === current
                  ? "2px solid var(--blue)"
                  : "2px solid var(--faint)",
                padding: 0,
                cursor: "pointer",
                flexShrink: 0,
                background: "none",
                transition: "border-color 0.15s",
              }}
            >
              <img
                src={url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
