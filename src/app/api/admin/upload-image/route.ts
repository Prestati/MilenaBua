import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mb_admin")?.value;
  if (!token) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  try {
    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) throw new Error("AUTH_SECRET mangler");
    await jwtVerify(token, new TextEncoder().encode(authSecret));
  } catch {
    return NextResponse.json({ error: "Ugyldig sesjon" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return NextResponse.json({ error: "Ingen fil valgt" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `product-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Supabase Storage (production)
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.storage
      .from("products")
      .upload(`images/${filename}`, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("products")
      .getPublicUrl(`images/${filename}`);

    return NextResponse.json({ url: publicUrl });
  }

  // Local fallback (dev without Supabase)
  try {
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
