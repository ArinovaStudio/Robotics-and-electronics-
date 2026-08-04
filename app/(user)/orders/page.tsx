"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  Loader2,
  Search,
  Inbox,
} from "lucide-react";

const ACCENT = "#ff5a1f";
const BORDER = "#232323";

const STATUS_COLORS: Record<string, string> = {
  pending: "text-gray-500 dark:text-white/40",
  confirmed: "text-blue-500",
  processing: "text-blue-500",
  shipped: "text-amber-500",
  delivered: "text-green-500",
  cancelled: "text-red-500",
  refunded: "text-red-500",
};

export default function OrdersListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/users/orders`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || "Failed to load orders.");
        }
      } catch (err) {
        setError("Something went wrong fetching your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const orderNum = (o.orderNumber || "").toLowerCase();
    const itemNames = (o.items || [])
      .map((i: any) => i.product?.title?.toLowerCase() || "")
      .join(" ");
    return orderNum.includes(q) || itemNames.includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 md:px-16 py-16">
      <div className="max-w-3xl w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href=""
            className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-dm-sans text-2xl font-extrabold text-gray-900 dark:text-white">
            My Orders
          </h1>
          <span className="font-mono text-xs text-gray-500 dark:text-white/40">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>


        {/* Search */}
        {orders.length > 0 && (
          <div className="relative mb-6">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order number or item name"
              className="w-full font-mono text-xs bg-transparent border border-gray-300 dark:border-white/10 pl-11 pr-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-gray-500 dark:focus:border-white/30 transition-colors"
            />
          </div>
        )}

        {error && (
          <p className="font-mono text-sm text-red-500 mb-6">{error}</p>
        )}

        {/* Empty state */}
        {!error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center border border-gray-300 dark:border-white/10 py-20 px-6 text-center">
            <Inbox className="w-12 h-12 text-gray-300 dark:text-white/20 mb-4" strokeWidth={1.5} />
            <p className="font-dm-sans text-sm font-bold text-gray-900 dark:text-white mb-2">
              No orders yet
            </p>
            <p className="font-mono text-xs text-gray-500 dark:text-white/40 mb-6 max-w-xs">
              When you place an order, it'll show up here.
            </p>
            <Link
              href="/products"
              className="font-dm-sans text-xs font-semibold uppercase tracking-widest text-white px-8 py-3 transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* No search results */}
        {!error && orders.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center border border-gray-300 dark:border-white/10 py-16 px-6 text-center">
            <p className="font-mono text-xs text-gray-500 dark:text-white/40">
              No orders match "{query}"
            </p>
          </div>
        )}

        {/* Orders list */}
        {filtered.length > 0 && (
          <div className="border" style={{ borderColor: BORDER }}>
            {filtered.map((order, idx) => {
              const items = order.items || [];
              const total = Number(order.totalAmount) || 0;
              const statusKey = (order.status || "pending").toLowerCase();
              const firstItem = items[0];
              const previewImage = firstItem?.product?.image;
              const previewName = firstItem?.product?.title;
              const extraCount = items.length - 1;

              return (
                <Link
                  key={order.id || idx}
                  href={`/orders/${order.id}`}
                  className={`flex items-center gap-4 p-5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${idx !== filtered.length - 1 ? "border-b border-gray-100 dark:border-white/5" : ""
                    }`}
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 shrink-0 border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-white/5">
                    {previewImage ? (
                      <img src={previewImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300 dark:text-white/20" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-dm-sans text-sm font-bold text-gray-900 dark:text-white truncate">
                        {previewName || "Order"}
                        {extraCount > 0 && (
                          <span className="text-gray-500 dark:text-white/40 font-normal">
                            {" "}+{extraCount} more
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-gray-500 dark:text-white/40">
                      <span>#{order.orderNumber}</span>
                      <span>·</span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span className={`uppercase tracking-widest font-bold ${STATUS_COLORS[statusKey] || "text-gray-500 dark:text-white/40"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Price + chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                      ₹{total.toLocaleString("en-IN")}
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/30" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}