export const dynamic = "force-dynamic";

import { readContent } from "@/lib/content";
import EmailAdmin from "./EmailAdmin";

const defaults = {
  thankYouMessage:
    "Tusen takk! Jeg håper du finner god nytte av dette. Ta gjerne kontakt om det er noe på hei@milenabua.no",
  projectMessage:
    "Det du kjøper her er med på å finansiere nye prosjekter jeg bygger og teknologi jeg vil utforske videre — det setter jeg stor pris på!",
  signoff: "Varm hilsen,\nMilena",
  welcomeSubject: "Velkommen — her er gaven din! 🎁",
  welcomeBody:
    "Tusen takk for at du meldte deg på nyhetsbrevet mitt!\n\nHer er den lovede PDF-en — klikk på knappen under for å laste den ned. Lagre den gjerne på telefonen eller PCen din.\n\nFremover vil du få ærlige oppdateringer fra prosjektene mine, verktøy jeg bruker, og ting jeg lærer underveis. Ingen spam — bare det som faktisk er nyttig.\n\nVarm hilsen,\nMilena",
  welcomePdfUrl: "",
  welcomePdfButtonText: "Last ned gratis PDF →",
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
        Ordrebekreftelse til kunder, og velkomst-e-post til nye abonnenter.
      </p>
      <EmailAdmin initial={settings} />
    </div>
  );
}
