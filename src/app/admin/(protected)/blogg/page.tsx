import { readContent } from "@/lib/content";
import BlogAdmin from "./BlogAdmin";
import type { BlogPost } from "@/types";

export default async function AdminBloggPage() {
  const posts = await readContent<BlogPost[]>("posts.json");
  const categories = await readContent<string[]>("categories.json");

  return (
    <div className="p-8">
      <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
        Innblikk
      </h1>
      <p className="text-[0.85rem] mb-8" style={{ color: "var(--mid)" }}>
        Skriv nye innlegg eller rediger eksisterende.
      </p>
      <BlogAdmin initial={posts} categories={categories} />
    </div>
  );
}
