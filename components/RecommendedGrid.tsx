"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";

const ACCENT = "#ffa600"; // yellow-400

type Product = {
    id: string;
    title: string;
    price: string;
    salePrice: string | null;
    imageLink: string;
};

function ProductImage({ src, alt }: { src: string; alt: string }) {
    return (
        <div className="relative w-full h-full bg-gray-200 dark:bg-[#1c1c1c] border border-gray-300 dark:border-[#232323] overflow-hidden">
            <span className="absolute top-1.5 left-1.5 h-2 w-2 border-t border-l border-black/30 dark:border-white/40 z-10" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 border-t border-r border-black/30 dark:border-white/40 z-10" />
            <span className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l border-black/30 dark:border-white/40 z-10" />
            <span className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r border-black/30 dark:border-white/40 z-10" />

            {src ? (
                <Image src={src} alt={alt} fill className="object-cover" unoptimized />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="font-dm-sans text-xs text-gray-500 dark:text-white/30 uppercase tracking-widest">
                        No image
                    </span>
                </div>
            )}
        </div>
    );
}

function ProductBlock({
    product,
    imageHeightClass,
}: {
    product: Product;
    imageHeightClass: string;
}) {
    const regularPrice = parseFloat(product.price) || 0;
    const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;
    const displayPrice = salePrice ?? regularPrice;

    return (
        <Link href={`/products/${product.id}`} className="group block h-auto">
            <div className={`w-full ${imageHeightClass}`}>
                <ProductImage src={product.imageLink} alt={product.title} />
            </div>

            <div className="mt-4 md:mt-5 flex items-start justify-between gap-3 md:gap-4">
                <div className="min-w-0">
                    <p className="font-dm-sans text-sm text-gray-900 dark:text-white leading-snug line-clamp-2">
                        {product.title}
                    </p>
                    <div className="mt-2">
                        <span className="font-dm-sans text-[10px] uppercase tracking-widest text-[#ca8a04] dark:text-[#ffa600]">
                            Price
                        </span>
                        <div className="font-dm-sans text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                            ₹{displayPrice}
                        </div>
                    </div>
                </div>

                <span className="font-dm-sans text-xl md:text-2xl text-gray-400 dark:text-white/30 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex-shrink-0">
                    ↗
                </span>
            </div>
        </Link>
    );
}

export default function RecommendedGrid({ products }: { products: Product[] }) {
    const [pairIndex, setPairIndex] = useState(0);
    const totalPairs = Math.ceil(products.length / 2);

    const goTo = (direction: "prev" | "next") => {
        setPairIndex((prev) => {
            if (direction === "next") return (prev + 1) % totalPairs;
            return (prev - 1 + totalPairs) % totalPairs;
        });
    };

    const left = products[pairIndex * 2];
    const right = products[pairIndex * 2 + 1];

    return (
        <div className="relative group pb-12 md:pb-24">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start auto-rows-auto">
                {/* Left — tall vertical product */}
                <div className="h-auto">
                    {left && (
                        <ProductBlock
                            key={left.id}
                            product={left}
                            imageHeightClass="h-[280px] sm:h-[380px] md:h-[440px]"
                        />
                    )}
                </div>

                {/* Right — wide horizontal product, subtle stagger */}
                <div className="h-auto md:mt-8">
                    {right && (
                        <ProductBlock
                            key={right.id}
                            product={right}
                            imageHeightClass="h-[240px] sm:h-[320px] md:h-[380px]"
                        />
                    )}
                </div>
            </div>

            {/* Cycle controls — only show if there's more than one pair */}
            {totalPairs > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => goTo("prev")}
                        className="absolute -top-2 md:-top-3 right-0 md:-right-6 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center bg-white/80 dark:bg-black/60 border border-gray-300 dark:border-white/15 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                        aria-label="Previous products"
                    >
                        <ChevronUp size={15} className="md:hidden" />
                        <ChevronUp size={16} className="hidden md:block" />
                    </button>
                    <button
                        type="button"
                        onClick={() => goTo("next")}
                        className="absolute -bottom-2 md:-bottom-3 right-0 md:-right-6 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center bg-white/80 dark:bg-black/60 border border-gray-300 dark:border-white/15 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                        aria-label="Next products"
                    >
                        <ChevronDown size={15} className="md:hidden" />
                        <ChevronDown size={16} className="hidden md:block" />
                    </button>

                    {/* Small pair indicator dots */}
                    <div className="flex items-center gap-1.5 mt-6 md:mt-0 md:absolute md:-bottom-8 md:right-0">
                        {Array.from({ length: totalPairs }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setPairIndex(i)}
                                aria-label={`Go to pair ${i + 1}`}
                                className={`w-1.5 h-1.5 transition-colors ${
                                    i === pairIndex ? "" : "bg-gray-300 dark:bg-white/20"
                                }`}
                                style={i === pairIndex ? { backgroundColor: ACCENT } : undefined}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}