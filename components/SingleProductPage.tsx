"use client";
// ─── Breadcrumbs Component ────────────────────────────────────────────────
type BreadcrumbItem = { label: string; href?: string };

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      className="flex items-center gap-2 text-sm text-[#9ca3af] mb-8"
      aria-label="Breadcrumb"
    >
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          {item.href && idx !== items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-[#050a30] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#050a30] font-semibold">{item.label}</span>
          )}
          {idx < items.length - 1 && <span className="text-[#ccc]">›</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}
import { Unbounded } from "next/font/google";

const unbounded = Unbounded({ subsets: ["latin"], weight: ["900"] });

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Loader2, Check } from "lucide-react";
import { useCart, useAuth } from "@/app/contexts";

// ─── Mock Reviews Data ────────────────────────────────────────────────────
const reviews = [
  {
    name: "Samantha D.",
    rating: 4.5,
    verified: true,
    text: '"I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It\'s become my favorite go-to shirt."',
    date: "Posted on August 14, 2023",
  },
  {
    name: "Alex M.",
    rating: 5,
    verified: true,
    text: '"The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I\'m quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me."',
    date: "Posted on August 15, 2023",
  },
  {
    name: "Ethan R.",
    rating: 4.5,
    verified: true,
    text: '"This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer\'s touch in every aspect of this shirt."',
    date: "Posted on August 16, 2023",
  },
  {
    name: "Olivia P.",
    rating: 5,
    verified: true,
    text: '"As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It\'s evident that the designer poured their creativity into making this t-shirt stand out."',
    date: "Posted on August 17, 2023",
  },
];

type APIProduct = {
  id: string;
  title: string;
  description: string;
  imageLink: string;
  additionalImageLinks: string[];
  price: { value: number; currency: string };
  salePrice: { value: number; currency: string } | null;
  link: string;
  productHighlights: string[];
  availability: string;
};

