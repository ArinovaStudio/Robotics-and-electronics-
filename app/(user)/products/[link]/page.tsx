import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";

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

type SimilarProduct = {
  id: string;
  title: string;
  imageLink: string | null;
  price: any;
  salePrice: any;
  link: string;
};

async function getProduct(link: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products/${link}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.product || null;
  } catch (err) {
    console.error("Failed to fetch product:", err);
    return null;
  }
}

async function getSimilarProducts(link: string): Promise<SimilarProduct[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products/${link}/similar?limit=8`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.products || [];
  } catch (err) {
    console.error("Failed to fetch similar products:", err);
    return [];
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const { link } = await params;

  const [product, similarProducts] = await Promise.all([
    getProduct(link),
    getSimilarProducts(link),
  ]);

  if (!product) notFound();

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <ProductDetail product={product} similarProducts={similarProducts} />
      <Footer />
    </main>
  );
}