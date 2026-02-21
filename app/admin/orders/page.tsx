"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Download, Search, Eye, Truck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleMetricCard } from "@/components/admin/SimpleMetricCard";
import { authFetcher } from "@/store/adminStore";
import { useRouter } from "next/navigation";
import { OrderStatusModal } from "@/components/admin/OrderStatusModal";
import { ExportModal } from "@/components/admin/ExportModal";

export default function OrdersPage() {
    const router = useRouter();

    // State
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState("");
    const [sortFilter, setSortFilter] = useState("newest");
    const debouncedSearch = useDebounce(search, 500);

    // Modal State
    const [updatingOrder, setUpdatingOrder] = useState<any>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, sortFilter, limit]);

    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortFilter,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
    }).toString();

    const { data, isLoading, mutate } = useSWR(`/api/admin/orders?${query}`, authFetcher);
    
    const orders = data?.data?.orders || [];
    const pagination = data?.data?.pagination || { totalPages: 1, total: 0 };
    
    const summary = data?.data?.summary || { 
        total: 0, 
        pending: 0, 
        confirmed: 0, 
        shipped: 0, 
        delivered: 0, 
        cancelled: 0 
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
            case "CONFIRMED": return "bg-sky-100 text-sky-700 border-sky-200";
            case "PROCESSING": return "bg-purple-100 text-purple-700 border-purple-200";
            case "SHIPPED": return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "DELIVERED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "CANCELLED": 
            case "REFUNDED": return "bg-rose-100 text-rose-700 border-rose-200";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Orders</h1>
                        
                        <div className="relative w-full sm:max-w-md mt-2 sm:mt-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Search order ID, customer, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 rounded-full border-slate-200 bg-white focus:ring-[#4a439a]/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button onClick={() => setIsExportModalOpen(true)} className="bg-[#ebe9f1] text-[#5c4da5] px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#e2dcf0] transition-colors font-medium flex-1 md:flex-none shadow-sm">
                            <Download size={20} /> 
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 w-full">
                <SimpleMetricCard title="Total Orders" value={summary.total} color="slate" />
                <SimpleMetricCard title="Pending" value={summary.pending} color="amber" />
                <SimpleMetricCard title="Confirmed" value={summary.confirmed} color="sky" />
                <SimpleMetricCard title="Shipped" value={summary.shipped} color="indigo" />
                <SimpleMetricCard title="Delivered" value={summary.delivered} color="emerald" />
                <SimpleMetricCard title="Cancelled" value={summary.cancelled} color="rose" />
            </div>

            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {/* FILTERS & LIMIT */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 border-b border-slate-100 gap-4 bg-slate-50/50">
                        <p className="text-xl font-semibold text-slate-800">Order History</p>
                        
                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            <select value={sortFilter} onChange={(e) => setSortFilter(e.target.value)} className="flex-1 md:flex-none border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-sm">
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount_high">Highest Amount</option>
                                <option value="amount_low">Lowest Amount</option>
                            </select>

                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex-1 md:flex-none border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-sm">
                                <option value="">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>

                            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-sm">
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-slate-500 font-medium"><Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-[#4a439a]"/> Loading orders...</TableCell></TableRow>
                                ) : orders.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-slate-500 font-medium">No orders found.</TableCell></TableRow>
                                ) : (
                                    orders.map((order: any) => (
                                        <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <span className="font-mono text-slate-800 font-semibold">{order.orderNumber}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-slate-800">{order.user.name}</div>
                                                <div className="text-xs text-slate-500">{order.user.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium text-slate-700">{formatDate(order.orderedAt)}</div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-medium">
                                                {order.itemCount} items
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-slate-800">{formatCurrency(order.totalAmount)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded border ${order.payment?.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {order.payment?.status || "UNPAID"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(order.status)} shadow-sm border`}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {/* View Order Details */}
                                                    <Button size="icon" variant="ghost" className="text-slate-500 hover:text-[#4a439a] hover:bg-[#ebe9f1] rounded-lg" 
                                                        onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                                        <Eye size={18} />
                                                    </Button>
                                                    {/* Update Status Modal */}
                                                    <Button size="icon" variant="ghost" className="text-slate-500 hover:text-[#4a439a] hover:bg-[#ebe9f1] rounded-lg" 
                                                        onClick={() => setUpdatingOrder(order)}
                                                        disabled={["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)}>
                                                        <Truck size={18} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 gap-4">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing page <span className="text-slate-800 font-bold">{page}</span> of <span className="text-slate-800 font-bold">{pagination.totalPages}</span> 
                            <span className="hidden sm:inline"> ({pagination.total} total orders)</span>
                        </p>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" className="flex-1 sm:flex-none bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-medium" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                Previous
                            </Button>
                            <Button variant="outline" className="flex-1 sm:flex-none bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-medium" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <OrderStatusModal 
                isOpen={!!updatingOrder}
                onClose={() => setUpdatingOrder(null)}
                order={updatingOrder}
                onSuccess={() => mutate()}
            />

            <ExportModal 
                isOpen={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)} 
                type="orders"
            />
        </div>
    );
}