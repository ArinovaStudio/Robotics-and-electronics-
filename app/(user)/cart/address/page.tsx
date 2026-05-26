"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCart } from "@/app/contexts";
import Link from "next/link";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import AddressModal from "@/components/AddressModal";
import { AddressCard } from "@/components/checkout/AddressCard";
import { PriceSummary } from "@/components/checkout/PriceSummary";
import { usePayU } from "@/hooks/usePayU";
import { useRazorpay } from "@/hooks/useRazorPay";

type Address = {
  id: string; name: string; phone: string; addressLine1: string; addressLine2?: string;
  city: string; state: string; pincode: string; isDefault: boolean; type: string;
};

export default function AddressPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { cart, handleApplyCoupon, handleRemoveCoupon, totals, couponInput, couponError, setCouponInput, appliedCoupon, isValidatingCoupon } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [isCODProcessing, setIsCODProcessing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Address | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login?callbackUrl=/cart/address");
  }, [isAuthenticated, isLoading, router]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/users/address");
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data || []);
        const def = data.data?.find((a: Address) => a.isDefault);
        if (def && !selectedId) setSelectedId(def.id);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) fetchAddresses(); }, [isAuthenticated]);

  // Address Handlers
  const handleDeleteAddress = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/users/address/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        if (selectedId === id) setSelectedId("");
        fetchAddresses();
      } else alert(data.message || "Failed to delete address");
    } catch { alert("An error occurred while deleting the address."); }
  };

  const handleEditClick = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation();
    setEditData(address);
    setIsModalOpen(true);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedId);
  
  const { processRazorpayPayment, isProcessing: isRzpProcessing } = useRazorpay(user, selectedAddress);
  const { processPayUPayment, isProcessing: isPayuProcessing } = usePayU();

  const processingPayment = isCODProcessing || isRzpProcessing || isPayuProcessing;
  const activeGateway = process.env.NEXT_PUBLIC_GATEWAY || "RAZORPAY";

  const handlePayment = async () => {
    if (!selectedId) return alert("Please select a delivery address.");
    
    if (paymentMethod === "COD") {
        setIsCODProcessing(true);
        try {
            const res = await fetch("/api/payments/cod/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addressId: selectedId, couponCode: appliedCoupon?.code })
            });
            const data = await res.json();
            if (data.success){
              router.push(`/order-success?orderId=${data.data.orderId}`);
            }
            else { alert(data.message); setIsCODProcessing(false); }
        } catch {
            alert("Something went wrong with COD checkout.");
            setIsCODProcessing(false);
        }
        return;
    }

    if (activeGateway === "RAZORPAY") {
        await processRazorpayPayment(selectedId, appliedCoupon?.code);
    } 
    else if (activeGateway === "PAYU") {
        await processPayUPayment(selectedId, appliedCoupon?.code);
    }
  };

  if (isLoading || loading) return <div className="flex justify-center items-center py-40"><Loader2 className="w-12 h-12 border-4 border-[#f0b31e] border-t-transparent rounded-full animate-spin text-[#f0b31e]" /></div>;

  const defaultAddr = addresses.find((a) => a.isDefault);
  const otherAddrs = addresses.filter((a) => !a.isDefault);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 relative">
      {activeGateway === "RAZORPAY" && <Script src="https://checkout.razorpay.com/v1/checkout.js" />}

      <AddressModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAddresses} initialData={editData} />

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link> <span>›</span>
        <Link href="/cart" className="hover:text-gray-700">Cart</Link> <span>›</span>
        <span className="text-gray-700 font-semibold">Address</span>
      </div>

      <div className="flex lg:flex-row flex-col gap-8">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Select Delivery Address</h1>
            <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="border-2 border-gray-800 text-gray-800 px-5 py-2 rounded font-semibold hover:bg-gray-50 transition-colors">
              ADD NEW ADDRESS
            </button>
          </div>

          {defaultAddr && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-600 mb-3">DEFAULT ADDRESS</h2>
              <AddressCard addr={defaultAddr} selectedId={selectedId} onSelect={setSelectedId} onEdit={handleEditClick} onDelete={handleDeleteAddress} />
            </div>
          )}

          {otherAddrs.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-600 mb-3">OTHER ADDRESSES</h2>
              <div className="space-y-4">
                {otherAddrs.map((addr) => (
                  <AddressCard key={addr.id} addr={addr} selectedId={selectedId} onSelect={setSelectedId} onEdit={handleEditClick} onDelete={handleDeleteAddress} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-[380px] w-full">
          <PriceSummary
            cart={cart}
            totals={totals}
            couponInput={couponInput}
            setCouponInput={setCouponInput}
            appliedCoupon={appliedCoupon}
            couponError={couponError}
            isValidatingCoupon={isValidatingCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            handlePayment={handlePayment}
            processingPayment={processingPayment}
            selectedId={selectedId}
            paymentMethod={paymentMethod} 
            setPaymentMethod={setPaymentMethod}
          />
        </div>
      </div>
    </div>
  );
}