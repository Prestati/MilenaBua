import { readContent } from "@/lib/content";
import AboutAdmin from "./AboutAdmin";
import Link from "next/link";

export default function OmMegAdminPage() {
  const data = readContent("about.json");
  return (
    <div style={{ padding: "32px 40px", maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>Om meg-siden</h1>
        <Link href="/om-meg" target="_blank"
          style={{ fontSize: "0.75rem", color: "var(--blue)", fontWeight: 600, textDecoration: "none", padding: "3px 10px", borderRadius: 6, background: "var(--blue-lt)" }}>
          Se side →
        </Link>
      </div>
      <p style={{ fontSize: "0.88rem", color: "var(--mid)", marginBottom: 28 }}>Rediger innholdet på om meg-siden.</p>
      <AboutAdmin initial={data as Parameters<typeof AboutAdmin>[0]["initial"]} />
    </div>
  );
}
