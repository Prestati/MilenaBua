import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file || !file.name || file.size === 0) {
      return NextResponse.json({ error: "Ingen fil valgt" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const finalPath = path.join(uploadsDir, filename);
    await writeFile(finalPath, Buffer.from(bytes));

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error", error);
    return NextResponse.json({ error: "Feil ved opplasting" }, { status: 500 });
  }
}
