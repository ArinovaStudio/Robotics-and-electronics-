"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Truck, CreditCard, ChevronRight, Wand2, Loader2 } from "lucide-react";

const ACCENT = "#ff5a1f";
const BORDER = "#232323";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/users/orders/${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.message || "Failed to load order details.");
        }
      } catch (err) {
        setError("Something went wrong fetching your order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <p className="font-mono text-sm text-red-500 mb-6">{error || "Order not found."}</p>
        <Link
          href=""
          className="font-dm-sans text-xs font-semibold uppercase tracking-widest text-white px-8 py-4 transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT }}
        >
          Go Home
        </Link>
      </div>
    );
  }

  const isCOD = order.payment?.method === "COD";
  const address = order.address;

  return (
    <div className="flex flex-col items-center px-6 md:px-16 py-16">
      <div className="max-w-3xl w-full border border-gray-300 dark:border-white/10 p-8">

        {/* Header */}
        <div className="text-center mb-10 border-b border-gray-100 dark:border-white/5 pb-8">
          <BadgeCheck className="w-16 h-16 mx-auto mb-4" style={{ color: ACCENT }} />
          <h1 className="font-dm-sans text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Order Confirmed
          </h1>
          <p className="font-mono text-sm text-gray-500 dark:text-white/40 max-w-lg mx-auto leading-6">
            Your order is confirmed. You will receive an order confirmation email / SMS shortly with the expected delivery date for your items.
          </p>
        </div>

        {/* Delivering To */}
        <div className="border p-5 mb-6 relative" style={{ borderColor: BORDER }}>
          <div className="pr-24">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
              Delivering to
            </h3>
            <p className="font-dm-sans text-sm font-bold text-gray-900 dark:text-white mb-1">
              {address?.name} | {address?.phone}
            </p>
            <p className="font-mono text-xs text-gray-600 dark:text-white/60 mb-4 leading-relaxed max-w-sm">
              {address?.addressLine1}
              {address?.addressLine2 ? `, ${address.addressLine2}` : ""}
              {`, ${address?.city}, ${address?.state} - ${address?.pincode}`}
            </p>

            <Link
              href={`/orders/${orderId}`}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-widest border px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              Order Details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="absolute top-5 right-5 border border-gray-200 dark:border-white/10 p-4">
            <Truck className="w-10 h-10 text-gray-400 dark:text-white/30" strokeWidth={1.5} />
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-gray-400 dark:text-white/30" />
            <p className="font-mono text-xs text-gray-500 dark:text-white/40">
              You can track / view / modify your order from the orders page.
            </p>
          </div>
        </div>

        {/* Pay at your convenience */}
        {isCOD && (
          <div className="border p-5 mb-8 relative flex items-center justify-between" style={{ borderColor: BORDER }}>
            <div className="pr-4 max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-dm-sans text-sm font-bold text-gray-900 dark:text-white">
                  Now pay at your convenience
                </h3>
                <span
                  className="font-mono text-[10px] font-bold uppercase tracking-widest text-white px-2 py-0.5"
                  style={{ backgroundColor: ACCENT }}
                >
                  New
                </span>
              </div>
              <p className="font-mono text-xs text-gray-600 dark:text-white/60 leading-relaxed">
                You can pay online using the Pay Now option from your orders page, or pay on delivery (Cash/UPI).
              </p>
            </div>
            <div className="border border-gray-200 dark:border-white/10 p-3">
              <CreditCard className="w-10 h-10 text-gray-400 dark:text-white/30" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Bottom buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/products"
            className="flex-1 text-center border font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-700 dark:text-white/70 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            style={{ borderColor: BORDER }}
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 text-center font-dm-sans text-xs font-semibold uppercase tracking-widest text-white py-4 transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            View Order
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}