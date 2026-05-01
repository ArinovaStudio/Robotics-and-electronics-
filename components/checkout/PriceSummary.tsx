import Image from "next/image";
import { Loader2 } from "lucide-react";

export function PriceSummary({
  cart, totals, 
  couponInput, setCouponInput, appliedCoupon, couponError, isValidatingCoupon, onApplyCoupon, onRemoveCoupon,
  handlePayment, processingPayment, selectedId
}: any) {
  
  const finalTotal = totals.total - (appliedCoupon?.discountAmount || 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
      <h2 className="text-sm font-bold text-gray-600 mb-4">DELIVERY ESTIMATES</h2>
      <div className="space-y-4 mb-6">
        {cart?.items?.slice(0, 2).map((item: any, i: number) => (
          <div key={i} className="flex gap-3">
            <Image src={item.product?.imageLink || "/homeposter.png"} alt="" width={60} height={60} className="rounded object-cover border border-gray-100" unoptimized />
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">APPLY COUPON</h3>
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-md text-sm">
            <div className="flex flex-col">
              <span className="font-bold text-emerald-800 tracking-wide">{appliedCoupon.code}</span>
              <span className="text-emerald-600 font-medium">Saved ₹{appliedCoupon.discountAmount.toFixed(2)}</span>
            </div>
            <button onClick={onRemoveCoupon} className="text-slate-400 hover:text-red-500 font-bold p-1 transition-colors">✕</button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-800 uppercase font-medium"
              />
              <button
                onClick={onApplyCoupon}
                disabled={isValidatingCoupon || !couponInput.trim()}
                className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-700 disabled:opacity-50 transition-colors w-24 flex justify-center items-center"
              >
                {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "APPLY"}
              </button>
            </div>
            {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
          </div>
        )}
      </div>

      <h3 className="text-sm font-bold text-gray-700 mb-3">PRICE DETAILS ({totals.itemCount} Items)</h3>
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total MRP</span>
          <span className="text-gray-800">₹{Number(totals.subtotal).toFixed(2)}</span>
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
          <span className="text-gray-800">{totals.shipping > 0 ? `₹${totals.shipping.toFixed(2)}` : 'FREE'}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between text-base font-bold">
          <span className="text-gray-800">Total Amount</span>
          <span className="text-gray-800">₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handlePayment} 
        disabled={!selectedId || processingPayment}
        className="w-full bg-[#F0B31E] flex justify-center items-center gap-2 cursor-pointer text-white font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#e0a800]"
      >
        {processingPayment ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> PROCESSING...</>
        ) : (
          "PAY SECURELY"
        )}
      </button>
    </div>
  );
}