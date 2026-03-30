export const dynamic = "force-dynamic";

import { readContent } from "@/lib/content";
import EmailAdmin from "./EmailAdmin";

const defaults = {
  thankYouMessage:
    "Tusen takk! Jeg håper du finner god nytte av dette. Ta gjerne kontakt om det er noe på hei@milenabua.no",
  projectMessage:
    "Det du kjøper her er med på å finansiere nye prosjekter jeg bygger og teknologi jeg vil utforske videre — det setter jeg stor pris på!",
  signoff: "Varm hilsen,\nMilena",
};

export default async function AdminEpostPage() {
  let settings = defaults;
  try {
    const saved = await readContent<typeof defaults>("email-settings.json");
    settings = { ...defaults, ...saved };
  } catch {
    // not saved yet — use defaults
  }

  return (
    <div className="p-8">
      <h1
        className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-1"
        style={{ color: "var(--ink)" }}
      >
        E-posttekster
      </h1>
      <p className="text-[0.85rem] mb-8" style={{ color: "var(--mid)" }}>
        Teksten som sendes til kunden etter et kjøp. Husk å lagre.
      </p>
      <EmailAdmin initial={settings} />
    </div>
  );
}
