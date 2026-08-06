"use client";

import React, { useState } from "react";

const ACCENT = "#facc15"; // yellow-400

export default function Newsletter() {


  return (
    <section className="bg-white dark:bg-[#0a0a0a] grid md:grid-cols-[240px_1fr] border-t border-gray-300 dark:border-[#232323]">
      {/* Left gutter — continues the global vertical line */}
      <div className="hidden md:block border-r border-gray-300 dark:border-[#232323]" />

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-16 py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
          <div className="min-w-0">
            <span
              className="font-dm-sans text-xs uppercase tracking-widest"
              style={{ color: ACCENT }}
            >
              [ Get Exclusive Sale ]
            </span>
            <h2 className="font-oliveira text-xl sm:text-2xl md:text-3xl text-gray-900 dark:text-white mt-2 break-words">
              Get Exclusive{" "}
              <span className="font-dm-sans font-bold text-[#ca8a04] dark:text-[#facc15]">
                DEALS
              </span>{" "}
              and{" "}
              <span className="font-dm-sans font-bold" style={{ color: ACCENT }}>
                DISCOUNTS
              </span>
            </h2>
          </div>

          {/* Email input stays functional but visually hidden; only the button is visible per design */}
          {/* <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 w-full md:w-auto flex-shrink-0 md:justify-end"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="sr-only"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 px-6 h-11 w-full md:w-auto whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: ACCENT }}
            >
              <span className="text-gray-900 text-[10px]">▪</span>
              {status === "loading" ? "..." : "Subscribe Us"}
            </button>
          </form> */}
        </div>
      </div>
    </section>
  );
}