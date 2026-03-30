export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { readContent } from "@/lib/content";
import type { BlogPost } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Innblikk",
  description: "Tanker og erfaringer om webutvikling, design og teknologi.",
};

function isPublished(post: BlogPost) {
  // Innlegg må være marked som publisert
  if (post.status !== "published") {
    return false;
  }

  // Innlegg må være markert som synlig (kan skjules selv om det er publisert)
  if (!post.visible) {
    return false;
  }

  // Sjekk om publiseringsdato/tidspunkt er nådd
  const now = new Date();
  const nowDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const nowTime = now.toTimeString().slice(0, 5); // HH:mm

  // Hvis publiseringsdato er i fremtiden, vis ikke
  if (post.publishDate > nowDate) {
    return false;
  }

  // Hvis dato er i dag og tidspunktet er oppgitt, sjekk tidspunktet
  if (post.publishDate === nowDate && post.publishTime) {
    if (post.publishTime > nowTime) {
      return false; // Tidspunktet er ennå ikke nådd
    }
  }

  return true;
}

export default async function BloggPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const posts = await readContent<BlogPost[]>("posts.json");
  const { category: selectedCategory = "all" } = (await searchParams) ?? {};
  const publishedPosts = posts
    .filter(isPublished)
    .sort((a, b) => ((a.publishDate || a.date) < (b.publishDate || b.date) ? 1 : -1));

  const categories = Array.from(new Set(publishedPosts.map((p) => p.category).filter(Boolean)));
  const visiblePosts = selectedCategory && selectedCategory !== "all"
    ? publishedPosts.filter((post) => post.category === selectedCategory)
    : publishedPosts;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Innblikk</h1>
      <p className="text-lg text-gray-500 mb-6">
        Tanker og erfaringer om webutvikling, design og det å jobbe selvstendig.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/blogg"
          className={`text-sm px-3 py-1 rounded-full ${selectedCategory === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          Alle kategorier
        </a>
        {categories.map((category) => (
          <a
            key={category}
            href={`/blogg?category=${encodeURIComponent(category)}`}
            className={`text-sm px-3 py-1 rounded-full ${selectedCategory === category ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            {category}
          </a>
        ))}
      </div>

      <div className="space-y-6">
        {visiblePosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blogg/${post.slug}`}
            className="group block border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {post.imageUrl && (
                <div className="relative w-full sm:w-48 h-40 flex-shrink-0">
                  <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-6 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs text-gray-400">{post.publishDate || post.date}</p>
                  <span className="text-gray-200">|</span>
                  <p className="text-xs text-gray-400">{post.author}</p>
                </div>
                <div className="mb-2 text-xs font-semibold text-indigo-600">{post.category || "Uten kategori"}</div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{post.title}</h2>
                <p className="mt-2 text-gray-500">{post.excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
