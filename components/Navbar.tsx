import React from "react";
import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full   bg-white flex items-center h-[64px] px-8">
      {/* Logo */}
      <Link href="/" aria-label="Home">
        <div className="font-bold text-2xl text-[#050a30] tracking-wide cursor-pointer">
          LOGO
        </div>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-[55%] max-w-[600px]">
          <input
            type="text"
            placeholder="Search for products"
            className="w-full h-11 pl-8 pr-16 rounded-full bg-[#f8f8f8] text-base placeholder:text-[#434343] outline-none border-none shadow-none"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#f0b31e] hover:bg-[#e6a700] w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            aria-label="Search"
          >
            <Search size={20} color="#050a30" />
          </button>
        </div>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-6 ml-6">
        <Link href="/cart" aria-label="Cart">
          <ShoppingCart
            size={24}
            strokeWidth={2}
            className="text-[#434343] cursor-pointer"
          />
        </Link>
        <User size={24} strokeWidth={2} className="text-[#434343]" />
      </div>
    </nav>
  );
}
