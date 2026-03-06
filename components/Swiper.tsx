"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
export default function CustomSwiper({ children }: any) {
  return (
    <div className="grid w-full h-full">
      <Swiper
        modules={[FreeMode, Pagination]}
        spaceBetween={15}
        grabCursor
        loop
        freeMode={{
          enabled: true,
          sticky: true, // 👈 important
        }}
        pagination={{
          el: ".custom-pagination",
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} custom-bullet"></span>`;
          },
        }}
        breakpoints={{
          0: { slidesPerView: 1 },
        }}
        className="w-full justify-center items-center"
      >
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <SwiperSlide className="relative" key={index}>
              {child}
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide className="relative">{children}</SwiperSlide>
        )}
        <div
          className="
          z-400
    custom-pagination
    absolute
    bottom-2
    left-1/2
    -translate-x-1/2
    flex items-center gap-3
    px-4 py-2
    rounded-full
    bg-white/20
    backdrop-blur-sm
    shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.25)]
  "
        />
      </Swiper>
    </div>
  );
}
