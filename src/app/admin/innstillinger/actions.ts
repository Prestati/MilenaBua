"use server";
import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";

export async function saveSocialsAction(data: unknown) {
  try {
    writeContent("socials.json", data);
    revalidatePath("/");
    revalidatePath("/om-meg");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
