import { readFileSync } from "fs";
import path from "path";
import type { Project } from "@/types";

function load(): Project[] {
  const file = path.join(process.cwd(), "src/content/projects.json");
  return JSON.parse(readFileSync(file, "utf-8"));
}

export const projects: Project[] = load();

export function getProjectBySlug(slug: string): Project | undefined {
  return load().find((p) => p.slug === slug);
}
