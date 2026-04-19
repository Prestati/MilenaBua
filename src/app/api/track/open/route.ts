import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("c");
  const encodedEmail = searchParams.get("e");

  if (campaignId && encodedEmail && supabaseAdmin) {
    try {
      const email = Buffer.from(encodedEmail, "base64url").toString("utf-8");
      await supabaseAdmin.from("email_events").insert({
        campaign_id: campaignId,
        email,
        event_type: "open",
      });
    } catch {
      // Sporing feiler stille — ikke blokker pixelrespons
    }
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
