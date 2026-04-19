"use server";
import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";
import { writeFileSync } from "fs";
import path from "path";

export async function saveAboutAction(data: unknown) {
  try {
    await writeContent("about.json", data);
    revalidatePath("/om-meg");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function uploadAboutImageAction(formData: FormData, field: "imageUrl" | "portraitUrl") {
  try {
    const file = formData.get("file") as File;
    if (!file || !file.size) return { success: false, error: "Ingen fil" };
    const ext = file.name.split(".").pop();
    const filename = `about-${field}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(path.join(process.cwd(), "public/uploads", filename), buffer);
    revalidatePath("/om-meg");
    return { success: true, url: `/uploads/${filename}` };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
