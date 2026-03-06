"use client";
import React from "react";
import Image from "next/image";
import { Dot, Ellipsis } from "lucide-react";
import CustomSwiper from "./Swiper";
import useSWR from "swr";
import { Skeleton } from "./ui/skeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function HomePoster() {
  const { data, isLoading: loading } = useSWR("/api/admin/banners", fetcher, {
    revalidateOnFocus: false,
  });
  const banners = data?.data ?? [];
  return (
    <section className="w-full flex justify-center items-center mt-8">
      {loading ? (
        <div className="w-[95vw] relative h-[350px] md:h-[480px] rounded-4xl overflow-hidden">
          <Skeleton className="w-full h-full rounded-4xl" />
        </div>
      ) : (
        <div className="w-[95vw] relative h-[350px] md:h-[480px] bg-[#eaf4ff] rounded-4xl flex items-center justify-center overflow-hidden">
          <CustomSwiper>
            {banners.map(
              (
                { image, title }: { image: string; title: string },
                index: number
              ) => {
                console.log(image,title);
                return (
                  <Image
                    key={index}
                    src={image}
                    alt={title}
                    fill
                    className="object-cover w-full h-full rounded-4xl"
                    priority
                  />
                );
              }
            )}
          </CustomSwiper>
        </div>
      )}
     
    </section>
  );
}
