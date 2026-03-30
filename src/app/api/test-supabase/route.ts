import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "supabaseAdmin er null — SUPABASE_SERVICE_ROLE_KEY mangler" });
  }

  // Test lesing
  const { data: readData, error: readError } = await supabaseAdmin
    .from("content")
    .select("key, updated_at")
    .limit(5);

  // Test skriving
  const { error: writeError } = await supabaseAdmin
    .from("content")
    .upsert({ key: "__test__", data: { ok: true }, updated_at: new Date().toISOString() });

  // Rydd opp
  await supabaseAdmin.from("content").delete().eq("key", "__test__");

  return NextResponse.json({
    supabaseAdmin: "ok",
    read: readError ? { error: readError.message } : { keys: readData?.map((r) => r.key) },
    write: writeError ? { error: writeError.message } : { ok: true },
  });
}
