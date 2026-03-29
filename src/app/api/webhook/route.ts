import { readContent } from "@/lib/content";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  inStock?: boolean;
  type?: string;
  buyUrl?: string;
  pageContent?: string;
  downloadUrl?: string;
}

async function sendOrderEmail({
  to,
  product,
  successUrl,
}: {
  to: string;
  product: Product;
  successUrl: string;
}) {
  const API_KEY = process.env.RESEND_API_KEY;
  if (!API_KEY) {
    throw new Error("Missing RESEND_API_KEY in environment");
  }

  const downloadUrl =
    product.downloadUrl ||
    (product.type === "pdf" ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pdfs/${product.id}.pdf` : "");

  const html = `
      <p>Hei!</p>
      <p>Tusen takk for kjøpet ditt av <strong>${product.name}</strong> ✅</p>
      <p>Du kan laste ned filen her:</p>
      <p><a href="${downloadUrl}">${downloadUrl}</a></p>
      <p>Se din ordrebekreftelse her: <a href="${successUrl}">Gjennomføringsside</a></p>
      <p>Ha en strålende dag,<br/>Milena</p>
  `;

  const text = `Hei!\n\nTakk for kjøpet av ${product.name}.\n\nLast ned her: ${downloadUrl}\n\nOrdre var success: ${successUrl}\n\n- Milena`;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      from: "Milena Bua <noreply@milenabua.no>",
      to,
      subject: `Takk for kjøpet av ${product.name}`,
      html,
      text,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Resend error", errText);
    throw new Error("Could not send email through Resend");
  }

  return await resp.json();
}

export async function POST(req: Request) {
  try {
    const stripeSignature = req.headers.get("stripe-signature");
    if (!stripeSignature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
    }

    const body = await req.text();

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, stripeSignature, webhookSecret);
    } catch (error: any) {
      console.error("Webhook signature verification failed.", error.message);
      return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const productId = session.metadata?.productId;
      const email = session.customer_details?.email || session.customer_email;
      const successUrl = session.success_url || "";

      if (!productId || !email) {
        console.warn("Missing productId or customer email in session", { productId, email });
        return NextResponse.json({ ok: true });
      }

      const products = await readContent<Product[]>("products.json");
      const product = products.find((p) => p.id === productId);
      if (!product) {
        console.warn("Product not found for productId", productId);
        return NextResponse.json({ ok: true });
      }

      try {
        await sendOrderEmail({ to: email, product, successUrl });
      } catch (emailError) {
        console.error("Failed to send order email", emailError);
        // Ikke crash webhook, men logg.
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
