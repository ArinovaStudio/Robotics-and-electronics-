"use client";
import { useState, useEffect } from "react";
import { Space_Grotesk } from "next/font/google";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
};

export default function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "/api/categories?isActive=true&parentId=null&includeProducts=true",
      );

      if (response.data?.success && response.data?.data) {
        const cats = response.data.data;
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedSlug(cats[0].slug);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full max-w-300 mx-auto mt-8 mb-16">
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full flex justify-between items-center gap-6 md:gap-8 overflow-x-auto pb-2 px-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center min-w-22.5 justify-start"
            >
              <div className="w-20 h-20 md:w-25 md:h-25 rounded-full bg-gray-200 animate-pulse" />
              <div className="mt-2 w-16 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-5 mt-8 mb-16">
      <div className="flex items-center justify-between mb-2 px-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#050A30] mb-5 tracking-wide">
          SHOP BY CATEGORIES
        </h2>
        <Link
          href="/categories"
          className="text-[#f0b31e] font-space-grotesk font-semibold text-sm md:text-base flex items-center gap-1 hover:underline"
        >
          VIEW ALL
          <ArrowRight size={18} strokeWidth={2.2} className="ml-1" />
        </Link>
      </div>
      <div className="w-full no-scrollbar flex justify-between items-center gap-6 md:gap-15 overflow-x-auto pb-2 px-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center min-w-22.5 justify-start group"
            onMouseEnter={() => setSelectedSlug(cat.slug)}
          >
            <div
              className={`w-20 h-20 md:w-25 md:h-25 rounded-full bg-gray-100 flex items-center justify-center border-4 transition-all overflow-hidden ${selectedSlug === cat.slug
                  ? "border-[#f0b31e]"
                  : "border-transparent"
                } group-hover:border-[#f0b31e]`}
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-2xl text-gray-400">📦</span>
              )}
            </div>
            <span
              className={`mt-2 text-xs md:text-sm font-space-grotesk font-bold text-center whitespace-pre-line flex items-center justify-center w-full transition-colors ${selectedSlug === cat.slug ? "text-[#f0b31e]" : "text-[#050a30]"
                } group-hover:text-[#f0b31e] ${spaceGrotesk.className}`}
              style={{ minHeight: "2.5em", lineHeight: "1.2" }}
            >
              {cat.name.toUpperCase()}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
