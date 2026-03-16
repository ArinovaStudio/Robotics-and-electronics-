"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Phone, Calendar, Package, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductMetricCard } from "@/components/admin/ProductMetricCard";

const STATUS_STYLES: Record<string, string> = {
    PENDING:   "bg-yellow-50 text-yellow-700 border border-yellow-100",
    APPROVED:  "bg-blue-50 text-blue-700 border border-blue-100",
    AVAILABLE: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    REJECTED:  "bg-rose-50 text-rose-700 border border-rose-100",
};

export default function RequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        async function fetchRequests() {
            try {
                const res = await fetch("/api/admin/requests");
                const data = await res.json();
                if (data.success) {
                    setRequests(data.data);
                    setFiltered(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchRequests();
    }, []);

    useEffect(() => {
        let result = requests;
        if (statusFilter !== "all") result = result.filter((r) => r.status === statusFilter);
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((r) =>
                r.name?.toLowerCase().includes(q) ||
                r.user?.name?.toLowerCase().includes(q) ||
                r.user?.email?.toLowerCase().includes(q) ||
                r.brand?.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
        setPage(1);
    }, [search, statusFilter, requests]);

    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    const counts = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "PENDING").length,
        approved: requests.filter((r) => r.status === "APPROVED" || r.status === "AVAILABLE").length,
        rejected: requests.filter((r) => r.status === "REJECTED").length,
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

    const getInitials = (name: string) =>
        (name || "U").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Product Requests</h1>
                        <div className="relative w-full sm:max-w-md mt-2 sm:mt-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Search by product, user or brand..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 rounded-full border-slate-200 bg-white focus:ring-[#4a439a]/20"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <ProductMetricCard title="Total Requests"  value={counts.total}    percent={100} isUp={true}  data={[2, 4, 6, 8, counts.total]} />
                <ProductMetricCard title="Pending"         value={counts.pending}  percent={counts.total > 0 ? Math.round((counts.pending / counts.total) * 100) : 0}  isUp={false} data={[3, 5, 4, 6, counts.pending]} />
                <ProductMetricCard title="Approved"        value={counts.approved} percent={counts.total > 0 ? Math.round((counts.approved / counts.total) * 100) : 0} isUp={true}  data={[1, 2, 3, 4, counts.approved]} />
                <ProductMetricCard title="Rejected"        value={counts.rejected} percent={counts.total > 0 ? Math.round((counts.rejected / counts.total) * 100) : 0} isUp={false} data={[1, 2, 1, 2, counts.rejected]} />
            </div>

            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {/* FILTERS */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 border-b border-slate-100 gap-4 bg-slate-50/50">
                        <p className="text-xl font-semibold text-slate-800">All Requests</p>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Requested By</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Admin Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                                            <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-[#4a439a]" />
                                            Loading requests...
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                                            No requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginated.map((req) => (
                                        <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors">

                                            {/* Product */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {req.image ? (
                                                        <img src={req.image} alt={req.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-[#ebe9f1] flex items-center justify-center">
                                                            <Package size={18} className="text-[#4a439a]" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-slate-800 max-w-[180px] truncate">{req.name}</p>
                                                        {req.productUrl && (
                                                            <a href={req.productUrl} target="_blank" rel="noreferrer" className="text-xs text-[#4a439a] flex items-center gap-1 hover:underline">
                                                                <ExternalLink size={10} /> View Link
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* User */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#4a439a] to-[#7b74c4] text-white font-semibold text-xs shrink-0">
                                                        {getInitials(req.user?.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{req.user?.name || "—"}</p>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Mail size={11} /> {req.user?.email}
                                                        </div>
                                                        {req.user?.phone && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                <Phone size={11} /> {req.user.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Brand */}
                                            <TableCell>
                                                <span className="text-sm text-slate-700 font-medium">{req.brand || "—"}</span>
                                            </TableCell>

                                            {/* Qty */}
                                            <TableCell>
                                                <span className="font-semibold text-slate-800">{req.quantity}</span>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <Calendar size={13} className="text-slate-400" />
                                                    {formatDate(req.createdAt)}
                                                </div>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${STATUS_STYLES[req.status] || STATUS_STYLES.PENDING}`}>
                                                    {req.status}
                                                </span>
                                            </TableCell>

                                            {/* Admin Notes */}
                                            <TableCell>
                                                <span className="text-xs text-slate-500 max-w-[150px] truncate block">
                                                    {req.adminNotes || "—"}
                                                </span>
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
                            Showing page <span className="text-slate-800 font-bold">{page}</span> of <span className="text-slate-800 font-bold">{totalPages || 1}</span>
                            <span className="hidden sm:inline"> ({filtered.length} total requests)</span>
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-medium" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                Previous
                            </Button>
                            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-medium" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
