"use client";
import { Unbounded } from "next/font/google";

const unbounded = Unbounded({ subsets: ["latin"], weight: ["900"] });

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingCart,
  User,
  Search,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────
const product = {
  name: "Aurdino uno 2.4",
  rating: 4.5,
  price: 260,
  oldPrice: 300,
  discount: 40,
  description:
    "This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.",
  images: [
    "/images/arduino1.png",
    "/images/arduino2.png",
    "/images/arduino3.png",
  ],
  variants: [
    { name: "Arduino Mega 2560", image: "/images/variant1.png" },
    { name: "Arduino Mega 2560", image: "/images/variant2.png" },
    { name: "Arduino Mega 2560", image: "/images/variant3.png" },
    { name: "Arduino Mega 2560", image: "/images/variant4.png" },
  ],
};

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
  {
    name: "Liam K.",
    rating: 5,
    verified: true,
    text: "\"This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.\"",
    date: "Posted on August 18, 2023",
  },
  {
    name: "Ava H.",
    rating: 4.5,
    verified: true,
    text: "\"I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.\"",
    date: "Posted on August 19, 2023",
  },
];

type Product = {
  name: string;
  desc: string;
  price: number;
  oldPrice: number;
  discount: string;
};

const suggestedProducts: Product[] = Array(4).fill({
  name: "Aurdino uno 3.4",
  desc: "Lorem ipsum dolor sit amet consectetur. Augue ut nec mauris mauris cras gravida suspendisse.",
  price: 400,
  oldPrice: 600,
  discount: "20% OFF",
});

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
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <Star size={size} fill="#f0b31e" className="text-[#f0b31e]" />
              </span>
            )}
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
export default function SingleProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "faqs">(
    "reviews",
  );
  const router = useRouter();

  const tabs = [
    { id: "details" as const, label: "Product Details" },
    { id: "reviews" as const, label: "Rating & Reviews" },
  ];

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* ── PAGE BODY ── */}
      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-[#9ca3af] mb-8">
          {["Home", "Shop", "Robotics"].map((crumb) => (
            <React.Fragment key={crumb}>
              <a href="#" className="hover:text-[#050a30] transition-colors">
                {crumb}
              </a>
              <span className="text-[#ccc]">›</span>
            </React.Fragment>
          ))}
          <span className="text-[#050a30] font-semibold">{product.name}</span>
        </div>

        {/* ── PRODUCT LAYOUT ── */}
        <div className="flex gap-6 items-start">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-[120px] h-[110px] rounded-xl border-2 overflow-hidden bg-white transition-all
                  ${selectedImage === idx ? "border-[#f0b31e]" : "border-[#e8e8e8] hover:border-[#f0b31e]/50"}`}
              >
                {/* Replace with <img src={product.images[idx]} className="w-full h-full object-contain p-2" /> */}
                <div className="w-full h-full bg-[#f5f5f5]" />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="w-[390px] h-[430px] rounded-2xl bg-[#f0f0f0] overflow-hidden shrink-0">
            {/* Replace with <img src={product.images[selectedImage]} className="w-full h-full object-contain p-8" /> */}
            <div className="w-full h-full bg-[#ececec]" />
          </div>

          {/* Details */}
          <div className="flex-1 pl-2">
            <h1 className="text-[#050a30] text-[30px] font-extrabold leading-tight mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.rating} />
              <span className="text-[#434343] text-sm font-semibold">
                {product.rating}/5
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#050a30] text-2xl font-extrabold">
                ₹{product.price}
              </span>
              <span className="text-[#9ca3af] text-2xl font-bold line-through">
                ₹{product.oldPrice}
              </span>
              <span className="bg-[#ffe5e5] text-[#ff4d4d] text-sm font-bold px-3 py-[5px] rounded-md">
                -{product.discount}%
              </span>
            </div>

            <p className="text-[#555] text-[14px] leading-relaxed max-w-[400px] mb-5">
              {product.description}
            </p>
            <hr className="border-[#e8e8e8] mb-5" />

            {/* Variants */}
            <div className="mb-6">
              <p className="text-[#9ca3af] text-xs font-bold tracking-widest mb-3 uppercase">
                Other Variants
              </p>
              <div className="flex gap-3">
                {product.variants.map((v, idx) => (
                  <button
                    key={idx}
                    className="w-[115px] flex flex-col items-center gap-2 bg-[#f8f8f8] hover:bg-[#fff5e0] border border-[#e8e8e8] hover:border-[#f0b31e] rounded-xl p-1 transition-all"
                  >
                    {/* Replace with <img src={v.image} className="w-[60px] h-[48px] object-contain" /> */}
                    <div className="w-[100px] h-[68px] bg-[#e0e0e0] rounded-lg" />
                    <span className="text-[11px] font-semibold text-[#434343] text-center leading-tight">
                      {v.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Actions */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center bg-[#f5f5f5] rounded-full px-5 py-[10px] gap-4 border border-[#e8e8e8]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[#050a30] text-xl font-bold hover:text-[#f0b31e] w-4 text-center leading-none"
                >
                  −
                </button>
                <span className="text-[#050a30] text-sm font-bold w-4 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-[#050a30] text-xl font-bold hover:text-[#f0b31e] w-4 text-center leading-none"
                >
                  +
                </button>
              </div>
              <button className="flex-1 bg-white text-[#f0b31e] font-bold text-sm px-6 py-[10px] rounded-full border-2 border-[#f0b31e] hover:bg-[#fffbe6] transition-all">
                Add to Cart
              </button>
              <button className="flex-1 bg-[#f0b31e] text-white font-bold text-sm px-6 py-[10px] rounded-full border-2 border-[#f0b31e] hover:bg-[#e0a800] transition-all">
                BUY NOW
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            TABS SECTION
        ══════════════════════════════════════════ */}
        <div className="mt-16">
          {/* Tab bar */}
          <div className="flex border-b border-[#e8e8e8]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-center pb-4 text-sm transition-all relative
                  ${
                    activeTab === tab.id
                      ? "text-[#050a30] font-bold"
                      : "text-[#9ca3af] font-semibold hover:text-[#050a30]"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[170px] h-[2.5px] bg-[#050a30] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── Rating & Reviews ── */}
          {activeTab === "reviews" && (
            <div className="mt-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#050a30] text-xl font-extrabold">
                  All Reviews
                  <span className="text-[#9ca3af] text-base font-semibold ml-1">
                    (451)
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                  {/* Filter icon button */}
                  <button className="w-[38px] h-[38px] flex items-center justify-center border border-[#e0e0e0] rounded-full hover:border-[#050a30] transition-all">
                    <SlidersHorizontal size={15} className="text-[#555]" />
                  </button>

                  {/* Sort */}
                  <button className="flex items-center gap-2 border border-[#e0e0e0] rounded-full px-4 py-[9px] text-sm font-semibold text-[#050a30] hover:border-[#050a30] transition-all">
                    Latest <ChevronDown size={14} />
                  </button>

                  {/* Write a review */}
                  <button className="bg-[#050a30] text-white text-sm font-bold px-5 py-[9px] rounded-full hover:bg-[#0a1560] transition-all">
                    Write a Review
                  </button>
                </div>
              </div>

              {/* 2-column grid */}
              <div className="grid grid-cols-2 gap-4">
                {reviews.map((review, i) => (
                  <ReviewCard key={i} review={review} />
                ))}
              </div>

              {/* Load More */}
              <div className="flex justify-center mt-8 mb-4">
                <button className="border border-[#e0e0e0] text-[#050a30] text-sm font-bold px-10 py-3 rounded-full hover:border-[#050a30] hover:bg-[#f8f8f8] transition-all">
                  Load More Reviews
                </button>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="mt-8 text-[#434343] text-sm leading-relaxed max-w-2xl">
              <p>Detailed product information will appear here.</p>
            </div>
          )}

          {activeTab === "faqs" && (
            <div className="mt-8 text-[#434343] text-sm leading-relaxed max-w-2xl">
              <p>Frequently asked questions will appear here.</p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            YOU MIGHT ALSO LIKE
        ══════════════════════════════════════════ */}
        <section className="mt-20 mb-10">
          {/* Title */}
          <h2
            className={`text-center text-[#050a30] text-[38px] font-black tracking-tight mb-12 ${unbounded.className}`}
          >
            You might also like
          </h2>

          {/* 4-column product grid */}
          <div className="grid grid-cols-4 gap-6">
            {suggestedProducts.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-[16px] p-4 flex flex-col items-start w-full max-w-[340px] min-h-[420px] cursor-pointer"
                onClick={() => router.push(`/products/${p.id ?? i}`)}
              >
                <div className="w-full flex justify-center">
                  <div className="w-[220px] h-[180px] bg-[#f8fafd] rounded-[18px] flex items-center justify-center">
                    {/* Image placeholder */}
                  </div>
                </div>
                <span className="mt-4 text-xs font-semibold text-[#34d399] bg-[#eafaf1] px-3 py-1 rounded-full mb-2">
                  {p.discount}
                </span>
                <h3 className="text-2xl font-extrabold text-[#050a30] mb-1 mt-2">
                  {p.name}
                </h3>
                <p
                  className="text-sm text-[#434343] mb-4 mt-1"
                  style={{ minHeight: "40px" }}
                >
                  {p.desc}
                </p>
                <div className="flex items-end gap-2 mt-auto mb-2">
                  <span className="text-2xl font-bold text-[#f0b31e]">
                    ₹ {p.price}
                  </span>
                  <span className="text-base font-semibold text-[#434343] line-through">
                    ₹{p.oldPrice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
