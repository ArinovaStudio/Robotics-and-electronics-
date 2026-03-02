"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCart } from "@/app/contexts";
import Link from "next/link";
import Image from "next/image";

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
    const { isAuthenticated, isLoading } = useAuth();
    const { cart } = useCart();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login?callbackUrl=/cart/address");
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        async function fetchAddresses() {
            try {
                const res = await fetch("/api/users/addresses");
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
        }
        if (isAuthenticated) fetchAddresses();
    }, [isAuthenticated]);

    if (isLoading || loading) {
        return <div className="max-w-[1200px] mx-auto px-6 py-10">Loading...</div>;
    }

    const defaultAddr = addresses.find((a) => a.isDefault);
    const otherAddrs = addresses.filter((a) => !a.isDefault);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10">
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
                        <button className="border-2 border-gray-800 text-gray-800 px-5 py-2 rounded font-semibold hover:bg-gray-50">
                            ADD NEW ADDRESS
                        </button>
                    </div>

                    {defaultAddr && (
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-600 mb-3">DEFAULT ADDRESS</h2>
                            <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <input
                                        type="radio"
                                        checked={selectedId === defaultAddr.id}
                                        onChange={() => setSelectedId(defaultAddr.id)}
                                        className="mt-1 w-4 h-4 accent-pink-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-gray-800">{defaultAddr.name}</span>
                                            <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-semibold">HOME</span>
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
                                        <div className="flex gap-3">
                                            <button className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm font-semibold hover:bg-gray-50">REMOVE</button>
                                            <button className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm font-semibold hover:bg-gray-50">EDIT</button>
                                        </div>
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
                                    <div key={addr.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                checked={selectedId === addr.id}
                                                onChange={() => setSelectedId(addr.id)}
                                                className="mt-1 w-4 h-4 accent-pink-500"
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
                                        <p className="text-sm text-gray-700">Delivery between <span className="font-semibold">{startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></p>
                                    </div>
                                );
                            })}
                        </div>

                        <h3 className="text-sm font-bold text-gray-700 mb-3">PRICE DETAILS ({cart?.summary?.totalItems || 0} Items)</h3>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total MRP</span>
                                <span className="text-gray-800">₹{Number(cart?.summary?.subtotal || 0).toFixed(2)}</span>
                            </div>
                            {Number(cart?.summary?.totalSavings || 0) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount on MRP</span>
                                    <span>-₹{Number(cart?.summary?.totalSavings).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping Fee</span>
                                <span className="text-gray-800">{Number(cart?.summary?.shipping || 0) > 0 ? `₹${Number(cart?.summary?.shipping).toFixed(2)}` : 'FREE'}</span>
                            </div>
                        </div>

                        <div className="border-t pt-4 mb-6">
                            <div className="flex justify-between text-base font-bold">
                                <span className="text-gray-800">Total Amount</span>
                                <span className="text-gray-800">₹{Number(cart?.summary?.total || 0).toFixed(2)}</span>
                            </div>
                        </div>
                        <span className="text-gray-800">Total Amount</span>
                        <span className="text-gray-800">₹{cart?.summary?.total || 0}</span>
                    </div>
                <button
                    onClick={() => router.push("/checkout")}
                    disabled={!selectedId}
                    className="w-full mt-4  bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    CONTINUE
                </button>
                </div>

            </div>
        </div>
    );
}