import { NextResponse } from "next/server";
import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";
import type { BlogPost } from "@/types";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req: Request) {
  // Sjekk at brukeren er logget inn som admin
  const cookieStore = await cookies();
  const token = cookieStore.get("mb_admin")?.value;
  if (!token) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET!));
  } catch {
    return NextResponse.json({ error: "Ugyldig sesjon" }, { status: 401 });
  }

  try {
    const posts: BlogPost[] = await req.json();

    const normalized = posts.map((post) => ({
      slug: post.slug || `innlegg-${Date.now()}`,
      title: post.title || "",
      excerpt: post.excerpt || "",
      date: post.date || new Date().toISOString().slice(0, 10),
      author: post.author || "Milena Bua",
      tags: Array.isArray(post.tags) ? post.tags : [],
      content: post.content || "",
      imageUrl: post.imageUrl || "",
      category: post.category || "",
      status: (post.status as "draft" | "scheduled" | "published" | "hidden") || "draft",
      publishDate: post.publishDate || new Date().toISOString().slice(0, 10),
      publishTime: post.publishTime || "10:00",
      visible: post.visible !== false,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      createdAt: post.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    await writeContent("posts.json", normalized);
    revalidatePath("/blogg");
    revalidatePath("/admin/blogg");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save posts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Noe gikk galt" },
      { status: 500 }
    );
  }
}
