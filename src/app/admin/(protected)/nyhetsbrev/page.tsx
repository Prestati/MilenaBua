export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase";
import { readContent } from "@/lib/content";
import NewsletterAdmin from "./NewsletterAdmin";

interface RawPost {
  slug: string;
  title: string;
  excerpt?: string;
  status?: string;
  visible?: boolean;
}

interface RawProduct {
  id: string;
  name: string;
  price: number;
  inStock?: boolean;
  visible?: boolean;
}

export default async function AdminNyhetsbrevPage() {
  const [subscribersRes, buyersRes, postsRaw, productsRaw] = await Promise.all([
    supabaseAdmin
      ?.from("subscribers")
      .select("id, email, name, subscribed_at, active, source")
      .order("subscribed_at", { ascending: false }),
    supabaseAdmin
      ?.from("orders")
      .select("customer_email, customer_name, product_name, created_at")
      .eq("email_consented", true)
      .order("created_at", { ascending: false }),
    readContent<RawPost[]>("posts").catch(() => [] as RawPost[]),
    readContent<RawProduct[]>("products").catch(() => [] as RawProduct[]),
  ]);

  const subscribers = (subscribersRes?.data ?? []) as {
    id: string;
    email: string;
    name: string | null;
    subscribed_at: string;
    active: boolean;
    source: string | null;
  }[];

  const buyerMap = new Map<
    string,
    { email: string; name: string | null; product_name: string; created_at: string }
  >();
  for (const row of buyersRes?.data ?? []) {
    if (!buyerMap.has(row.customer_email)) {
      buyerMap.set(row.customer_email, {
        email: row.customer_email,
        name: row.customer_name,
        product_name: row.product_name,
        created_at: row.created_at,
      });
    }
  }
  const buyers = Array.from(buyerMap.values());

  const posts = (postsRaw ?? [])
    .filter((p) => p.status === "published" && p.visible !== false)
    .map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt }));

  const products = (productsRaw ?? [])
    .filter((p) => p.inStock !== false)
    .map((p) => ({ id: p.id, name: p.name, price: p.price }));

  return (
    <div className="p-8">
      <h1
        className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-1"
        style={{ color: "var(--ink)" }}
      >
        Nyhetsbrev
      </h1>
      <p className="text-[0.85rem] mb-8" style={{ color: "var(--mid)" }}>
        Administrer abonnenter og send nyhetsbrev via Resend.
      </p>
      <NewsletterAdmin
        subscribers={subscribers}
        buyers={buyers}
        posts={posts}
        products={products}
      />
    </div>
  );
}
