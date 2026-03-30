import { MetadataRoute } from "next";
import { readContent } from "@/lib/content";
import type { BlogPost } from "@/types";
import type { Product } from "@/types";

const BASE = "https://www.milenabua.no";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, products] = await Promise.all([
    readContent<BlogPost[]>("posts.json").catch(() => [] as BlogPost[]),
    readContent<Product[]>("products.json").catch(() => [] as Product[]),
  ]);

  const publishedPosts = posts.filter(
    (p) => p.status === "published" && p.visible
  );

  return [
    { url: BASE, lastModified: new Date(), priority: 1 },
    { url: `${BASE}/blogg`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE}/produkter`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE}/om-meg`, lastModified: new Date(), priority: 0.6 },

    ...publishedPosts.map((p) => ({
      url: `${BASE}/blogg/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.date),
      priority: 0.7,
    })),

    ...products
      .filter((p) => p.inStock && p.visible !== false)
      .map((p) => ({
        url: `${BASE}/produkter/${p.id}`,
        lastModified: new Date(),
        priority: 0.7,
      })),
  ];
}
