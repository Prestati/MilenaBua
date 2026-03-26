import Stripe from "stripe";
import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { Product } from "@/types";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(req: Request) {
  try {
    if (!stripe) return NextResponse.json({ error: "Betalingsfunksjon ikke konfigurert" }, { status: 503 });
    const { productId } = await req.json();

    const products: Product[] = JSON.parse(
      readFileSync(path.join(process.cwd(), "src/content/products.json"), "utf-8")
    );
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
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
