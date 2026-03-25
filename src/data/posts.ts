import { readFileSync } from "fs";
import path from "path";
import type { BlogPost } from "@/types";

function load(): BlogPost[] {
  const file = path.join(process.cwd(), "src/content/posts.json");
  return JSON.parse(readFileSync(file, "utf-8"));
}

export const posts: BlogPost[] = load();

export function getPostBySlug(slug: string): BlogPost | undefined {
  return load().find((p) => p.slug === slug);
}
