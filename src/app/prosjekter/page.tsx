import Link from "next/link";
import { projects } from "@/data/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prosjekter",
  description: "Se et utvalg av prosjekter jeg har jobbet med.",
};

export default function ProsjekterPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Prosjekter</h1>
      <p className="text-lg text-gray-500 mb-12 max-w-2xl">
        Her er et utvalg av prosjekter jeg har jobbet med. Fra design til ferdig produkt.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/prosjekter/${project.slug}`}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="w-full h-48 bg-indigo-100 flex items-center justify-center text-5xl">
              🖥
            </div>
            <div className="p-6">
              <h2 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors text-lg">
                {project.title}
              </h2>
              <p className="mt-2 text-sm text-gray-500">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
