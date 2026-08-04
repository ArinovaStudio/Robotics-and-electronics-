"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Minus, Plus } from "lucide-react";

const ACCENT = "#ff5a1f";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string | null;
  createdAt: string;
};

type Faq = {
  question: string;
  answer: string;
};

type ProductDetailItem = {
  sectionName: string;
  attributeName: string;
  attributeValue: string;
};

type Product = {
  id: string;
  title: string;
  description: string | null;
  imageLink: string | null;
  additionalImageLinks: string[] | null;
  price: string;
  salePrice: string | null;
  brand: string | null;
  category: { id: string; name: string; slug: string } | null;
  stockQuantity: number;
  link: string;
  productDetails: ProductDetailItem[] | null;
  productHighlights: string[] | null;
  avgRating: number;
  reviews: Review[];
  faqs?: Faq[] | null;
};

type SimilarProduct = {
  id: string;
  title: string;
  imageLink: string | null;
  price: string;
  salePrice: string | null;
  link: string;
};

type Tab = "details" | "reviews" | "faqs";

function StarRow({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={size}
          style={{ color: i < Math.round(rating) ? ACCENT : undefined }}
        >
          {i < Math.round(rating) ? "★" : <span className="text-gray-300 dark:text-white/20">★</span>}
        </span>
      ))}
    </div>
  );
}

