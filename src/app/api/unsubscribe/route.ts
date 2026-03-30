import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return new Response("<p>Ugyldig lenke.</p>", {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (supabaseAdmin) {
    await supabaseAdmin
      .from("subscribers")
      .update({ active: false })
      .eq("email", email.toLowerCase());
  }

  return new Response(
    `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Avmeldt – Milena Bua</title>
  <style>
    body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #f5f4f2; }
    .card { background: white; border-radius: 16px; padding: 48px 40px; max-width: 420px;
            text-align: center; border: 1px solid #e8e6e1; }
    h1 { font-size: 1.4rem; font-weight: 800; margin: 0 0 12px; color: #1a1a2e; }
    p { color: #666; font-size: 0.92rem; line-height: 1.7; margin: 0 0 20px; }
    a { color: #3b6fd4; text-decoration: none; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:2.5rem;margin-bottom:16px">👋</div>
    <h1>Du er avmeldt</h1>
    <p>Du vil ikke lenger motta nyhetsbrev fra Milena Bua.</p>
    <a href="https://www.milenabua.no">← Tilbake til milenabua.no</a>
  </div>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
