"use server";

import { writeContent } from "@/lib/content";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import type { Product } from "@/types";

export async function saveProductsAction(products: Product[]): Promise<{ success?: boolean; error?: string }> {
  try {
    writeContent("products.json", products);
    revalidatePath("/");
    products.forEach((p) => revalidatePath(`/produkter/${p.id}`));
    return { success: true };
  } catch {
    return { error: "Noe gikk galt." };
  }
}

export async function uploadProductImageAction(
  _prev: unknown,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return { error: "Ingen fil valgt." };
    const bytes = await file.arrayBuffer();
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadsDir, { recursive: true });
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `product-${Date.now()}.${ext}`;
    await writeFile(path.join(uploadsDir, filename), Buffer.from(bytes));
    return { url: `/uploads/${filename}` };
  } catch (e) {
    return { error: String(e) };
  }
}
