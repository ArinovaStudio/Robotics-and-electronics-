import React from "react";
import { Funnel } from "lucide-react";

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
  return (
    <aside className="w-[260px] bg-[#f8f8f8] rounded p-4 shadow-sm flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-[#050a30]">FILTERS</span>
        <Funnel size={20} className="text-[#434343]" />
      </div>
      <hr className="border-t border-[#e0e0e0] mb-3" />

      {/* BY BRANDS */}
      <div className="mb-3">
        <span className="text-base font-bold text-[#f0b31e] mb-2 block">
          BY BRANDS
        </span>
        <div className="flex flex-col gap-[10px]">
          {brands.map((b) => (
            <label
              key={b}
              className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-[17px] h-[17px] border border-[#bdbdbd] accent-[#f0b31e] rounded-none"
                style={{ borderRadius: 0 }}
              />
              {b}
            </label>
          ))}
        </div>
        <span className="mt-2 block text-sm font-semibold text-[#bdbdbd]">
          +10 MORE
        </span>
      </div>
      <hr className="border-t border-[#e0e0e0] mb-3" />

      {/* BY TYPES */}
      <div className="mb-3">
        <span className="text-base font-bold text-[#f0b31e] mb-2 block">
          BY TYPES
        </span>
        <div className="flex flex-col gap-[10px]">
          {types.map((t) => (
            <label
              key={t}
              className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-[17px] h-[17px] border border-[#bdbdbd] accent-[#f0b31e]"
                style={{ borderRadius: 0 }}
              />
              {t}
            </label>
          ))}
        </div>
        <span className="mt-2 block text-sm font-semibold text-[#bdbdbd]">
          +10 MORE
        </span>
      </div>
      <hr className="border-t border-[#e0e0e0] mb-3" />

      {/* PRICE */}
      {/* You can pass PriceRangeSlider as a child or keep it here */}
      <hr className="border-t border-[#e0e0e0] mb-3 mt-1" />

      {/* DISCOUNT RANGE */}
      <div>
        <span className="text-base font-bold text-[#f0b31e] mb-2 block">
          DISCOUNT RANGE
        </span>
        <div className="flex flex-col gap-[10px]">
          {discounts.map((d) => (
            <label
              key={d}
              className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-[17px] h-[17px] border border-[#bdbdbd] accent-[#f0b31e]"
                style={{ borderRadius: 0 }}
                checked={checkedDiscounts.includes(d)}
                onChange={() => toggleDiscount(d)}
              />
              {d}
            </label>
          ))}
        </div>
        <span className="mt-2 block text-sm font-semibold text-[#bdbdbd]">
          +3 MORE
        </span>
      </div>
    </aside>
  );
};

export default FilterSidebar;
