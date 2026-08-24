"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";

const ACCENT = "#ffa600"; // yellow-400

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    imageLink: string | null;
    price: number;
    originalPrice: number;
    stockQuantity: number;
    availability: string;
    averageRating: number;
    link: string;
  };
  lineTotal: number;
};

type Cart = {
  cartId: string;
  items: CartItem[];
  summary: {
    subtotal: string;
    totalSavings: string;
    total: string;
    itemCount: number;
  };
  hasInventoryChanges: boolean;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  async function fetchCart() {
    try {
      const res = await fetch("/api/cart");

      if (res.status === 401) {
        router.push("/login?callbackUrl=/cart");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setCart(data.data);
      } else {
        setError(data.message || "Could not load your cart.");
      }
    } catch {
      setError("Something went wrong loading your cart.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;

    setUpdatingIds((prev) => new Set(prev).add(productId));
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();

      if (data.success) {
        await fetchCart();
      } else {
        setError(data.message || "Could not update quantity.");
      }
    } catch {
      setError("Something went wrong updating quantity.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }

  async function removeItem(productId: string) {
    setUpdatingIds((prev) => new Set(prev).add(productId));
    try {
      const res = await fetch("/api/cart/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (data.success) {
        await fetchCart();
      } else {
        setError(data.message || "Could not remove item.");
      }
    } catch {
      setError("Something went wrong removing the item.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="px-4 sm:px-6 md:px-16 py-16 text-center">
        <p className="font-mono text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="px-4 sm:px-6 md:px-16 py-16 md:py-24 text-center">
        <ShoppingCart size={44} className="mx-auto text-gray-300 dark:text-white/20 mb-5 md:mb-6" />
        <h1 className="font-dm-sans text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
          Your cart is empty
        </h1>
        <p className="font-mono text-sm text-gray-500 dark:text-white/40 mb-8">
          Start adding some products to your cart.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 px-6 sm:px-8 py-3.5 sm:py-4 transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-16 py-8 md:py-10">
      <nav className="font-mono text-xs text-gray-500 dark:text-white/40 mb-5 md:mb-6">
        <Link href="" className="hover:underline">Home</Link>
        {" / "}
        <span className="text-gray-700 dark:text-white/70">Cart</span>
      </nav>

      <h1 className="font-dm-sans text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-6 md:mb-10">
        Your Cart
      </h1>

      {cart.hasInventoryChanges && (
        <p className="font-mono text-xs text-yellow-700 dark:text-yellow-400 mb-6 border border-yellow-500/30 px-4 py-3">
          Some items in your cart were adjusted or removed due to stock changes.
        </p>
      )}

      <div className="grid md:grid-cols-[1fr_380px] gap-6 md:gap-10">
        {/* Items */}
        <div className="border border-gray-300 dark:border-white/10 divide-y divide-gray-200 dark:divide-white/10">
          {cart.items.map((item) => {
            const isUpdating = updatingIds.has(item.product.id);
            return (
              <div
                key={item.id}
                className={`flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 sm:p-5 transition-opacity ${
                  isUpdating ? "opacity-50" : ""
                }`}
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 border border-gray-200 dark:border-white/10 flex-shrink-0 bg-gray-50 dark:bg-[#141414]">
                  {item.product.imageLink ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.imageLink}
                      alt={item.product.title}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : null}
                </div>

                <div className="flex-1 min-w-[140px]">
                  <Link
                    href={`/products/${item.product.link}`}
                    className="font-dm-sans text-sm font-semibold text-gray-900 dark:text-white hover:underline line-clamp-2"
                  >
                    {item.product.title}
                  </Link>
                  <p className="font-mono text-xs text-gray-500 dark:text-white/40 mt-1">
                    ₹{item.product.price.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center gap-3 border border-gray-300 dark:border-white/15 px-2.5 sm:px-3 py-2 order-3 sm:order-none">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    disabled={isUpdating || item.quantity <= 1}
                    aria-label="Decrease quantity"
                    className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={isUpdating || item.quantity >= item.product.stockQuantity}
                    aria-label="Increase quantity"
                    className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <p className="font-dm-sans text-sm font-extrabold w-16 sm:w-20 text-right text-[#ca8a04] dark:text-[#ffa600] order-4 sm:order-none">
                  ₹{item.lineTotal.toFixed(2)}
                </p>

                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  disabled={isUpdating}
                  aria-label="Remove item"
                  className="text-gray-400 dark:text-white/30 hover:text-red-500 disabled:opacity-40 order-5 sm:order-none ml-auto sm:ml-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="border border-gray-300 dark:border-white/10 p-5 md:p-6 h-fit md:sticky md:top-6">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] mb-5 text-[#ca8a04] dark:text-[#ffa600]">
            Order Summary
          </h2>

          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between text-gray-600 dark:text-white/60">
              <span>Subtotal ({cart.summary.itemCount} items)</span>
              <span>₹{cart.summary.subtotal}</span>
            </div>
            {Number(cart.summary.totalSavings) > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Savings</span>
                <span>-₹{cart.summary.totalSavings}</span>
              </div>
            )}
            <div className="flex justify-between font-dm-sans text-lg font-extrabold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-white/5">
              <span>Total</span>
              <span className="text-[#ca8a04] dark:text-[#ffa600]">₹{cart.summary.total}</span>
            </div>
          </div>

          {error && <p className="mt-4 font-mono text-xs text-red-500">{error}</p>}

          <button
            type="button"
            onClick={() => router.push("/cart/address")}
            className="w-full mt-6 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 px-8 py-3.5 sm:py-4 transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Go to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}