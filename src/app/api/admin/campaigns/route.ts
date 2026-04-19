import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mb_admin")?.value;
  if (!token) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET!));
  } catch {
    return NextResponse.json({ error: "Ugyldig sesjon" }, { status: 401 });
  }

  if (!supabaseAdmin) return NextResponse.json({ campaigns: [] });

  const [campaignsRes, eventsRes] = await Promise.all([
    supabaseAdmin
      .from("email_campaigns")
      .select("id, subject, template, recipient_count, sent_at")
      .order("sent_at", { ascending: false })
      .limit(50),
    supabaseAdmin
      .from("email_events")
      .select("campaign_id, email, event_type"),
  ]);

  const events = eventsRes.data ?? [];

  // Unique opens per campaign
  const opensByCampaign = new Map<string, Set<string>>();
  for (const ev of events) {
    if (ev.event_type === "open") {
      if (!opensByCampaign.has(ev.campaign_id)) {
        opensByCampaign.set(ev.campaign_id, new Set());
      }
      opensByCampaign.get(ev.campaign_id)!.add(ev.email);
    }
  }

  const campaigns = (campaignsRes.data ?? []).map((c) => ({
    ...c,
    unique_opens: opensByCampaign.get(c.id)?.size ?? 0,
  }));

  return NextResponse.json({ campaigns });
}
