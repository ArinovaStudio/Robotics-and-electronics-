"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";

type APIProduct = {
  id: string;
  title: string;
  description?: string;
  imageLink: string;
  price: { value: number; currency: string };
  salePrice: { value: number; currency: string } | null;
  link: string;
};

type ProductGridProps = {
  products: APIProduct[];
};

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const router = useRouter();
  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
      {products.map((p, i) => {
        let discountPct = 0;
        if (p.salePrice && p.price.value > p.salePrice.value) {
          discountPct = Math.round(
            ((p.price.value - p.salePrice.value) / p.price.value) * 100,
          );
        }

        const displayPrice = p.salePrice
          ? p.salePrice.value
          : p.price?.value || 0;

        return (
          <div
            key={p.id || i}
            className=" rounded-lg max-h-[65vh] flex flex-col items-stretch w-full cursor-pointer transition-all duration-200 hover:-translate-y-[5px] overflow-hidden pr-5"
            onClick={() => router.push(`/products/${p.link || p.id}`)}>
            {/* Image Area */}
            <div className="w-full relative">
              <div className="w-full h-[200px]  relative rounded flex items-center justify-center  overflow-hidden">
                {p.imageLink ? (
                  <Image
                    src={p.imageLink}
                    alt={p.title || "Product image"}
                    fill
                    className="overflow-hidden rounded-xl h-full w-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                ) : (
                  <span className="text-5xl text-gray-300">📦</span>
                )}
              </div>

              {/* Discount Badge */}
              {discountPct > 0 && (
                <span className="absolute bottom-2 left-1 font-space-grotesk text-[10px] font-bold text-green-600 bg-green-300 px-3 py-[3px] rounded-full tracking-wide uppercase z-[2]">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Card Content */}
            <div className="pt-5 pb-[22px] flex flex-col flex-1 ">
              {/* Title */}
              <h3
                className="text-lg font-bold text-[#050A30] leading-tight mb-1.5 line-clamp-2"
                title={p.title}
              >
                {p.title}
              </h3>

              {/* Description */}
              <p
                className="text-xs text-gray-400 leading-relaxed mb-3.5 line-clamp-2 min-h-[38px]"
                title={p.description || ""}
              >
                {p.description || "No description available."}
              </p>

              {/* Price */}
              <div className="flex items-baseline font-inter gap-2.5 mt-auto">
                <span className="text-[28px] font-bold text-[#F0B31E] tracking-tight flex items-baseline gap-0.5">
                  <span className="text-[#F0B31E] text-[28px]">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                </span>
                {p.salePrice && p.salePrice.value < p.price.value && (
                  <span className="text-[16px] font-medium text-gray-300 line-through">
                    ₹{p.price.value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
