import { readContent } from "@/lib/content";
import ProjectsAdmin from "./ProjectsAdmin";
import type { Project } from "@/types";

export default function AdminProsjekterPage() {
  const projects = readContent<Project[]>("projects.json");

  return (
    <div className="p-8">
      <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
        Prosjekter
      </h1>
      <p className="text-[0.85rem] mb-8" style={{ color: "var(--mid)" }}>
        Legg til, rediger eller slett prosjekter.
      </p>
      <ProjectsAdmin initial={projects} />
    </div>
  );
}
