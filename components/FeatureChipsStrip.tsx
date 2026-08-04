"use client";
import { Award, Rocket, ShieldCheck, BookOpen, FileText } from "lucide-react";

const ACCENT = "#ff5a1f";
const items = [
  { icon: Award, label: "MSME Certified" },
  { icon: Rocket, label: "Startup India DPIIT" },
  { icon: ShieldCheck, label: "QC Before Dispatch" },
  { icon: BookOpen, label: "Guide + Viva Q&A Included" },
  { icon: FileText, label: "GST Invoice Available" },
];

export default function FeatureChipsStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-b border-gray-300 dark:border-white/10 bg-white dark:bg-black px-6 md:px-16 py-6 transition-colors">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center border shrink-0"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              <Icon size={16} />
            </span>
            <span className="font-mono text-xs text-gray-700 dark:text-white/70 whitespace-nowrap">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}