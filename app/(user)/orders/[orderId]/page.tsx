"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  FileText,
  Loader2,
  CheckCircle2,
  Circle,
  ChevronLeft,
} from "lucide-react";

const ACCENT = "#ff5a1f";
const BORDER = "#232323";

const STATUS_STEPS = ["Placed", "Confirmed", "Shipped", "Delivered"];

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.findIndex(
    (s) => s.toLowerCase() === currentStatus?.toLowerCase()
  );
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="flex items-center w-full">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= activeIndex;
        const isLast = i === STATUS_STEPS.length - 1;
        return (
          <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-2">
              {done ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: ACCENT }} />
              ) : (
                <Circle className="w-5 h-5 shrink-0 text-gray-300 dark:text-white/20" />
              )}
              <span
                className={`font-mono text-[10px] uppercase tracking-widest whitespace-nowrap ${
                  done ? "text-gray-900 dark:text-white font-bold" : "text-gray-400 dark:text-white/30"
                }`}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className="flex-1 h-[2px] mx-2 mb-5"
                style={{
                  backgroundColor: i < activeIndex ? ACCENT : undefined,
                }}
              >
                {i >= activeIndex && (
                  <div className="w-full h-full bg-gray-200 dark:bg-white/10" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

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
          href="/orders"
          className="font-dm-sans text-xs font-semibold uppercase tracking-widest text-white px-8 py-4 transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT }}
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCOD = order.payment?.method === "COD";
  const address = order.address;
  const items = order.items || [];
  const subtotal = order.subtotal ?? items.reduce((s: number, it: any) => s + (it.price || 0) * (it.quantity || 1), 0);
  const shipping = order.shippingFee ?? 0;
  const total = order.total ?? subtotal + shipping;

  return (
    <div className="flex flex-col items-center px-6 md:px-16 py-16">
      <div className="max-w-3xl w-full">

        <Link
          href="/orders"
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Orders
        </Link>

        <div className="border border-gray-300 dark:border-white/10 p-8">

          <div className="flex items-start justify-between border-b border-gray-100 dark:border-white/5 pb-8 mb-8">
            <div>
              <h1 className="font-dm-sans text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Order #{order.orderId || order._id?.slice(-8).toUpperCase()}
              </h1>
              <p className="font-mono text-xs text-gray-500 dark:text-white/40">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1.5 shrink-0"
              style={{ backgroundColor: ACCENT }}
            >
              {order.status || "Placed"}
            </span>
          </div>

          <div className="mb-10 px-2">
            <StatusTimeline currentStatus={order.status} />
          </div>

          <div className="mb-8">
            <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-4">
              <Package className="w-3.5 h-3.5" /> Items
            </h3>
            <div className="border" style={{ borderColor: BORDER }}>
              {items.map((item: any, idx: number) => (
                <div
                  key={item._id || idx}
                  className={`flex items-center justify-between gap-4 p-4 ${
                    idx !== items.length - 1 ? "border-b border-gray-100 dark:border-white/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover border border-gray-200 dark:border-white/10 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-dm-sans text-sm font-bold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="font-mono text-xs text-gray-500 dark:text-white/40 mt-0.5">
                        Qty: {item.quantity || 1}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono text-sm font-bold text-gray-900 dark:text-white shrink-0">
                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border p-5 mb-8" style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between font-mono text-xs text-gray-600 dark:text-white/60 mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs text-gray-600 dark:text-white/60 mb-4">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</span>
            </div>
            <div className="flex items-center justify-between font-dm-sans text-sm font-extrabold text-gray-900 dark:text-white pt-4 border-t border-gray-100 dark:border-white/5">
              <span>Total</span>
              <span style={{ color: ACCENT }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="border p-5" style={{ borderColor: BORDER }}>
              <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-3">
                <MapPin className="w-3.5 h-3.5" /> Delivery Address
              </h3>
              <p className="font-dm-sans text-sm font-bold text-gray-900 dark:text-white mb-1">
                {address?.name} | {address?.phone}
              </p>
              <p className="font-mono text-xs text-gray-600 dark:text-white/60 leading-relaxed">
                {address?.addressLine1}
                {address?.addressLine2 ? `, ${address.addressLine2}` : ""}
                {`, ${address?.city}, ${address?.state} - ${address?.pincode}`}
              </p>
            </div>

            <div className="border p-5" style={{ borderColor: BORDER }}>
              <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-3">
                <CreditCard className="w-3.5 h-3.5" /> Payment
              </h3>
              <p className="font-dm-sans text-sm font-bold text-gray-900 dark:text-white mb-1">
                {isCOD ? "Cash / UPI on Delivery" : order.payment?.method || "Online Payment"}
              </p>
              <p className="font-mono text-xs text-gray-600 dark:text-white/60">
                Status: {order.payment?.status || (isCOD ? "Pending" : "Paid")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {order.invoiceUrl && (
                <a
                href={order.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 text-center border font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-700 dark:text-white/70 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                style={{ borderColor: BORDER }}
              >
                <FileText className="w-3.5 h-3.5" /> Download Invoice
              </a>
            )}
            {isCOD && order.payment?.status !== "Paid" && (
              <button
                className="flex-1 text-center font-dm-sans text-xs font-semibold uppercase tracking-widest text-white py-4 transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Pay Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}