"use client";
import { FaTwitter, FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#ebebeb] pt-16 pb-6 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-16 md:gap-0">
        {/* Left: Logo and Social */}
        <div className="flex-[1.2] flex flex-col gap-6 pr-10">
          <div>
            <div className="text-5xl font-semibold tracking-tight text-[#111] mb-4">
              LOGO
            </div>
            <p className="text-sm text-[#555] max-w-[260px] leading-relaxed">
              We have parts that suits your electronics and which you're proud
              to buil.
            </p>
          </div>
          <div className="flex gap-3 mt-1">
            <a
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
            </a>
            <a
              href="#"
              className="w-9 h-9 bg-white rounded-full border border-[#bbb] flex items-center justify-center text-[#222] hover:bg-[#ddd] transition"
            >
              <FaInstagram size={16} />
            </a>
            <a
              href="#"
              className="w-9 h-9 bg-white rounded-full border border-[#bbb] flex items-center justify-center text-[#222] hover:bg-[#ddd] transition"
            >
              <FaGithub size={16} />
            </a>
          </div>
        </div>

        {/* Right: Links Grid */}
        <div className="flex-[3] grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4">
          {[
            {
              title: "COMPANY",
              links: ["About", "Features", "Works", "Career"],
            },
            {
              title: "HELP",
              links: [
                "Customer Support",
                "Delivery Details",
                "Terms & Conditions",
                "Privacy Policy",
              ],
            },
            {
              title: "FAQ",
              links: ["Account", "Manage Deliveries", "Orders", "Payments"],
            },
            {
              title: "RESOURCES",
              links: [
                "Free eBooks",
                "Development Tutorial",
                "How to - Blog",
                "Youtube Playlist",
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <div className="font-semibold text-sm tracking-[0.2em] text-[#111] mb-5">
                {col.title}
              </div>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#555] hover:text-[#111] transition"
                    >
                      {link}
                    </a>
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
        <div className="text-sm text-[#666]">
          Shop.co © 2000-2023, All Rights Reserved
        </div>
        <div>
          <Image
            src="/Frame53.png"
            alt="Payment Methods"
            width={280}
            height={40}
            className="object-contain"
          />
        </div>
      </div>
    </footer>
  );
}
