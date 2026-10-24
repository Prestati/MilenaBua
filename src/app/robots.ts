import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/escapeny/"] },
    sitemap: "https://www.milenabua.no/sitemap.xml",
  };
}
