// import React from "react";
// import { ArrowRight, Filter } from "lucide-react";

// const brands = ["FANUC", "ABB", "KUKA", "Denso Corporation", "Arduino", "+10 MORE"];
// const types = ["Electric Motor", "Semi-Conductors", "Ultra Sonic Sensors", "Sensors", "Wires", "+10 MORE"];
// const discounts = ["10% OFF", "20% OFF", "30% OFF", "40% OFF", "50% OFF", "60% OFF", "70% OFF", "+3 MORE"];

// const products = Array(6).fill({
//   name: "Aurdino uno 3.4",
//   desc: "Lorem ipsum dolor sit amet consectetur. Augue ut nec mauris mauris cras gravida suspendisse.",
//   price: 400,
//   oldPrice: 600,
//   discount: "20% OFF",
// });

// export default function RoboticsPartsSection() {
//   return (
//     <section className="w-full max-w-[1200px] mx-auto mt-12">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4 px-2">
//           <h2 className="text-2xl md:text-3xl font-extrabold text-[#050a30] tracking-wide">
//             TOP SELLING
//             <span className="relative align-middle mx-2">
//               <span className="absolute left-0 top-0 w-full h-full bg-[#f0b31e] z-0" style={{height:'1.2em'}}></span>
//               <span className="font-extrabold text-[#050a30] relative z-10 px-1" style={{position:'relative'}}>
//                 ROBOTICS
//               </span>
//             </span>
//             PARTS
//           </h2>
//         <a href="#" className="text-[#f0b31e] font-semibold text-base flex items-center gap-1 hover:underline">
//           VIEW ALL
//           <ArrowRight size={20} strokeWidth={2.2} className="ml-1" />
//         </a>
//       </div>
//       {/* Main grid */}
//       <div className="flex gap-8">
//         {/* Filters */}
//         <aside className="w-[260px] bg-[#f8f8f8] rounded p-4 shadow-sm flex flex-col gap-4">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-lg font-semibold text-[#050a30]">FILTERS</span>
//             <Filter size={20} className="text-[#434343]" />
//           </div>
//           <hr className="border-t border-[#eaeaea] mb-2" />
//           {/* Brands */}
//           <div className="mb-2">
//             <span className="text-base font-bold text-[#f0b31e] mb-2 block">BY BRANDS</span>
//             <div className="flex flex-col gap-3">
//               {brands.slice(0,5).map((b, i) => (
//                 <label key={b} className="flex items-center gap-3 text-l text-black font-semibold">
//                   <input type="checkbox" className="accent-[#f0b31e] w-5 h-5 border border-[#bdbdbd] rounded" /> {b}
//                 </label>
//               ))}
//             </div>
//             <span className="mt-2 text-base font-semibold text-[#bdbdbd]">+10 MORE</span>
//           </div>
//           <hr className="border-t border-[#eaeaea] mb-2" />
//           {/* Types */}
//           <div className="mb-2">
//             <span className="text-base font-bold text-[#f0b31e] mb-2 block">BY TYPES</span>
//             <div className="flex flex-col gap-3">
//               {types.slice(0,5).map((t, i) => (
//                 <label key={t} className="flex items-center gap-3 text-l text-black font-semibold">
//                   <input type="checkbox" className="accent-[#f0b31e] w-5 h-5 border border-[#bdbdbd] rounded" /> {t}
//                 </label>
//               ))}
//             </div>
//             <span className="mt-2 text-base font-semibold text-[#bdbdbd]">+10 MORE</span>
//           </div>
//           <hr className="border-t border-[#eaeaea] mb-2" />
//           {/* Price */}
//           <div className="mb-2">
//             <span className="text-xs font-bold text-[#f0b31e] mb-2 block">PRICE</span>
//             <div className="flex items-center gap-2">
//               <span className="text-xs text-[#434343] font-semibold">₹100</span>
//               <input type="range" min="100" max="1000" className="w-full accent-[#f0b31e] h-2" style={{background:'#f0b31e'}} />
//               <span className="text-xs text-[#434343] font-semibold">₹1000+</span>
//             </div>
//           </div>
//           <hr className="border-t border-[#eaeaea] mb-2" />
//           {/* Discount Range */}
//           <div>
//             <span className="text-base font-bold text-[#f0b31e] mb-2 block">DISCOUNT RANGE</span>
//             <div className="flex flex-col gap-3">
//               {discounts.slice(0,7).map((d, i) => (
//                 <label key={d} className="flex items-center gap-3 text-l text-black font-semibold">
//                   <input type="checkbox" className={`w-5 h-5 border border-[#bdbdbd] rounded ${d === '20% OFF' ? 'accent-[#f0b31e]' : 'accent-[#bdbdbd]'}`} checked={d === '20% OFF'} readOnly /> {d}
//                 </label>
//               ))}
//             </div>
//             <span className="mt-2 text-base font-semibold text-[#bdbdbd]">+3 MORE</span>
//           </div>
//         </aside>
//         {/* Products grid */}
//         <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
//           {products.map((p, i) => (
//             <div key={i} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center">
//               {/* Product image placeholder */}
//               <div className="w-[180px] h-[120px] bg-[#eaf4ff] rounded-xl mb-4 flex items-center justify-center">
//                 {/* Image here */}
//               </div>
//               <span className="text-xs font-bold text-[#34d399] bg-[#eafaf1] px-3 py-1 rounded-full mb-2">{p.discount}</span>
//               <h3 className="text-lg font-bold text-[#050a30] mb-1">{p.name}</h3>
//               <p className="text-xs text-[#434343] mb-2 text-center">{p.desc}</p>
//               <div className="flex items-end gap-2">
//                 <span className="text-2xl font-bold text-[#f0b31e]">₹ {p.price}</span>
//                 <span className="text-base font-semibold text-[#434343] line-through">₹{p.oldPrice}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";
import React, { useState } from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";

