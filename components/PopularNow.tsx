import PopularNowSlider from "./PopularNowSlider";

const ACCENT = "#facc15"; // yellow-400

type Product = {
  id: string;
  title: string;
  price: string;
  salePrice: string | null;
  imageLink: string;
  brand: string;
  productHighlights?: string[] | null;
};

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/featured-products`
    );
    const data = await res.json();
    return data?.products || [];
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
    return [];
  }
}

export default async function PopularNow() {
  const products = await getFeaturedProducts();

  return (
    <section
      id="popular-now"
      className="bg-white dark:bg-[#0a0a0a] scroll-mt-20 md:scroll-mt-24 border-b border-gray-300 dark:border-[#232323]"
    >
      {/* Same 240px gutter as Hero / Navbar / CategoryGrid, row-span so it
          runs the full height of this section including the product card below */}
      <div className="grid md:grid-cols-[240px_1fr] md:grid-rows-[auto_1fr]">
        {/* Left gutter — badge lives here, rest is empty whitespace, spans both rows */}
        <div className="hidden md:flex md:row-span-2 border-r border-gray-300 dark:border-[#232323] items-start px-6 py-16">
          <span className="font-dm-sans text-xs uppercase tracking-widest text-gray-500 dark:text-white/40 border border-gray-300 dark:border-white/15 px-3 py-3">
            Popular Now
          </span>
        </div>

        {/* Mobile-only badge, since gutter is hidden below md */}
        <div className="md:hidden px-4 sm:px-6 pt-8">
          <span className="font-dm-sans text-xs uppercase tracking-widest text-gray-500 dark:text-white/40 border border-gray-300 dark:border-white/15 px-3 py-1 rounded-full">
            Popular Now
          </span>
        </div>

        {/* Title row */}
        <div className="px-4 sm:px-6 md:px-16 py-6 md:py-16 border-b border-gray-300 dark:border-[#232323]">
          <h2 className="font-oliveira text-2xl sm:text-3xl md:text-4xl text-gray-900 dark:text-white leading-tight break-words">
            Gaining{" "}
            <span style={{ color: ACCENT }} className="font-dm-sans font-bold">
              POPULARITY
            </span>
            <br />
            at Tsquarey Currently
          </h2>
        </div>

        {/* Product card row — aligned with title's left edge via same grid column */}
        <div className="px-4 sm:px-6 md:px-16 py-10 md:py-20 max-w-[1200px] min-w-0">
          {products.length > 0 ? (
            <PopularNowSlider products={products} />
          ) : (
            <p className="font-dm-sans text-gray-400 dark:text-white/30 text-sm">
              No featured products available right now.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}