import { NextResponse } from "next/server";
import { writeContent } from "@/lib/content";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mb_admin")?.value;
  if (!token) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET!));
  } catch {
    return NextResponse.json({ error: "Ugyldig sesjon" }, { status: 401 });
  }

  try {
    const settings = await req.json();
    await writeContent("email-settings.json", settings);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Noe gikk galt" },
      { status: 500 }
    );
  }
}
