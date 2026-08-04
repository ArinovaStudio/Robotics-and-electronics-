"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Truck, CreditCard, ChevronRight, Wand2, Loader2 } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#f0b31e]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
        <p className="text-red-500 font-bold mb-4">{error || "Order not found."}</p>
        <Link href="/" className="bg-[#f0b31e] text-white px-6 py-2 rounded font-bold">Go Home</Link>
      </div>
    );
  }

  const isCOD = order.payment?.method === "COD";
  const address = order.address;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-md shadow-sm border border-gray-200 p-8">
        
        {/* Header Section */}
        <div className="text-center mb-10 border-b border-gray-100 pb-8">
          <BadgeCheck className="w-16 h-16 text-[#03a685] mx-auto mb-4" />
          <h1 className="text-[28px] font-bold text-[#03a685] mb-4">
            Order confirmed
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-lg mx-auto">
            Your order is confirmed. You will receive an order confirmation email/SMS shortly with the expected delivery date for your items.
          </p>
        </div>

        {/* Delivering To Box */}
        <div className="border border-gray-200 rounded p-5 mb-6 relative">
          <div className="pr-24">
            <h3 className="text-xs text-gray-500 mb-2">Delivering to:</h3>
            <p className="text-sm font-bold text-gray-900 mb-1">
              {address?.name} | {address?.phone}
            </p>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed max-w-sm">
              {address?.addressLine1}
              {address?.addressLine2 ? `, ${address.addressLine2}` : ""}
              {`, ${address?.city}, ${address?.state} - ${address?.pincode}`}
            </p>
            
            <Link 
              href={`/orders`} 
              className="inline-flex items-center text-xs font-bold text-[#ff3f6c] border border-[#ff3f6c] rounded px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              ORDER DETAILS <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="absolute top-5 right-5 bg-blue-50 p-4 rounded-full">
            <Truck className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500">
              You can Track/View/Modify order from orders page.
            </p>
          </div>
        </div>

        {/* Pay at your convenience Box */}
        {isCOD && (
          <div className="border border-gray-200 rounded p-5 mb-8 relative flex items-center justify-between">
            <div className="pr-4 max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-gray-900">Now pay at your convenience</h3>
                <span className="bg-[#03a685] text-white text-[10px] font-bold px-2 py-0.5 rounded">New</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                Now you can pay online using Pay Now option from orders or you can Pay on Delivery (Cash/UPI).
              </p>
              <button className="text-xs font-bold text-[#ff3f6c] hover:underline">
                See How
              </button>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full mr-4">
              <CreditCard className="w-10 h-10 text-[#ff3f6c]" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Bottom Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link 
            href="/products" 
            className="flex-1 text-center border border-gray-300 text-gray-700 font-bold text-sm py-3.5 px-4 rounded hover:bg-gray-50 transition-colors"
          >
            CONTINUE SHOPPING
          </Link>
          <Link 
            href="/orders" 
            className="flex-1 text-center bg-[#f0b31e] hover:bg-[#e6a700] text-white font-bold text-sm py-3.5 px-4 rounded transition-colors"
          >
            VIEW ORDER
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#f0b31e]" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}