import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readContent } from "@/lib/content";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  let ogImage = "/uploads/hero-1774386644277.png";
  try {
    const hero = await readContent<{ imageUrl?: string }>("hero.json");
    if (hero.imageUrl) ogImage = hero.imageUrl;
  } catch { /* use default */ }

  return {
    title: { template: "%s | milenabua.no", default: "milenabua.no" },
    description: "Sideprosjekter som hobby, skaperglede som drivkraft – og i 2026: et åpent eksperiment der AI er daglig leder. Alt deles: tall, valg, feil og suksess.",
    metadataBase: new URL("https://www.milenabua.no"),
    openGraph: {
      siteName: "milenabua.no",
      locale: "nb_NO",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
      <GoogleAnalytics gaId="G-8WFK6932J7" />
    </html>
  );
}
