import Image from "next/image";
import { Loader2 } from "lucide-react";

export function PriceSummary({
  cart,
  totals,
  couponInput,
  setCouponInput,
  appliedCoupon,
  couponError,
  isValidatingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  handlePayment,
  processingPayment,
  selectedId,
  paymentMethod,
  setPaymentMethod,
}: any) {
  const finalTotal = totals.total - (appliedCoupon?.discountAmount || 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
      <h2 className="text-sm font-bold text-gray-600 mb-4">
        DELIVERY ESTIMATES
      </h2>
      <div className="space-y-4 mb-6">
        {cart?.items?.slice(0, 2).map((item: any, i: number) => (
          <div key={i} className="flex gap-3">
            <Image
              src={item.product?.imageLink || "/homeposter.png"}
              alt=""
              width={60}
              height={60}
              className="rounded object-cover border border-gray-100"
              unoptimized
            />
          </div>
        ))}
      </div>

      <h3 className="text-sm font-bold text-gray-700 mb-3">
        PRICE DETAILS ({totals.itemCount} Items)
      </h3>
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total MRP</span>
          <span className="text-gray-800">
            ₹{Number(totals.subtotal).toFixed(2)}
          </span>
        </div>
        {Number(totals.totalSavings) > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount on MRP</span>
            <span>-₹{Number(totals.totalSavings).toFixed(2)}</span>
          </div>
        )}

        {/* Show Coupon Discount in summary */}
        {appliedCoupon && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Coupon Discount ({appliedCoupon.code})</span>
            <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping Fee</span>
          <span className="text-gray-800">
            {totals.shipping > 0 ? `₹${totals.shipping.toFixed(2)}` : "FREE"}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between text-base font-bold">
          <span className="text-gray-800">Total Amount</span>
          <span className="text-gray-800">₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">PAYMENT METHOD</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="ONLINE"
              checked={paymentMethod === "ONLINE"}
              onChange={() => setPaymentMethod("ONLINE")}
              className="w-4 h-4 accent-[#f0b31e] cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-800">Pay Online</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
              className="w-4 h-4 accent-[#f0b31e] cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-800">Cash on Delivery (COD)</span>
          </label>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={!selectedId || processingPayment}
        className="w-full bg-[#F0B31E] flex justify-center items-center gap-2 cursor-pointer text-white font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#e0a800]"
      >
        {processingPayment ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> PROCESSING...
          </>
        ) : paymentMethod === "COD" ? (
          "PLACE ORDER"
        ) : (
          "PAY SECURELY"
        )}
      </button>
    </div>
  );
}