import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const correct = process.env.ESCAPE_PASSWORD ?? "escape2026";
  return NextResponse.json({ ok: password === correct });
}
