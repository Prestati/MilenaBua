import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Resend } from "resend";
import Newsletter from "@/emails/Newsletter";

const BATCH_SIZE = 50;

export async function POST(req: Request) {
  // Auth
  const cookieStore = await cookies();
  const token = cookieStore.get("mb_admin")?.value;
  if (!token) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET!));
  } catch {
    return NextResponse.json({ error: "Ugyldig sesjon" }, { status: 401 });
  }

  try {
    const { subject, content, emails } = await req.json() as {
      subject: string;
      content: string;
      emails: string[];
    };

    if (!subject || !content || !emails?.length) {
      return NextResponse.json({ error: "Emne, innhold og mottakere er påkrevd" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = "https://www.milenabua.no";
    const from = process.env.EMAIL_FROM!;

    let sent = 0;
    let failed = 0;

    // Send in batches of BATCH_SIZE
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const messages = batch.map((email) => ({
        from,
        to: email,
        subject,
        react: Newsletter({
          subject,
          content,
          unsubscribeUrl: `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}`,
        }),
      }));

      const { data, error } = await resend.batch.send(messages);
      if (error) {
        console.error("Resend batch error:", error);
        failed += batch.length;
      } else {
        sent += data?.data?.length ?? batch.length;
      }
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Noe gikk galt" },
      { status: 500 }
    );
  }
}
