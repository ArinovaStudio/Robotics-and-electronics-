"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const ACCENT = "#ff5a1f";

type Banner = {
  id: string;
  title: string;
  image: string;
  link: string | null;
};

export default function Hero() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/banners")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          // console.log(json.data);
          
          setBanners(json.data || []);
        }
      })
      .catch((err) => console.error("Failed to fetch banners:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative bg-white dark:bg-[#0a0a0a] group border-b border-gray-300 dark:border-[#232323]">
      <div className="grid md:grid-cols-[240px_1fr]">
        {/* Left gutter — empty whitespace, border only, no content in Hero */}
        <div className="hidden md:block border-r border-gray-300 dark:border-[#232323]" />

        {/* Main content column */}
        <div className="max-w-[1200px]">
          {/* Promo banner strip */}
          <div className="w-full flex items-center justify-between px-6 md:px-10 py-2 border-b border-gray-300 dark:border-[#232323] font-dm-sans text-xs">
            <span className="text-gray-600 dark:text-white/70 flex items-center gap-2">
              <span
                className="font-semibold px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white"
                style={{ backgroundColor: ACCENT }}
              >
                Sale
              </span>
              Yearly Sale Available Now, Till 5th December
            </span>
            <Link
              href="/products"
              className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors pl-6 border-l border-gray-300 dark:border-[#232323]"
            >
              Learn More
            </Link>
          </div>

          <div className="relative">
            {loading ? (
              <div className="flex items-center justify-center h-[420px]">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: ACCENT }} />
              </div>
            ) : banners.length === 0 ? (
              <div className="flex items-center justify-center h-[420px]">
                <p className="font-dm-sans text-sm text-gray-400 dark:text-white/30">
                  No banners available right now.
                </p>
              </div>
            ) : (
              <>
                <Swiper
                  modules={[Pagination, Autoplay]}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  pagination={{
                    clickable: true,
                    bulletClass: "custom-bullet",
                    bulletActiveClass: "custom-bullet-active",
                    el: ".hero-pagination",
                  }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  loop={banners.length > 1}
                  className="w-full"
                >
                  {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                      <div className="grid md:grid-cols-2 md:h-[420px]">
                        {/* Text side */}
                        <div className="flex flex-col justify-center px-6 md:px-10 py-10 md:py-0 overflow-hidden">
                          <div className="max-w-md">
                            <h1 className="font-oliveira text-3xl md:text-4xl leading-tight text-gray-900 dark:text-white">
                              {banner.title}
                            </h1>

                            {banner.link && (
                              <Link
                                href={banner.link}
                                className="inline-flex items-center gap-2 mt-8 font-dm-sans text-xs font-semibold uppercase tracking-widest text-white px-6 py-3 border transition-opacity hover:opacity-90"
                                style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
                              >
                                <span className="text-white text-[10px]">▪</span>
                                Start Buying
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Divider between text and image */}
                        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gray-300 dark:bg-[#232323]" />

                        {/* Image side — actual banner image from the backend */}
                        <div className="relative w-full h-[220px] md:h-full overflow-hidden bg-gray-100 dark:bg-[#141414]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="hero-pagination absolute bottom-4 right-6 md:right-10 z-20 flex items-center gap-1.5" />

                {/* Prev / Next arrows — only useful with more than one banner */}
                {banners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => swiperRef.current?.slidePrev()}
                      className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => swiperRef.current?.slideNext()}
                      className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      aria-label="Next slide"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-bullet {
          width: 8px;
          height: 8px;
          display: inline-block;
          background: rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .dark .custom-bullet {
          background: rgba(255, 255, 255, 0.25);
        }
        .custom-bullet-active {
          background: ${ACCENT} !important;
        }
      `}</style>
    </section>
  );
}
