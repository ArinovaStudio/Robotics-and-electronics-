"use client";
import { useState, useEffect } from "react";
import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="w-full max-w-300 mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-[#050a30] mb-2"
            style={{ fontFamily: spaceGrotesk.style.fontFamily }}
          >
            ALL CATEGORIES
          </h1>
          <p className="text-gray-600 text-base">
            Browse our complete collection of product categories
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-200 rounded-2xl animate-pulse mb-4" />
                <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse mt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-96 bg-gray-50 rounded-2xl">
            <span className="text-6xl mb-4">📦</span>
            <h3 className="text-2xl font-bold text-[#050a30] mb-2">
              No Categories Available
            </h3>
            <p className="text-gray-600 mb-4">
              Check back later for new categories!
            </p>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center"
              >
                <div className="w-full aspect-square bg-[#f8fafd] rounded-2xl flex items-center justify-center overflow-hidden mb-4 border-4 border-transparent group-hover:border-[#f0b31e] transition-all relative">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                      unoptimized
                    />
                  ) : (
                    <span className="text-5xl text-gray-400">📦</span>
                  )}
                </div>

                <h3
                  className="text-sm md:text-base font-bold text-[#050a30] text-center mb-1 group-hover:text-[#f0b31e] transition-colors"
                  style={{ fontFamily: spaceGrotesk.style.fontFamily }}
                >
                  {category.name.toUpperCase()}
                </h3>

                {category._count && (
                  <p className="text-xs text-gray-500">
                    {category._count.products}{" "}
                    {category._count.products === 1 ? "Product" : "Products"}
                  </p>
                )}

                {category.description && (
                  <p className="text-xs text-gray-600 text-center mt-2 line-clamp-2 px-2">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
