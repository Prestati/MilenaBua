import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin client er ikke konfigurert" }, { status: 500 });
    }

    const { data, count, error } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact" });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Databaseforespørsel feilet" }, { status: 500 });
    }

    return NextResponse.json({ rows: data?.length ?? 0, count: count ?? 0 });
  } catch (error) {
    console.error("uventet error:", error);
    return NextResponse.json({ error: "Uventet feil" }, { status: 500 });
  }
}
