import { notFound } from "next/navigation";
import Link from "next/link";
import { projects, getProjectBySlug } from "@/data/projects";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function ProsjektPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/prosjekter" className="text-sm text-indigo-600 hover:underline mb-8 inline-block">
        ← Tilbake til prosjekter
      </Link>

      <div className="w-full h-64 bg-indigo-100 rounded-xl flex items-center justify-center text-7xl mb-10">
        🖥
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
            {tag}
          </span>
        ))}
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.title}</h1>
      <p className="text-lg text-gray-500 mb-8">{project.description}</p>

      <div className="prose prose-gray max-w-none mb-10">
        <p>{project.content}</p>
      </div>

      <div className="flex gap-4">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Se live →
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            GitHub
          </a>
        )}
      </div>
    </div>
  );
}