export default function ProductDetail({
  product,
  similarProducts,
}: {
  product: any;
  similarProducts: SimilarProduct[];
}) {
  const images = [product.imageLink, ...(product.additionalImageLinks || [])].filter(
    Boolean
  ) as string[];

  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [cartStatus, setCartStatus] = useState<"idle" | "adding" | "error">("idle");
  const [cartError, setCartError] = useState<string | null>(null);

  async function addToCart(): Promise<boolean> {
    setCartStatus("adding");
    setCartError(null);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push(`/login?callbackUrl=/products/${product.link}`);
        return false;
      }

      if (!data.success) {
        setCartStatus("error");
        setCartError(data.message || "Could not add item to cart.");
        return false;
      }

      setCartStatus("idle");
      return true;
    } catch {
      setCartStatus("error");
      setCartError("Something went wrong. Please try again.");
      return false;
    }
  }

  async function handleAddToCart() {
    const ok = await addToCart();
    if (ok) {
      router.refresh();
    }
  }

  async function handleBuyNow() {
    const ok = await addToCart();
    if (ok) {
      router.push("/cart");
    }
  }

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount =
    product.salePrice && Number(product.salePrice) < Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(
      ((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100
    )
    : 0;

  const inStock = product.stockQuantity > 0;
  const reviewCount = product.reviews.length;
  const faqs = product.faqs ?? [];

  return (
    <>
      {/* Breadcrumb */}
      <section className="border-b border-gray-300 dark:border-white/10 px-6 md:px-16 py-4">
        <nav className="font-mono text-xs text-gray-500 dark:text-white/40">
          <Link href="" className="hover:underline">Home</Link>
          {" / "}
          <Link href="/products" className="hover:underline">Products</Link>
          {product.category && (
            <>
              {" / "}
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:underline"
              >
                {product.category.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-gray-700 dark:text-white/70">{product.title}</span>
        </nav>
      </section>

      {/* Main split: sticky left image column + scrolling right content column.
          Sticky is scoped to this grid — it releases once the right column's
          content ends, before Similar Products starts. */}
      <section className="grid md:grid-cols-[minmax(0,480px)_1fr] border-b border-gray-300 dark:border-white/10">
        {/* LEFT: sticky image gallery */}
        <div className="border-b md:border-b-0 md:border-r border-gray-300 dark:border-white/10">
          <div className="md:sticky md:top-0 md:h-screen flex flex-col justify-center p-6 md:p-10">
            <div className="relative aspect-square border border-gray-300 dark:border-white/10">
              <span className="absolute top-1.5 left-1.5 h-3 w-3 border-t border-l border-gray-400 dark:border-white/40 z-10" />
              <span className="absolute top-1.5 right-1.5 h-3 w-3 border-t border-r border-gray-400 dark:border-white/40 z-10" />
              <span className="absolute bottom-1.5 left-1.5 h-3 w-3 border-b border-l border-gray-400 dark:border-white/40 z-10" />
              <span className="absolute bottom-1.5 right-1.5 h-3 w-3 border-b border-r border-gray-400 dark:border-white/40 z-10" />

              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="h-full w-full object-contain p-8"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-xs text-gray-300 dark:text-white/20">
                  No image
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className="relative h-16 w-16 shrink-0 border p-1 transition-colors"
                    style={{ borderColor: i === activeImage ? ACCENT : undefined }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${product.title} ${i + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: title, price, CTAs, and tabbed content */}
        <div>
          {/* Title + price + CTAs */}
          <div className="px-6 md:px-10 py-8 border-b border-gray-300 dark:border-white/10">
            {product.brand && (
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">
                {product.brand}
              </p>
            )}
            <h1 className="mt-2 font-dm-sans text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              {product.title}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <StarRow rating={product.avgRating} />
              <span className="font-mono text-xs text-gray-500 dark:text-white/40">
                {product.avgRating.toFixed(1)}/5 ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <p className="font-dm-sans text-3xl font-extrabold" style={{ color: ACCENT }}>
                ₹{Number(displayPrice).toLocaleString("en-IN")}
              </p>
              {hasDiscount && (
                <>
                  <p className="font-mono text-sm text-gray-400 dark:text-white/30 line-through">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                  <p className="font-mono text-xs font-semibold text-green-600 dark:text-green-400">
                    {discountPct}% off
                  </p>
                </>
              )}
            </div>

            {product.description && (
              <p className="mt-4 font-mono text-sm leading-6 text-gray-600 dark:text-white/60 max-w-xl">
                {product.description}
              </p>
            )}

            <p
              className={`mt-4 font-mono text-xs font-semibold ${inStock ? "text-green-600 dark:text-green-400" : "text-red-500"
                }`}
            >
              {inStock ? `✓ In Stock (${product.stockQuantity} available)` : "✕ Out of Stock"}
            </p>

            {/* Quantity + CTAs */}
            <div className="mt-6 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-4 border border-gray-300 dark:border-white/15 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-mono text-sm font-semibold text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                disabled={!inStock || cartStatus === "adding"}
                onClick={handleAddToCart}
                className="font-dm-sans text-xs font-semibold uppercase tracking-widest px-8 py-4 border transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: ACCENT, color: ACCENT }}
              >
                {cartStatus === "adding" ? "Adding..." : "Add to Cart"}
              </button>

              <button
                type="button"
                disabled={!inStock || cartStatus === "adding"}
                onClick={handleBuyNow}
                className="font-dm-sans text-xs font-semibold uppercase tracking-widest text-white px-8 py-4 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: ACCENT }}
              >
                {!inStock ? "Out of Stock" : cartStatus === "adding" ? "Please wait..." : "Buy Now"}
              </button>
            </div>

            {cartStatus === "error" && cartError && (
              <p className="mt-3 font-mono text-xs text-red-500">{cartError}</p>
            )}
          </div>

          {/* Tabs */}
          <div className="px-6 md:px-10 pt-6 flex items-center gap-8 border-b border-gray-300 dark:border-white/10">
            {([
              ["details", "Product Details"],
              ["reviews", "Rating & Reviews"],
              ["faqs", "FAQs"],
            ] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`pb-4 font-dm-sans text-sm font-semibold uppercase tracking-widest transition-colors -mb-px border-b-2 ${activeTab === key
                    ? "text-gray-900 dark:text-white"
                    : "border-transparent text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60"
                  }`}
                style={activeTab === key ? { borderColor: ACCENT } : undefined}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-6 md:px-10 py-8">
            {activeTab === "details" && (
              <ProductDetailsTab product={product} />
            )}

            {activeTab === "reviews" && (
              <ReviewsTab product={product} />
            )}

            {activeTab === "faqs" && (
              <FaqsTab faqs={faqs} />
            )}
          </div>
        </div>
      </section>

      {/* Similar Products — full-width, no longer inside the sticky grid row */}
      {similarProducts.length > 0 && (
        <section className="px-6 md:px-16 py-12 border-b border-gray-300 dark:border-white/10">
          <h2 className="font-dm-sans text-xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white mb-8">
            You Might Also Like
          </h2>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {similarProducts.map((sp) => {
              const spPrice = sp.salePrice ?? sp.price;
              return (
                <Link
                  key={sp.id}
                  href={`/products/${sp.link}`}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-square border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#141414]">
                    {sp.imageLink ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sp.imageLink}
                        alt={sp.title}
                        loading="lazy"
                        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-xs text-gray-300 dark:text-white/20">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="mt-3 line-clamp-2 font-dm-sans text-xs font-semibold text-gray-900 dark:text-white">
                    {sp.title}
                  </p>
                  <p className="mt-1 font-dm-sans text-sm font-extrabold" style={{ color: ACCENT }}>
                    ₹{Number(spPrice).toLocaleString("en-IN")}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function ProductDetailsTab({ product }: { product: Product }) {
  const [specsOpen, setSpecsOpen] = useState(true);

  const hasHighlights = product.productHighlights && product.productHighlights.length > 0;

  const groupedDetails: Record<string, { attributeName: string; attributeValue: string }[]> = {};
  for (const item of product.productDetails ?? []) {
    const section = item.sectionName;
    if (!groupedDetails[section]) groupedDetails[section] = [];
    groupedDetails[section].push({
      attributeName: item.attributeName,
      attributeValue: item.attributeValue,
    });
  }
  const sections = Object.keys(groupedDetails);
  const hasDetails = sections.length > 0;

  if (!hasHighlights && !hasDetails) {
    return (
      <p className="font-mono text-xs text-gray-400 dark:text-white/40">
        No additional details available for this product.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setSpecsOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 border-b border-gray-200 dark:border-white/10"
      >
        <span className="font-dm-sans text-lg font-bold text-gray-900 dark:text-white">
          Features &amp; Specifications
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 dark:text-white/40 transition-transform ${specsOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {specsOpen && (
        <div>
          {hasHighlights &&
            product.productHighlights!.map((h, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-8 py-4 border-b border-gray-100 dark:border-white/5 font-mono text-sm"
              >
                <span style={{ color: ACCENT }}>▪</span>
                <span className="flex-1 text-gray-700 dark:text-white/70">{h}</span>
              </div>
            ))}

          {sections.map((section) => (
            <div key={section} className="mt-6 first:mt-5">
              <h3 className="font-dm-sans text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-2">
                {section}
              </h3>
              <div>
                {groupedDetails[section].map((attr, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-8 py-3 border-b border-gray-100 dark:border-white/5 font-mono text-sm"
                  >
                    <span className="text-gray-500 dark:text-white/40 capitalize">
                      {attr.attributeName}
                    </span>
                    <span className="text-gray-900 dark:text-white text-right capitalize">
                      {attr.attributeValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsTab({ product }: { product: Product }) {
  if (product.reviews.length === 0) {
    return (
      <p className="font-mono text-xs text-gray-400 dark:text-white/40">
        No reviews yet. Be the first to review this product.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
        <p className="font-dm-sans text-4xl font-extrabold text-gray-900 dark:text-white">
          {product.avgRating.toFixed(1)}
        </p>
        <div>
          <StarRow rating={product.avgRating} size="text-base" />
          <p className="mt-1 font-mono text-xs text-gray-500 dark:text-white/40">
            {product.reviews.length} verified review{product.reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {product.reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 dark:border-white/5 pb-6 last:border-b-0">
            <div className="flex items-center justify-between">
              <StarRow rating={review.rating} />
              <span className="font-mono text-[11px] text-gray-400 dark:text-white/30">
                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {review.authorName && (
              <p className="mt-2 font-dm-sans text-xs font-semibold text-gray-900 dark:text-white">
                {review.authorName}
              </p>
            )}
            {review.comment && (
              <p className="mt-1 font-mono text-xs leading-5 text-gray-600 dark:text-white/60">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqsTab({ faqs }: { faqs: Faq[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (faqs.length === 0) {
    return (
      <p className="font-mono text-xs text-gray-400 dark:text-white/40">
        No FAQs available for this product yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-white/10">
      {faqs.map((faq, i) => (
        <div key={i} className="py-4">
          <button
            type="button"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="font-dm-sans text-sm font-semibold text-gray-900 dark:text-white">
              {faq.question}
            </span>
            <span className="font-mono text-lg shrink-0 ml-4" style={{ color: ACCENT }}>
              {openFaq === i ? "−" : "+"}
            </span>
          </button>
          {openFaq === i && (
            <p className="mt-3 font-mono text-xs leading-5 text-gray-500 dark:text-white/50">
              {faq.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
