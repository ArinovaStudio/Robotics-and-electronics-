"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, User, Package, LogOut, Menu, X } from "lucide-react";
import { getSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

const ACCENT = "#facc15"; // yellow-400

type Suggestion = {
  id: string;
  title: string;
  link: string;
  image: string | null;
};

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Mobile hamburger menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      setIsLoggedIn(!!session);
      setSessionChecked(true);
    });
  }, []);

  // Fuzzy-ranked suggestions now come straight from the API (pg_trgm on the server)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      fetch(`/api/products/suggest?search=${encodeURIComponent(trimmed)}`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setSuggestions(json.data.products);
            setShowSuggestions(true);
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") console.error("Search suggestion fetch failed:", err);
        })
        .finally(() => setIsSearching(false));
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on resize back to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <nav className="w-full border-b bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-[#232323] relative">
      <div className="flex items-center h-14 md:h-16">
        {/* Logo */}
        <Link href="/" aria-label="Home" className="px-4 md:px-6">
          <span
            className="font-oliveira text-xl md:text-2xl tracking-wide cursor-pointer"
            style={{ color: ACCENT }}
          >
            Tsquarey
          </span>
        </Link>

        {/* Search bar — desktop only */}
        <div
          ref={wrapperRef}
          className="relative hidden md:flex flex-1 max-w-sm h-full"
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center h-full border-l border-gray-300 dark:border-[#232323] px-4"
          >
            <Search size={14} className="text-gray-400 dark:text-white/40 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
              placeholder="Search products..."
              className="bg-transparent w-full px-2 py-1.5 font-dm-sans text-xs tracking-wide text-gray-700 dark:text-white/80 placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none"
            />
          </form>

          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-0 bg-white dark:bg-[#0a0a0a] border border-t-0 border-gray-300 dark:border-[#232323] shadow-lg z-50">
              {isSearching && suggestions.length === 0 && (
                <div className="px-4 py-3 text-xs text-gray-400 dark:text-white/30 font-dm-sans">
                  Searching...
                </div>
              )}
              {suggestions.map((s) => (
                <Link
                  key={s.id}
                  href={`/products/${s.link}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 border-b last:border-b-0 border-gray-100 dark:border-white/5 transition-colors"
                >
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.image}
                      alt={s.title}
                      className="h-8 w-8 object-contain shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 shrink-0 bg-gray-100 dark:bg-white/5" />
                  )}
                  <span className="font-dm-sans text-xs text-gray-700 dark:text-white/80 line-clamp-1">
                    {s.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-stretch ml-auto font-dm-sans text-[11px] tracking-widest uppercase text-gray-600 dark:text-white/60 h-full">
          <Link
            href="#popular-now"
            className="flex items-center gap-2 px-4 border-l border-gray-300 dark:border-[#232323] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span style={{ color: ACCENT }}>▪</span>
            Popular Now
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-2 px-4 border-l border-gray-300 dark:border-[#232323] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span style={{ color: ACCENT }}>▪</span>
            Products
          </Link>
          <Link
            href="/categories"
            className="flex items-center gap-2 px-4 border-l border-r border-gray-300 dark:border-[#232323] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span style={{ color: ACCENT }}>▪</span>
            Categories
          </Link>

          <div className="flex items-center px-6">
            <ThemeToggle />
          </div>

          {sessionChecked && (
            isLoggedIn ? (
              <div ref={profileRef} className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((v) => !v)}
                  className="flex items-center gap-1.5 px-3.5 h-full text-[11px] text-gray-900 font-semibold"
                  style={{ backgroundColor: ACCENT }}
                >
                  <User size={13} />
                  Profile
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-0 w-44 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#232323] shadow-lg z-50">
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-[11px] tracking-widest uppercase text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 transition-colors"
                    >
                      <User size={13} className="text-gray-400 dark:text-white/40" />
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-[11px] tracking-widest uppercase text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 transition-colors"
                    >
                      <Package size={13} className="text-gray-400 dark:text-white/40" />
                      My Orders
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-[11px] tracking-widest uppercase text-red-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <LogOut size={13} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3.5 text-[11px] text-gray-900 font-semibold"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="text-gray-900">▪</span>
                Account
              </Link>
            )
          )}
        </div>

        {/* Mobile: search icon + hamburger */}
        <div className="md:hidden flex items-center ml-auto gap-1 px-2">
          <Link
            href="/search"
            aria-label="Search"
            className="p-2 text-gray-600 dark:text-white/60"
          >
            <Search size={18} />
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 text-gray-600 dark:text-white/60"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-300 dark:border-[#232323] bg-white dark:bg-[#0a0a0a] font-dm-sans text-xs tracking-widest uppercase text-gray-600 dark:text-white/60">
          <Link
            href="#popular-now"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/5"
          >
            <span style={{ color: ACCENT }}>▪</span>
            Popular Now
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/5"
          >
            <span style={{ color: ACCENT }}>▪</span>
            Products
          </Link>
          <Link
            href="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/5"
          >
            <span style={{ color: ACCENT }}>▪</span>
            Categories
          </Link>

          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
            <span>Theme</span>
            <ThemeToggle />
          </div>

          {sessionChecked && (
            isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 dark:border-white/5"
                >
                  <User size={13} className="text-gray-400 dark:text-white/40" />
                  Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 dark:border-white/5"
                >
                  <Package size={13} className="text-gray-400 dark:text-white/40" />
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-red-500"
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 px-4 py-3 text-gray-900 font-semibold"
                style={{ backgroundColor: ACCENT }}
              >
                Account
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}