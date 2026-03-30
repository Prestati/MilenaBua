import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Resend } from "resend";
import Newsletter from "@/emails/Newsletter";
import NewsletterBlogProducts from "@/emails/NewsletterBlogProducts";
import NewsletterShort from "@/emails/NewsletterShort";
import type { BlogPostItem, ProductItem } from "@/emails/NewsletterBlogProducts";

type Template = "standard" | "blogproducts" | "short";

const BATCH_SIZE = 50;

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

  try {
    const { template = "standard", subject, content, emails, posts, products } =
      (await req.json()) as {
        template?: Template;
        subject: string;
        content: string;
        emails: string[];
        posts?: BlogPostItem[];
        products?: ProductItem[];
      };

    if (!subject || !content || !emails?.length) {
      return NextResponse.json(
        { error: "Emne, innhold og mottakere er påkrevd" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = "https://www.milenabua.no";
    const from = process.env.EMAIL_FROM!;

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const messages = batch.map((email) => {
        const unsubscribeUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}`;

        let reactEl;
        if (template === "blogproducts") {
          reactEl = NewsletterBlogProducts({
            subject,
            content,
            unsubscribeUrl,
            posts,
            products,
          });
        } else if (template === "short") {
          reactEl = NewsletterShort({ subject, content, unsubscribeUrl });
        } else {
          reactEl = Newsletter({ subject, content, unsubscribeUrl });
        }

        return { from, to: email, subject, react: reactEl };
      });

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
