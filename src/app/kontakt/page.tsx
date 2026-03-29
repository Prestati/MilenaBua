import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Ta kontakt for samarbeid eller spørsmål.",
};

export default function KontaktPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Ta kontakt</h1>
      <p className="text-lg text-gray-500 mb-12">
        Har du et prosjekt du vil diskutere, eller bare vil si hei? Fyll ut skjemaet nedenfor.
      </p>

      <ContactForm />
    </div>
  );
}
