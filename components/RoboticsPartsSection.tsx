"use client";
import { JSX, useState, useEffect, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { ArrowRight, Filter } from "lucide-react";
import FilterSidebar, { FilterState } from "./FilterSidebar";
import ProductGrid from "./ProductGrid";
import { Button } from "./ui/button";
import Link from "next/link";

export default function RoboticsPartsSection(): JSX.Element {
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  // Debounce filter state to avoid rapid fetches
  const debouncedFilters = useDebounce(activeFilters, 350);
  const [filterResetKey, setFilterResetKey] = useState(0);

  // Build query string from filter state
  const buildQuery = useCallback((filters: FilterState | null): string => {
    const params = new URLSearchParams();
    params.set("limit", "50");

    if (filters) {
      if (filters.categories.length === 1) {
        params.set("category", filters.categories[0]);
      }
      if (filters.minPrice > 0) {
        params.set("minPrice", String(filters.minPrice));
      }
      if (filters.maxPrice < 999999) {
        params.set("maxPrice", String(filters.maxPrice));
      }
    }

    return params.toString();
  }, []);

  // Fetch products (with optional filters)
  const fetchProducts = useCallback(
    async (filters: FilterState | null) => {
      setLoading(true);
      try {
        const query = buildQuery(filters);
        const res = await fetch(`/api/products?${query}`);
        const data = await res.json();
        if (data.success) {
          let items = data.data.products || [];

          // Client-side: filter by multiple categories
          if (filters && filters.categories.length > 1) {
            items = items.filter((p: any) =>
              filters.categories.includes(p.category?.slug),
            );
          }

          // Client-side: filter by discount ranges
          if (filters && filters.discounts.length > 0) {
            const minDiscounts = filters.discounts.map((d) =>
              parseInt(d.replace("% OFF", "")),
            );
            items = items.filter((p: any) => {
              const regular = p.price?.value || 0;
              const sale = p.salePrice?.value;
              if (!sale || regular <= sale) return false;
              const pct = Math.round(((regular - sale) / regular) * 100);
              const bucket = Math.floor(pct / 10) * 10;
              return minDiscounts.includes(bucket);
            });
          }

          // Show all products
          setProducts(items);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery],
  );

  // Initial fetch
  useEffect(() => {
    fetchProducts(null);
  }, [fetchProducts]);

  // Handle filter changes (debounced fetch)
  const handleFiltersChange = useCallback((filters: FilterState) => {
    setActiveFilters(filters);
  }, []);

  // Fetch products when debounced filters change
  useEffect(() => {
    fetchProducts(debouncedFilters ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  // Clear all filters (also resets sidebar)
  const clearFilters = () => {
    setActiveFilters(null);
    setFilterResetKey((k) => k + 1);
    fetchProducts(null);
  };

  return (
    <section className="w-full max-w-[1200px] gap-8 mt-12 mb-12 relative ">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl md:text-4xl font-semibold text-[#0a0f3c] tracking-wide uppercase">
          TOP SELLING{" "}
          <span className="relative inline-block">
            <span
              className="absolute bottom-0 left-0 w-full bg-[#FFE29A]"
              style={{ height: "55%" }}
            ></span>
            <span className="relative z-10">ROBOTICS</span>
          </span>{" "}
          PARTS
        </h2>
        <Link
          href="/products"
          className="text-[#f0b31e] font-semibold text-base flex items-center gap-1 hover:underline"
        >
          VIEW ALL
          <ArrowRight size={20} strokeWidth={2.2} className="ml-1" />
        </Link>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-6">
        <Button
          size={"icon"}
          onClick={() => setIsFilterOpen(true)}
          className="bg-[#f0b31e] text-white font-semibold px-5 py-2 rounded-full shadow flex items-center gap-2"
        >
          <Filter />
        </Button>
      </div>

      {/* Overlay (Mobile Only) */}
      {isFilterOpen && (
        <div
          onClick={() => setIsFilterOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <div className="flex gap-12 relative">
        {/* Responsive Sidebar Wrapper */}
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
            resetKey={filterResetKey}
          />
        </div>

        {loading ? (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 animate-pulse rounded-[20px] min-h-[360px] w-full"
              ></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[420px]">
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
          <ProductGrid products={products} />
        )}
      </div>
    </section>
  );
}
