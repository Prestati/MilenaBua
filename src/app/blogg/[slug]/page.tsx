export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { readContent } from "@/lib/content";
import { renderMarkdown } from "@/lib/renderMarkdown";
import type { BlogPost } from "@/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

function isPublished(post: BlogPost) {
  // Innlegg må være marked som publisert
  if (post.status !== "published") {
    return false;
  }

  // Innlegg må være markert som synlig
  if (!post.visible) {
    return false;
  }

  // Sjekk om publiseringsdato/tidspunkt er nådd
  const now = new Date();
  const nowDate = now.toISOString().slice(0, 10);
  const nowTime = now.toTimeString().slice(0, 5);

  if (post.publishDate > nowDate) {
    return false;
  }

  if (post.publishDate === nowDate && post.publishTime) {
    if (post.publishTime > nowTime) {
      return false;
    }
  }

  return true;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const posts = await readContent<BlogPost[]>("posts.json");
  const post = posts.find((p) => p.slug === slug);
  if (!post || !isPublished(post)) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const imageUrl = post.imageUrl || "/default-og-image.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/blogg/${slug}`,
      siteName: "Milena Bua",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "nb_NO",
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BloggPostPage({ params }: Props) {
  const { slug } = await params;
  const posts = await readContent<BlogPost[]>("posts.json");
  const post = posts.find((p) => p.slug === slug);

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
        {post.category && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
            {post.category}
          </span>
        )}
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
        {renderMarkdown(post.content, "text-lg text-gray-600 leading-relaxed mb-5")}
      </div>
    </div>
  );
}
