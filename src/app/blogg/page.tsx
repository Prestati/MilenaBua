import Link from "next/link";
import Image from "next/image";
import { posts } from "@/data/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogg",
  description: "Tanker og erfaringer om webutvikling, design og teknologi.",
};

function isPublished(post: typeof posts[number]) {
  const now = new Date().toISOString().slice(0, 10);
  return post.visible !== false && post.published && post.publishDate && post.publishDate <= now;
}

export default function BloggPage() {
  const visiblePosts = posts
    .filter(isPublished)
    .sort((a, b) => ((a.publishDate || a.date) < (b.publishDate || b.date) ? 1 : -1));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Blogg</h1>
      <p className="text-lg text-gray-500 mb-12">
        Tanker og erfaringer om webutvikling, design og det å jobbe selvstendig.
      </p>

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
