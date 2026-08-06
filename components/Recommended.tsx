import RecommendedGrid from "./RecommendedGrid";

const ACCENT = "#facc15"; // yellow-400

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
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?page=1&limit=10`,
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

        <div className="md:hidden px-4 sm:px-6 pt-8">
          <span className="inline-flex items-center gap-2 font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60 border border-gray-300 dark:border-white/15 px-3 py-1.5">
            <span style={{ color: ACCENT }} className="text-[10px]">▪</span>
            For You
          </span>
        </div>

        {/* Top-right: title + Browse All */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-6 px-4 sm:px-6 md:px-16 py-6 md:py-16 border-b border-gray-300 dark:border-[#232323]">
          <h2 className="font-oliveira text-2xl sm:text-3xl md:text-4xl text-gray-900 dark:text-white leading-tight break-words">
            <span className="font-dm-sans font-bold text-[#ca8a04] dark:text-[#facc15]">
              RECOMMENDED
            </span>{" "}
            By
            <br />
            Previews Browsing
          </h2>

          <a
            href="/products"
            className="inline-flex items-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 px-5 md:px-6 py-2.5 md:py-3 transition-opacity hover:opacity-90 flex-shrink-0 w-fit"
            style={{ backgroundColor: ACCENT }}
          >
            <span className="text-gray-900 text-[10px]">▪</span>
            Browse All
          </a>
        </div>

        {/* Staggered grid with scroll/cycle controls */}
        <div className="px-4 sm:px-6 md:px-16 pt-10 md:pt-20 pb-12 md:pb-24 h-auto">
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