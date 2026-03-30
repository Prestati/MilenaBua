import { NextResponse } from "next/server";
import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";
import type { Product } from "@/types";
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

  try {
    const products: Product[] = await req.json();
    await writeContent("products.json", products);
    revalidatePath("/");
    revalidatePath("/admin/produkter");
    products.forEach((p) => revalidatePath(`/produkter/${p.id}`));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Noe gikk galt" },
      { status: 500 }
    );
  }
}
