"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Download, Search, Mail, Phone, Calendar, BadgeCheck, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductMetricCard } from "@/components/admin/ProductMetricCard";
import { authFetcher } from "@/store/adminStore";

export default function CustomersPage() {
    // State
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [verifiedFilter, setVerifiedFilter] = useState("all");
    const [sortFilter, setSortFilter] = useState("newest");

    // Reset pagination when filters change
    useEffect(() => { setPage(1); }, [search, verifiedFilter, sortFilter, limit]);

    // Build SWR Query URL
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortFilter,
        ...(search && { search }),
        ...(verifiedFilter !== "all" && { verified: verifiedFilter === "verified" ? "true" : "false" }),
    }).toString();

    // Fetch Data
    const { data, isLoading } = useSWR(`/api/admin/users?${query}`, authFetcher);
    
    // Extract Data
    const users = data?.data?.users || [];
    const pagination = data?.data?.pagination || { totalPages: 1, total: 0 };
    const metrics = data?.data?.metrics || { totalCustomers: 0, verifiedCustomers: 0, unverifiedCustomers: 0 };

    // Helpers
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getInitials = (name: string) => {
        if (!name) return "US";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Customers</h1>
                        
                        <div className="relative w-full sm:max-w-md mt-2 sm:mt-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 rounded-full border-slate-200 bg-white focus:ring-[#4a439a]/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="bg-[#ebe9f1] text-[#5c4da5] px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#e2dcf0] transition-colors font-medium flex-1 md:flex-none shadow-sm">
                            <Download size={20} /> 
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
                <ProductMetricCard 
                    title="Total Customers" 
                    value={metrics.totalCustomers} 
                    percent={100} isUp={true} data={[5, 10, 15, 20, Math.max(5, metrics.totalCustomers)]} 
                />
                <ProductMetricCard 
                    title="Verified Accounts" 
                    value={metrics.verifiedCustomers} 
                    percent={metrics.totalCustomers > 0 ? Math.round((metrics.verifiedCustomers / metrics.totalCustomers) * 100) : 0} 
                    isUp={true} data={[2, 4, 8, 12, Math.max(2, metrics.verifiedCustomers)]} 
                />
                <ProductMetricCard 
                    title="Pending Verification" 
                    value={metrics.unverifiedCustomers} 
                    percent={metrics.totalCustomers > 0 ? Math.round((metrics.unverifiedCustomers / metrics.totalCustomers) * 100) : 0} 
                    isUp={false} data={[10, 8, 6, 4, Math.max(1, metrics.unverifiedCustomers)]} 
                />
            </div>

            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {/* FILTERS & LIMIT */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 border-b border-slate-100 gap-4 bg-slate-50/50">
                        <p className="text-xl font-semibold text-slate-800">Customer Directory</p>
                        
                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            <select value={sortFilter} onChange={(e) => setSortFilter(e.target.value)} className="flex-1 md:flex-none border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-sm">
                                <option value="newest">Sort: Newest First</option>
                                <option value="orders">Sort: Most Orders</option>
                                <option value="alphabetical">Sort: A-Z</option>
                            </select>

                            <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} className="flex-1 md:flex-none border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-sm">
                                <option value="all">All Statuses</option>
                                <option value="verified">Verified Only</option>
                                <option value="unverified">Unverified Only</option>
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
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Total Orders</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-500 font-medium"><Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-[#4a439a]"/> Loading customers...</TableCell></TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-500 font-medium">No customers found.</TableCell></TableRow>
                                ) : (
                                    users.map((user: any) => (
                                        <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            
                                            {/* Name & Avatar */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#4a439a] to-[#7b74c4] text-white font-semibold text-sm shadow-sm shrink-0">
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{user.name || "Unknown User"}</p>
                                                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {user.id.substring(user.id.length - 6)}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Contact Info */}
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail size={14} className="text-slate-400" />
                                                        {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Phone size={14} className="text-slate-400" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Joined Date */}
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </TableCell>

                                            {/* Orders */}
                                            <TableCell>
                                                <span className={`font-semibold px-2.5 py-1 rounded-lg text-xs ${user._count.orders > 0 ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-slate-100 text-slate-600"}`}>
                                                    {user._count.orders} Orders
                                                </span>
                                            </TableCell>

                                            {/* Total Spent */}
                                            <TableCell>
                                                <span className="font-semibold text-slate-800">
                                                    {user.totalSpent > 0 ? formatCurrency(user.totalSpent) : "—"}
                                                </span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                {user.emailVerified ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md w-max border border-emerald-100 text-xs font-semibold">
                                                        <BadgeCheck size={14} /> Verified
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md w-max border border-rose-100 text-xs font-semibold">
                                                        <XCircle size={14} /> Unverified
                                                    </div>
                                                )}
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
                            <span className="hidden sm:inline"> ({pagination.total} total customers)</span>
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
        </div>
    );
}