// Kjør: node scripts/seed-supabase.mjs
// Laster opp alle JSON-filer fra src/content/ til Supabase

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../src/content");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Mangler NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY i miljøvariabler.");
  console.error("Kjør: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-supabase.mjs");
  process.exit(1);
}

const supabase = createClient(url, key);

const files = readdirSync(contentDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const key = file.replace(".json", "");
  const data = JSON.parse(readFileSync(path.join(contentDir, file), "utf-8"));
  const { error } = await supabase
    .from("content")
    .upsert({ key, data, updated_at: new Date().toISOString() });

  if (error) {
    console.error(`✕ ${file}: ${error.message}`);
  } else {
    console.log(`✓ ${file} → key="${key}"`);
  }
}

console.log("\nFerdig! Alle filer er lastet opp til Supabase.");
