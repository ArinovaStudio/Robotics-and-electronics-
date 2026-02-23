"use client";
import { JSX, useState } from "react";
import { ArrowRight } from "lucide-react";
import FilterSidebar from "./FilterSidebar";
import ProductGrid from "./ProductGrid";

const brands: string[] = [
  "FANUC",
  "ABB",
  "KUKA",
  "Denso Corporation",
  "Arduino",
];
const types: string[] = [
  "Electric Motor",
  "Semi-Conductors",
  "Ultra Sonic Sensors",
  "Sensors",
  "Wires",
];
const discounts: string[] = [
  "10% OFF",
  "20% OFF",
  "30% OFF",
  "40% OFF",
  "50% OFF",
  "60% OFF",
  "70% OFF",
];

type Product = {
  name: string;
  desc: string;
  price: number;
  oldPrice: number;
  discount: string;
};
const products: Product[] = Array(6).fill({
  name: "Aurdino uno 3.4",
  desc: "Lorem ipsum dolor sit amet consectetur. Augue ut nec mauris mauris cras gravida suspendisse.",
  price: 400,
  oldPrice: 600,
  discount: "20% OFF",
});

function PriceRangeSlider(): JSX.Element {
  const [minVal, setMinVal] = useState<number>(100);
  const [maxVal, setMaxVal] = useState<number>(1000);
  const MIN: number = 100;
  const MAX: number = 1000;

  const minPercent: number = ((minVal - MIN) / (MAX - MIN)) * 100;
  const maxPercent: number = ((maxVal - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="mb-2">
      <span className="text-base font-bold text-[#f0b31e] mb-3 block">
        PRICE
      </span>
      <div
        className="relative h-6 flex items-center"
        style={{ marginTop: "8px" }}
      >
        {/* Track background */}
        <div className="absolute w-full h-[4px] bg-[#e0e0e0] rounded-full" />
        {/* Yellow fill between handles */}
        <div
          className="absolute h-[4px] bg-[#f0b31e] rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={minVal}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), maxVal - 50);
            setMinVal(val);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={maxVal}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), minVal + 50);
            setMaxVal(val);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="text-center mt-3 text-sm font-semibold text-[#434343]">
        ₹{minVal} - ₹{maxVal === MAX ? `${MAX}+` : maxVal}
      </div>
      <style>{`
        input[type='range'].appearance-none::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f0b31e;
          border: 2.5px solid #fff;
          box-shadow: 0 0 0 2px #f0b31e;
          pointer-events: all;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f0b31e;
          border: 2.5px solid #fff;
          box-shadow: 0 0 0 2px #f0b31e;
          pointer-events: all;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-runnable-track {
          background: transparent;
        }
        input[type='range']::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f0b31e;
          border: 2.5px solid #fff;
          box-shadow: 0 0 0 2px #f0b31e;
          pointer-events: all;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default function RoboticsPartsSection(): JSX.Element {
  const [checkedDiscounts, setCheckedDiscounts] = useState<string[]>([
    "20% OFF",
  ]);

  const toggleDiscount = (d: string): void => {
    setCheckedDiscounts((prev: string[]) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  return (
    <section className="w-full max-w-[1200px] mx-auto mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12  px-2">
        <h2 className="text-2xl md:text-4xl font-semibold text-[#0a0f3c] tracking-wide uppercase">
          TOP SELLING{" "}
          <span className="relative inline-block">
            <span
              className="absolute bottom-0 left-0 w-full bg-[#f0b31e]"
              style={{ height: "55%" }}
            ></span>
            <span className="relative z-10">ROBOTICS</span>
          </span>{" "}
          PARTS
        </h2>
        <a
          href="#"
          className="text-[#f0b31e] font-semibold text-base flex items-center gap-1 hover:underline"
        >
          VIEW ALL
          <ArrowRight size={20} strokeWidth={2.2} className="ml-1" />
        </a>
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          brands={brands}
          types={types}
          discounts={discounts}
          checkedDiscounts={checkedDiscounts}
          toggleDiscount={toggleDiscount}
        />
        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[420px]">
            <h2 className="text-3xl font-black text-[#050a30] mb-2 flex items-center gap-2">
              OOPS! <span>😥</span>
            </h2>
            <p className="text-[#bdbdbd] text-lg mb-6">
              No product found, please try to clear filters
            </p>
            <button
              className="bg-[#0a0f3c] text-white font-semibold text-lg px-8 py-3 rounded-lg shadow-lg flex items-center gap-2 hover:bg-[#050a30] transition-all"
              onClick={() => {
                setCheckedDiscounts([]);
                // Add any other filter reset logic here
              }}
            >
              Clear Filters
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </section>
  );
}
