"use server";

import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";
import type { BlogPost } from "@/types";

export async function savePostsAction(posts: BlogPost[]): Promise<{ success?: boolean; error?: string }> {
  try {
    await writeContent("posts.json", posts);
    revalidatePath("/blogg");
    return { success: true };
  } catch {
    return { error: "Noe gikk galt." };
  }
}
