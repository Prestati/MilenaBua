import "server-only";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { supabaseAdmin } from "./supabase";

const dir = path.join(process.cwd(), "src/content");
const key = (file: string) => file.replace(".json", "");

// ── Local JSON fallback (dev / no Supabase) ─────────────────────────────────

function readLocal<T>(file: string): T {
  const raw = readFileSync(path.join(dir, file), "utf-8");
  return JSON.parse(raw) as T;
}

function writeLocal(file: string, data: unknown): void {
  writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2));
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function readContent<T>(file: string): Promise<T> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("content")
      .select("data")
      .eq("key", key(file))
      .single();
    if (!error && data) return data.data as T;
  }
  return readLocal<T>(file);
}

export async function writeContent(file: string, data: unknown): Promise<void> {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from("content")
      .upsert({ key: key(file), data, updated_at: new Date().toISOString() });
    if (error) {
      console.error(`[writeContent] Supabase upsert feilet for "${file}":`, error.message);
      throw new Error(error.message);
    }
  } else {
    console.warn("[writeContent] supabaseAdmin er null — sjekk SUPABASE_SERVICE_ROLE_KEY");
  }
  // Always write locally too (keeps JSON files in sync for git)
  try { writeLocal(file, data); } catch { /* read-only på Vercel — ignorer */ }
}
