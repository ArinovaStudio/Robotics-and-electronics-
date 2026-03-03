"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCart } from "@/app/contexts";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Script from "next/script";

type Address = {
    id: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
    type: string;
};

export default function AddressPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const { cart } = useCart();
    
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    
    const [processingPayment, setProcessingPayment] = useState(false);

    const [formData, setFormData] = useState({
        name: "", phone: "", addressLine1: "", addressLine2: "",
        city: "", state: "", pincode: "", type: "SHIPPING" as const
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login?callbackUrl=/cart/address");
        }
    }, [isAuthenticated, isLoading, router]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch("/api/users/address");
            const data = await res.json();
            if (data.success) {
                setAddresses(data.data || []);
                const def = data.data?.find((a: Address) => a.isDefault);
                if (def) setSelectedId(def.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/users/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                setFormData({ name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", type: "SHIPPING" });
                await fetchAddresses();
            } else {
                alert(data.message || "Failed to add address");
            }
        } catch (err) {
            alert("Error adding address");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchAddresses();
    }, [isAuthenticated]);

    const calculateTotals = () => {
        if (!cart?.items || cart.items.length === 0) {
            return { itemCount: 0, subtotal: 0, totalSavings: 0, shipping: 0, total: 0 };
        }

        if (cart.summary && typeof cart.summary.total === 'number' && cart.summary.total > 0) {
            return {
                itemCount: cart.summary.itemCount || cart.items.length,
                subtotal: cart.summary.subtotal || 0,
                totalSavings: cart.summary.totalSavings || 0,
                shipping: cart.summary.shipping || 0,
                total: cart.summary.total
            };
        }

        let subtotal = 0;
        let totalSavings = 0;

        cart.items.forEach((item: any) => {
            const price = Number(item.product?.price || item.price || 0);
            const originalPrice = Number(item.product?.originalPrice || item.originalPrice || price);
            const quantity = Number(item.quantity || 1);

            subtotal += originalPrice * quantity;
            const savings = (originalPrice - price) * quantity;
            if (savings > 0) {
                totalSavings += savings;
            }
        });

        const shipping = subtotal > 1000 ? 0 : 50; 
        const total = subtotal - totalSavings + shipping;

        return { itemCount: cart.items.length, subtotal, totalSavings, shipping, total };
    };

    const totals = calculateTotals();

    // Razorpay Payment Handler
    const handlePayment = async () => {
        if (!selectedId) {
            alert("Please select a delivery address.");
            return;
        }

        // Check if the script loaded properly
        if (!(window as any).Razorpay) {
            alert("Razorpay SDK failed to load. Please check your connection.");
            return;
        }

        setProcessingPayment(true);

        try {
            const checkoutRes = await fetch("/api/razorpay/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addressId: selectedId }),
            });

            const orderData = await checkoutRes.json();

            if (!orderData.success) {
                alert(orderData.message || "Failed to create order");
                setProcessingPayment(false);
                return;
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

                        if (verifyData.success) {
                            router.push("/orders");
                        } else {
                            alert(`Verification failed: ${verifyData.message}`);
                            setProcessingPayment(false);
                        }
                    } catch (err) {
                        alert("An error occurred while verifying the payment.");
                        setProcessingPayment(false);
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: addresses.find(a => a.id === selectedId)?.phone || "",
                },
                theme: { color: "#f0b31e" },
                modal: {
                    ondismiss: function () {
                        setProcessingPayment(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            
            rzp.on("payment.failed", function (response: any) {
                alert(`Payment failed: ${response.error.description}`);
                setProcessingPayment(false);
            });

            rzp.open();
        } catch (error) {
            alert("Something went wrong initializing the payment.");
            setProcessingPayment(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <Loader2 className="w-12 h-12 border-4 border-[#f0b31e] border-t-transparent rounded-full animate-spin text-[#f0b31e]" />
            </div>
        );
    }

    const defaultAddr = addresses.find((a) => a.isDefault);
    const otherAddrs = addresses.filter((a) => !a.isDefault);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10 relative">
            {/* Inject Razorpay SDK */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Link href="/" className="hover:text-gray-700">Home</Link>
                <span>›</span>
                <Link href="/cart" className="hover:text-gray-700">Cart</Link>
                <span>›</span>
                <span className="text-gray-700 font-semibold">Address</span>
            </div>

            <div className="flex lg:flex-row flex-col gap-8">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Select Delivery Address</h1>
                        <button onClick={() => setShowAddModal(true)} className="border-2 border-gray-800 text-gray-800 px-5 py-2 rounded font-semibold hover:bg-gray-50 transition-colors">
                            ADD NEW ADDRESS
                        </button>
                    </div>

                    {defaultAddr && (
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-600 mb-3">DEFAULT ADDRESS</h2>
                            <div 
                                onClick={() => setSelectedId(defaultAddr.id)}
                                className={`border rounded-lg p-6 cursor-pointer transition-colors ${selectedId === defaultAddr.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        checked={selectedId === defaultAddr.id}
                                        onChange={() => setSelectedId(defaultAddr.id)}
                                        className="mt-1 w-4 h-4 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-gray-800">{defaultAddr.name}</span>
                                            <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-semibold">{defaultAddr.type}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {defaultAddr.addressLine1}
                                            {defaultAddr.addressLine2 && `, ${defaultAddr.addressLine2}`}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {defaultAddr.city}, {defaultAddr.state} - {defaultAddr.pincode}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-3">Mobile: <span className="font-semibold">{defaultAddr.phone}</span></p>
                                        <p className="text-sm text-gray-600 mb-4">• Pay on Delivery available</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {otherAddrs.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-gray-600 mb-3">OTHER ADDRESS</h2>
                            <div className="space-y-4">
                                {otherAddrs.map((addr) => (
                                    <div 
                                        key={addr.id} 
                                        onClick={() => setSelectedId(addr.id)}
                                        className={`border rounded-lg p-6 cursor-pointer transition-colors ${selectedId === addr.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                checked={selectedId === addr.id}
                                                onChange={() => setSelectedId(addr.id)}
                                                className="mt-1 w-4 h-4 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-gray-800">{addr.name}</span>
                                                    <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-semibold">{addr.type}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {addr.addressLine1}
                                                    {addr.addressLine2 && `, ${addr.addressLine2}`}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                                <p className="text-sm text-gray-600">Mobile: <span className="font-semibold">{addr.phone}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:w-[380px] w-full">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
                        <h2 className="text-sm font-bold text-gray-600 mb-4">DELIVERY ESTIMATES</h2>
                        <div className="space-y-4 mb-6">
                            {cart?.items?.slice(0, 2).map((item: any, i: number) => {
                                const deliveryDays = 5 + i * 2;
                                const startDate = new Date();
                                startDate.setDate(startDate.getDate() + deliveryDays);
                                const endDate = new Date(startDate);
                                endDate.setDate(endDate.getDate() + 2);

                                return (
                                    <div key={i} className="flex gap-3">
                                        <Image src={item.product?.imageLink || "/homeposter.png"} alt="" width={60} height={60} className="rounded object-cover" />
                                        {/* <p className="text-sm text-gray-700">Delivery between <span className="font-semibold">{startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></p> */}
                                    </div>
                                );
                            })}
                        </div>

                        <h3 className="text-sm font-bold text-gray-700 mb-3">PRICE DETAILS ({totals.itemCount} Items)</h3>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total MRP</span>
                                <span className="text-gray-800">₹{totals.subtotal.toFixed(2)}</span>
                            </div>
                            {totals.totalSavings > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount on MRP</span>
                                    <span>-₹{totals.totalSavings.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping Fee</span>
                                <span className="text-gray-800">{totals.shipping > 0 ? `₹${totals.shipping.toFixed(2)}` : 'FREE'}</span>
                            </div>
                        </div>

                        <div className="border-t pt-4 mb-6">
                            <div className="flex justify-between text-base font-bold">
                                <span className="text-gray-800">Total Amount</span>
                                <span className="text-gray-800">₹{totals.total.toFixed(2)}</span>
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
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Add New Address</h2>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                            <input required placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded px-3 py-2" />
                            <input required placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border rounded px-3 py-2" />
                            <input required placeholder="Address Line 1" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} className="w-full border rounded px-3 py-2" />
                            <input placeholder="Address Line 2" value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} className="w-full border rounded px-3 py-2" />
                            <input required placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full border rounded px-3 py-2" />
                            <input required placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full border rounded px-3 py-2" />
                            <input required placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="w-full border rounded px-3 py-2" />
                            <div className="flex gap-3">
                                <button type="submit" disabled={saving} className="flex-1 bg-gray-800 text-white py-2 rounded font-semibold hover:bg-gray-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 py-2 rounded font-semibold hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}