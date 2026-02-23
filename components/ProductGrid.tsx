"use client";
import { useRouter } from "next/navigation";
import React from "react";

type Product = {
  id?: string;
  name: string;
  desc: string;
  price: number;
  oldPrice: number;
  discount: string;
};

type ProductGridProps = {
  products: Product[];
};


const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const router = useRouter();
  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {products.map((p, i) => (
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
  );
};

export default ProductGrid;
