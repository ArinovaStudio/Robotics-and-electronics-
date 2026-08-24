"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

const ACCENT = "#ffa600"; // yellow-400

type Product = {
  id: string;
  title: string;
  price: string;
  salePrice: string | null;
  imageLink: string;
  brand: string;
  productHighlights?: string[] | null;
  rating?: number | null;
  reviewCount?: number | null;
  additionalImages?: string[] | null;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: ACCENT }} className="text-[10px]">▪</span>
      <span className="font-dm-sans text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40">
        {children}
      </span>
    </div>
  );
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="font-dm-sans text-xs text-gray-400 dark:text-white/30 uppercase tracking-widest">
          No image
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export default function PopularNowSlider({ products }: { products: Product[] }) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="relative mt-8 md:mt-12 group">
      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        slidesPerView={1}
        spaceBetween={0}
        loop={products.length > 1}
        autoplay={
          products.length > 1
            ? { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        className="w-full"
      >
        {products.map((product) => {
          const regularPrice = parseFloat(product.price) || 0;
          const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;
          const displayPrice = salePrice ?? regularPrice;
          const extraImages = product.additionalImages?.slice(0, 2) ?? [];
          const extraCount = (product.additionalImages?.length ?? 0) - extraImages.length;

          return (
            <SwiperSlide key={product.id}>
              <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
                {/* Product image */}
                <div className="relative w-full h-56 sm:h-72 md:h-[420px] bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden">
                  <ProductImage src={product.imageLink} alt={product.title} />
                </div>

                {/* Product details */}
                <div className="min-w-0">
                  <h3 className="font-dm-sans text-lg sm:text-xl md:text-2xl text-gray-900 dark:text-white font-medium leading-snug break-words">
                    {product.title}
                  </h3>

                  {product.rating != null && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < Math.round(product.rating!) ? ACCENT : "none"}
                            color={i < Math.round(product.rating!) ? ACCENT : "#999"}
                          />
                        ))}
                      </div>
                      {product.reviewCount != null && (
                        <span className="font-dm-sans text-xs text-gray-500 dark:text-white/40 uppercase tracking-wide">
                          {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-5 md:mt-6">
                    <SectionLabel>Pricing</SectionLabel>
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-3">
                      <div className="border border-gray-300 dark:border-white/10 rounded-lg p-3 md:p-4">
                        <span className="font-dm-sans text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40">
                          Special Price
                        </span>
                        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                          <span className="font-dm-sans text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                            ₹{displayPrice}
                          </span>
                          {salePrice && (
                            <span className="font-dm-sans text-sm text-gray-400 dark:text-white/30 line-through">
                              ₹{regularPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {product.productHighlights && product.productHighlights.length > 0 && (
                    <div className="mt-6 md:mt-8">
                      <SectionLabel>About</SectionLabel>
                      <ul className="mt-2 space-y-1">
                        {product.productHighlights.slice(0, 4).map((h, i) => (
                          <li key={i} className="font-dm-sans text-sm text-gray-600 dark:text-white/60">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 mt-6 md:mt-8 flex-wrap">
                    <a
                      href={`/products/${product.id}`}
                      className="inline-flex items-center gap-1 font-dm-sans text-xs uppercase tracking-widest text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      View product <ArrowUpRight size={14} />
                    </a>

                    {extraImages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-dm-sans text-gray-400 dark:text-white/30 text-sm hidden sm:inline">↙↗</span>
                        {extraCount > 0 && (
                          <span
                            style={{ color: ACCENT }}
                            className="font-dm-sans text-xs uppercase tracking-widest mr-1"
                          >
                            {extraCount}+ more
                          </span>
                        )}
                        {extraImages.map((img, i) => (
                          <div
                            key={i}
                            className="relative w-11 h-11 md:w-14 md:h-14 rounded-md overflow-hidden border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-black/40"
                          >
                            <Image src={img} alt="" fill className="object-cover" unoptimized />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Prev / Next arrows */}
      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-1 md:left-2 top-24 sm:top-1/2 sm:-translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white dark:bg-black border border-gray-300 dark:border-white/20 shadow-md text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors cursor-pointer"
            aria-label="Previous product"
          >
            <ChevronLeft size={16} className="md:hidden" />
            <ChevronLeft size={18} className="hidden md:block" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-1 md:right-2 top-24 sm:top-1/2 sm:-translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white dark:bg-black border border-gray-300 dark:border-white/20 shadow-md text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors cursor-pointer"
            aria-label="Next product"
          >
            <ChevronRight size={16} className="md:hidden" />
            <ChevronRight size={18} className="hidden md:block" />
          </button>
        </>
      )}
    </div>
  );
}