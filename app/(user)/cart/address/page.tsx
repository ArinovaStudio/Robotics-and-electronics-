"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { Loader2, Edit, Trash2, Plus, Tag, X } from "lucide-react";
import toast from "react-hot-toast";
import AddressModal from "@/components/AddressModal";
import { usePayU } from "@/hooks/usePayU";
import { useRazorpay } from "@/hooks/useRazorPay";

const ACCENT = "#ff5a1f";

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

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    imageLink: string | null;
    price: number;
    originalPrice: number;
  };
  lineTotal: number;
};

type Cart = {
  cartId: string;
  items: CartItem[];
  summary: {
    subtotal: string;
    totalSavings: string;
    total: string;
    itemCount: number;
    shipping?: number;
  };
};

type AppliedCoupon = { code: string; discountAmount: number };

export default function BetaAddressPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [addressLoading, setAddressLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [isCODProcessing, setIsCODProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Address | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/login?callbackUrl=/cart/address");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
      } else {
        toast.error(data.message || "Could not load your cart.");
      }
    } catch {
      toast.error("Something went wrong loading your cart.");
    } finally {
      setCartLoading(false);
    }
  }, [router]);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/users/address");
      if (res.status === 401) {
        router.push("/login?callbackUrl=/cart/address");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data || []);
        const def = data.data?.find((a: Address) => a.isDefault);
        if (def) setSelectedId((prev) => prev || def.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, [fetchCart, fetchAddresses]);

  const totals = (() => {
    if (!cart?.summary) return { itemCount: 0, subtotal: 0, totalSavings: 0, shipping: 0, total: 0 };
    return {
      itemCount: Number(cart.summary.itemCount || 0),
      subtotal: Number(cart.summary.subtotal || 0),
      totalSavings: Number(cart.summary.totalSavings || 0),
      shipping: Number(cart.summary.shipping || 0),
      total: Number(cart.summary.total || 0),
    };
  })();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/users/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput,
          cartTotal: totals.subtotal - totals.totalSavings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.data);
        setCouponInput("");
      } else {
        setCouponError(data.message);
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleDeleteAddress = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/users/address/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        if (selectedId === id) setSelectedId("");
        fetchAddresses();
        toast.success("Address deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete address");
      }
    } catch {
      toast.error("An error occurred while deleting the address.");
    }
  };

  const handleEditClick = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation();
    setEditData(address);
    setIsModalOpen(true);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedId);

  const { processRazorpayPayment, isProcessing: isRzpProcessing } = useRazorpay(
    session?.user,
    selectedAddress
  );
  const { processPayUPayment, isProcessing: isPayuProcessing } = usePayU();

  const processingPayment = isCODProcessing || isRzpProcessing || isPayuProcessing;
  const activeGateway = process.env.NEXT_PUBLIC_GATEWAY || "RAZORPAY";

  const handlePayment = async () => {
    if (!selectedId) {
      toast.error("Please select a delivery address to proceed.");
      return;
    }

    if (paymentMethod === "COD") {
      setIsCODProcessing(true);
      try {
        const res = await fetch("/api/payments/cod/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addressId: selectedId, couponCode: appliedCoupon?.code }),
        });
        const data = await res.json();
        if (data.success) {
          router.push(`/order-success?orderId=${data.data.orderId}`);
        } else {
          toast.error(data.message);
          setIsCODProcessing(false);
        }
      } catch {
        toast.error("Something went wrong with COD checkout.");
        setIsCODProcessing(false);
      }
      return;
    }

    if (activeGateway === "RAZORPAY") {
      await processRazorpayPayment(selectedId, appliedCoupon?.code);
    } else if (activeGateway === "PAYU") {
      await processPayUPayment(selectedId, appliedCoupon?.code);
    }
  };

  if (cartLoading || addressLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  const defaultAddr = addresses.find((a) => a.isDefault);
  const otherAddrs = addresses.filter((a) => !a.isDefault);
  const finalTotal = totals.total - (appliedCoupon?.discountAmount || 0);

  return (
    <div className="px-6 md:px-16 py-10">
      {activeGateway === "RAZORPAY" && <Script src="https://checkout.razorpay.com/v1/checkout.js" />}

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAddresses}
        initialData={editData}
      />

      <nav className="font-mono text-xs text-gray-500 dark:text-white/40 mb-6">
        <Link href="" className="hover:underline">Home</Link>
        {" / "}
        <Link href="/cart" className="hover:underline">Cart</Link>
        {" / "}
        <span className="text-gray-700 dark:text-white/70">Address</span>
      </nav>

      <h1 className="font-dm-sans text-3xl font-extrabold text-gray-900 dark:text-white mb-10">
        Checkout
      </h1>

      <div className="grid md:grid-cols-[1fr_380px] gap-10">
        {/* LEFT: address list */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-dm-sans text-lg font-bold text-gray-900 dark:text-white">
              Select Delivery Address
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest px-5 py-3 border transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              <Plus size={14} />
              Add New
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="border border-gray-300 dark:border-white/10 p-10 text-center">
              <p className="font-mono text-sm text-gray-500 dark:text-white/40">
                You don&apos;t have any saved addresses yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {defaultAddr && (
                <div>
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-white/40 mb-3">
                    Default Address
                  </h3>
                  <AddressCard
                    addr={defaultAddr}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteAddress}
                  />
                </div>
              )}

              {otherAddrs.length > 0 && (
                <div>
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-white/40 mb-3">
                    Other Addresses
                  </h3>
                  <div className="space-y-4">
                    {otherAddrs.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        addr={addr}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteAddress}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: order summary + payment */}
        <div className="border border-gray-300 dark:border-white/10 p-6 h-fit sticky top-6">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] mb-5" style={{ color: ACCENT }}>
            Order Summary
          </h2>

          {cart?.items && cart.items.length > 0 && (
            <div className="flex gap-2 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
              {cart.items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="relative w-14 h-14 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#141414] flex-shrink-0"
                >
                  {item.product?.imageLink ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.imageLink}
                      alt=""
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : null}
                </div>
              ))}
              {cart.items.length > 4 && (
                <div className="w-14 h-14 border border-gray-200 dark:border-white/10 flex items-center justify-center font-mono text-xs text-gray-500 dark:text-white/40">
                  +{cart.items.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Coupon */}
          <div className="mb-6">
            {appliedCoupon ? (
              <div className="flex items-center justify-between border border-green-500/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-green-600 dark:text-green-400" />
                  <span className="font-mono text-xs font-semibold text-green-600 dark:text-green-400">
                    {appliedCoupon.code} applied
                  </span>
                </div>
                <button type="button" onClick={handleRemoveCoupon} aria-label="Remove coupon">
                  <X size={14} className="text-gray-400 dark:text-white/30 hover:text-red-500" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 h-11 px-3 border bg-transparent text-sm font-mono text-gray-900 dark:text-white outline-none focus:border-current transition-colors"
                    style={{ borderColor: "#232323" }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="font-dm-sans text-xs font-semibold uppercase tracking-widest px-5 border disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    style={{ borderColor: ACCENT, color: ACCENT }}
                  >
                    {isValidatingCoupon ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 font-mono text-xs text-red-500">{couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="space-y-2 font-mono text-sm mb-4">
            <div className="flex justify-between text-gray-600 dark:text-white/60">
              <span>Total MRP ({totals.itemCount} items)</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.totalSavings > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount on MRP</span>
                <span>-₹{totals.totalSavings.toFixed(2)}</span>
              </div>
            )}
            {appliedCoupon && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 dark:text-white/60">
              <span>Shipping</span>
              <span>{totals.shipping > 0 ? `₹${totals.shipping.toFixed(2)}` : "FREE"}</span>
            </div>
          </div>

          <div className="flex justify-between font-dm-sans text-lg font-extrabold text-gray-900 dark:text-white pt-4 mb-6 border-t border-gray-100 dark:border-white/5">
            <span>Total</span>
            <span style={{ color: ACCENT }}>₹{finalTotal.toFixed(2)}</span>
          </div>

          {/* Payment method */}
          <div className="mb-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-white/40 mb-3">
              Payment Method
            </h3>
            <div className="space-y-2">
              <label
                className="flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors"
                style={{ borderColor: paymentMethod === "ONLINE" ? ACCENT : "#232323" }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: ACCENT }}
                />
                <span className="font-mono text-xs font-semibold text-gray-800 dark:text-white/80">
                  Pay Online
                </span>
              </label>
              <label
                className="flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors"
                style={{ borderColor: paymentMethod === "COD" ? ACCENT : "#232323" }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: ACCENT }}
                />
                <span className="font-mono text-xs font-semibold text-gray-800 dark:text-white/80">
                  Cash on Delivery
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePayment}
            disabled={!selectedId || processingPayment}
            className="w-full flex items-center justify-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-white px-8 py-4 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT }}
          >
            {processingPayment ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : paymentMethod === "COD" ? (
              "Place Order"
            ) : (
              "Pay Securely"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddressCard({
  addr,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  addr: Address;
  selectedId: string;
  onSelect: (id: string) => void;
  onEdit: (e: React.MouseEvent, addr: Address) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}) {
  const isSelected = selectedId === addr.id;
  return (
    <div
      onClick={() => onSelect(addr.id)}
      className="relative group border p-5 cursor-pointer transition-colors"
      style={{ borderColor: isSelected ? ACCENT : "#232323" }}
    >
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => onEdit(e, addr)}
          className="p-2 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 transition-colors"
          title="Edit Address"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => onDelete(e, addr.id)}
          className="p-2 text-gray-500 dark:text-white/40 hover:text-red-500 border border-gray-200 dark:border-white/10 hover:border-red-500 transition-colors"
          title="Delete Address"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="radio"
          checked={isSelected}
          onChange={() => onSelect(addr.id)}
          className="mt-1 w-4 h-4 cursor-pointer"
          style={{ accentColor: ACCENT }}
        />
        <div className="flex-1 pr-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-dm-sans text-sm font-bold text-gray-900 dark:text-white">
              {addr.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border border-gray-300 dark:border-white/15 text-gray-500 dark:text-white/40">
              {addr.type}
            </span>
          </div>
          <p className="font-mono text-xs text-gray-600 dark:text-white/60 mb-1">
            {addr.addressLine1}
            {addr.addressLine2 && `, ${addr.addressLine2}`}
          </p>
          <p className="font-mono text-xs text-gray-600 dark:text-white/60 mb-2">
            {addr.city}, {addr.state} - {addr.pincode}
          </p>
          <p className="font-mono text-xs text-gray-500 dark:text-white/40">
            Mobile: <span className="text-gray-800 dark:text-white/70">{addr.phone}</span>
          </p>
        </div>
      </div>
    </div>
  );
}