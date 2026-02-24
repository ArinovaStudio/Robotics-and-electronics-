"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";

const initialCart = [
  {
    name: "Aurdino uno 2.4",
    category: "Robotics",
    price: 145,
    rating: 4.5,
    image: "/images/arduino1.png",
    quantity: 1,
  },
  {
    name: "Old Aurdino uno 2.0",
    category: "Robotics",
    price: 180,
    rating: 4.5,
    image: "/images/arduino2.png",
    quantity: 1,
  },
  {
    name: "Wifi module Aurdino",
    category: "Robotics",
    price: 240,
    rating: 4.5,
    image: "/images/arduino3.png",
    quantity: 1,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill={rating >= star ? "#f0b31e" : "#e0e0e0"}
          className="inline"
        >
          <polygon points="10,1 12.6,7.2 19.2,7.6 14,12.2 15.6,18.7 10,15.2 4.4,18.7 6,12.2 0.8,7.6 7.4,7.2" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-[#434343] font-semibold">
        {rating}/5
      </span>
    </span>
  );
}

export default function CartPage() {
  const [cart, setCart] = useState(initialCart);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = Math.round(subtotal * 0.2);
  const delivery = 15;
  const total = subtotal - discount + delivery;

  const updateQty = (idx: number, delta: number) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };
  const removeItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[#9ca3af] mb-6">
        <a href="#" className="hover:text-[#050a30]">
          Home
        </a>
        <span className="text-[#ccc]">›</span>
        <span className="text-[#050a30] font-semibold">Cart</span>
      </div>
      <h1 className="text-4xl font-black text-[#050a30] mb-8">YOUR CART</h1>
      <div className="flex md:flex-row flex-col gap-8 items-start">
        {/* Cart List */}
        <div className="flex-1 w-full bg-white rounded-2xl p-6 shadow-sm border border-[#ececec]">
          {cart.map((item, idx) => (
            <div
              key={idx}
              className="flex md:flex-row w-full justify-between flex-col items-center gap-6 py-4 border-b border-[#f3f3f3] last:border-b-0"
            >
              <div className="flex flex-row justify-between gap-6 w-full">
              <div className="w-[100px] h-[100px] rounded bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
                {/* Replace with <img src={item.image} className="w-full h-full object-contain" /> */}
                <div className="w-full h-full bg-[#e0e0e0]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-md md:text-lg font-bold text-[#050a30] mb-1">
                  {item.name}
                </h2>
                <div className="text-xs text-[#9ca3af] mb-1">
                  Category: {item.category}
                </div>
                <StarRating rating={item.rating} />
                <div className="text-lg font-bold text-[#050a30] mt-2">
                  ₹{item.price}
                </div>
              </div>
              </div>
              <div className="flex max-md:w-full justify-start">
              <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-full px-4 py-2">
                <button
                  onClick={() => updateQty(idx, -1)}
                  className="text-[#050a30] text-xl font-bold hover:text-[#f0b31e] w-5"
                >
                  −
                </button>
                <span className="text-[#050a30] text-base font-bold w-5 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQty(idx, 1)}
                  className="text-[#050a30] text-xl font-bold hover:text-[#f0b31e] w-5"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(idx)}
                className="ml-4 text-[#ff4d4d] hover:text-[#d90429]"
              >
                <Trash2 size={22} />
              </button>
              </div>
            </div>
          ))}
        </div>
        {/* Order Summary */}
        <div className="w-full md:max-w-[350px] bg-white rounded-2xl p-7 shadow-sm border border-[#ececec]">
          <h2 className="text-xl font-bold text-[#050a30] mb-6">
            Order Summary
          </h2>
          <div className="flex justify-between text-[#434343] text-base mb-3">
            <span>Subtotal</span>
            <span className="font-bold">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-[#22c55e] text-base mb-3">
            <span>Discount (-20%)</span>
            <span className="font-bold">-₹{discount}</span>
          </div>
          <div className="flex justify-between text-[#434343] text-base mb-3">
            <span>Delivery Fee</span>
            <span className="font-bold">₹{delivery}</span>
          </div>
          <hr className="my-4 border-[#ececec]" />
          <div className="flex justify-between text-[#050a30] text-xl font-bold mb-6">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button className="w-full bg-[#f0b31e] text-white font-bold text-lg py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#e0a800] transition-all">
            Go to Checkout
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
