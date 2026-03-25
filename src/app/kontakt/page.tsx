import type { Metadata } from "next";

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

      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Navn
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ditt navn"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-post
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="din@epost.no"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Melding
          </label>
          <textarea
            id="message"
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Fortell meg om prosjektet ditt..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          Send melding
        </button>
      </form>
    </div>
  );
}
