"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Loader2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, useCart } from "@/app/contexts";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill={rating >= star ? "#f0b31e" : "#e0e0e0"}
          className="inline"
        >
          <polygon points="10,1 12.6,7.2 19.2,7.6 14,12.2 15.6,18.7 10,15.2 4.4,18.7 6,12.2 0.8,7.6 7.4,7.2" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-[#434343] font-semibold">
        {rating}/5
      </span>
    </span>
  );
}

function CartPageContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    cart,
    isLoading: cartLoading,
    error,
    updateQuantity: contextUpdateQuantity,
    removeItem: contextRemoveItem,
  } = useCart();

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/cart");
    }
  }, [isAuthenticated, authLoading, router]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      await contextUpdateQuantity(itemId, quantity);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    if (!confirm("Remove this item from cart?")) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      await contextRemoveItem(itemId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const subtotal = cart?.summary?.subtotal || 0;
  const discount = cart?.summary?.discount || 0;
  const delivery = cart?.summary?.shippingEstimate || 0;
  const total = cart?.summary?.estimatedTotal || 0;
  const freeShipping = cart?.summary?.eligibleForFreeShipping || false;
  const discountPct = subtotal > 0 ? Math.round((discount / (subtotal + discount)) * 100) : 0;

  if (authLoading || cartLoading) {
    return (
      <div className="max-w-300 mx-auto px-4 py-20 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#f0b31e] mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-300 mx-auto px-4 py-20 text-center">
        <p className="text-red-600 font-medium mb-4">{error}</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-300 mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-[#050a30] mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-8">
          Start adding some products to your cart!
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#f0b31e] hover:bg-[#e6a700] text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[#9ca3af] mb-6">
        <Link href="/" className="hover:text-[#050a30]">
          Home
        </Link>
        <span className="text-[#ccc]">›</span>
        <span className="text-[#050a30] font-semibold">Cart</span>
      </div>
      <h1 className="text-4xl font-black text-[#050a30] mb-8">YOUR CART</h1>
      <div className="flex md:flex-row flex-col gap-8 items-start">
        {/* Cart List */}
        <div className="flex-1 w-full bg-white rounded-2xl p-6 shadow-sm border border-[#ececec]">
          {cart.items.map((item) => {
            const isUpdating = updatingItems.has(item.id);
            const price =
              item.product.salePrice?.value || item.product.price.value;
            return (
              <div
                key={item.id}
                className={`flex md:flex-row w-full justify-between flex-col items-center gap-6 py-4 border-b border-[#f3f3f3] last:border-b-0 ${isUpdating ? "opacity-50" : ""}`}
              >
                <div className="flex flex-row justify-between gap-6 w-full">
                  <div className="w-25 h-25 rounded bg-[#f5f5f5] flex items-center justify-center overflow-hidden relative">
                    {item.product.imageLink ? (
                      <Image
                        src={item.product.imageLink}
                        alt={item.product.title}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#e0e0e0]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.id}`}>
                      <h2 className="text-md md:text-lg font-bold text-[#050a30] mb-1 hover:text-[#f0b31e] transition-colors">
                        {item.product.title}
                      </h2>
                    </Link>
                    <StarRating rating={4.5} />
                    <div className="text-lg font-bold text-[#050a30] mt-2">
                      ₹{price}
                    </div>
                  </div>
                </div>
                <div className="flex max-md:w-full justify-start">
                  <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-full px-4 py-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={isUpdating || item.quantity <= 1}
                      className="text-[#050a30] text-xl font-bold hover:text-[#f0b31e] w-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="text-[#050a30] text-base font-bold w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isUpdating}
                      className="text-[#050a30] text-xl font-bold hover:text-[#f0b31e] w-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={isUpdating}
                    className="ml-4 text-[#ff4d4d] hover:text-[#d90429] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {/* Order Summary */}
        <div className="w-full md:max-w-87.5 bg-white rounded-2xl p-7 shadow-sm border border-[#ececec]">
          <h2 className="text-xl font-bold text-[#050a30] mb-6">
            Order Summary
          </h2>
          <div className="flex justify-between text-[#434343] text-base mb-3">
            <span>Subtotal</span>
            <span className="font-bold">₹{subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[#22c55e] text-base mb-3">
              <span>Discount{discountPct > 0 ? ` (-${discountPct}%)` : ""}</span>
              <span className="font-bold">-₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-[#434343] text-base mb-3">
            <span>Delivery Fee</span>
            <span className="font-bold">{freeShipping ? <span className="text-[#22c55e]">Free</span> : `₹${delivery}`}</span>
          </div>
          <hr className="my-4 border-[#ececec]" />
          <div className="flex justify-between text-[#050a30] text-xl font-bold mb-6">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full bg-[#f0b31e] text-white font-bold text-lg py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#e0a800] transition-all"
          >
            Go to Checkout
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return <CartPageContent />;
}
