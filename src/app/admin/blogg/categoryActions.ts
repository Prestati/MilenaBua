"use server";

import { writeContent } from "@/lib/content";

export async function saveCategoriesAction(categories: string[]): Promise<{ success?: boolean; error?: string }> {
  try {
    const normalized = Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean)));
    await writeContent("categories.json", normalized);
    return { success: true };
  } catch (error) {
    console.error("Save categories error:", error);
    return { error: "Noe gikk galt. Prøv igjen." };
  }
}
