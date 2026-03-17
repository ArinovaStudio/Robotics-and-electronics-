"use client";
import { FaTwitter, FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, YEAR } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#ebebeb] pt-16 pb-6 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-16 md:gap-0">
        {/* Left: Logo and Social */}
        <div className="flex-[1.2] flex flex-col gap-6 pr-10">
          <div className="flex gap-4">
            <div className="text-5xl relative h-25 w-25 flex uppercase font-semibold tracking-tight text-[#111] mb-4">
              <Image alt={"Loading"} priority unoptimized src={"/logo.png"} fill/>
            </div>
            <p className="text-sm max-w-[150px]! text-justify text-[#555] max-w-[260px] leading-relaxed">
              We have parts that suits your electronics and which you're proud
              to buil.
            </p>
          </div>
          <div className="flex gap-3 mt-1">
            {/* <a
              href="#"
              className="w-9 h-9 bg-white rounded-full border border-[#bbb] flex items-center justify-center text-[#222] hover:bg-[#ddd] transition"
            >
              <FaTwitter size={16} />
            </a>
            <a
              href="#"
              className="w-9 h-9  rounded-full border border-[#111] flex items-center justify-center bg-[#111] text-white"
            >
              <FaFacebookF size={16} />
            </a> */}
            <a
              href="https://www.instagram.com/tsquare_y1?igsh=ZHY1d2p6NTF1dGlm&utm_source=qr"
              className="w-9 h-9 bg-white rounded-full border border-[#bbb] flex items-center justify-center text-[#222] hover:bg-[#ddd] transition"
              target="_blank"
            >
              <FaInstagram size={16} />
            </a>
            {/* <a
              href="#"
              className="w-9 h-9 bg-white rounded-full border border-[#bbb] flex items-center justify-center text-[#222] hover:bg-[#ddd] transition"
            >
              <FaGithub size={16} />
            </a> */}
          </div>
        </div>

        {/* Right: Links Grid */}
        <div className="flex-[3] grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-4">
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
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <div className="font-semibold text-sm tracking-[0.2em] text-[#111] mb-5">
                {col.title}
              </div>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#555] hover:text-[#111] transition"
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
      <div className="max-w-[1400px] mx-auto mt-14 border-t border-[#cecece]" />

      {/* Bottom bar */}
      <div className="max-w-[1400px] mx-auto mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative text-sm uppercase text-[#666]">
          {SITE_NAME} © {YEAR}, All Rights Reserved
        </div>
        {/* Payment Method Cards */}
        <div className="flex items-center gap-2.5">
          
          {/* Visa Card */}
          <div className="relative bg-white rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center w-[54px] h-[34px] overflow-hidden">
            <Image 
              src="/visa.png" 
              alt="Visa" 
              fill
              className="object-cover mix-blend-multiply"
              unoptimized
            />
          </div>

          {/* Mastercard Card */}
          <div className="relative bg-white rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center w-[54px] h-[34px] overflow-hidden">
            <Image 
              src="/mastercard.png" 
              alt="Mastercard" 
              fill
              className="object-cover mix-blend-multiply"
              unoptimized
            />
          </div>

          {/* G Pay Card */}
          <div className="relative bg-white rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center w-[64px] h-[34px] overflow-hidden">
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
    </footer>
  );
}