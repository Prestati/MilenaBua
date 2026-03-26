"use server";

import { writeContent } from "@/lib/content";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import type { BlogPost } from "@/types";

export async function savePostsAction(posts: BlogPost[]): Promise<{ success?: boolean; error?: string }> {
  try {
    const normalized = posts.map((post) => ({
      ...post,
      category: post.category || "",
      published: !!post.published,
      publishDate: post.publishDate || post.date,
      visible: post.visible !== false,
      tags: post.tags || [],
      imageUrl: post.imageUrl || "",
    }));

    await writeContent("posts.json", normalized);
    revalidatePath("/blogg");
    return { success: true };
  } catch (error) {
    console.error("Save posts error:", error);
    return { error: "Noe gikk galt. Prøv igjen." };
  }
}
