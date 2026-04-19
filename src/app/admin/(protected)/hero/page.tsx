import { readContent } from "@/lib/content";
import HeroForm from "./HeroForm";

interface HeroData {
  badge: string;
  h1Line1: string;
  h1Highlight: string;
  h1Line2: string;
  description: string;
  primaryBtn: string;
  secondaryBtn: string;
  imageUrl: string;
}

export default async function AdminHeroPage() {
  const data = await readContent<HeroData>("hero.json");

  return (
    <div className="p-8">
      <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
        Forside
      </h1>
      <p className="text-[0.85rem] mb-8" style={{ color: "var(--mid)" }}>
        Rediger tekst og bilde øverst på siden.
      </p>
      <HeroForm data={data} />
    </div>
  );
}
