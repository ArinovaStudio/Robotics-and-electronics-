"use client";
import { Award, Rocket, ShieldCheck, BookOpen, FileText } from "lucide-react";

const ACCENT = "#facc15"; 

const items = [
  { icon: Award, label: "MSME Certified" },
  { icon: Rocket, label: "Startup India DPIIT" },
  { icon: ShieldCheck, label: "QC Before Dispatch" },
  { icon: BookOpen, label: "Guide + Viva Q&A Included" },
  { icon: FileText, label: "GST Invoice Available" },
];

export default function FeatureChipsStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-10 md:gap-y-4 border-b border-gray-300 dark:border-white/10 bg-white dark:bg-black px-4 md:px-16 py-4 md:py-6 transition-colors">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-2 md:gap-2.5">
            <span
              className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center border shrink-0"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              <Icon size={15} />
            </span>
            <span className="font-mono text-[10px] md:text-xs text-gray-700 dark:text-white/70 whitespace-nowrap">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}