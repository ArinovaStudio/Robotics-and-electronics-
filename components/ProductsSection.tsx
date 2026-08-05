"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ProductRequestModal from "./ProductRequestModal";

const ACCENT = "#ff5a1f";
const MAX_PRICE = 50000;

type Product = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  price: string;
  salePrice: string | null;
  brand: string | null;
  category: { id: string; name: string; slug: string } | null;
  stock: number;
  isLowStock: boolean;
  link: string;
};

type Facets = {
  categories: { id: string; name: string; count: number }[];
  brands: string[];
};

type ApiResponse = {
  success: boolean;
  data: {
    products: Product[];
    facets: Facets;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
    };
  };
};

const PAGE_SIZE = 12; // full listing page shows more per page than the homepage embed did

export default function ProductsSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<Facets>({ categories: [], brands: [] });
  const [loading, setLoading] = useState(true);

  const categoryName = searchParams.get("categoryName") || null;
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categoryId")?.split(",").filter(Boolean) || []
  );
  const [minPrice, setMinPrice] = useState<number>(
    Number(searchParams.get("minPrice")) || 0
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    Number(searchParams.get("maxPrice")) || MAX_PRICE
  );
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const VISIBLE_COUNT = 6;
  const readMoreRef = useRef<HTMLButtonElement>(null);

  const toggleCategoriesExpanded = useCallback(() => {
    setCategoriesExpanded((prev) => {
      const next = !prev;
      // Only correct scroll position when collapsing. Expanding just grows
      // the list downward — nothing above the button moves, so the button
      // stays put naturally. Collapsing removes content, which would
      // otherwise yank the button (and viewport) upward.
      if (!next) {
        requestAnimationFrame(() => {
          readMoreRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
        });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    params.set("page", String(currentPage));
    if (selectedCategories.length > 0) {
      params.set("categoryId", selectedCategories.join(","));
    }
    if (minPrice > 0) params.set("minPrice", String(minPrice));
    if (maxPrice < MAX_PRICE) params.set("maxPrice", String(maxPrice));

    setLoading(true);

    fetch(`/api/products?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json: ApiResponse) => {
        if (json.success) {
          setProducts(json.data.products);
          setFacets(json.data.facets);
          setTotalPages(json.data.pagination.totalPages || 1);
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err))
      .finally(() => setLoading(false));

    // startTransition(() => {
    //   // Adapts based on where this component is rendered: embedded on the
    //   // homepage () it keeps the #products anchor; on its own
    //   // standalone route it just updates that route's query string.
    //   const isEmbeddedOnHome = pathname === "";
    //   const target = isEmbeddedOnHome
    //     ? `?${params.toString()}#products`
    //     : `${pathname}?${params.toString()}`;
    //   router.replace(target, { scroll: false });
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, minPrice, maxPrice, currentPage]);

  // Reset to page 1 whenever filters change (not when page itself changes)
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, minPrice, maxPrice]);

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  return (
    <section
      id="products"
      className="border-b border-gray-300 dark:border-white/10 bg-white dark:bg-transparent"
    >
      {/* Header row — title + View All, full-width border beneath */}
      <div className="flex items-center justify-between border-b border-gray-300 dark:border-white/10 px-6 md:px-16 py-6 md:py-8">
        <h2 className="font-dm-sans text-xl md:text-2xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">
          {categoryName ?? "Top Selling Products"}
        </h2>
        <Link
          href="/products"
          className="flex items-center gap-2 font-dm-sans text-xs font-bold uppercase tracking-widest whitespace-nowrap"
          style={{ color: ACCENT }}
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {/* Two-column split — filters aligned to same 240px gutter as CategoryGrid sidebar */}
      <div className="grid md:grid-cols-[240px_1fr]">
        {/* Filters — collapsible, brutalist: sharp corners, horizontal rules only */}
        <aside className="border-b md:border-b-0 md:border-r border-gray-300 dark:border-white/10 md:sticky md:top-0 md:self-start md:max-h-screen md:overflow-y-auto">
          <div className="px-6 py-5 border-b border-gray-300 dark:border-white/10">
            <span className="font-dm-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gray-700 dark:text-white/70">
              Filters
            </span>
          </div>

          <div>
            {/* Categories */}
            <div className="border-b border-gray-300 dark:border-white/10 px-6 py-5">
              <p
                className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
                style={{ color: ACCENT }}
              >
                Categories
              </p>
              <div className="flex flex-col gap-4">
                {(categoriesExpanded
                  ? facets.categories
                  : facets.categories.slice(0, VISIBLE_COUNT)
                ).map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <span className="relative h-4 w-4 shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="peer h-4 w-4 cursor-pointer appearance-none border border-gray-400 dark:border-white/30"
                        style={{
                          backgroundColor: selectedCategories.includes(cat.id)
                            ? ACCENT
                            : "transparent",
                          borderColor: selectedCategories.includes(cat.id)
                            ? ACCENT
                            : undefined,
                        }}
                      />
                      {selectedCategories.includes(cat.id) && (
                        <svg
                          viewBox="0 0 16 16"
                          className="pointer-events-none absolute inset-0 h-4 w-4 p-[2px]"
                        >
                          <path
                            d="M3 8l3 3 7-7"
                            stroke="white"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="square"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="font-mono text-xs text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {cat.name}
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-gray-400 dark:text-white/30">
                      {cat.count}
                    </span>
                  </label>
                ))}
              </div>

              {facets.categories.length > VISIBLE_COUNT && (
                <button
                  ref={readMoreRef}
                  type="button"
                  onClick={toggleCategoriesExpanded}
                  className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: ACCENT }}
                >
                  {categoriesExpanded
                    ? "− Read Less"
                    : `+ Read More (${facets.categories.length - VISIBLE_COUNT})`}
                </button>
              )}
            </div>

            {/* Price range */}
            {/* Price range */}
              <div className="px-6 py-5">
                <p
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] mb-5"
                  style={{ color: ACCENT }}
                >
                  Price Range
                </p>

                {/* Direct entry inputs */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex-1">
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-gray-400 dark:text-white/30 mb-1">
                      Min
                    </label>
                    <div className="flex items-center border border-gray-300 dark:border-white/15 px-2 py-1.5">
                      <span className="font-mono text-xs text-gray-400 dark:text-white/30 mr-1">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={maxPrice - 50}
                        step={50}
                        value={minPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (Number.isNaN(val)) return;
                          setMinPrice(Math.max(0, Math.min(val, maxPrice - 50)));
                        }}
                        className="w-full bg-transparent font-mono text-xs text-gray-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  <span className="mt-4 font-mono text-xs text-gray-400 dark:text-white/30">
                    —
                  </span>

                  <div className="flex-1">
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-gray-400 dark:text-white/30 mb-1">
                      Max
                    </label>
                    <div className="flex items-center border border-gray-300 dark:border-white/15 px-2 py-1.5">
                      <span className="font-mono text-xs text-gray-400 dark:text-white/30 mr-1">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={minPrice + 50}
                        max={MAX_PRICE}
                        step={50}
                        value={maxPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (Number.isNaN(val)) return;
                          setMaxPrice(Math.min(MAX_PRICE, Math.max(val, minPrice + 50)));
                        }}
                        className="w-full bg-transparent font-mono text-xs text-gray-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative h-[2px] bg-gray-300 dark:bg-white/15 mb-5">
                  <div
                    className="absolute h-[2px]"
                    style={{
                      backgroundColor: ACCENT,
                      left: `${(minPrice / MAX_PRICE) * 100}%`,
                      right: `${100 - (maxPrice / MAX_PRICE) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={MAX_PRICE}
                    step={50}
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(Math.min(Number(e.target.value), maxPrice - 50))
                    }
                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-900 dark:[&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <input
                    type="range"
                    min={0}
                    max={MAX_PRICE}
                    step={50}
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(Math.max(Number(e.target.value), minPrice + 50))
                    }
                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-900 dark:[&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                <p className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                  ₹{minPrice.toLocaleString("en-IN")} — ₹
                  {maxPrice >= MAX_PRICE
                    ? `${MAX_PRICE.toLocaleString("en-IN")}+`
                    : maxPrice.toLocaleString("en-IN")}
                </p>
              </div>

            {/* Product Request card */}
            <div className="border-t border-gray-300 dark:border-white/10 px-6 py-6">
              <p className="font-dm-sans text-sm font-bold text-gray-900 dark:text-white">
                Product Request
              </p>
              <p className="mt-2 font-mono text-xs text-gray-500 dark:text-white/50 leading-relaxed">
                Have an idea for a new product? Let us know!
              </p>
              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="mt-4 w-full font-dm-sans text-xs font-semibold uppercase tracking-widest text-white px-6 py-3 transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </aside>

        {/* Product grid — wireframe cells: borders between every row/column */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="border-b border-r border-gray-300 dark:border-white/10 p-6"
                >
                  <div className="aspect-[1.3] bg-gray-100 dark:bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => {
                const displayPrice = product.salePrice ?? product.price;
                const isLastCol = (i + 1) % 3 === 0;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.link}`}
                    className={`group flex flex-col p-6 border-b border-gray-300 dark:border-white/10 ${!isLastCol ? "border-r" : ""
                      }`}
                  >
                    <div className="relative aspect-[1.3]">
                      <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-gray-400 dark:border-white/40" />
                      <span className="absolute top-0 right-0 h-3 w-3 border-t border-r border-gray-400 dark:border-white/40" />
                      <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-gray-400 dark:border-white/40" />
                      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-gray-400 dark:border-white/40" />

                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.title}
                          loading="lazy"
                          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-mono text-xs text-gray-300 dark:text-white/20">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-1 flex-col">
                      <h3 className="line-clamp-2 font-dm-sans text-sm font-bold text-gray-900 dark:text-white">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="mt-2 line-clamp-2 font-mono text-xs leading-5 text-gray-500 dark:text-white/50">
                          {product.description}
                        </p>
                      )}
                      <p
                        className="mt-3 font-dm-sans text-lg font-extrabold"
                        style={{ color: ACCENT }}
                      >
                        ₹{Number(displayPrice).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center border-t border-gray-300 dark:border-white/10 py-20">
              <p className="font-mono text-xs text-gray-400 dark:text-white/40">
                No products match these filters.
              </p>
            </div>
          )}

          {/* Pagination — only show once loaded and there's more than one page */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-gray-300 dark:border-white/10 py-8 font-mono text-xs">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-white/15 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current, and neighbors of current — collapse the rest into "..."
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .reduce<(number | "ellipsis")[]>((acc, page, i, arr) => {
                  if (i > 0 && page - (arr[i - 1] as number) > 1) {
                    acc.push("ellipsis");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "ellipsis" ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 dark:text-white/30">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCurrentPage(item)}
                      className={
                        item === currentPage
                          ? "w-9 h-9 flex items-center justify-center border text-white"
                          : "w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-white/15 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors"
                      }
                      style={
                        item === currentPage
                          ? { backgroundColor: ACCENT, borderColor: ACCENT }
                          : undefined
                      }
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-white/15 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductRequestModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />
    </section>
  );
}