// ─── Star Rating ──────────────────────────────────────────────────
function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <span
            key={star}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              fill="#e0e0e0"
              className="text-[#e0e0e0] absolute inset-0"
            />
            {filled || half ? (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <Star size={size} fill="#f0b31e" className="text-[#f0b31e]" />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

// ─── Review Card ─────────────────────────────────────────────────
function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-5 flex flex-col gap-3">
      {/* Stars + dots menu */}
      <div className="flex items-center justify-between">
        <StarRating rating={review.rating} size={18} />
        <button className="text-[#9ca3af] font-bold text-lg leading-none tracking-widest pb-1">
          ···
        </button>
      </div>

      {/* Name + verified badge */}
      <div className="flex items-center gap-2">
        <span className="text-[#050a30] text-sm font-extrabold">
          {review.name}
        </span>
        <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-[#22c55e] rounded-full shrink-0">
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.2 6L8 1"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {/* Review text */}
      <p className="text-[#434343] text-[13px] leading-relaxed">
        {review.text}
      </p>

      {/* Date */}
      <p className="text-[#9ca3af] text-xs font-semibold">{review.date}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function SingleProductPage({
  product,
}: {
  product: APIProduct;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [suggestedProducts, setSuggestedProducts] = useState<APIProduct[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/products/${product.link}`);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err: any) {
      alert(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/products/${product.link}`);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      router.push("/cart");
    } catch (err: any) {
      alert(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // Load related featured products
  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(
          "/api/products/featured?type=bestsellers&limit=4",
        );
        const data = await res.json();
        if (data.success) {
          setSuggestedProducts(
            data.data
              .filter((p: APIProduct) => p.id !== product.id)
              .slice(0, 4),
          );
        }
      } catch (err) {
        console.error("Failed to load suggested products", err);
      }
    }
    fetchRelated();
  }, [product.id]);

  const tabs = [
    { id: "details" as const, label: "Product Details" },
    { id: "reviews" as const, label: "Rating & Reviews" },
  ];

  const allImages = [
    product.imageLink,
    ...(product.additionalImageLinks || []),
  ].filter(Boolean);

  let discountPct = 0;
  if (product.salePrice && product.price.value > product.salePrice.value) {
    discountPct = Math.round(
      ((product.price.value - product.salePrice.value) / product.price.value) *
        100,
    );
  }

  const currentPrice = product.salePrice
    ? product.salePrice.value
    : product.price.value;

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* ── PAGE BODY ── */}
      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/products" },
            { label: product.title },
          ]}
        />

        {/* ── PRODUCT LAYOUT ── */}
        <div className="flex xl:flex-row flex-col gap-8 xl:gap-8 items-start">
          <div className="flex lg:flex-row flex-col gap-6 items-start w-full xl:w-[60%] shrink-0">
            {/* Thumbnails + Main */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 sm:gap-6 w-full">
              {/* Thumbnails */}
              <div className="flex sm:flex-col flex-row gap-3 sm:gap-3 overflow-x-auto sm:overflow-visible">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-[80px] h-[80px] sm:w-[100px] sm:h-[95px] lg:w-[120px] lg:h-[110px] 
                      rounded-xl border-2 overflow-hidden bg-white transition-all relative
                      ${
                        selectedImage === idx
                          ? "border-[#f0b31e]"
                          : "border-[#e8e8e8] hover:border-[#f0b31e]/50"
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumb ${idx}`}
                      fill
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="flex-1 flex justify-center sm:justify-start w-full">
                <div className="w-full relative h-[350px] md:h-[450px] rounded-2xl bg-[#f8fafd] border border-[#e8e8e8] overflow-hidden shrink-0">
                  {allImages.length > 0 && (
                    <Image
                      src={allImages[selectedImage]}
                      alt={product.title}
                      fill
                      className="object-contain p-6"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 w-full pl-0 xl:pl-6 leading-tight">
            <h1 className="text-[#050a30] text-[28px] md:text-[32px] font-extrabold leading-tight mb-3">
              {product.title}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={4.5} />
              <span className="text-[#434343] text-sm font-semibold">
                4.5/5
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#050a30] text-[28px] font-extrabold">
                ₹{currentPrice}
              </span>
              {discountPct > 0 && (
                <span className="text-[#9ca3af] text-xl font-bold line-through">
                  ₹{product.price.value}
                </span>
              )}
              {discountPct > 0 && (
                <span className="bg-[#ffe5e5] text-[#ff4d4d] text-sm font-bold px-3 py-[5px] rounded-md">
                  -{discountPct}% OFF
                </span>
              )}
            </div>

            <p className="text-[#555] text-sm leading-relaxed mb-5 whitespace-pre-wrap">
              {product.description}
            </p>

            <div className="mb-4 text-sm font-semibold">
              <span
                className={
                  product.availability === "IN_STOCK"
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                {product.availability === "IN_STOCK"
                  ? "✓ In Stock"
                  : "✗ Out of Stock"}
              </span>
            </div>

            <hr className="border-[#e8e8e8] mb-6 mt-6" />

            {/* Quantity + Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between bg-[#f5f5f5] rounded-full px-5 py-[12px] md:py-[10px] gap-4 border border-[#e8e8e8] w-full md:w-[130px] shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[#050a30] text-2xl font-bold hover:text-[#f0b31e] w-8 h-8 flex items-center justify-center leading-none"
                >
                  −
                </button>

                <span className="text-[#050a30] text-base font-bold text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-[#050a30] text-2xl font-bold hover:text-[#f0b31e] w-8 h-8 flex items-center justify-center leading-none"
                >
                  +
                </button>
              </div>

              <div className="flex flex-row gap-3 w-full">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.availability !== "IN_STOCK"}
                  className="
        flex-1
        bg-white text-[#f0b31e]
        font-bold text-sm
        px-6 py-[14px] md:py-[13px]
        rounded-full
        border-2 border-[#f0b31e]
        hover:bg-[#fffbe6]
        transition-all shadow-sm hover:shadow
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      "
                >
                  {addingToCart ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : addedToCart ? (
                    <>
                      <Check size={18} /> Added!
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart || product.availability !== "IN_STOCK"}
                  className="
        flex-1
        bg-[#f0b31e] text-white
        font-bold text-sm
        px-6 py-[14px] md:py-[13px]
        rounded-full
        border-2 border-[#f0b31e]
        hover:bg-[#e0a800] hover:border-[#e0a800]
        transition-all shadow-md hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
      "
                >
                  BUY NOW
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            TABS SECTION
        ══════════════════════════════════════════ */}
        <div className="mt-20">
          {/* Tab bar */}
          <div className="flex border-b border-[#e8e8e8]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-center pb-4 text-sm md:text-base transition-all relative
                  ${
                    activeTab === tab.id
                      ? "text-[#050a30] font-bold"
                      : "text-[#9ca3af] font-semibold hover:text-[#050a30]"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-[20%] right-[20%] md:left-1/2 md:-translate-x-1/2 md:w-[170px] h-[3px] bg-[#050a30] rounded-t-lg" />
                )}
              </button>
            ))}
          </div>

          {/* ── Product Details ── */}
          {activeTab === "details" && (
            <div className="mt-8 text-[#434343] text-sm md:text-base leading-relaxed md:max-w-4xl space-y-4">
              <h3 className="text-xl font-bold text-[#050a30] mb-4">
                Features & Specifications
              </h3>
              {product.productHighlights &&
              product.productHighlights.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {product.productHighlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              ) : (
                <p>
                  No extra specifications strictly defined for this product
                  right now.
                </p>
              )}
            </div>
          )}

          {/* ── Rating & Reviews ── */}
          {activeTab === "reviews" && (
            <div className="mt-8">
              {/* Header row */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:justify-between mb-8">
                <h2 className="text-[#050a30] text-2xl font-extrabold">
                  All Reviews
                  <span className="text-[#9ca3af] text-lg font-semibold ml-2">
                    ({reviews.length})
                  </span>
                </h2>
                <div className="flex items-center gap-3 w-full md:w-auto self-end">
                  <button className="flex-1 md:flex-none justify-center bg-[#050a30] text-white text-sm font-bold px-6 py-[12px] rounded-full hover:bg-[#0a1560] shadow-md transition-all">
                    Write a Review
                  </button>
                </div>
              </div>

              {/* 2-column grid */}
              <div className="grid md:grid-cols-2 gap-5">
                {reviews.map((review, i) => (
                  <ReviewCard key={i} review={review} />
                ))}
              </div>

              {/* Load More */}
              <div className="flex justify-center mt-10 mb-4">
                <button className="border-2 border-[#e0e0e0] text-[#050a30] text-sm font-bold px-10 py-[12px] rounded-full hover:border-[#050a30] hover:bg-[#f8f8f8] transition-all">
                  Load More Reviews
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            YOU MIGHT ALSO LIKE
        ══════════════════════════════════════════ */}
        {suggestedProducts.length > 0 && (
          <section className="mt-24 mb-10">
            {/* Title */}
            <h2
              className={`text-center text-[#050a30] text-[32px] md:text-[38px] font-black tracking-tight mb-12 ${unbounded.className}`}
            >
              You might also like
            </h2>

            {/* 4-column product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 place-items-center">
              {suggestedProducts.map((p, i) => {
                let recDiscountPct = 0;
                if (p.salePrice && p.price.value > p.salePrice.value) {
                  recDiscountPct = Math.round(
                    ((p.price.value - p.salePrice.value) / p.price.value) * 100,
                  );
                }

                return (
                  <div
                    key={p.id || i}
                    className="bg-white rounded-[16px] p-4 flex flex-col items-start w-full max-w-[340px] border border-transparent hover:border-[#f0b31e]/30 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => router.push(`/products/${p.link || p.id}`)}
                  >
                    <div className="w-full flex justify-center mb-4">
                      <div className="w-full h-[180px] bg-[#f8fafd] rounded-[18px] relative overflow-hidden flex items-center justify-center">
                        {p.imageLink ? (
                          <Image
                            src={p.imageLink}
                            alt={p.title}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#f1f1f1]" />
                        )}
                      </div>
                    </div>
                    {recDiscountPct > 0 ? (
                      <span className="text-xs font-semibold text-[#34d399] bg-[#eafaf1] px-3 py-1 rounded-full mb-2">
                        {recDiscountPct}% OFF
                      </span>
                    ) : (
                      <span className="h-6 mb-2"></span>
                    )}
                    <h3
                      className="text-lg font-extrabold text-[#050a30] mb-1 line-clamp-2"
                      title={p.title}
                    >
                      {p.title}
                    </h3>
                    <p
                      className="text-xs text-[#434343] mb-4 mt-1 line-clamp-2"
                      style={{ minHeight: "35px" }}
                    >
                      {p.description}
                    </p>
                    <div className="flex items-end gap-2 mt-auto">
                      <span className="text-xl font-bold text-[#f0b31e]">
                        ₹{p.salePrice ? p.salePrice.value : p.price?.value || 0}
                      </span>
                      {p.salePrice && p.salePrice.value < p.price.value && (
                        <span className="text-sm font-semibold text-[#434343] line-through">
                          ₹{p.price.value}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
