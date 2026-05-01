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

type Address = {
    id: string; name: string; phone: string; addressLine1: string; addressLine2?: string;
    city: string; state: string; pincode: string; isDefault: boolean; type: string;
};

export default function AddressPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const { cart } = useCart();
    
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<Address | null>(null);

    // Coupon States
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountAmount: number} | null>(null);
    const [couponError, setCouponError] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

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
        } catch (err) { alert("An error occurred while deleting the address."); }
    };

    const handleEditClick = (e: React.MouseEvent, address: Address) => {
        e.stopPropagation();
        setEditData(address);
        setIsModalOpen(true);
    };

    const calculateTotals = () => {
        if (!cart?.items || cart.items.length === 0) return { itemCount: 0, subtotal: 0, totalSavings: 0, shipping: 0, total: 0 };
        if (cart.summary && cart.summary.total) {
            return {
                itemCount: Number(cart.summary.itemCount || cart.items.length),
                subtotal: Number(cart.summary.subtotal || 0),
                totalSavings: Number(cart.summary.totalSavings || 0),
                shipping: Number(cart.summary.shipping || 0),
                total: Number(cart.summary.total || 0)
            };
        }
        let subtotal = 0, totalSavings = 0;
        cart.items.forEach((item: any) => {
            const price = Number(item.product?.price || item.price || 0);
            const originalPrice = Number(item.product?.originalPrice || item.originalPrice || price);
            const quantity = Number(item.quantity || 1);
            subtotal += originalPrice * quantity;
            const savings = (originalPrice - price) * quantity;
            if (savings > 0) totalSavings += savings;
        });
        const shipping = subtotal > 1000 ? 0 : 50; 
        const total = subtotal - totalSavings + shipping;
        return { itemCount: cart.items.length, subtotal, totalSavings, shipping, total };
    };

    const totals = calculateTotals();

    // Coupon Handlers
    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setIsValidatingCoupon(true);
        setCouponError("");
        try {
            const res = await fetch("/api/users/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponInput, cartTotal: totals.subtotal - totals.totalSavings }) 
            });
            const data = await res.json();
            if (data.success) {
                setAppliedCoupon(data.data);
                setCouponInput("");
            } else {
                setCouponError(data.message);
            }
        } catch (err) {
            setCouponError("Failed to validate coupon");
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError("");
    };

    const cancelOrder = async (orderId: string) => {
        try {
            await fetch("/api/razorpay/cancel", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }),
            });
        } catch (error) { console.error("Failed to cancel order:", error); }
    };

    const handlePayment = async () => {
        if (!selectedId) return alert("Please select a delivery address.");
        if (!(window as any).Razorpay) return alert("Razorpay SDK failed to load.");
        setProcessingPayment(true);

        try {
            const checkoutRes = await fetch("/api/razorpay/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addressId: selectedId, couponCode: appliedCoupon?.code }),
            });

            const orderData = await checkoutRes.json();
            if (!orderData.success) {
                alert(orderData.message || "Failed to create order");
                setProcessingPayment(false); return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
                amount: orderData.data.amount, 
                currency: orderData.data.currency,
                name: "Robotics Store",
                description: "Secure Order Checkout",
                order_id: orderData.data.razorpayOrderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: orderData.data.orderId,
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyData.success) router.push("/orders");
                        else { alert(`Verification failed: ${verifyData.message}`); setProcessingPayment(false); }
                    } catch (err) { alert("An error occurred verifying the payment."); setProcessingPayment(false); }
                },
                prefill: {
                    name: user?.name || "", email: user?.email || "", contact: addresses.find(a => a.id === selectedId)?.phone || "",
                },
                theme: { color: "#f0b31e" },
                modal: {
                    ondismiss: function () {
                        setProcessingPayment(false);
                        if (orderData?.data?.orderId) cancelOrder(orderData.data.orderId);
                    }
                }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                alert(`Payment failed: ${response.error.description}`);
                setProcessingPayment(false);
                if (orderData?.data?.orderId) cancelOrder(orderData.data.orderId);
            });
            rzp.open();
        } catch (error) {
            alert("Something went wrong initializing the payment.");
            setProcessingPayment(false);
        }
    };

    if (isLoading || loading) return <div className="flex justify-center items-center py-40"><Loader2 className="w-12 h-12 border-4 border-[#f0b31e] border-t-transparent rounded-full animate-spin text-[#f0b31e]" /></div>;

    const defaultAddr = addresses.find((a) => a.isDefault);
    const otherAddrs = addresses.filter((a) => !a.isDefault);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10 relative">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            <AddressModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAddresses} initialData={editData} />

            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Link href="/" className="hover:text-gray-700">Home</Link> <span>›</span>
                <Link href="/cart" className="hover:text-gray-700">Cart</Link> <span>›</span>
                <span className="text-gray-700 font-semibold">Address</span>
            </div>

            <div className="flex lg:flex-row flex-col gap-8">
                {/* Address Selection */}
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

                {/* Price Summary & Coupons */}
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
                    />
                </div>
            </div>
        </div>
    );
}