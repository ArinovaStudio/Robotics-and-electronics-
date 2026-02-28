"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Funnel, Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

export type FilterState = {
  categories: string[];     // slugs
  discounts: string[];      // e.g. ["10% OFF", "20% OFF"]
  minPrice: number;
  maxPrice: number;
};

type FilterSidebarProps = {
  onFiltersChange: (filters: FilterState) => void;
  resetKey?: number;
};

// ─── Price Range Slider ──────────────────────────────────────────────────────

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
        const v = Math.round(min + p * (max - min));
        if (thumb === "low") {
          onChange([Math.min(v, value[1] - 50), value[1]]);
        } else {
          onChange([value[0], Math.max(v, value[0] + 50)]);
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

// ─── Custom Checkbox ─────────────────────────────────────────────────────────

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

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFiltersChange, resetKey = 0 }) => {
  // Filter options from API
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [discountOptions, setDiscountOptions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000,
  });
  const [loading, setLoading] = useState(true);

  // Selected filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 10000]);

  // Track if initial data loaded
  const initializedRef = useRef(false);

  // Fetch filter options on mount
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("/api/products/filters");
        const data = await res.json();
        if (data.success) {
          const d = data.data;
          setCategories(d.categories || []);
          setDiscountOptions(d.discounts || []);
          setPriceRange(d.priceRange || { min: 0, max: 10000 });
          setSelectedPriceRange([
            d.priceRange?.min || 0,
            d.priceRange?.max || 10000,
          ]);
          initializedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilters();
  }, []);

  // Reset all selections when resetKey changes (parent clicked "Clear Filters")
  useEffect(() => {
    if (resetKey > 0) {
      setSelectedCategories([]);
      setSelectedDiscounts([]);
      setSelectedPriceRange([priceRange.min, priceRange.max]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Notify parent when filters change
  useEffect(() => {
    if (!initializedRef.current) return;
    onFiltersChange({
      categories: selectedCategories,
      discounts: selectedDiscounts,
      minPrice: selectedPriceRange[0],
      maxPrice: selectedPriceRange[1],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedDiscounts, selectedPriceRange]);

  const toggleItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const Divider = () => (
    <hr className="border-t border-[#e0e0e0] my-2" />
  );

  const showMoreCategories = 5;
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, showMoreCategories);

  if (loading) {
    return (
      <aside className="w-[260px] bg-[#f8f8f8] rounded p-4 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-[#f0b31e]" size={28} />
      </aside>
    );
  }

  return (
    <aside className="w-[260px] bg-[#f8f8f8] rounded p-4 shadow-sm flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-space-grotesk font-medium text-[#050a30]">FILTERS</span>
        <Funnel size={20} className="text-[#434343]" />
      </div>

      <Divider />

      {/* BY CATEGORY */}
      <div className="mb-3 mt-1">
        <span className="text-sm font-semibold text-[#f0b31e] mb-2 block tracking-wide">
          BY CATEGORY
        </span>
        <div className="flex flex-col gap-[10px]">
          {visibleCategories.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer select-none"
            >
              <CustomCheckbox
                checked={selectedCategories.includes(c.slug)}
                onChange={() =>
                  toggleItem(selectedCategories, setSelectedCategories, c.slug)
                }
              />
              {c.name}
              <span className="ml-auto text-xs text-gray-400">
                ({c.productCount})
              </span>
            </label>
          ))}
        </div>
        {categories.length > showMoreCategories && (
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="mt-2 block text-sm font-semibold text-[#bdbdbd] hover:text-[#f0b31e] transition-colors"
          >
            {showAllCategories
              ? "SHOW LESS"
              : `+${categories.length - showMoreCategories} MORE`}
          </button>
        )}
      </div>

      <Divider />

      {/* PRICE */}
      <div className="mt-1 mb-1">
        <span className="text-sm font-semibold text-[#f0b31e] mb-1 block tracking-wide">
          PRICE
        </span>
        <PriceRangeSlider
          min={priceRange.min}
          max={priceRange.max}
          value={selectedPriceRange}
          onChange={setSelectedPriceRange}
        />
      </div>

      <Divider />

      {/* DISCOUNT RANGE */}
      {discountOptions.length > 0 && (
        <div className="mt-1">
          <span className="text-sm font-semibold text-[#f0b31e] mb-2 block tracking-wide">
            DISCOUNT RANGE
          </span>
          <div className="flex flex-col gap-[10px]">
            {discountOptions.map((d) => (
              <label
                key={d}
                className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer select-none"
              >
                <CustomCheckbox
                  checked={selectedDiscounts.includes(d)}
                  onChange={() =>
                    toggleItem(selectedDiscounts, setSelectedDiscounts, d)
                  }
                />
                {d}
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;