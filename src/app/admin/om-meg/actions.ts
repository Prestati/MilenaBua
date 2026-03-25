"use server";
import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";

export async function saveAboutAction(data: unknown) {
  try {
    writeContent("about.json", data);
    revalidatePath("/om-meg");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
