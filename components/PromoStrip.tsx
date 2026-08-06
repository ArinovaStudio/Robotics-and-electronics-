"use client";

import { Truck, ShieldCheck, Store, Headset } from "lucide-react";

const ACCENT = "#facc15"; // yellow-400

const items = [
  { icon: Truck, title: "Fast Delivery", subtitle: "Pan-India shipping" },
  { icon: ShieldCheck, title: "Genuine Parts", subtitle: "Quality guaranteed" },
  { icon: Store, title: "Student-First Pricing", subtitle: "Built for makers" },
  { icon: Headset, title: "Expert Support", subtitle: "Tech Engi connect" },
];

export default function PromoStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
      {items.map((item, i) => {
        const Icon = item.icon;
        const isLastCol = (i + 1) % 4 === 0;
        const isLastRowMobile = (i + 1) % 2 === 0;
        return (
          <div
            key={item.title}
            className={`flex items-center justify-center gap-2 md:gap-3 px-2 md:px-4 py-3 md:py-5 border-gray-300 dark:border-white/10 ${
              !isLastRowMobile ? "border-r" : ""
            } ${!isLastCol ? "md:border-r" : "md:border-r-0"} ${
              i < 2 ? "border-b md:border-b-0" : ""
            }`}
          >
            <Icon size={18} className="md:hidden shrink-0" style={{ color: ACCENT }} />
            <Icon size={20} className="hidden md:block shrink-0" style={{ color: ACCENT }} />
            <div className="min-w-0">
              <p className="font-dm-sans text-[11px] md:text-xs font-bold text-gray-900 dark:text-white truncate">
                {item.title}
              </p>
              <p className="font-mono text-[9px] md:text-[11px] text-gray-500 dark:text-white/40 truncate">
                {item.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}