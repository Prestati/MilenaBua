import Link from "next/link";
import { posts } from "@/data/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogg",
  description: "Tanker og erfaringer om webutvikling, design og teknologi.",
};

export default function BloggPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Blogg</h1>
      <p className="text-lg text-gray-500 mb-12">
        Tanker og erfaringer om webutvikling, design og det å jobbe selvstendig.
      </p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blogg/${post.slug}`}
            className="group block border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs text-gray-400">{post.date}</p>
              <span className="text-gray-200">|</span>
              <p className="text-xs text-gray-400">{post.author}</p>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {post.title}
            </h2>
            <p className="mt-2 text-gray-500">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
