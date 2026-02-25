"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts";
import { useRouter } from "next/navigation";
import { Package, Loader2, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/orders");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated || !token) return;

      try {
        const res = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setOrders(data.data.orders);
        } else {
          setError(data.message || "Failed to fetch orders");
        }
      } catch (err: any) {
        setError("An unexpected error occurred.");
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  if (isLoading || loadingOrders || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex justify-center items-center py-40 min-h-[60vh]">
        <Loader2 className="w-12 h-12 border-4 border-[#f0b31e] border-t-transparent rounded-full animate-spin text-[#f0b31e]" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PROCESSING":
        return "bg-[#fef8e6] text-[#b38515] border-[#f0b31e]/20";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <main className="bg-[#f8fafd] min-h-screen py-10 px-4">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#050a30] mb-2 flex items-center gap-3">
              <Package className="text-[#f0b31e]" size={32} />
              My Orders
            </h1>
            <p className="text-gray-600 font-medium">
              View and track your recent purchases.
            </p>
          </div>

          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
               <Search size={18} />
             </div>
             <input
                type="text"
                placeholder="Search orders..."
                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f0b31e] outline-none text-[#050a30] text-sm"
             />
          </div>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#ececec] p-12 text-center">
            <div className="w-24 h-24 bg-[#f8fafd] text-[#e0e4ef] rounded-full flex items-center justify-center mx-auto mb-6">
               <Package size={48} />
            </div>
            <h2 className="text-2xl font-bold text-[#050a30] mb-3">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't made any purchases yet. Start exploring our catalog to find amazing products!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#f0b31e] hover:bg-[#e6a700] text-white font-bold rounded-full transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-[#ececec] overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-[#fafbfd] px-6 py-4 border-b border-[#ececec] flex flex-wrap gap-4 justify-between items-center text-sm">
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <p className="text-gray-500 font-medium mb-1">
                        Order Placed
                      </p>
                      <p className="text-[#050a30] font-bold">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Total</p>
                      <p className="text-[#050a30] font-bold">
                        ₹{order.totalAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 font-medium mb-1">Order #</p>
                    <p className="text-[#050a30] font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                      {order.id.split("-")[0].toUpperCase()}...
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-4 py-4 border-b border-[#f3f3f3] last:border-0 last:pb-0"
                    >
                      <div className="w-20 h-20 bg-[#f8fafd] rounded-xl flex shrink-0 items-center justify-center overflow-hidden relative">
                        {item.product.imageLink ? (
                          <Image
                            src={item.product.imageLink}
                            alt={item.product.title}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <Package className="text-gray-300" size={32} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-[#050a30] font-bold hover:text-[#f0b31e] transition-colors line-clamp-1 mb-1"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-gray-500 text-sm">
                          Qty: <span className="font-semibold text-[#050a30]">{item.quantity}</span>
                        </p>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                         <span className="text-[#050a30] font-bold">
                           ₹{(item.price * item.quantity).toLocaleString()}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-gray-50 border-t border-[#ececec] flex justify-end">
                    <button
                       className="text-sm font-bold text-[#f0b31e] hover:text-[#e6a700] hover:underline flex items-center gap-1 transition-all"
                    >
                        View Order Details <ExternalLink size={16} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
