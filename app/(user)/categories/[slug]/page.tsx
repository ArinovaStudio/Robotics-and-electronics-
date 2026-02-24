"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

type Product = {
  id: string;
  title: string;
  link: string;
  imageLink: string;
  price: { value: number; currency: string };
  salePrice?: { value: number; currency: string } | null;
  availability?: string;
  brand?: string | null;
  stockQuantity?: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { products: number };
};

type FilterState = {
  minPrice: string;
  maxPrice: string;
  brand: string;
  sort: string;
};

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    brand: "",
    sort: "newest",
  });

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug, page, filters]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);

      // Fetch category details
      const categoryRes = await axios.get(`/api/categories/${slug}`);
      if (categoryRes.data?.success) {
        setCategory(categoryRes.data.data);
      }

      // Fetch products
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sort: filters.sort,
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.brand && { brand: filters.brand }),
      });

      const productsRes = await axios.get(
        `/api/categories/${slug}/products?${params}`,
      );

      if (productsRes.data?.success && productsRes.data?.data) {
        setProducts(productsRes.data.data.products);
        setTotalPages(productsRes.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const getDiscountPercentage = (product: Product) => {
    if (!product.salePrice) return null;
    const discount =
      ((product.price.value - product.salePrice.value) / product.price.value) *
      100;
    return Math.round(discount);
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="w-full max-w-300 mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-[#050a30] hover:text-[#f0b31e] mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="font-semibold">Back to Categories</span>
        </Link>

        {/* Category Header */}
        {category && (
          <div className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold text-[#050a30] mb-2"
              style={{ fontFamily: spaceGrotesk.style.fontFamily }}
            >
              {category.name.toUpperCase()}
            </h1>
            {category.description && (
              <p className="text-gray-600 text-base">{category.description}</p>
            )}
            {category._count && (
              <p className="text-sm text-gray-500 mt-2">
                {category._count.products}{" "}
                {category._count.products === 1 ? "Product" : "Products"}
              </p>
            )}
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[#050a30] font-semibold"
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
            </button>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  placeholder="Min"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  placeholder="Max"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange("brand", e.target.value)}
                  placeholder="Enter brand name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-full h-48 bg-gray-200 rounded-xl animate-pulse mb-4" />
                <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse mb-2" />
                <div className="w-full h-6 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-96 bg-gray-50 rounded-2xl">
            <span className="text-6xl mb-4">📦</span>
            <h3 className="text-2xl font-bold text-[#050a30] mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later!
            </p>
            <button
              onClick={() => {
                setFilters({
                  minPrice: "",
                  maxPrice: "",
                  brand: "",
                  sort: "newest",
                });
                setPage(1);
              }}
              className="bg-[#f0b31e] text-[#050a30] font-semibold px-6 py-2 rounded-lg hover:bg-[#e6a700] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const discount = getDiscountPercentage(product);
                const currentPrice = product.salePrice || product.price;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-shadow cursor-pointer group"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    <div className="w-full h-48 bg-[#f8fafd] rounded-xl flex items-center justify-center overflow-hidden relative mb-4">
                      <Image
                        src={product.imageLink}
                        alt={product.title}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform"
                        unoptimized
                      />
                    </div>

                    {discount && (
                      <span className="inline-block text-xs font-semibold text-[#34d399] bg-[#eafaf1] px-3 py-1 rounded-full mb-2">
                        {discount}% OFF
                      </span>
                    )}

                    <h3 className="text-base font-bold text-[#050a30] mb-2 line-clamp-2 group-hover:text-[#f0b31e] transition-colors">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xl font-bold text-[#f0b31e]">
                        ₹{currentPrice.value.toLocaleString()}
                      </span>
                      {product.salePrice && (
                        <span className="text-sm text-[#434343] line-through">
                          ₹{product.price.value.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {product.brand && (
                      <p className="text-xs text-gray-500 mt-2">
                        {product.brand}
                      </p>
                    )}

                    {product.availability && (
                      <p
                        className={`text-xs mt-2 font-semibold ${
                          product.availability === "IN_STOCK"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.availability === "IN_STOCK"
                          ? "In Stock"
                          : "Out of Stock"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                        page === i + 1
                          ? "bg-[#f0b31e] text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
