"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { ShoppingBasket, Sprout, ShoppingCart, Users, CalendarDays, ClipboardCheck, Package, Truck, Loader2, AlertTriangle, TrendingUp } from "lucide-react";
import { AnalyticCard, Timeframe } from "@/components/admin/AnalyticCard";
import { AnalyticChart } from "@/components/admin/AnalyticChart"; 
import { authFetcher } from "@/store/adminStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
    const { data, isLoading } = useSWR("/api/admin/dashboard", authFetcher);
    
    const [revenueTimeframe, setRevenueTimeframe] = useState<Timeframe>("weekly");
    const [ordersTimeframe, setOrdersTimeframe] = useState<Timeframe>("weekly");

    if (isLoading || !data?.data) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4a439a]" />
                    <p className="font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const { overview, recentStats, ordersByStatus, lowStockProducts, topSellingProducts, chartData } = data.data;

    const getRevenueValue = () => {
        switch (revenueTimeframe) {
            case "today": return recentStats.revenueToday;
            case "weekly": return recentStats.revenueThisWeek;
            case "monthly": return recentStats.revenueThisMonth;
            case "total": return overview.totalRevenue;
            default: return 0;
        }
    };

    const getOrdersValue = () => {
        switch (ordersTimeframe) {
            case "today": return recentStats.ordersToday;
            case "weekly": return recentStats.ordersThisWeek;
            case "monthly": return recentStats.ordersThisMonth;
            case "total": return overview.totalOrders;
            default: return 0;
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full space-y-6 pb-10">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
            </div>

            {/* TOP ROW: Stats & Order Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AnalyticCard title="Total Revenue" icon={<Sprout size={20} />} val={formatCurrency(getRevenueValue())} timeframe={revenueTimeframe} onTimeframeChange={setRevenueTimeframe} iconBgClass="bg-[#463996]" iconColorClass="text-white" />
                    <AnalyticCard title="Total Orders" icon={<ShoppingCart size={20} />} val={getOrdersValue()} timeframe={ordersTimeframe} onTimeframeChange={setOrdersTimeframe} iconBgClass="bg-[#4ccd83]" iconColorClass="text-white" />
                    <AnalyticCard title="Total Customers" icon={<Users size={20} />} val={overview.totalCustomers} showTimeframe={false} iconBgClass="bg-[#f6bb07]" iconColorClass="text-white" />
                    <AnalyticCard title="Total Products" icon={<ShoppingBasket size={20} />} val={overview.totalProducts} showTimeframe={false} iconBgClass="bg-[#0a74f5]" iconColorClass="text-white" />
                </div>

                {/* Order Summary Block */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 leading-tight">Order</h1>
                            <h1 className="text-2xl font-bold text-slate-800 leading-tight">Summary</h1>
                        </div>
                        <div className="bg-slate-50 rounded-full p-3 border border-slate-100">
                            <CalendarDays className="text-slate-500" size={24} />
                        </div>
                    </div>
                    
                    <div className="space-y-3 flex-1 flex flex-col justify-end">
                        <div className="border border-slate-100 rounded-xl p-3 flex items-center gap-4 transition-colors hover:bg-slate-50">
                            <div className="bg-[#F5F4FC] rounded-xl p-3"><ClipboardCheck className="text-2xl text-[#55516E]" /></div>
                            <div><p className="text-sm font-medium text-slate-500">Pending</p><h1 className="text-xl font-bold text-slate-800">{ordersByStatus.PENDING || 0}</h1></div>
                        </div>
                        <div className="border border-slate-100 rounded-xl p-3 flex items-center gap-4 transition-colors hover:bg-slate-50">
                            <div className="bg-[#DFF9EC] rounded-xl p-3"><Package className="text-2xl text-[#6aa78f]" /></div>
                            <div><p className="text-sm font-medium text-slate-500">Processing</p><h1 className="text-xl font-bold text-slate-800">{ordersByStatus.PROCESSING || 0}</h1></div>
                        </div>
                        <div className="border border-slate-100 rounded-xl p-3 flex items-center gap-4 transition-colors hover:bg-slate-50">
                            <div className="bg-[#FBF6EB] rounded-xl p-3"><Truck className="text-2xl text-[#E5C863]" /></div>
                            <div><p className="text-sm font-medium text-slate-500">Shipped</p><h1 className="text-xl font-bold text-slate-800">{ordersByStatus.SHIPPED || 0}</h1></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW: Dynamic Graph & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* 📈 Dynamic Area Chart (Takes up 2 columns) */}
                <div className="lg:col-span-2 flex flex-col min-h-[400px]">
                    <AnalyticChart chartData={chartData} />
                </div>

                {/* Low Stock & Top Selling Lists */}
                <div className="space-y-6 flex flex-col">
                    <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden flex-1">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500"/> Top Selling Products
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {topSellingProducts.length === 0 ? (
                                    <p className="p-6 text-sm text-slate-500 text-center">No sales data yet.</p>
                                ) : (
                                    topSellingProducts.map((prod: any, index: number) => (
                                        <div key={prod.id} className="p-4 flex items-center gap-3 hover:bg-slate-50">
                                            <div className="w-6 text-center font-bold text-slate-400">#{index + 1}</div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800 line-clamp-1 text-sm">{prod.title}</p>
                                                <p className="text-xs text-emerald-600 font-semibold">{prod.totalSold} sold</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-rose-100 shadow-sm rounded-2xl bg-white overflow-hidden flex-1">
                        <CardHeader className="bg-rose-50/50 border-b border-rose-100 py-4 px-6">
                            <CardTitle className="text-base font-semibold text-rose-800 flex items-center gap-2">
                                <AlertTriangle size={18} /> Low Stock Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {lowStockProducts.length === 0 ? (
                                    <p className="p-6 text-sm text-slate-500 text-center">All product stocks are healthy!</p>
                                ) : (
                                    lowStockProducts.map((prod: any) => (
                                        <div key={prod.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                            <div>
                                                <p className="font-medium text-slate-800 line-clamp-1 text-sm">{prod.title}</p>
                                                <p className="text-xs text-slate-500 font-mono">SKU: {prod.sku}</p>
                                            </div>
                                            <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">
                                                {prod.stockQuantity} Left
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}