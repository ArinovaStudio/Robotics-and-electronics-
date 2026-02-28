"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Package,
  UserCircle,
  ChevronDown,
  TrendingUp,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, useCart } from "@/app/contexts";

type SuggestionProduct = {
  id: string;
  title: string;
  link: string;
  imageLink: string;
  price: { value: number; currency: string };
  salePrice: { value: number; currency: string } | null;
  brand: string;
  category: { name: string; slug: string };
};

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { cartItemCount } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  // Debounced fetch for autocomplete
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(query.trim())}&limit=6`
      );
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data.products || []);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setActiveIndex(-1);

    // Debounce the API call (300ms)
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle form submit (go to full search page)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Navigate to a product
  const handleSelectProduct = (product: SuggestionProduct) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/products/${product.link || product.id}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelectProduct(suggestions[activeIndex]);
      }
      // else: let the form submit handle it (goes to search page)
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <>
      <div className="bg-black w-full py-1 text-sm flex items-center justify-between gap-10 relative mb-1 px-4">
        <p className="text-white font-space-grotesk">GET 50% OFF BLACK FRIDAY SALE</p>
        <p className="text-[#FFFFFF] text-center">Sign up and get 20% off to your first order.
          <Link
            href="/register" className="text-[#FFFFFF] font-semibold underline">
            <span className="text-[#FFFFFF]">Sign Up Now</span>
          </Link>
        </p>
        <X className="text-white" />
      </div>
      <nav className="w-full bg-white flex items-center h-16 px-8 relative z-50">
        {/* Logo */}
        <Link href="/" aria-label="Home">
          <div className="font-bold text-2xl text-[#050a30] tracking-wide cursor-pointer">
            <Image
              src="/logo.png"
              alt="Robotics and Electronics Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
        </Link>

        {/* Search Bar with Autocomplete */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-[55%] max-w-150">
            <form onSubmit={handleSearch}>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0 && searchQuery.trim().length >= 2) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="Search for products"
                className="w-full h-11 pl-8 pr-16 font-space-grotesk rounded-full bg-[#f8f8f8] text-base outline-none border-none shadow-none"
                autoComplete="off"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#f0b31e] hover:bg-[#e6a700] w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors"
                aria-label="Search"
                suppressHydrationWarning
              >
                <Search size={20} color="#fff" />
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {isSearching ? (
                  <div className="flex items-center gap-3 px-5 py-4">
                    <div className="w-5 h-5 border-2 border-[#f0b31e] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-400">Searching...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    {/* Product suggestions */}
                    <ul className="py-2">
                      {suggestions.map((product, index) => {
                        const displayPrice =
                          product.salePrice?.value ?? product.price?.value ?? 0;

                        return (
                          <li
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors ${activeIndex === index
                              ? "bg-[#fdf6e3]"
                              : "hover:bg-gray-50"
                              }`}
                          >
                            {/* Product image */}
                            <div className="w-12 h-12 bg-[#f8fafd] rounded-xl flex-shrink-0 relative overflow-hidden">
                              {product.imageLink ? (
                                <Image
                                  src={product.imageLink}
                                  alt={product.title}
                                  fill
                                  className="object-contain p-1"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>

                            {/* Product info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#050a30] truncate">
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm font-bold text-[#f0b31e]">
                                  ₹{displayPrice}
                                </span>
                                {product.salePrice &&
                                  product.salePrice.value < product.price.value && (
                                    <span className="text-xs text-gray-400 line-through">
                                      ₹{product.price.value}
                                    </span>
                                  )}
                                <span className="text-xs text-gray-400">
                                  · {product.category?.name || product.brand}
                                </span>
                              </div>
                            </div>

                            <ArrowRight
                              size={14}
                              className="text-gray-300 flex-shrink-0"
                            />
                          </li>
                        );
                      })}
                    </ul>

                    {/* View All Results link */}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          router.push(
                            `/search?q=${encodeURIComponent(searchQuery.trim())}`
                          );
                        }}
                        onMouseEnter={() => setActiveIndex(suggestions.length)}
                        className={`w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition-colors ${activeIndex === suggestions.length
                          ? "bg-[#fdf6e3] text-[#050a30]"
                          : "text-[#f0b31e] hover:bg-gray-50"
                          }`}
                      >
                        <TrendingUp size={16} />
                        View all results for &quot;{searchQuery.trim()}&quot;
                      </button>
                    </div>
                  </>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="px-5 py-6 text-center">
                    <p className="text-sm text-gray-400">
                      No products found for &quot;{searchQuery.trim()}&quot;
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6 ml-6">
          {/* Cart Icon */}
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingCart
              size={24}
              strokeWidth={2}
              className="text-[#000000] hover:text-[#f0b31e] cursor-pointer transition-colors"
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
                className="flex items-center cursor-pointer gap-2 text-[#000000] hover:text-[#f0b31e] transition-colors"
              >
                <UserCircle size={24} strokeWidth={2} />
                {/* <User size={24} strokeWidth={2} /> */}
                {/* <ChevronDown
                  size={16}
                  className={`transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                /> */}
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
    </>
  );
}
