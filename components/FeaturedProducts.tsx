"use client";
import React, { useEffect, useState } from "react";
import FeaturedProductCard from "./FeaturedProductCard";
import { Skeleton } from "./ui/skeleton";
// import useSWR from "swr";
import { CustomSwiper } from "./CustomSwiperForFeatured";

export default function FeaturedProducts() {
  //   const { data, isLoading, error } = useSWR("/api/featured-products");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const request = await fetch("/api/featured-products");
        const response = await request.json();
        if (!response.success) {
          throw Error(response.message);
        }
        setProducts(response.products ?? []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="space-y-4 px-10 my-6">
      <h2 className="font-bold text-2xl uppercase">Featured Products</h2>

      {/* Loading State */}
      {isLoading && <Skeleton className="h-[600px] w-full bg-gray-200" />}

      {/* Error State */}
      {error && (
        <div className="text-red-500 text-center">
          Failed to load featured products.
        </div>
      )}

      {/* Success State (no real data yet) */}
      {!isLoading && !error && (
        <CustomSwiper>
          {products.map((product, idx) => {
            return <FeaturedProductCard product={product} />;
          })}
        </CustomSwiper>
      )}
    </div>
  );
}
