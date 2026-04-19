"use server";

import { writeContent } from "@/lib/content";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function saveHeroAction(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const file = formData.get("image") as File | null;
    let imageUrl = formData.get("currentImageUrl") as string;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const uploadsDir = path.join(process.cwd(), "public/uploads");
      await mkdir(uploadsDir, { recursive: true });
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `hero-${Date.now()}.${ext}`;
      await writeFile(path.join(uploadsDir, filename), Buffer.from(bytes));
      imageUrl = `/uploads/${filename}`;
    }

    await writeContent("hero.json", {
      badge: formData.get("badge"),
      h1Line1: formData.get("h1Line1"),
      h1Highlight: formData.get("h1Highlight"),
      h1Line2: formData.get("h1Line2"),
      description: formData.get("description"),
      primaryBtn: formData.get("primaryBtn"),
      secondaryBtn: formData.get("secondaryBtn"),
      imageUrl,
    });

    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Noe gikk galt. Prøv igjen." };
  }
}
