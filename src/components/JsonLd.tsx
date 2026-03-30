interface ProductJsonLdProps {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  url: string;
}

export default function ProductJsonLd({
  name,
  description,
  price,
  imageUrl,
  url,
}: ProductJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description && { description }),
    ...(imageUrl && { image: imageUrl }),
    url,
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "NOK",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
