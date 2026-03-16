"use client";
import { JSX, useState, useEffect, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { ArrowRight, Filter } from "lucide-react";
import FilterSidebar, { FilterState } from "./FilterSidebar";
import ProductGrid from "./ProductGrid";
import { Button } from "./ui/button";
import Link from "next/link";
import FeatureRequest from "./FeatureRequest";

export default function RoboticsPartsSection(): JSX.Element {
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  // Debounce filter state to avoid rapid fetches
  const debouncedFilters = useDebounce(activeFilters, 350);
  const [filterResetKey, setFilterResetKey] = useState(0);

  // Build query string from the updated filter state
  const buildQuery = useCallback((filters: FilterState | null): string => {
    const params = new URLSearchParams();
    params.set("limit", "50");

    if (filters) {
      if (filters.categoryId) {
        params.set("categoryId", filters.categoryId);
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
  }, []);

  // Fetch products cleanly using the powerful new API
  const fetchProducts = useCallback(
    async (filters: FilterState | null) => {
      setLoading(true);
      try {
        const query = buildQuery(filters);
        const res = await fetch(`/api/products?${query}`);
        const data = await res.json();

        if (data.success) {
          // No more client-side filtering needed!
          setProducts(data.data.products || []);
          setAvailableBrands(data.data.facets?.brands || []); // Pass facets to sidebar
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
    if (debouncedFilters !== undefined) {
      fetchProducts(debouncedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  // Clear all filters (also resets sidebar)
  const clearFilters = () => {
    setActiveFilters(null);
    setFilterResetKey((k) => k + 1);
    fetchProducts(null);
  };

  return (
    <section className="w-full gap-8 mt-12 mb-12 relative ">
      {/* Header */}
      <div className="flex px-5 items-center justify-between mb-10">
        <h2 className="text-lg max-md:grid gap-1 space-x-1 sm:text-xl md:text-2xl font-bold text-[#050A30] tracking-wide uppercase">
          TOP SELLING{" "}
          <span>
            <span className="relative inline-block">
              <span
                className="absolute bottom-0 left-0 w-full bg-[#FFE29A]"
                style={{ height: "55%" }}
              ></span>
              <span className="relative z-10">ROBOTICS</span>
            </span>{" "}
            PARTS
          </span>
        </h2>
        {/* Mobile Filter Button */}
        <div className="flex gap-0 items-center">
          <div className="md:hidden px-5">
            <Button
              size={"icon"}
              onClick={() => setIsFilterOpen(true)}
              className="bg-[#f0b31e] text-white font-semibold px-5 py-2 rounded-full shadow flex items-center gap-2"
            >
              <Filter />
            </Button>
          </div>
          <Link
            href="/products"
            className="text-[#f0b31e] font-space-grotesk font-semibold text-base flex items-center gap-1 hover:underline"
          >
            VIEW ALL
            <ArrowRight size={20} strokeWidth={2.2} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Overlay (Mobile Only) */}
      {isFilterOpen && (
        <div
          onClick={() => setIsFilterOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <div className="flex gap-12 relative px-5">
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
            availableBrands={availableBrands} // Connect dynamic brands here
            resetKey={filterResetKey}
          />
          <div>
            <FeatureRequest />
          </div>
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
          <div className="flex-1">
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </section>
  );
}