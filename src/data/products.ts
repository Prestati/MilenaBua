import { readFileSync } from "fs";
import path from "path";
import type { Product } from "@/types";

function load(): Product[] {
  const file = path.join(process.cwd(), "src/content/products.json");
  return JSON.parse(readFileSync(file, "utf-8"));
}

export const products: Product[] = load();

export function getProductById(id: string): Product | undefined {
  return load().find((p) => p.id === id);
}
