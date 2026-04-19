"use server";

import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";
import type { Project } from "@/types";

export async function saveProjectsAction(projects: Project[]): Promise<{ success?: boolean; error?: string }> {
  try {
    await writeContent("projects.json", projects);
    revalidatePath("/");
    revalidatePath("/prosjekter");
    return { success: true };
  } catch {
    return { error: "Noe gikk galt." };
  }
}
