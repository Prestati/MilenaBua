import { readContent } from "@/lib/content";
import TimerForm from "./TimerForm";

interface TimerRow {
  icon: string;
  label: string;
  value: string;
}

interface TimerData {
  sectionTag: string;
  sectionTitle: string;
  heading: string;
  headingAccent: string;
  body: string;
  cardHeaderText: string;
  cardHeaderBg: string;
  cardFooterLabel: string;
  cardFooterValue: string;
  cardFooterBg: string;
  rows: TimerRow[];
}

const defaults: TimerData = {
  sectionTag: "Bakgrunnen",
  sectionTitle: "Hvorfor la AI bestemme?",
  heading: "4 timer.",
  headingAccent: "Hva gjør du med dem?",
  body: "Du har faktisk nok tid. Alle har 24 timer, og når hverdagen er unnagjort sitter du igjen med rundt 4. Det er mer enn nok til å bygge noe du er stolt av.\n\nHvis du bruker dem på det som faktisk betyr noe. Drømmene dine er ikke for store. De venter bare på at du prioriterer dem!",
  cardHeaderText: "Et typisk døgn",
  cardHeaderBg: "#1a1a2e",
  cardFooterLabel: "→ Fritid igjen",
  cardFooterValue: "4 timer",
  cardFooterBg: "#fff1ea",
  rows: [
    { icon: "😴", label: "Søvn", value: "8 timer" },
    { icon: "💼", label: "Arbeid", value: "8 timer" },
    { icon: "🚗", label: "Transport", value: "1 time" },
    { icon: "🍽️", label: "Matlaging", value: "1 time" },
    { icon: "🥗", label: "Spising", value: "1 time" },
    { icon: "🏠", label: "Husarbeid", value: "1 time" },
  ],
};

export default async function AdminTimerPage() {
  let data: TimerData;
  try {
    data = await readContent<TimerData>("timer.json");
    if (!data?.rows) data = defaults;
  } catch {
    data = defaults;
  }

  return (
    <div className="p-8">
      <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
        4-timer seksjonen
      </h1>
      <p className="text-[0.85rem] mb-8" style={{ color: "var(--mid)" }}>
        Rediger tekst, farger og tabellinnhold for seksjonen «{data.sectionTag}» på forsiden.
      </p>
      <TimerForm data={data} />
    </div>
  );
}
