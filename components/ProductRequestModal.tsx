"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Upload } from "lucide-react";

const ACCENT = "#eab308";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ProductRequestModal({ open, onClose }: Props) {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "unauthorized"
  >("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const resetAndClose = () => {
    setProductName("");
    setBrand("");
    setDescription("");
    setProductUrl("");
    setQuantity(1);
    setImage(null);
    setStatus("idle");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("name", productName.trim());
      formData.append("brand", brand.trim());
      formData.append("description", description.trim());
      formData.append("productUrl", productUrl.trim());
      formData.append("quantity", String(quantity));
      if (image) formData.append("image", image);

      const res = await fetch("/api/users/requests", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else if (res.status === 401) {
        setStatus("unauthorized");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Product request submit failed:", err);
      setStatus("error");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={resetAndClose} />

      {/* Modal — theme-aware via dark: variants, matching the rest of the site */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-white/10">
          <h3 className="font-dm-sans text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Request New Product
          </h3>
          <button
            onClick={resetAndClose}
            aria-label="Close"
            className="shrink-0 text-gray-400 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {status === "success" ? (
          <div className="px-4 sm:px-6 py-10 text-center">
            <p className="font-dm-sans text-gray-900 dark:text-white">
              Thanks — your request has been submitted!
            </p>
            <button
              onClick={resetAndClose}
              className="mt-6 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 px-6 py-3 w-full sm:w-auto"
              style={{ backgroundColor: ACCENT }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 space-y-5">
            <p className="font-dm-sans text-sm text-gray-500 dark:text-white/50">
              Can&apos;t find what you&apos;re looking for? Let us know and we&apos;ll try to add it!
            </p>

            <div>
              <label className="font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60">
                Product Name <span style={{ color: "#92700a" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Wireless Gaming Mouse"
                className="mt-2 w-full h-11 px-4 text-sm bg-transparent border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-gray-500 dark:focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label className="font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Logitech"
                className="mt-2 w-full h-11 px-4 text-sm bg-transparent border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-gray-500 dark:focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label className="font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about this product..."
                rows={3}
                className="mt-2 w-full px-4 py-3 text-sm bg-transparent border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-gray-500 dark:focus:border-white/40 transition-colors resize-y"
              />
            </div>

            <div>
              <label className="font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60">
                Product URL (Optional)
              </label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://example.com/product"
                className="mt-2 w-full h-11 px-4 text-sm bg-transparent border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-gray-500 dark:focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label className="font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60">
                Quantity Interested
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="mt-2 w-full h-11 px-4 text-sm bg-transparent border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white outline-none focus:border-gray-500 dark:focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label className="font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60">
                Product Image (Optional)
              </label>
              <label className="mt-2 flex flex-col items-center justify-center gap-2 h-28 sm:h-32 border border-dashed border-gray-300 dark:border-white/15 cursor-pointer hover:border-gray-500 dark:hover:border-white/40 transition-colors px-4 text-center">
                <Upload size={20} className="text-gray-400 dark:text-white/40" />
                <span className="font-dm-sans text-xs text-gray-400 dark:text-white/40 break-all">
                  {image ? image.name : "Click to upload image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {status === "error" && (
              <p className="font-dm-sans text-xs text-red-500 dark:text-red-400">
                Something went wrong. Please try again.
              </p>
            )}
            {status === "unauthorized" && (
              <p className="font-dm-sans text-xs text-red-500 dark:text-red-400">
                Please{" "}
                <a href="/login" className="underline">
                  log in
                </a>{" "}
                to submit a product request.
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="flex-1 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-white/70 px-6 py-3 border border-gray-300 dark:border-white/15 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 px-6 py-3 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: ACCENT }}
              >
                {status === "loading" ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}