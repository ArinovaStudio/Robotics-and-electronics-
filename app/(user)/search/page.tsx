// app/search/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ACCENT = "#ff5a1f";

type Product = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  price: string;
  salePrice: string | null;
  link: string;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(q)}&limit=24`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProducts(json.data.products);
      })
      .catch((err) => console.error("Search fetch failed:", err))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <Navbar />

      <section className="border-b border-gray-300 dark:border-white/10 px-6 md:px-16 py-8">
        <h1 className="font-dm-sans text-xl md:text-2xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">
          Search results for{" "}
          <span className="bg-yellow-200 dark:bg-yellow-500/20 px-1">
            {q || "…"}
          </span>
        </h1>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-b border-r border-gray-300 dark:border-white/10 p-6">
              <div className="aspect-[1.3] bg-gray-100 dark:bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => {
            const displayPrice = product.salePrice ?? product.price;
            const isLastCol = (i + 1) % 3 === 0;
            return (
              <Link
                key={product.id}
                href={`/products/${product.link}`}
                className={`group flex flex-col p-6 border-b border-gray-300 dark:border-white/10 ${
                  !isLastCol ? "border-r" : ""
                }`}
              >
                <div className="relative aspect-[1.3]">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-mono text-xs text-gray-300 dark:text-white/20">
                      No image
                    </div>
                  )}
                </div>
                <div className="mt-5 flex flex-1 flex-col">
                  <h3 className="line-clamp-2 font-dm-sans text-sm font-bold text-gray-900 dark:text-white">
                    {product.title}
                  </h3>
                  <p className="mt-3 font-dm-sans text-lg font-extrabold" style={{ color: ACCENT }}>
                    ₹{Number(displayPrice).toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center border-t border-gray-300 dark:border-white/10 py-20">
          <p className="font-mono text-xs text-gray-400 dark:text-white/40">
            No products found for &quot;{q}&quot;.
          </p>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}