"use client";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
import React from "react";

const EndReached: React.FC<{ onScrollTop?: () => void }> = ({
  onScrollTop,
}) => {
  const handleScrollTop = () => {
    if (onScrollTop) {
      onScrollTop();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  return (
    <div className="w-full flex items-center justify-between bg-[#f0b31e]  p-12 relative overflow-hidden min-h-[340px]">
      {/* Left Content */}
      <div className="z-10">
        <h2
          className={`text-white font-space-grotesk text-3xl md:text-5xl font-bold mb-6 tracking-tight ${spaceGrotesk.className}`}
        >
          END REACHED
        </h2>
        <p className="text-white text-sm md:text-2xl mb-8 max-md:max-w-[150px] md:max-w-3xl">
          You have browsed all the product in this category, you may try to
          change the filters and catrgory to browse more!
        </p>
        <button
          className={`bg-white text-[#f0b31e] cursor-pointer font-bold text-md md:text-xl px-4 md:px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-150 border-none outline-none ${spaceGrotesk.className}`}
          style={{ boxShadow: "6px 6px 0 #d6a01a" }}
          onClick={handleScrollTop}
          suppressHydrationWarning
        >
          SCROLL TO TOP
        </button>
      </div>
      {/* Right SVG Placeholder */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full flex items-center justify-end z-0">
        {/* SVG circles placeholder - replace with actual SVG later */}
        <div className="max-md:w-[200px] max-md:h-[200px] md:w-[350px] md:h-[350px] flex items-center justify-end">
          <img
            src="/circleSVG.svg"
            alt="Circles SVG"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default EndReached;
