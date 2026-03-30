import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Resend } from "resend";
import Newsletter from "@/emails/Newsletter";
import NewsletterBlogProducts from "@/emails/NewsletterBlogProducts";
import NewsletterShort from "@/emails/NewsletterShort";
import type { BlogPostItem, ProductItem } from "@/emails/NewsletterBlogProducts";

type Template = "standard" | "blogproducts" | "short";

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

  const testEmail = process.env.EMAIL_TO;
  if (!testEmail)
    return NextResponse.json(
      { error: "EMAIL_TO mangler i miljøvariabler" },
      { status: 500 }
    );

  try {
    const { template, subject, content, posts, products } =
      (await req.json()) as {
        template: Template;
        subject: string;
        content: string;
        posts?: BlogPostItem[];
        products?: ProductItem[];
      };

    if (!subject || !content)
      return NextResponse.json(
        { error: "Emne og innhold er påkrevd" },
        { status: 400 }
      );

    const siteUrl = "https://www.milenabua.no";
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(testEmail)}`;

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

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: testEmail,
      subject: `[TEST] ${subject}`,
      react: reactEl,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Noe gikk galt" },
      { status: 500 }
    );
  }
}
