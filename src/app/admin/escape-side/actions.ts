"use server";

import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";

export async function saveEscapePageAction(data: unknown) {
  try {
    writeContent("escape-page.json", data);
    revalidatePath("/escape-haugesund");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
