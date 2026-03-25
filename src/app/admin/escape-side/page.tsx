import { readContent } from "@/lib/content";
import EscapePageAdmin from "./EscapePageAdmin";
import Link from "next/link";

export default function EscapeSideAdminPage() {
  const data = readContent("escape-page.json");

  return (
    <div style={{ padding: "32px 40px", maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Escape Haugesund — prosjektside
          </h1>
          <Link
            href="/escape-haugesund"
            target="_blank"
            style={{
              fontSize: "0.75rem",
              color: "var(--blue)",
              fontWeight: 600,
              textDecoration: "none",
              padding: "3px 10px",
              borderRadius: 6,
              background: "var(--blue-lt)",
            }}
          >
            Se side →
          </Link>
        </div>
        <p style={{ fontSize: "0.88rem", color: "var(--mid)" }}>
          Rediger KPI-er, månedlige oppdateringer og innhold på prosjektsiden. Skjulte måneder vises ikke på siden.
        </p>
      </div>
      <EscapePageAdmin initial={data as Parameters<typeof EscapePageAdmin>[0]["initial"]} />
    </div>
  );
}
