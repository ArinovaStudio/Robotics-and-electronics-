"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";

type APIProduct = {
  id: string;
  title: string;
  description?: string;
  image: string;
  price: string;
  salePrice: string | null; 
  brand?: string;
  category?: { id: string; name: string; slug: string };
  stock: number;
  isLowStock: boolean;
  link?: string; 
};

type ProductGridProps = {
  products: APIProduct[];
};

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const router = useRouter();

  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-x-10! sm:gap-7">
      {products.map((p, i) => {
        
        const regularPrice = parseFloat(p.price) || 0;
        const salePrice = p.salePrice ? parseFloat(p.salePrice) : null;

        let discountPct = 0;
        if (salePrice && regularPrice > salePrice) {
          discountPct = Math.round(
            ((regularPrice - salePrice) / regularPrice) * 100
          );
        }

        const displayPrice = salePrice ? salePrice : regularPrice;

        return (
          <div
            key={p.id || i}
            className="rounded-lg md:max-h-[65vh] flex flex-col items-stretch w-full cursor-pointer transition-all duration-200 hover:-translate-y-[5px] overflow-hidden"
            onClick={() => router.push(`/products/${p.link || p.id}`)}
          >
            {/* Image Area */}
            <div className="w-full relative">
              <div className="w-full h-[200px] relative rounded flex items-center justify-center overflow-hidden">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.title || "Product image"}
                    fill
                    className="object-cover rounded-xl h-full w-full"
                    unoptimized
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

              {/* NEW: Low Stock Badge */}
              {p.isLowStock && (
                <span className="absolute top-2 right-1 font-space-grotesk text-[10px] font-bold text-red-600 bg-red-100 px-3 py-[3px] rounded-full tracking-wide uppercase z-[2]">
                  Only {p.stock} Left
                </span>
              )}
            </div>

            {/* Card Content */}
            <div className="pt-5 pb-[22px] flex flex-col flex-1">
              
              {/* Brand Label */}
              {p.brand && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#f0b31e] mb-1">
                  {p.brand}
                </span>
              )}

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
                    ₹{displayPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </span>
                
                {salePrice && salePrice < regularPrice && (
                  <span className="text-[16px] font-medium text-gray-300 line-through">
                    ₹{regularPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
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