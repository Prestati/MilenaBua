import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { posts, getPostBySlug } from "@/data/posts";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

function isPublished(post: typeof posts[number]) {
  const now = new Date().toISOString().slice(0, 10);
  return post.visible !== false && post.published && post.publishDate && post.publishDate <= now;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || !isPublished(post)) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BloggPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !isPublished(post)) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/blogg" className="text-sm text-indigo-600 hover:underline mb-8 inline-block">
        ← Tilbake til bloggen
      </Link>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
            {tag}
          </span>
        ))}
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

      <div className="flex items-center gap-3 mb-10 text-sm text-gray-400">
        <span>{post.date}</span>
        <span>·</span>
        <span>{post.author}</span>
      </div>

      {post.imageUrl && (
        <div className="relative w-full h-80 mb-8 rounded-xl overflow-hidden border border-gray-200">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-gray-600 leading-relaxed">{post.content}</p>
      </div>
    </div>
  );
}
