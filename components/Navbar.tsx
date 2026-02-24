"use client";

import React, { useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Package,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useAuth, useCart } from "@/app/contexts";

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { cartItemCount } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <nav className="w-full bg-white flex items-center h-16 px-8  relative z-50">
      {/* Logo */}
      <Link href="/" aria-label="Home">
        <div className="font-bold text-2xl text-[#050a30] tracking-wide cursor-pointer">
          LOGO
        </div>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-[55%] max-w-150">
          <input
            type="text"
            placeholder="Search for products"
            className="w-full h-11 pl-8 pr-16 rounded-full bg-[#f8f8f8] text-base placeholder:text-[#434343] outline-none border-none shadow-none"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#f0b31e] hover:bg-[#e6a700] w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors"
            aria-label="Search"
          >
            <Search size={20} color="#050a30" />
          </button>
        </div>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-6 ml-6">
        {/* Cart Icon */}
        <Link href="/cart" aria-label="Cart" className="relative">
          <ShoppingCart
            size={24}
            strokeWidth={2}
            className="text-[#434343] hover:text-[#f0b31e] cursor-pointer transition-colors"
          />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#f0b31e] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount > 9 ? "9+" : cartItemCount}
            </span>
          )}
        </Link>

        {/* User Menu */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-[#434343] hover:text-[#f0b31e] transition-colors"
            >
              <User size={24} strokeWidth={2} />
              <ChevronDown
                size={16}
                className={`transition-transform ${showUserMenu ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#050a30] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserCircle size={18} />
                    My Profile
                  </Link>

                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Package size={18} />
                    My Orders
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : isLoading ? (
          <div className="w-10 h-10" />
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#434343] hover:text-[#f0b31e] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#f0b31e] hover:bg-[#e6a700] text-white px-4 py-2 rounded-full transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
