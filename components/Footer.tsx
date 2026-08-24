"use client";

import { FaInstagram } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const ACCENT = "#ffa600"; // yellow-400

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0a0a0a] grid md:grid-cols-[240px_1fr] border-t border-gray-300 dark:border-[#232323]">
      {/* Left gutter — continues the global vertical line */}
      <div className="hidden md:block border-r border-gray-300 dark:border-[#232323]" />

      {/* Content */}
      <div className="pt-10 md:pt-16 pb-6 px-4 sm:px-6 md:px-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-0">
          {/* Left: Logo and Social */}
          <div className="flex-[1.2] flex flex-col gap-6 md:pr-10">
            <div className="flex gap-4">
              <div className="text-5xl relative h-16 w-16 md:h-25 md:w-25 flex shrink-0 uppercase font-semibold tracking-tight text-gray-900 dark:text-white mb-4 bg-gray-200 dark:bg-transparent">
                <Image alt="Logo" priority unoptimized src="/logo.png" fill />
              </div>
              <p className="font-mono text-sm text-justify text-gray-600 dark:text-white/50 max-w-[260px] leading-relaxed">
                We have parts that suits your electronics and which you&apos;re proud
                to build.
              </p>
            </div>
            <div className="flex gap-3 mt-1">
              <a
                href="https://www.instagram.com/tsquare_y1?igsh=ZHY1d2p6NTF1dGlm&utm_source=qr"
                className="w-9 h-9 border border-gray-300 dark:border-[#232323] flex items-center justify-center text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 dark:hover:border-white/40 transition-colors"
                target="_blank"
              >
                <FaInstagram size={16} />
              </a>
            </div>
          </div>

          {/* Right: Links Grid */}
          <div className="flex-[3] grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-4">
            {[
              {
                title: "COMPANY",
                links: [
                  { name: "About", href: "/about" },
                  { name: "Products", href: "/products" },
                  { name: "Contact Us", href: "/contact" },
                ],
              },
              {
                title: "HELP & SUPPORT",
                links: [
                  { name: "Terms & Conditions", href: "/terms-conditions" },
                  { name: "Privacy Policy", href: "/privacy-policy" },
                  { name: "Refund Policy", href: "/refund-policy" },
                  { name: "Customer Support", href: "/contact" },
                ],
              },
              {
                title: "FAQ",
                links: [
                  { name: "Account", href: "/faq/account" },
                  { name: "Manage Deliveries", href: "/faq/manage-deliveries" },
                  { name: "Orders", href: "/faq/orders" },
                  { name: "Payments", href: "/faq/payments" },
                  { name: "Products", href: "/faq/products" },
                ],
              },
            ].map((col) => (
              <div key={col.title} className="min-w-0">
                <div className="font-mono text-[11px] sm:text-xs uppercase tracking-widest mb-4 md:mb-5 text-[#ca8a04] dark:text-[#ffa600]">
                  [ {col.title} ]
                </div>
                <ul className="space-y-3 md:space-y-4">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="font-mono text-xs sm:text-sm text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 md:mt-14 border-t border-gray-300 dark:border-[#232323]" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono relative text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 dark:text-white/40 text-center md:text-left">
            TSQUAREY1 OPC PRIVATE LIMITED © {new Date().getFullYear()}, All Rights Reserved
          </div>

          {/* Payment Method Cards */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="relative bg-white flex items-center justify-center w-[46px] h-[30px] sm:w-[54px] sm:h-[34px] overflow-hidden border border-gray-300 dark:border-transparent">
              <Image
                src="/visa.png"
                alt="Visa"
                fill
                className="object-cover mix-blend-multiply"
                unoptimized
              />
            </div>

            <div className="relative bg-white flex items-center justify-center w-[46px] h-[30px] sm:w-[54px] sm:h-[34px] overflow-hidden border border-gray-300 dark:border-transparent">
              <Image
                src="/mastercard.png"
                alt="Mastercard"
                fill
                className="object-cover mix-blend-multiply"
                unoptimized
              />
            </div>

            <div className="relative bg-white flex items-center justify-center w-[54px] h-[30px] sm:w-[64px] sm:h-[34px] overflow-hidden border border-gray-300 dark:border-transparent">
              <Image
                src="/gpay.png"
                alt="Google Pay"
                fill
                className="object-cover mix-blend-multiply"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}