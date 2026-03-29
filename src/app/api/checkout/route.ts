import { readContent } from "@/lib/content";
import { NextResponse } from "next/server";
import type { Product } from "@/types";

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: "Betalingsfunksjon ikke konfigurert" }, { status: 503 });

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    const { productId, customerEmail } = await req.json();
    const products = await readContent<Product[]>("products.json");
    const product = products.find((p) => p.id === productId);
    if (!product) return NextResponse.json({ error: "Produkt ikke funnet" }, { status: 404 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "nok",
            product_data: {
              name: product.name,
              description: product.description || undefined,
              ...(product.imageUrl ? { images: [`${siteUrl}${product.imageUrl}`] } : {}),
            },
            unit_amount: product.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/produkter/${productId}?success=1`,
      cancel_url: `${siteUrl}/produkter/${productId}`,
      metadata: {
        productId: productId,
      },
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
