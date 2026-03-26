import { readContent } from "@/lib/content";
import EscapeForm from "./EscapeForm";

interface EscapeData {
  tag: string; heading: string; headingAccent: string; description: string;
  goalLabel: string; goalText: string; primaryBtn: string; secondaryBtn: string; secondaryBtnUrl: string;
}

export default async function AdminEscapePage() {
  const data = await readContent<EscapeData>("escape.json");

  return (
    <div className="p-8">
      <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
        Escape Haugesund
      </h1>
      <p className="text-[0.85rem] mb-8" style={{ color: "var(--mid)" }}>
        Rediger tekst i den mørke escape-seksjonen.
      </p>
      <EscapeForm data={data} />
    </div>
  );
}
