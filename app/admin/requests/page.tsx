"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Phone, Calendar, Package, Loader2, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductMetricCard } from "@/components/admin/ProductMetricCard";

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-100",
    APPROVED: "bg-blue-50 text-blue-700 border border-blue-100",
    AVAILABLE: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    REJECTED: "bg-rose-50 text-rose-700 border border-rose-100",
};

type EditForm = { status: string; adminNotes: string };

export default function RequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1 });
    const limit = 10;

    const [editTarget, setEditTarget] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<EditForm>({ status: "", adminNotes: "" });
    const [editLoading, setEditLoading] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        async function fetchRequests() {
            setLoading(true);
            try {
                const params = new URLSearchParams({ page: String(page), limit: String(limit) });
                if (debouncedSearch) params.set("search", debouncedSearch);
                if (statusFilter) params.set("status", statusFilter);
                const res = await fetch(`/api/admin/requests?${params}`);
                const data = await res.json();
                if (data.success) {
                    setRequests(data.data);
                    setPagination(data.pagination);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchRequests();
    }, [page, debouncedSearch, statusFilter, refreshKey]);

    const totalPages = pagination.totalPages;

    const counts = {
        total: pagination.totalItems,
        pending: requests.filter((r) => r.status === "PENDING").length,
        approved: requests.filter((r) => r.status === "APPROVED" || r.status === "AVAILABLE").length,
        rejected: requests.filter((r) => r.status === "REJECTED").length,
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

    const getInitials = (name: string) =>
        (name || "U").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

    function openEdit(req: any) {
        setEditTarget(req);
        setEditForm({ status: req.status, adminNotes: req.adminNotes || "" });
    }

    async function handleUpdate() {
        if (!editTarget) return;
        setEditLoading(true);
        try {
            const res = await fetch(`/api/admin/requests/${editTarget.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (data.success) {
                setEditTarget(null);
                setRefreshKey(k => k + 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setEditLoading(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/admin/requests/${deleteTarget.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setDeleteTarget(null);
                setRefreshKey(k => k + 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <>
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
                    <ProductMetricCard title="Total Requests" value={counts.total} percent={100} isUp={true} data={[2, 4, 6, 8, counts.total]} />
                    <ProductMetricCard title="Pending" value={counts.pending} percent={counts.total > 0 ? Math.round((counts.pending / counts.total) * 100) : 0} isUp={false} data={[3, 5, 4, 6, counts.pending]} />
                    <ProductMetricCard title="Approved" value={counts.approved} percent={counts.total > 0 ? Math.round((counts.approved / counts.total) * 100) : 0} isUp={true} data={[1, 2, 3, 4, counts.approved]} />
                    <ProductMetricCard title="Rejected" value={counts.rejected} percent={counts.total > 0 ? Math.round((counts.rejected / counts.total) * 100) : 0} isUp={false} data={[1, 2, 1, 2, counts.rejected]} />
                </div>

                <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        {/* FILTERS */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 border-b border-slate-100 gap-4 bg-slate-50/50">
                            <p className="text-xl font-semibold text-slate-800">All Requests</p>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-sm"
                            >
                                <option value="">All Statuses</option>
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
                                        <TableHead>Actions</TableHead>
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
                                    ) : requests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                                                No requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        requests.map((req) => (
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

                                                {/* Actions */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openEdit(req)} className="p-1.5 rounded-md hover:bg-[#ebe9f1] text-[#4a439a] transition-colors">
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button onClick={() => setDeleteTarget(req)} className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500 transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
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
                                Showing page <span className="text-slate-800 font-bold">{page}</span> of <span className="text-slate-800 font-bold">{totalPages || 1}</span>
                                <span className="hidden sm:inline"> ({pagination.totalItems} total requests)</span>
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

            {/* EDIT MODAL */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Update Request</h2>
                        <p className="text-sm text-slate-500">Editing: <span className="font-semibold text-slate-700">{editTarget.name}</span></p>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Status</label>
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Admin Notes</label>
                            <textarea
                                rows={3}
                                value={editForm.adminNotes}
                                onChange={(e) => setEditForm(f => ({ ...f, adminNotes: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                                placeholder="Optional notes..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editLoading}>Cancel</Button>
                            <Button onClick={handleUpdate} disabled={editLoading} className="bg-[#4a439a] hover:bg-[#3b3580] text-white">
                                {editLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Delete Request</h2>
                        <p className="text-sm text-slate-500">Are you sure you want to delete the request for <span className="font-semibold text-slate-700">{deleteTarget.name}</span>? This cannot be undone.</p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</Button>
                            <Button onClick={handleDelete} disabled={deleteLoading} className="bg-rose-500 hover:bg-rose-600 text-white">
                                {deleteLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
