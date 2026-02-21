import React from "react";

export default function HomePoster() {
  return (
    <section className="w-full flex justify-center items-center mt-8">
      <div className="w-[90vw] max-w-[1200px] h-[340px] bg-[#eaf4ff] rounded-[40px] border-[2px] border-[#050a30] flex items-center relative overflow-hidden">
        {/* Left images */}
        <div className="absolute left-8 top-10 w-[120px] h-[80px] bg-[#b3d7ff] rounded-lg flex items-center justify-center">
          {/* Laptop image placeholder */}
        </div>
        <div className="absolute left-8 bottom-10 w-[120px] h-[80px] bg-[#b3d7ff] rounded-lg flex items-center justify-center">
          {/* Tablet image placeholder */}
        </div>
        <div className="absolute left-[160px] bottom-16 w-[80px] h-[80px] bg-[#ffe066] rounded-full flex items-center justify-center">
          {/* Headphones image placeholder */}
        </div>

        {/* Center text */}
        <div className="mx-auto flex flex-col items-center justify-center z-10">
          <p className="text-lg font-medium text-[#434343] mb-2">
            Make Smart Choices
          </p>
          <h1 className="text-4xl font-extrabold text-[#050a30] mb-2">
            Dive into our
          </h1>
          <h1 className="text-4xl font-extrabold text-[#2196f3] mb-2">
            Electronics Store
          </h1>
          <p className="text-lg font-medium text-[#434343] mt-2">website.com</p>
        </div>

        {/* Right images */}
        <div className="absolute right-8 top-10 w-[80px] h-[80px] bg-[#ffe066] rounded-full flex items-center justify-center">
          {/* Camera image placeholder */}
        </div>
        <div className="absolute right-8 bottom-10 w-[80px] h-[120px] bg-[#b3d7ff] rounded-lg flex items-center justify-center">
          {/* Phone image placeholder */}
        </div>
        <div className="absolute right-[160px] bottom-16 w-[160px] h-[80px] bg-[#2196f3] rounded-lg flex items-center justify-center">
          {/* Monitor image placeholder */}
        </div>

        {/* Dots for slider */}
        <div className="absolute bottom-6 right-8 flex gap-2">
          <span className="w-6 h-3 rounded-full bg-[#dbeafe] border border-[#050a30] opacity-80"></span>
          <span className="w-6 h-3 rounded-full bg-[#dbeafe] border border-[#050a30] opacity-80"></span>
          <span className="w-6 h-3 rounded-full bg-[#dbeafe] border border-[#050a30] opacity-80"></span>
          <span className="w-6 h-3 rounded-full bg-[#dbeafe] border border-[#050a30] opacity-40"></span>
        </div>
      </div>
    </section>
  );
}
