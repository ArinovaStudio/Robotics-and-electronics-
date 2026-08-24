"use client";

import { useState } from "react";
import { Lock, BadgeCheck, FileCheck2, Package, Bell } from "lucide-react";

const ACCENT = "#ffa600"; // yellow-400

const features = [
  { icon: Lock, label: "Escrow-protected payments" },
  { icon: BadgeCheck, label: "Verified expert profiles only" },
  { icon: FileCheck2, label: "NDA & IP protection built-in" },
  { icon: Package, label: "Predefined project packages" },
];

const cards = [
  {
    emoji: "🎓",
    title: "For Students",
    sub: "Get expert guidance on your FYP, viva projects, and research builds",
  },
  {
    emoji: "💼",
    title: "For Experts",
    sub: "Monetise your engineering skills through structured project demand",
  },
  {
    emoji: "🏭",
    title: "For Businesses",
    sub: "Affordable prototyping and R&D with vetted engineering talent",
  },
  {
    emoji: "🔒",
    title: "Trust Layer",
    sub: "Every project secured with escrow, NDA, and originality checks",
  },
];

export default function TechEngiSection() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setEmail("");
        setSubmitted(true);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Newsletter subscribe failed:", err);
      setStatus("error");
    }
  };


  return (
    <section className="border-b border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] px-4 sm:px-6 md:px-16 py-10 md:py-16">
      <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
        {/* LEFT */}
        <div>
          <span
            className="inline-block font-mono text-[11px] font-bold uppercase tracking-[0.25em] border px-3 py-1.5 mb-5 md:mb-6 text-[#ca8a04] dark:text-[#ffa600]"
            style={{ borderColor: ACCENT }}
          >
            We are Live
          </span>

          <h2 className="font-dm-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 md:mb-5 break-words">
            Tech <span className="text-[#ca8a04] dark:text-[#ffa600]">Engi</span>
            <br />
            Expert Connect
          </h2>

          <p className="font-mono text-sm leading-6 text-gray-600 dark:text-white/60 max-w-lg mb-6 md:mb-8">
            Connect with verified engineering experts for your projects. Secure escrow
            payments, IP protection, and structured project packages — from concept to
            delivery.
          </p>

          <div className="space-y-3 mb-6 md:mb-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-center gap-3">
                  <Icon size={16} className="shrink-0 text-[#ca8a04] dark:text-[#ffa600]" />
                  <span className="font-mono text-xs text-gray-700 dark:text-white/70">
                    {f.label}
                  </span>
                </div>
              );
            })}
          </div>

          {submitted ? (
            <p className="font-mono text-xs font-semibold text-green-600 dark:text-green-400">
              ✓ You&apos;re on the list — we&apos;ll email you when it launches.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for early access"
                className="flex-1 h-12 px-4 border bg-transparent text-sm font-mono text-gray-900 dark:text-white outline-none transition-colors"
                style={{ borderColor: "#232323" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#232323")}
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 px-6 py-3 transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <Bell size={14} />
                {submitted ? "Subscribed!" : "Notify Me"}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT: 2x2 card grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent p-4 md:p-5"
            >
              <span className="text-xl md:text-2xl">{card.emoji}</span>
              <p className="mt-2.5 md:mt-3 font-dm-sans text-sm font-bold text-gray-900 dark:text-white">
                {card.title}
              </p>
              <p className="mt-1.5 md:mt-2 font-mono text-xs leading-5 text-gray-500 dark:text-white/50">
                {card.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}