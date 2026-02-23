
"use client";

import React, { useState, useRef, useCallback } from "react";
import { Funnel } from "lucide-react";

// ─── Price Range Slider ──────────────────────────────────────────────────────

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min = 100,
  max = 1000,
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
      {/* Track */}
      <div
        ref={trackRef}
        className="relative"
        style={{ height: 3, background: "#e0e0e0", borderRadius: 2, margin: "10px 10px" }}
      >
        {/* Filled range */}
        <div
          className="absolute h-full"
          style={{
            left: `${pct(value[0])}%`,
            right: `${100 - pct(value[1])}%`,
            background: "#f0b31e",
            borderRadius: 2,
          }}
        />

        {/* Low thumb */}
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

        {/* High thumb */}
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

      {/* Label */}
      <p className="text-center font-bold text-[#111] mt-3" style={{ fontSize: 14 }}>
        ₹{value[0]} - ₹{value[1] >= max ? `${max}+` : value[1]}
      </p>
    </div>
  );
};

// ─── Custom Checkbox ─────────────────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

const CustomCheckbox: React.FC<CheckboxProps> = ({ checked, onChange }) => (
  <span
    onClick={onChange}
    className="inline-flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-100"
    style={{
      width: 17,
      height: 17,
      minWidth: 17,
      border: `1.5px solid ${checked ? "#f0b31e" : "#bdbdbd"}`,
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

type FilterSidebarProps = {
  brands: string[];
  types: string[];
  discounts: string[];
  checkedDiscounts: string[];
  toggleDiscount: (discount: string) => void;
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  brands,
  types,
  discounts,
  checkedDiscounts,
  toggleDiscount,
}) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 1000]);
  const [checkedBrands, setCheckedBrands] = useState<string[]>([]);
  const [checkedTypes, setCheckedTypes] = useState<string[]>([]);

  const toggleItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const Divider = () => (
    <hr className="border-t border-[#e0e0e0]" style={{ margin: "8px 0" }} />
  );

  return (
    <aside className="w-[260px] bg-[#f8f8f8] rounded p-4 shadow-sm flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-[#050a30]">FILTERS</span>
        <Funnel size={20} className="text-[#434343]" />
      </div>

      <Divider />

      {/* BY BRANDS */}
      <div className="mb-3 mt-1">
        <span className="text-sm font-bold text-[#f0b31e] mb-2 block tracking-wide">
          BY BRANDS
        </span>
        <div className="flex flex-col gap-[10px]">
          {brands.map((b) => (
            <label
              key={b}
              className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer select-none"
            >
              <CustomCheckbox
                checked={checkedBrands.includes(b)}
                onChange={() => toggleItem(checkedBrands, setCheckedBrands, b)}
              />
              {b}
            </label>
          ))}
        </div>
        <span className="mt-2 block text-sm font-semibold text-[#bdbdbd]">+10 MORE</span>
      </div>

      <Divider />

      {/* BY TYPES */}
      <div className="mb-3 mt-1">
        <span className="text-sm font-bold text-[#f0b31e] mb-2 block tracking-wide">
          BY TYPES
        </span>
        <div className="flex flex-col gap-[10px]">
          {types.map((t) => (
            <label
              key={t}
              className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer select-none"
            >
              <CustomCheckbox
                checked={checkedTypes.includes(t)}
                onChange={() => toggleItem(checkedTypes, setCheckedTypes, t)}
              />
              {t}
            </label>
          ))}
        </div>
        <span className="mt-2 block text-sm font-semibold text-[#bdbdbd]">+10 MORE</span>
      </div>

      <Divider />

      {/* PRICE */}
      <div className="mt-1 mb-1">
        <span className="text-sm font-bold text-[#f0b31e] mb-1 block tracking-wide">
          PRICE
        </span>
        <PriceRangeSlider
          min={100}
          max={1000}
          value={priceRange}
          onChange={setPriceRange}
        />
      </div>

      <Divider />

      {/* DISCOUNT RANGE */}
      <div className="mt-1">
        <span className="text-sm font-bold text-[#f0b31e] mb-2 block tracking-wide">
          DISCOUNT RANGE
        </span>
        <div className="flex flex-col gap-[10px]">
          {discounts.map((d) => (
            <label
              key={d}
              className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer select-none"
            >
              <CustomCheckbox
                checked={checkedDiscounts.includes(d)}
                onChange={() => toggleDiscount(d)}
              />
              {d}
            </label>
          ))}
        </div>
        <span className="mt-2 block text-sm font-semibold text-[#bdbdbd]">+3 MORE</span>
      </div>
    </aside>
  );
};

export default FilterSidebar;