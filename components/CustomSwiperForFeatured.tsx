"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
export function CustomSwiper({ children }: any) {
  return (
    <div className="grid w-full h-full">
      <Swiper
        modules={[FreeMode, Pagination, Autoplay]}
        spaceBetween={15}
        grabCursor
        loop
        autoplay={{
          delay: 2000, // 3 seconds
          disableOnInteraction: false, // keeps autoplay after user swipe
        }}
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
          700: { slidesPerView: 2 },
        }}
        className="w-full justify-center items-center"
      >
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <SwiperSlide
              className="flex! justify-center items-center"
              key={index}
            >
              {child}
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide className="flex! justify-center items-center">
            {children}
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}
