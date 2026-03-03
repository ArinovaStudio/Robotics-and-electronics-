"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
<<<<<<< HEAD:app/(user)/categories/[categoryId]/page.tsx
  const categoryId = params.categoryId as string;
=======
  const categoryId = params.slug as string;

>>>>>>> 7c8d82970746956901a98d7f02e3e3fc5155170f:app/(user)/categories/[slug]/page.tsx
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sort, setSort] = useState("newest");
  const LIMIT = 12;

<<<<<<< HEAD:app/(user)/categories/[categoryId]/page.tsx
  // Fetch category by ID
  useEffect(() => {
    if (!categoryId) return;
    async function fetchCategory() {
      const res = await fetch(`/api/categories/${categoryId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCategory(data.data.category);
      } else {
        setError("Category not found");
        setLoading(false);
=======
  useEffect(() => {
    if (!categoryId) return;
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories/${categoryId}`); 
        const data = await res.json();
        if (res.ok && data.success) {
          setCategory(data.data.category);
        } else if (res.status === 404) {
          setError("Category not found");
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Something went wrong.");
>>>>>>> 7c8d82970746956901a98d7f02e3e3fc5155170f:app/(user)/categories/[slug]/page.tsx
      }
    }
    fetchCategory();
  }, [categoryId]);

  const buildQuery = useCallback((p: number, s: string, catId: string): string => {
    const qp = new URLSearchParams();
    qp.set("categoryId", catId); 
    qp.set("page", String(p));
    qp.set("limit", String(LIMIT));
    qp.set("sort", s);

    return qp.toString();
  }, []);

<<<<<<< HEAD:app/(user)/categories/[categoryId]/page.tsx
  // Fetch products for this category
  const fetchProducts = useCallback(async (p: number, s: string) => {
    if (!category?.id) return;
    setLoading(true);
    const query = buildQuery(p, s);
    const res = await fetch(`/api/products?categoryId=${category.id}&${query}`);
    const data = await res.json();
=======
  // Fetch products using the unified endpoint
  const fetchProducts = useCallback(
    async (p: number, s: string) => {
      if (!categoryId) return;
      setLoading(true);
      try {
        const query = buildQuery(p, s, categoryId);
        const res = await fetch(`/api/products?${query}`); 
        const data = await res.json();
>>>>>>> 7c8d82970746956901a98d7f02e3e3fc5155170f:app/(user)/categories/[slug]/page.tsx

    if (data.success) {
      setProducts(data.data.products || []);

<<<<<<< HEAD:app/(user)/categories/[categoryId]/page.tsx
      setTotalPages(data.data.pagination?.totalPages || 1);

      // FIX HERE 🔥
      setTotalItems(data.data.pagination?.totalItems || 0);
    } else {
      setError(data.message);
    }
    setLoading(false);
  }, [category?.id, buildQuery]);

  // Fetch on page/sort change
  useEffect(() => {
    if (category?.id) {
      fetchProducts(page, sort);
    }
  }, [page, sort, category?.id, fetchProducts]);
=======
          setProducts(items);
          setTotalPages(data.data.pagination?.totalPages || 1);
          setTotalItems(data.data.pagination?.totalItems || 0);
        } else {
          setError(data.message || "Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [categoryId, buildQuery],
  );

  // Fetch on page/sort change
  useEffect(() => {
    if (categoryId) fetchProducts(page, sort);
  }, [page, sort, categoryId, fetchProducts]);
>>>>>>> 7c8d82970746956901a98d7f02e3e3fc5155170f:app/(user)/categories/[slug]/page.tsx

  const handleSortChange = (s: string) => {
    setSort(s);
    setPage(1);
  };

  // Pagination helper
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Error state
  if (error && !loading) {
    return (
      <main className="bg-white min-h-screen">
        <div className="w-full max-w-[1200px] mx-auto px-4 py-6">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-[#050a30] hover:text-[#f0b31e] mb-6 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-semibold">Back to Categories</span>
          </Link>
          <div className="flex flex-col items-center justify-center min-h-96 bg-gray-50 rounded-2xl">
            <span className="text-6xl mb-4">😥</span>
            <h3 className="text-2xl font-bold text-[#050a30] mb-2">{error}</h3>
            <button
              onClick={() => router.push("/categories")}
              className="mt-4 bg-[#f0b31e] text-[#050a30] font-semibold px-6 py-2 rounded-lg hover:bg-[#e6a700] transition-colors"
            >
              Browse All Categories
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-[#050a30] hover:text-[#f0b31e] mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="font-semibold">Back to Categories</span>
        </Link>

        {/* Category Header */}
        {category && (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#050a30] mb-2">
              {category.name.toUpperCase()}
            </h1>
            <div className="flex items-center justify-between">
              <div>
                {category.description && (
                  <p className="text-gray-600 text-base">
                    {category.description}
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  {totalItems} product{totalItems !== 1 ? "s" : ""} found
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="title_asc">Name: A to Z</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div>
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 animate-pulse rounded-[20px] min-h-[360px] w-full"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[420px]">
                <h2 className="text-3xl font-black text-[#050a30] mb-2 flex items-center gap-2">
                  OOPS! <span>😥</span>
                </h2>
                <p className="text-[#bdbdbd] text-lg mb-6">
                  No products found in this category
                </p>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((p, idx) =>
                        p === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-10 h-10 flex items-center justify-center text-gray-400"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${page === p
                              ? "bg-[#f0b31e] text-white shadow"
                              : "border border-gray-200 hover:bg-gray-50"
                              }`}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}