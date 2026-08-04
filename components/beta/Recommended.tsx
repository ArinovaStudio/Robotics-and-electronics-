import RecommendedGrid from "./RecommendedGrid";

const ACCENT = "#ff5a1f";

type Product = {
  id: string;
  title: string;
  price: string;
  salePrice: string | null;
  imageLink: string;
};

async function getRecentProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products?page=1&limit=10`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return data?.data?.products || [];
  } catch (err) {
    console.error("Failed to fetch recommended products:", err);
    return [];
  }
}

export default async function Recommended() {
  const products = await getRecentProducts();

  return (
    <section className="bg-white dark:bg-[#0a0a0a] border-b border-gray-300 dark:border-[#232323] h-auto">
      <div className="grid md:grid-cols-[240px_1fr] md:grid-rows-[auto_auto] h-auto">
        {/* Left gutter — "For You" badge, spans full section height */}
        <div className="hidden md:flex md:row-span-2 border-r border-gray-300 dark:border-[#232323] items-start px-6 py-16">
          <span className="inline-flex items-center gap-2 font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60 border border-gray-300 dark:border-white/15 px-3 py-1.5">
            <span style={{ color: ACCENT }} className="text-[10px]">▪</span>
            For You
          </span>
        </div>

        <div className="md:hidden px-6 pt-10">
          <span className="inline-flex items-center gap-2 font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60 border border-gray-300 dark:border-white/15 px-3 py-1.5">
            <span style={{ color: ACCENT }} className="text-[10px]">▪</span>
            For You
          </span>
        </div>

        {/* Top-right: title + Browse All */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 px-6 md:px-16 py-10 md:py-16 border-b border-gray-300 dark:border-[#232323]">
          <h2 className="font-oliveira text-3xl md:text-4xl text-gray-900 dark:text-white leading-tight">
            <span className="font-dm-sans font-bold" style={{ color: ACCENT }}>
              RECOMMENDED
            </span>{" "}
            By
            <br />
            Previews Browsing
          </h2>

          <a
            href="/products"
            className="inline-flex items-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-white px-6 py-3 transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: ACCENT }}
          >
            <span className="text-white text-[10px]">▪</span>
            Browse All
          </a>
        </div>

        {/* Staggered grid with scroll/cycle controls */}
        <div className="px-6 md:px-16 pt-16 md:pt-20 pb-16 md:pb-24 h-auto">
          {products.length > 0 ? (
            <RecommendedGrid products={products} />
          ) : (
            <p className="font-dm-sans text-gray-400 dark:text-white/30 text-sm">
              No products available right now.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}