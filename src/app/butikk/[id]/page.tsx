import { notFound } from "next/navigation";
import Link from "next/link";
import { products, getProductById } from "@/data/products";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProduktPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/butikk" className="text-sm text-indigo-600 hover:underline mb-8 inline-block">
        ← Tilbake til butikk
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="w-full aspect-square bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl flex items-center justify-center text-8xl">
          🎨
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-2">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-500 mb-6">{product.description}</p>

          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl font-bold text-gray-900">{product.price} kr</span>
            {product.inStock ? (
              <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                På lager
              </span>
            ) : (
              <span className="text-sm text-red-400 font-medium bg-red-50 px-3 py-1 rounded-full">
                Utsolgt
              </span>
            )}
          </div>

          <button
            disabled={!product.inStock}
            className="w-full py-3.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.inStock ? "Legg i handlekurv" : "Ikke tilgjengelig"}
          </button>

          <p className="mt-4 text-xs text-gray-400 text-center">
            Sikker betaling · Øyeblikkelig nedlasting etter kjøp
          </p>
        </div>
      </div>
    </div>
  );
}
