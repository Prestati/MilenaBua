import Link from "next/link";
import { products } from "@/data/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Butikk",
  description: "Digitale ressurser og maler for designere og utviklere.",
};

export default function ButikkPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Butikk</h1>
      <p className="text-lg text-gray-500 mb-12 max-w-2xl">
        Digitale ressurser, maler og verktøy som hjelper deg å jobbe raskere og smartere.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/butikk/${product.id}`}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="w-full h-44 bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center text-5xl">
              🎨
            </div>
            <div className="p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {product.category}
              </span>
              <h2 className="mt-1 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{product.price} kr</span>
                {product.inStock ? (
                  <span className="text-xs text-green-600 font-medium">På lager</span>
                ) : (
                  <span className="text-xs text-red-400 font-medium">Utsolgt</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
