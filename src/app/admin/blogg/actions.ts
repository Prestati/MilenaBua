"use server";

import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";
import type { BlogPost } from "@/types";

export async function savePostsAction(posts: BlogPost[]): Promise<{ success?: boolean; error?: string }> {
  try {
    // Normaliser alle innlegg med riktige default-verdier
    const normalized = posts.map((post) => ({
      slug: post.slug || `innlegg-${Date.now()}`,
      title: post.title || "",
      excerpt: post.excerpt || "",
      date: post.date || new Date().toISOString().slice(0, 10),
      author: post.author || "Milena Bua",
      tags: Array.isArray(post.tags) ? post.tags : [],
      content: post.content || "",
      imageUrl: post.imageUrl || "",
      category: post.category || "",
      
      // Status-system
      status: (post.status as "draft" | "scheduled" | "published" | "hidden") || "draft",
      publishDate: post.publishDate || new Date().toISOString().slice(0, 10),
      publishTime: post.publishTime || "10:00",
      visible: post.visible !== false,
      
      // SEO
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      
      // Tracking
      createdAt: post.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    await writeContent("posts.json", normalized);
    
    // Revalidere alle blogg-relaterte ruter
    revalidatePath("/blogg");
    revalidatePath("/admin/blogg");
    
    return { success: true };
  } catch (error) {
    console.error("Save posts error:", error);
    return { error: "Noe gikk galt. Prøv igjen." };
  }
}
