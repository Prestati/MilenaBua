import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  // Auth
  const cookieStore = await cookies();
  const token = cookieStore.get("mb_admin")?.value;
  if (!token)
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.AUTH_SECRET!)
    );
  } catch {
    return NextResponse.json({ error: "Ugyldig sesjon" }, { status: 401 });
  }

  if (!supabaseAdmin)
    return NextResponse.json(
      { error: "Supabase ikke tilkoblet" },
      { status: 500 }
    );

  try {
    const { rows } = (await req.json()) as {
      rows: { email: string; name?: string }[];
    };

    if (!rows?.length)
      return NextResponse.json({ error: "Ingen rader å importere" }, { status: 400 });

    let imported = 0;
    let duplicates = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const email = row.email?.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        errors.push(`Ugyldig e-post: "${row.email}"`);
        continue;
      }

      const { error } = await supabaseAdmin.from("subscribers").upsert(
        {
          email,
          name: row.name?.trim() || null,
          source: "import",
          active: true,
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: "email", ignoreDuplicates: false }
      );

      if (error) {
        if (error.code === "23505") {
          duplicates++;
        } else {
          errors.push(`${email}: ${error.message}`);
        }
      } else {
        imported++;
      }
    }

    return NextResponse.json({ imported, duplicates, errors });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Noe gikk galt" },
      { status: 500 }
    );
  }
}
