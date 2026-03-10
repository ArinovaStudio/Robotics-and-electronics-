"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Funnel, Loader2, SortAsc } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

// Updated to match your new API fields
export type FilterState = {
  categoryId: string | null;
  brands: string[];
  minPrice: number;
  maxPrice: number;
};

type FilterSidebarProps = {
  onFiltersChange: (filters: FilterState) => void;
  availableBrands?: string[]; // dynamically passed from the products API facets
  resetKey?: number;
  handleSortChange?: any;
  sort?: any;
};

// ─── Price Range Slider (Unchanged) ──────────────────────────────────────────

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const startDrag = useCallback(
    (thumb: "low" | "high") => (e: React.MouseEvent) => {
      e.preventDefault();

      const onMove = (ev: MouseEvent) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        let p = (ev.clientX - rect.left) / rect.width;
        p = Math.max(0, Math.min(1, p));
        // Stepping by 500 for higher priced electronics
        const v = Math.round((min + p * (max - min)) / 500) * 500;

        if (thumb === "low") {
          onChange([Math.min(v, value[1] - 500), value[1]]);
        } else {
          onChange([value[0], Math.max(v, value[0] + 500)]);
        }
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [min, max, value, onChange]
  );

  return (
    <div className="px-1 py-2">
      <div
        ref={trackRef}
        className="relative mx-2.5 my-2.5"
        style={{ height: 3, background: "#e0e0e0", borderRadius: 2 }}
      >
        <div
          className="absolute h-full"
          style={{
            left: `${pct(value[0])}%`,
            right: `${100 - pct(value[1])}%`,
            background: "#f0b31e",
            borderRadius: 2,
          }}
        />
        <div
          onMouseDown={startDrag("low")}
          className="absolute cursor-grab active:cursor-grabbing select-none"
          style={{
            top: "50%",
            left: `${pct(value[0])}%`,
            transform: "translate(-50%, -50%)",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#f0b31e",
            border: "2.5px solid #f0b31e",
            boxShadow: "0 0 0 2px #fff, 0 2px 6px rgba(0,0,0,0.18)",
            zIndex: 3,
          }}
        />
        <div
          onMouseDown={startDrag("high")}
          className="absolute cursor-grab active:cursor-grabbing select-none"
          style={{
            top: "50%",
            left: `${pct(value[1])}%`,
            transform: "translate(-50%, -50%)",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#f0b31e",
            border: "2.5px solid #f0b31e",
            boxShadow: "0 0 0 2px #fff, 0 2px 6px rgba(0,0,0,0.18)",
            zIndex: 3,
          }}
        />
      </div>
      <p className="text-center font-bold text-[#111] mt-3 text-sm">
        ₹{value[0]} - ₹{value[1] >= max ? `${max}+` : value[1]}
      </p>
    </div>
  );
};

// ─── Custom Checkbox (Unchanged) ─────────────────────────────────────────────

const CustomCheckbox: React.FC<{ checked: boolean; onChange: () => void }> = ({
  checked,
  onChange,
}) => (
  <span
    onClick={onChange}
    className="inline-flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-100"
    style={{
      width: 17,
      height: 17,
      minWidth: 17,
      border: `1px solid ${checked ? "#f0b31e" : "#B1B1B1"}`,
      borderRadius: 2,
      background: checked ? "#f0b31e" : "#fff",
    }}
  >
    {checked && (
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path
          d="M1 4L3.8 7L9 1"
          stroke="white"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </span>
);

// ─── Filter Sidebar ──────────────────────────────────────────────────────────

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onFiltersChange,
  availableBrands = [],
  resetKey = 0,
  handleSortChange,
  sort,
}) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Updated state based on the new API design
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    [number, number]
  >([0, 50000]); // Max 50,000 INR

  const initializedRef = useRef(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) {
          setCategories(data.data || []);
          initializedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Reset logic
  useEffect(() => {
    if (resetKey > 0) {
      setSelectedCategoryId(null);
      setSelectedBrands([]);
      setSelectedPriceRange([0, 50000]);
    }
  }, [resetKey]);

  // Notify parent of changes
  useEffect(() => {
    if (!initializedRef.current) return;

    // Slight delay (debounce) prevents spamming the API while dragging the price slider
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        categoryId: selectedCategoryId,
        brands: selectedBrands,
        minPrice: selectedPriceRange[0],
        maxPrice:
          selectedPriceRange[1] >= 50000 ? 999999 : selectedPriceRange[1], // If maxed, remove upper limit
      });
    }, 400);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedBrands, selectedPriceRange]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleCategorySelect = (id: string) => {
    // If clicking the already selected category, deselect it. Otherwise select it.
    setSelectedCategoryId((prev) => (prev === id ? null : id));
  };

  const Divider = () => <hr className="border-t border-[#e0e0e0] my-4" />;

  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);

  if (loading) {
    return (
      <aside className="w-[260px] bg-[#f8f8f8] rounded-xl p-6 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-[#f0b31e]" size={28} />
      </aside>
    );
  }

  return (
    <aside className="w-[260px] bg-[#f8f8f8] max-md:min-h-screen md:rounded-xl flex flex-col p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-space-grotesk font-bold text-[#050a30]">
          FILTERS
        </span>
        <Funnel size={18} className="text-[#434343]" />
      </div>

      <Divider />

      {/* CATEGORIES */}
      <div className="mb-2">
        <span className="text-xs font-bold text-[#f0b31e] mb-3 block tracking-widest uppercase">
          Categories
        </span>
        <div className="flex flex-col gap-3">
          {visibleCategories.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-3 text-sm text-gray-800 font-medium cursor-pointer select-none hover:text-[#f0b31e] transition-colors"
            >
              <CustomCheckbox
                checked={selectedCategoryId === c.id}
                onChange={() => handleCategorySelect(c.id)}
              />
              <span className="truncate">{c.name}</span>
            </label>
          ))}
        </div>
        {categories.length > 5 && (
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="mt-4 block text-xs font-bold text-gray-400 hover:text-[#f0b31e] transition-colors"
          >
            {showAllCategories ? "SHOW LESS" : `+${categories.length - 5} MORE`}
          </button>
        )}
      </div>

      <Divider />

      {/* PRICE */}
      <div className="mb-2">
        <span className="text-xs font-bold text-[#f0b31e] mb-2 block tracking-widest uppercase">
          Price Range
        </span>
        <PriceRangeSlider
          min={0}
          max={50000}
          value={selectedPriceRange}
          onChange={setSelectedPriceRange}
        />
      </div>
      {sort && handleSortChange && (
        <>
          <Divider />
          <div className="mb-2">
            <span className="text-xs font-bold text-[#f0b31e] mb-2 block tracking-widest uppercase">
              Sorting Order
            </span>
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
        </>
      )}
    </aside>
  );
};

export default FilterSidebar;
