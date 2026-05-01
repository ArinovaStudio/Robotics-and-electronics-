"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Search, Ticket, Calendar, Trash2, Edit, Loader2, IndianRupee, Percent, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ProductMetricCard } from "@/components/admin/ProductMetricCard";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { authFetcher } from "@/store/adminStore";
import { CouponModal } from "@/components/admin/CouponModal";

export default function CouponsPage() {
  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Build Query
  const query = new URLSearchParams({
    ...(search && { search }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  }).toString();

  // Fetch Data
  const { data, isLoading } = useSWR(`/api/admin/coupons?${query}`, authFetcher);
  
  const coupons = data?.data?.coupons || [];
  const metrics = data?.data?.metrics || { total: 0, active: 0, inactive: 0 };

  // Handlers
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) mutate(`/api/admin/coupons?${query}`);
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${deletingCoupon.id}`, { method: "DELETE" });
      if (res.ok) {
        mutate(`/api/admin/coupons?${query}`);
        setDeletingCoupon(null);
      }
    } catch (err) {
      console.error("Failed to delete coupon", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full space-y-6 pb-12">
      {/* Header & Search */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Coupons</h1>
          
          <div className="relative w-full sm:max-w-md mt-2 sm:mt-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              placeholder="Search code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-full border-slate-200 bg-white focus:ring-[#4a439a]/20"
            />
          </div>
        </div>

        <button 
          onClick={() => { setEditingCoupon(null); setIsAddModalOpen(true); }}
          className="bg-[#4a439a] text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 w-full md:w-auto cursor-pointer hover:bg-[#3e3685] transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span className="font-medium">Create Coupon</span>
        </button>
      </header>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <ProductMetricCard 
          title="Total Coupons" 
          value={metrics.total} 
          percent={100} isUp={true} data={[2, 4, 6, 8, Math.max(2, metrics.total)]} 
        />
        <ProductMetricCard 
          title="Active Coupons" 
          value={metrics.active} 
          percent={metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0} 
          isUp={true} data={[1, 3, 5, 7, Math.max(1, metrics.active)]} 
        />
        <ProductMetricCard 
          title="Inactive Coupons" 
          value={metrics.inactive} 
          percent={metrics.total > 0 ? Math.round((metrics.inactive / metrics.total) * 100) : 0} 
          isUp={false} data={[5, 4, 3, 2, Math.max(1, metrics.inactive)]} 
        />
      </div>

      {/* MAIN CONTENT CARD */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          
          {/* Filter Bar */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xl font-semibold text-slate-800">Coupon List</p>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Cards Container */}
          <div className="p-6 space-y-4 bg-slate-50/30">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#4a439a] w-8 h-8"/></div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-700">No coupons found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or create a new coupon.</p>
              </div>
            ) : (
              coupons.map((coupon: any) => (
                <div 
                  key={coupon.id} 
                  className={`relative flex flex-col lg:flex-row items-center justify-between gap-4 p-5 rounded-xl transition-all ${
                    coupon.isActive 
                      ? "bg-white border border-slate-200 shadow-sm hover:border-[#4a439a]/40" 
                      : "bg-slate-50 border-2 border-dashed border-slate-200 opacity-60 grayscale-[0.2]"
                  }`}
                >
                  {/* INACTIVE BADGE */}
                  {!coupon.isActive && (
                    <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-xl">
                      Inactive
                    </div>
                  )}

                  {/* Left: Code & Discount Value */}
                  <div className="flex items-center gap-5 w-full lg:w-1/3">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border ${coupon.isActive ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-200 border-slate-300'}`}>
                      {coupon.discountType === "PERCENTAGE" ? <Percent className={`w-5 h-5 ${coupon.isActive ? 'text-[#4a439a]' : 'text-slate-500'}`} /> : <IndianRupee className={`w-5 h-5 ${coupon.isActive ? 'text-[#4a439a]' : 'text-slate-500'}`} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className={`text-xl font-bold font-mono tracking-tight ${coupon.isActive ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
                          {coupon.code}
                        </h2>
                        <button onClick={() => handleCopy(coupon.code)} className="text-slate-400 hover:text-[#4a439a] transition-colors p-1" title="Copy Code">
                          {copiedCode === coupon.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className={`text-sm font-semibold ${coupon.isActive ? 'text-[#4a439a]' : 'text-slate-500'}`}>
                        {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Stats & Limits */}
                  <div className="flex flex-col w-full lg:w-1/3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Usage</span>
                      <span className="font-medium text-slate-700">
                        {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "uses"}
                      </span>
                    </div>
                    {coupon.usageLimit && (
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${coupon.usedCount >= coupon.usageLimit ? 'bg-rose-500' : 'bg-[#4a439a]'}`} 
                          style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {coupon.minOrderAmount && <span>Min: ₹{coupon.minOrderAmount}</span>}
                      {(coupon.startDate || coupon.expiryDate) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No expiry'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-end gap-5 w-full lg:w-auto mt-2 lg:mt-0">
                    <Switch 
                      checked={coupon.isActive} 
                      onCheckedChange={() => handleToggleActive(coupon.id, coupon.isActive)}
                    />
                    
                    <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCoupon(coupon); setIsAddModalOpen(true); }} className="h-8 w-8 text-slate-500 hover:text-[#4a439a] hover:bg-white shadow-sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingCoupon(coupon)} className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-white shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <DeleteConfirmModal 
        isOpen={!!deletingCoupon} 
        onClose={() => setDeletingCoupon(null)}
        onConfirm={handleDelete}
        title={deletingCoupon?.code || ""}
        itemName="Coupon"
        warningMessage="This code will be permanently deleted. Customers will no longer be able to use it."
        isDeleting={isDeleting}
      />

      <CouponModal 
        isOpen={isAddModalOpen || !!editingCoupon} 
        onClose={() => { setIsAddModalOpen(false); setEditingCoupon(null); }} 
        coupon={editingCoupon} 
        onSuccess={() => mutate(`/api/admin/coupons?${query}`)} 
      />
    </div>
  );
}