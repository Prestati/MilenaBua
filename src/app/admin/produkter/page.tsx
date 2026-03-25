import { readContent } from "@/lib/content";
import ProductsAdmin from "./ProductsAdmin";
import type { Product } from "@/types";

export default function AdminProdukterPage() {
  const products = readContent<Product[]>("products.json");

  return (
    <div className="p-8">
      <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
        Produkter
      </h1>
      <p className="text-[0.85rem] mb-8" style={{ color: "var(--mid)" }}>
        Legg til, rediger eller slett produkter. Husk å lagre.
      </p>
      <ProductsAdmin initial={products} />
    </div>
  );
}
