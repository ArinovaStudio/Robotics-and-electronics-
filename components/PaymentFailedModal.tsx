"use client";
import { XCircle } from "lucide-react";

type PaymentFailedModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PaymentFailedModal({ isOpen, onClose }: PaymentFailedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl relative animate-in fade-in zoom-in duration-200"
      >
        <div className="text-center">
          <XCircle className="w-16 h-16 text-[#ff4d4d] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#050a30] mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-8">
            We couldn&apos;t process your payment. Your order has been cancelled, and no charges were made. Please try a different payment method or try again later.
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-[#f0b31e] hover:bg-[#e6a700] text-white font-bold py-3 px-4 rounded-full transition-colors"
          >
            Review Cart & Try Again
          </button>
        </div>
      </div>
    </div>
  );
}