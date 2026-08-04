"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Loader2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, useCart } from "@/app/contexts";
import { PaymentFailedModal } from "@/components/PaymentFailedModal";

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
    totals,
    appliedCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    couponError,
    couponInput,
    setCouponInput,
    isValidatingCoupon,
    setIsValidatingCoupon,
  } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/cart");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("error") === "payment_failed") {
      setIsErrorModalOpen(true);
      window.history.replaceState(null, '', '/cart');
    }
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      await contextUpdateQuantity(productId, quantity);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const removeItem = async (productId: string) => {
    if (!confirm("Remove this item from cart?")) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      await contextRemoveItem(productId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const subtotal = Number(cart?.summary?.subtotal || 0);
  const discount = Number(cart?.summary?.totalSavings || 0);
  const delivery = Number(cart?.summary?.shipping || 0);
  const total = Number(cart?.summary?.total || 0);
  const freeShipping = delivery === 0;
  const discountPct =
    subtotal > 0 ? Math.round((discount / (subtotal + discount)) * 100) : 0;

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
  const finalTotal = totals.total - (appliedCoupon?.discountAmount || 0);
  return (
    <div className="max-w-300 mx-auto px-4 py-10">

      <PaymentFailedModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
      />

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
            if (!item.product) return null;

            const isUpdating = updatingItems.has(item.product.id);

            const price = Number(item.product.price || 0);

            return (
              <div
                key={item.id}
                className={`flex md:flex-row w-full justify-between flex-col items-center gap-6 py-4 border-b border-[#f3f3f3] last:border-b-0 ${
                  isUpdating ? "opacity-50" : ""
                }`}
              >
                <div className="flex flex-row justify-between gap-6 w-full">
                  <div className="w-25 h-25 rounded bg-[#f5f5f5] flex items-center justify-center overflow-hidden relative">
                    {item.product.imageLink ? (
                      <Image
                        src={item.product.imageLink}
                        alt={item.product.title}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#e0e0e0]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.link || item.product.id}`}
                    >
                      <h2 className="text-md md:text-lg font-bold text-[#050a30] mb-1 hover:text-[#f0b31e] transition-colors">
                        {item.product.title}
                      </h2>
                    </Link>
                    <StarRating rating={item.product.averageRating || 0} />
                    <div className="text-lg font-bold text-[#050a30] mt-2">
                      ₹{Number(price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex max-md:w-full justify-start">
                  <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-full px-4 py-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      disabled={isUpdating || item.quantity <= 1}
                      className="text-[#050a30] text-xl font-bold hover:text-[#f0b31e] w-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="text-[#050a30] text-base font-bold w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={isUpdating}
                      className="text-[#050a30] text-xl font-bold hover:text-[#f0b31e] w-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
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
        <div className="bg-white min-w-sm border border-gray-200 rounded-lg p-6 sticky top-6">
          <h2 className="text-sm font-bold text-gray-700 mb-6">
            ORDER SUMMARY
          </h2>
          {/* Coupon Section */}
          <div className="mb-6 border-y border-gray-200 py-6">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-md text-sm">
                <div className="flex flex-col">
                  <span className="font-bold text-emerald-800 tracking-wide">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-emerald-600 font-medium">
                    Saved ₹{appliedCoupon.discountAmount.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleRemoveCoupon}
                  className="text-slate-400 hover:text-red-500 font-bold p-1 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  APPLY COUPON
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) =>
                      setCouponInput(e.target.value.toUpperCase())
                    }
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-800 uppercase font-medium"
                  />

                  <button
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-700 disabled:opacity-50 transition-colors w-24 flex justify-center items-center"
                  >
                    {isValidatingCoupon ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "APPLY"
                    )}
                  </button>
                </div>

                {couponError && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {couponError}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-800 font-medium">
                ₹{totals.subtotal.toFixed(2)}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Discount{discountPct > 0 ? ` (-${discountPct}%)` : ""}
                </span>
                <span className="font-medium">-₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-gray-800 font-medium">
                {freeShipping ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${delivery.toFixed(2)}`
                )}
              </span>
            </div>
            {/* Coupon Discount */}
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600 font-medium mb-4">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between text-base font-bold">
              <span className="text-gray-800">Total Amount</span>
              <span className="text-gray-800">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/cart/address")}
            className="w-full bg-[#F0B31E] flex justify-center items-center gap-2 text-white font-bold py-3 rounded transition-all hover:bg-[#e0a800]"
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
