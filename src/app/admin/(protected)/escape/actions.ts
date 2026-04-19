"use server";

import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";

export async function saveEscapeAction(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    await writeContent("escape.json", {
      tag: formData.get("tag"),
      heading: formData.get("heading"),
      headingAccent: formData.get("headingAccent"),
      description: formData.get("description"),
      goalLabel: formData.get("goalLabel"),
      goalText: formData.get("goalText"),
      primaryBtn: formData.get("primaryBtn"),
      secondaryBtn: formData.get("secondaryBtn"),
      secondaryBtnUrl: formData.get("secondaryBtnUrl"),
    });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Noe gikk galt." };
  }
}
