import React from "react";
import { ArrowRight } from "lucide-react";

const categories = [
  { name: "ROBITICS", selected: true },
  { name: "ELECTRONICS" },
  { name: "SEMI\nCONDUCTOR" },
  { name: "DIY\nPROJECTS" },
  { name: "DRONE\nPARTS" },
  { name: "TV PARTS" },
  { name: "MUSICSYSTEM\nPARTS" },
  { name: "HOME\nAPPLIANCES" },
  { name: "COLLEGE\nPROJECTS" },
];

export default function HomeCategories() {
  return (
    <section className="w-full max-w-[1200px] mx-auto mt-8 mb-16">
      <div className="flex items-center justify-between mb-2 px-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#050a30] mb-5 tracking-wide">
          SHOP BY CATEOGRIES
        </h2>
        <a
          href="#"
          className="text-[#f0b31e] font-semibold text-sm md:text-base flex items-center gap-1 hover:underline"
        >
          VIEW ALL
          <ArrowRight size={18} strokeWidth={2.2} className="ml-1" />
        </a>
      </div>
      <div className="w-full flex justify-between items-center gap-6 md:gap-8 overflow-x-auto pb-2 px-2">
        {categories.map((cat, idx) => (
          <div
            key={cat.name}
            className="flex flex-col items-center min-w-[90px] justify-start"
          >
            <div
              className={`w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full bg-gray-200 flex items-center justify-center border-4 ${cat.selected ? "border-[#f0b31e]" : "border-transparent"}`}
            >
              {/* Image placeholder */}
            </div>
            <span
              className={`mt-2 text-xs md:text-sm font-bold text-center whitespace-pre-line flex items-center justify-center w-full ${cat.selected ? "text-[#f0b31e]" : "text-[#050a30]"}`}
              style={{ minHeight: "2.5em", lineHeight: "1.2" }}
            >
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
