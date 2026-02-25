"use client";

import React, { useEffect, useState, useCallback } from "react";
import ProductGrid from "@/components/ProductGrid";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "title_asc", label: "Name: A-Z" },
];

export default function SearchResults({ query }: { query: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);

  const fetchSearch = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
        limit: "12",
        sort,
      });

      const res = await fetch(`/api/products/search?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data.products || []);
        setPagination(data.data.pagination || null);
        setSuggestions(data.data.suggestions || []);
      } else {
        setError(data.message || "Failed to search products");
      }
    } catch (err) {
      setError("An error occurred while searching");
    } finally {
      setLoading(false);
    }
  }, [query, page, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <p className="text-[#bdbdbd] text-lg">
          Please enter a search term in the search bar above.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        {/* Sort bar skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 animate-pulse rounded-[16px] min-h-[380px]"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={fetchSearch}
          className="bg-[#f0b31e] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#e6a700] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <h2 className="text-3xl font-black text-[#050a30] mb-2 flex items-center gap-2">
          OOPS! <span>😥</span>
        </h2>
        <p className="text-[#bdbdbd] text-lg mb-6">
          No products found matching &quot;{query}&quot;
        </p>
        {suggestions.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((s, i) => (
                <a
                  key={i}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-[#f0b31e] hover:text-white transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Results count + Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-[#050a30]">
            {(pagination!.currentPage - 1) * pagination!.itemsPerPage + 1}–
            {Math.min(
              pagination!.currentPage * pagination!.itemsPerPage,
              pagination!.totalItems
            )}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#050a30]">
            {pagination!.totalItems}
          </span>{" "}
          results
        </p>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-500" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#f0b31e] transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, current, and neighbors
                if (p === 1 || p === pagination.totalPages) return true;
                if (Math.abs(p - page) <= 1) return true;
                return false;
              })
              .reduce((acc: (number | string)[], p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push("...");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                typeof p === "string" ? (
                  <span key={`dots-${i}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-[#f0b31e] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