const brands = ["FANUC", "ABB", "KUKA", "Denso Corporation", "Arduino"];
const types = ["Electric Motor", "Semi-Conductors", "Ultra Sonic Sensors", "Sensors", "Wires"];
const discounts = ["10% OFF", "20% OFF", "30% OFF", "40% OFF", "50% OFF", "60% OFF", "70% OFF"];

const products = Array(6).fill({
  name: "Aurdino uno 3.4",
  desc: "Lorem ipsum dolor sit amet consectetur. Augue ut nec mauris mauris cras gravida suspendisse.",
  price: 400,
  oldPrice: 600,
  discount: "20% OFF",
});

function PriceRangeSlider() {
  const [minVal, setMinVal] = useState(100);
  const [maxVal, setMaxVal] = useState(1000);
  const MIN = 100;
  const MAX = 1000;

  const minPercent = ((minVal - MIN) / (MAX - MIN)) * 100;
  const maxPercent = ((maxVal - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="mb-2">
      <span className="text-base font-bold text-[#f0b31e] mb-3 block">PRICE</span>
      <div className="relative h-6 flex items-center" style={{ marginTop: "8px" }}>
        {/* Track background */}
        <div className="absolute w-full h-[4px] bg-[#e0e0e0] rounded-full" />
        {/* Yellow fill between handles */}
        <div
          className="absolute h-[4px] bg-[#f0b31e] rounded-full"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={minVal}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), maxVal - 50);
            setMinVal(val);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={maxVal}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), minVal + 50);
            setMaxVal(val);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="text-center mt-3 text-sm font-semibold text-[#434343]">
        ₹{minVal} - ₹{maxVal === MAX ? `${MAX}+` : maxVal}
      </div>
      <style>{`
        input[type='range'].appearance-none::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f0b31e;
          border: 2.5px solid #fff;
          box-shadow: 0 0 0 2px #f0b31e;
          pointer-events: all;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f0b31e;
          border: 2.5px solid #fff;
          box-shadow: 0 0 0 2px #f0b31e;
          pointer-events: all;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-runnable-track {
          background: transparent;
        }
        input[type='range']::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f0b31e;
          border: 2.5px solid #fff;
          box-shadow: 0 0 0 2px #f0b31e;
          pointer-events: all;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default function RoboticsPartsSection() {
  const [checkedDiscounts, setCheckedDiscounts] = useState(["20% OFF"]);

  const toggleDiscount = (d) => {
    setCheckedDiscounts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  return (
    <section className="w-full max-w-[1200px] mx-auto mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#050a30] tracking-wide">
          TOP SELLING
          <span className="relative align-middle mx-2">
            <span
              className="absolute left-0 top-0 w-full h-full bg-[#f0b31e] z-0"
              style={{ height: "1.2em" }}
            />
            <span
              className="font-extrabold text-[#050a30] relative z-10 px-1"
              style={{ position: "relative" }}
            >
              ROBOTICS
            </span>
          </span>
          PARTS
        </h2>
        <a
          href="#"
          className="text-[#f0b31e] font-semibold text-base flex items-center gap-1 hover:underline"
        >
          VIEW ALL
          <ArrowRight size={20} strokeWidth={2.2} className="ml-1" />
        </a>
      </div>

      {/* Main grid */}
      <div className="flex gap-8">
        {/* Filters */}
        <aside className="w-[260px] bg-[#f8f8f8] rounded p-4 shadow-sm flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-[#050a30]">FILTERS</span>
            <SlidersHorizontal size={20} className="text-[#434343]" />
          </div>
          <hr className="border-t border-[#e0e0e0] mb-3" />

          {/* BY BRANDS */}
          <div className="mb-3">
            <span className="text-base font-bold text-[#f0b31e] mb-2 block">BY BRANDS</span>
            <div className="flex flex-col gap-[10px]">
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-[17px] h-[17px] border border-[#bdbdbd] accent-[#f0b31e] rounded-none"
                    style={{ borderRadius: 0 }}
                  />
                  {b}
                </label>
              ))}
            </div>
            <span className="mt-2 block text-sm font-semibold text-[#bdbdbd]">+10 MORE</span>
          </div>
          <hr className="border-t border-[#e0e0e0] mb-3" />

          {/* BY TYPES */}
          <div className="mb-3">
            <span className="text-base font-bold text-[#f0b31e] mb-2 block">BY TYPES</span>
            <div className="flex flex-col gap-[10px]">
              {types.map((t) => (
                <label key={t} className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-[17px] h-[17px] border border-[#bdbdbd] accent-[#f0b31e]"
                    style={{ borderRadius: 0 }}
                  />
                  {t}
                </label>
              ))}
            </div>
            <span className="mt-2 block text-sm font-semibold text-[#bdbdbd]">+10 MORE</span>
          </div>
          <hr className="border-t border-[#e0e0e0] mb-3" />

          {/* PRICE */}
          <PriceRangeSlider />
          <hr className="border-t border-[#e0e0e0] mb-3 mt-1" />

          {/* DISCOUNT RANGE */}
          <div>
            <span className="text-base font-bold text-[#f0b31e] mb-2 block">DISCOUNT RANGE</span>
            <div className="flex flex-col gap-[10px]">
              {discounts.map((d) => (
                <label key={d} className="flex items-center gap-3 text-sm text-black font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-[17px] h-[17px] border border-[#bdbdbd] accent-[#f0b31e]"
                    style={{ borderRadius: 0 }}
                    checked={checkedDiscounts.includes(d)}
                    onChange={() => toggleDiscount(d)}
                  />
                  {d}
                </label>
              ))}
            </div>
            <span className="mt-2 block text-sm font-semibold text-[#bdbdbd]">+3 MORE</span>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center">
              <div className="w-[180px] h-[120px] bg-[#eaf4ff] rounded-xl mb-4 flex items-center justify-center" />
              <span className="text-xs font-bold text-[#34d399] bg-[#eafaf1] px-3 py-1 rounded-full mb-2">
                {p.discount}
              </span>
              <h3 className="text-lg font-bold text-[#050a30] mb-1">{p.name}</h3>
              <p className="text-xs text-[#434343] mb-2 text-center">{p.desc}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-[#f0b31e]">₹ {p.price}</span>
                <span className="text-base font-semibold text-[#434343] line-through">₹{p.oldPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}