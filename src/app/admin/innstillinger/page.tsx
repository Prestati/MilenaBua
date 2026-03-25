import { readContent } from "@/lib/content";
import SocialsAdmin from "./SocialsAdmin";

interface Social { label: string; href: string; }

export default function InnstillingerPage() {
  const socials = readContent<Social[]>("socials.json");
  return (
    <div style={{ padding: "32px 40px", maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Sosiale medier
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--mid)" }}>
          Lenker som vises i bunnteksten på alle sider. Tomme lenker skjules automatisk.
        </p>
      </div>
      <SocialsAdmin initial={socials} />
    </div>
  );
}
