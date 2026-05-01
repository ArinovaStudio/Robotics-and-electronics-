"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export function CouponModal({ isOpen, onClose, coupon, onSuccess }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Core Data
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Optional Data Switches
  const [hasMinOrder, setHasMinOrder] = useState(false);
  const [minOrderAmount, setMinOrderAmount] = useState("");
  
  const [hasMaxDiscount, setHasMaxDiscount] = useState(false);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  
  const [hasUsageLimit, setHasUsageLimit] = useState(false);
  const [usageLimit, setUsageLimit] = useState("");
  
  const [hasDates, setHasDates] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (coupon) {
        // Edit Mode
        setCode(coupon.code);
        setDescription(coupon.description || "");
        setDiscountType(coupon.discountType);
        setDiscountValue(coupon.discountValue.toString());
        setIsActive(coupon.isActive);

        setHasMinOrder(!!coupon.minOrderAmount);
        setMinOrderAmount(coupon.minOrderAmount?.toString() || "");

        setHasMaxDiscount(!!coupon.maxDiscountAmount);
        setMaxDiscountAmount(coupon.maxDiscountAmount?.toString() || "");

        setHasUsageLimit(!!coupon.usageLimit);
        setUsageLimit(coupon.usageLimit?.toString() || "");

        setHasDates(!!(coupon.startDate || coupon.expiryDate));
        setStartDate(coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "");
        setExpiryDate(coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 16) : "");
      } else {
        // Create Mode - Reset
        setCode(""); setDescription(""); setDiscountType("PERCENTAGE"); setDiscountValue(""); setIsActive(true);
        setHasMinOrder(false); setMinOrderAmount("");
        setHasMaxDiscount(false); setMaxDiscountAmount("");
        setHasUsageLimit(false); setUsageLimit("");
        setHasDates(false); setStartDate(""); setExpiryDate("");
      }
      setError("");
    }
  }, [isOpen, coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const payload = {
      code,
      description: description || null,
      discountType,
      discountValue: Number(discountValue),
      isActive,
      minOrderAmount: hasMinOrder && minOrderAmount ? Number(minOrderAmount) : null,
      maxDiscountAmount: hasMaxDiscount && maxDiscountAmount && discountType === "PERCENTAGE" ? Number(maxDiscountAmount) : null,
      usageLimit: hasUsageLimit && usageLimit ? Number(usageLimit) : null,
      startDate: hasDates && startDate ? new Date(startDate).toISOString() : null,
      expiryDate: hasDates && expiryDate ? new Date(expiryDate).toISOString() : null,
    };

    try {
      const url = coupon ? `/api/admin/coupons/${coupon.id}` : "/api/admin/coupons";
      const method = coupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save coupon");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 py-5 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800">
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <form id="couponForm" onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>}

            {/* Core Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Coupon Code <span className="text-red-500">*</span></label>
                <Input required value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER50" className="uppercase font-mono font-bold tracking-wider focus-visible:ring-[#4a439a]" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Input value={description} onChange={e=>setDescription(e.target.value)} placeholder="e.g. Influencer campaign code" className="focus-visible:ring-[#4a439a]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Discount Type</label>
                <select value={discountType} onChange={e=>setDiscountType(e.target.value)} className="w-full border border-slate-200 bg-white rounded-md px-3 h-10 text-sm focus:ring-2 focus:ring-[#4a439a]/20 focus:border-[#4a439a] outline-none">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Discount Value <span className="text-red-500">*</span></label>
                <Input required type="number" min="0.01" step="0.01" value={discountValue} onChange={e=>setDiscountValue(e.target.value)} placeholder={discountType === 'PERCENTAGE' ? "e.g. 10" : "e.g. 500"} className="focus-visible:ring-[#4a439a] font-bold" />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Advanced Options Toggles */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Rules & Limits</h3>

              {/* Min Order */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Require Minimum Order Value?</label>
                  <Switch checked={hasMinOrder} onCheckedChange={setHasMinOrder} />
                </div>
                {hasMinOrder && (
                  <Input type="number" value={minOrderAmount} onChange={e=>setMinOrderAmount(e.target.value)} placeholder="Minimum ₹ amount required" className="mt-2 bg-white" required={hasMinOrder} />
                )}
              </div>

              {/* Max Discount (Only show if Percentage!) */}
              {discountType === "PERCENTAGE" && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Cap Maximum Discount Amount?</label>
                    <Switch checked={hasMaxDiscount} onCheckedChange={setHasMaxDiscount} />
                  </div>
                  {hasMaxDiscount && (
                    <Input type="number" value={maxDiscountAmount} onChange={e=>setMaxDiscountAmount(e.target.value)} placeholder="Maximum ₹ discount allowed" className="mt-2 bg-white" required={hasMaxDiscount} />
                  )}
                </div>
              )}

              {/* Usage Limit */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Limit Total Uses?</label>
                  <Switch checked={hasUsageLimit} onCheckedChange={setHasUsageLimit} />
                </div>
                {hasUsageLimit && (
                  <Input type="number" value={usageLimit} onChange={e=>setUsageLimit(e.target.value)} placeholder="Max number of times coupon can be used total" className="mt-2 bg-white" required={hasUsageLimit} />
                )}
              </div>

              {/* Dates */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Set Active Dates?</label>
                  <Switch checked={hasDates} onCheckedChange={setHasDates} />
                </div>
                {hasDates && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500">Start Date (Optional)</span>
                      <Input type="datetime-local" value={startDate} onChange={e=>setStartDate(e.target.value)} className="bg-white text-xs" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500">Expiry Date (Optional)</span>
                      <Input type="datetime-local" value={expiryDate} onChange={e=>setExpiryDate(e.target.value)} className="bg-white text-xs" />
                    </div>
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button form="couponForm" type="submit" disabled={isLoading} className="bg-[#4a439a] hover:bg-[#3e3685] text-white">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {coupon ? "Update Coupon" : "Create Coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}