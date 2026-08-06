import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import SimilarProducts from "./SimilarProducts"; // adjust to your actual path
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  description: string | null;
  imageLink: string | null;
  additionalImageLinks: string[] | null;
  price: any;
  salePrice: any;
  brand: string | null;
  category: { id: string; name: string; slug: string } | null;
  stockQuantity: number;
  link: string;
  productDetails: string | null;
  productHighlights: string[] | null;
  avgRating: number;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    authorName: string | null;
    createdAt: string;
  }[];
};

async function getProduct(link: string): Promise<Product | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/products/${link}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.text();
    console.log("Response body:", body);
    return null;
  }

  const json = await res.json();
  return json?.data?.product || null;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const { link } = await params;

  const product = await getProduct(link);

  if (!product) {
    return (
      <main className="bg-white dark:bg-[#0a0a0a] min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/products"
            className="px-6 py-3 text-white hover:bg-[#e04e1b] transition-colors"
          >
            Browse Products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <Suspense fallback={<SimilarProductsSkeleton />}>
        <SimilarProducts product={product} link={link} />
      </Suspense>
      <Footer />
    </main>
  );
}

function SimilarProductsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-6 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}