import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mb_admin")?.value;
  if (!token) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET!));
  } catch {
    return NextResponse.json({ error: "Ugyldig sesjon" }, { status: 401 });
  }

  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase ikke konfigurert" }, { status: 500 });

  const formData = await req.formData();
  const file = formData.get("pdf") as File | null;
  const productId = formData.get("productId") as string | null;

  if (!file || !productId) return NextResponse.json({ error: "Mangler fil eller produktId" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${productId}-${Date.now()}.pdf`;

  const { error } = await supabaseAdmin.storage
    .from("products")
    .upload(`pdfs/${filename}`, buffer, { contentType: "application/pdf", upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("products")
    .getPublicUrl(`pdfs/${filename}`);

  return NextResponse.json({ url: publicUrl });
}
