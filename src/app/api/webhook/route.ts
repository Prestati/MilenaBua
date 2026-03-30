import { readContent } from "@/lib/content";
import { sendOrderEmails } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import type { Product } from "@/types";

export const runtime = "nodejs";

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
      const email = session.customer_details?.email || session.customer_email || "";
      const name = session.customer_details?.name || "Kunde";
      const amount = (session.amount_total || 0) / 100;

      if (!productId || !email) {
        console.warn("Missing productId or email in session", { productId, email });
        return NextResponse.json({ received: true });
      }

      const products = await readContent<Product[]>("products.json");
      const product = products.find((p) => p.id === productId);
      const productName = product?.name || productId;

      // Lagre ordre i Supabase
      if (supabaseAdmin) {
        const { error: dbError } = await supabaseAdmin.from("orders").insert({
          customer_email: email,
          customer_name: name,
          product_name: productName,
          amount,
          status: "completed",
          stripe_session_id: session.id,
        });
        if (dbError) console.error("Supabase insert error:", dbError.message);
      }

      // Send e-post til kunde og admin
      try {
        await sendOrderEmails({
          customerName: name,
          customerEmail: email,
          productName,
          amount,
          orderId: session.id,
          orderDate: new Date().toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          fileUrl: product?.file_url || undefined,
        });
      } catch (emailError) {
        console.error("Failed to send order emails:", emailError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
