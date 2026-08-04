"use client";
import { useState, useEffect, useCallback } from "react";
import { Filter } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar, { FilterState } from "@/components/FilterSidebar";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]); // Added to track dynamic brands
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState("newest");
  const LIMIT = 12;

  // Build query from filters + page + sort
  const buildQuery = useCallback(
    (filters: FilterState | null, p: number, s: string): string => {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(LIMIT));
      params.set("sort", s);

      if (filters) {
        if (filters.categoryIds && filters.categoryIds.length > 0) {
          params.set("categoryId", filters.categoryIds.join(","));
        }
        if (filters.brands && filters.brands.length > 0) {
          params.set("brand", filters.brands.join(","));
        }
        if (filters.minPrice > 0) {
          params.set("minPrice", String(filters.minPrice));
        }
        if (filters.maxPrice < 999999) {
          params.set("maxPrice", String(filters.maxPrice));
        }
      }

      return params.toString();
    },
    [],
  );

  // Fetch products
  const fetchProducts = useCallback(
    async (filters: FilterState | null, p: number, s: string) => {
      setLoading(true);
      try {
        const query = buildQuery(filters, p, s);
        const res = await fetch(`/api/products?${query}`);
        const data = await res.json();

        if (data.success) {
          // No more client-side filtering needed! The API handles everything perfectly.
          setProducts(data.data.products || []);
          setAvailableBrands(data.data.facets?.brands || []); // Extract dynamic brands
          setTotalPages(data.data.pagination.totalPages || 1);
          setTotalItems(data.data.pagination.totalItems || 0);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery],
  );

  // Initial fetch
  useEffect(() => {
    fetchProducts(activeFilters, page, sort);
  }, [page, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle filter changes from sidebar
  const handleFiltersChange = useCallback(
    (filters: FilterState) => {
      setActiveFilters(filters);
      setPage(1);
      fetchProducts(filters, 1, sort);
    },
    [fetchProducts, sort],
  );

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters(null);
    setFilterResetKey((k) => k + 1);
    setPage(1);
    setSort("newest");
    fetchProducts(null, 1, "newest");
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

  const getHeading = () => {
    const names = activeFilters?.categoryNames ?? [];
    if (names.length === 0) return "ALL PRODUCTS";
    if (names.length === 1) return 'CATEGORY';
    return "CATEGORIES";
  };

  const getSubtext = () => {
    const names = activeFilters?.categoryNames ?? [];
    if (names.length === 1) return names[0];
    if (names.length > 1) return "All Results";
    return `${totalItems} product${totalItems !== 1 ? "s" : ""}`;
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="w-full max-w-[1200px] mx-auto px-4 py-2 md:py-8">
        {/* Header */}
        <div className="mb-8 flex max-md:justify-between items-center">
          <div className="grid gap-2 items-center mb-3">
            <h1 className="text-xl md:text-4xl font-bold text-[#050a30]">
              {getHeading()}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              {getSubtext()}
            </p>
          </div>
          <div className="flex items-center justify-between">


            {/* Sort + Mobile filter */}
            <div className="flex justify-between w-full items-center gap-3">
              <Button
                size="icon"
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden bg-[#f0b31e] text-white rounded-full shadow"
              >
                <Filter size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isFilterOpen && (
          <div
            onClick={() => setIsFilterOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
          />
        )}

        <div className="flex gap-8 relative">
          {/* Sidebar */}
          <div
            className={`
              fixed md:sticky top-0 left-0 h-full md:h-fit md:self-start
              z-50 md:z-auto
              transform overflow-y-auto transition-transform duration-300
              ${isFilterOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
          >
            <FilterSidebar
              onFiltersChange={handleFiltersChange}
              availableBrands={availableBrands} // Pass down dynamically fetched brands
              resetKey={filterResetKey}
              sort={sort}
              handleSortChange={handleSortChange}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
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
              <div className="flex flex-col items-center justify-center min-h-[420px]">
                <h2 className="text-3xl font-black text-[#050a30] mb-2 flex items-center gap-2">
                  OOPS! <span>😥</span>
                </h2>
                <p className="text-[#bdbdbd] text-lg mb-6">
                  No product found, please try to clear filters
                </p>
                <button
                  className="bg-[#0a0f3c] text-white font-semibold text-lg px-8 py-3 rounded-lg shadow-lg flex items-center gap-2 hover:bg-[#050a30] transition-all"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
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

                    <div className={`flex items-center gap-1 max-md:hidden`}>
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