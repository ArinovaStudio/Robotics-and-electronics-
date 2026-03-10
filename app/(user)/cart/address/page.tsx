"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCart } from "@/app/contexts";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Edit, Trash2 } from "lucide-react";
import Script from "next/script";
import AddressModal from "@/components/AddressModal";

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
    
    const [processingPayment, setProcessingPayment] = useState(false);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<Address | null>(null);

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
                if (def && !selectedId) setSelectedId(def.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchAddresses();
    }, [isAuthenticated]);

    const handleDeleteAddress = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); 
        
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            const res = await fetch(`/api/users/address/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            
            if (data.success) {
                if (selectedId === id) setSelectedId("");
                fetchAddresses();
            } else {
                alert(data.message || "Failed to delete address");
            }
        } catch (err) {
            alert("An error occurred while deleting the address.");
        }
    };

    const handleEditClick = (e: React.MouseEvent, address: Address) => {
        e.stopPropagation();
        setEditData(address);
        setIsModalOpen(true);
    };

    const handleAddNewClick = () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const calculateTotals = () => {
        if (!cart?.items || cart.items.length === 0) {
            return { itemCount: 0, subtotal: 0, totalSavings: 0, shipping: 0, total: 0 };
        }

       if (cart.summary && cart.summary.total) {
    return {
        itemCount: Number(cart.summary.itemCount || cart.items.length),
        subtotal: Number(cart.summary.subtotal || 0),
        totalSavings: Number(cart.summary.totalSavings || 0),
        shipping: Number(cart.summary.shipping || 0),
        total: Number(cart.summary.total || 0)
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

    const cancelOrder = async (orderId: string) => {
        try {
            await fetch("/api/razorpay/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
        } catch (error) {
            console.error("Failed to cancel order:", error);
        }
    };

    const handlePayment = async () => {
        if (!selectedId) {
            alert("Please select a delivery address.");
            return;
        }

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
                        if (orderData?.data?.orderId) {
                            cancelOrder(orderData.data.orderId);
                        }
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            
            rzp.on("payment.failed", function (response: any) {
                alert(`Payment failed: ${response.error.description}`);
                setProcessingPayment(false);
                if (orderData?.data?.orderId) {
                    cancelOrder(orderData.data.orderId);
                }
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

    const renderAddressCard = (addr: Address) => (
        <div 
            key={addr.id}
            onClick={() => setSelectedId(addr.id)}
            className={`border rounded-lg p-6 cursor-pointer transition-colors relative group ${selectedId === addr.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
        >
            {/* Update / Delete Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => handleEditClick(e, addr)}
                    className="p-2 text-gray-500 hover:text-[#f0b31e] bg-white border border-gray-200 rounded-md shadow-sm hover:border-[#f0b31e] transition-colors"
                    title="Edit Address"
                >
                    <Edit size={16} />
                </button>
                <button 
                    onClick={(e) => handleDeleteAddress(e, addr.id)}
                    className="p-2 text-gray-500 hover:text-red-500 bg-white border border-gray-200 rounded-md shadow-sm hover:border-red-500 transition-colors"
                    title="Delete Address"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex items-start gap-3">
                <input
                    type="radio"
                    checked={selectedId === addr.id}
                    onChange={() => setSelectedId(addr.id)}
                    className="mt-1.5 w-4 h-4 cursor-pointer accent-[#f0b31e]"
                />
                <div className="flex-1 pr-16">
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
                    {addr.isDefault && (
                        <p className="text-sm text-gray-600 mt-3">• Pay on Delivery available</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10 relative">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            <AddressModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAddresses}
                initialData={editData}
            />

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
                        <button 
                            onClick={handleAddNewClick} 
                            className="border-2 border-gray-800 text-gray-800 px-5 py-2 rounded font-semibold hover:bg-gray-50 transition-colors"
                        >
                            ADD NEW ADDRESS
                        </button>
                    </div>

                    {defaultAddr && (
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-600 mb-3">DEFAULT ADDRESS</h2>
                            {renderAddressCard(defaultAddr)}
                        </div>
                    )}

                    {otherAddrs.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-gray-600 mb-3">OTHER ADDRESS</h2>
                            <div className="space-y-4">
                                {otherAddrs.map((addr) => renderAddressCard(addr))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side Summary / Estimates Section */}
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
                                        <Image src={item.product?.imageLink || "/homeposter.png"} alt="" width={60} height={60} className="rounded object-cover border border-gray-100" unoptimized />
                                        {/* <p className="text-sm text-gray-700">Delivery between <span className="font-semibold">{startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></p> */}
                                    </div>
                                );
                            })}
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
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping Fee</span>
                                <span className="text-gray-800">{totals.shipping > 0 ? `₹${totals.shipping.toFixed(2)}` : 'FREE'}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mb-6">
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
        </div>
    );
}