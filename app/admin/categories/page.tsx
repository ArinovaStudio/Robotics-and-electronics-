"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Plus, Search, Pencil, Trash2, Image as FolderTree, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductMetricCard } from "@/components/admin/ProductMetricCard";
import { CategoryModal } from "@/components/admin/CategoryModal"; 
import { authFetcher } from "@/store/adminStore";
import api from "@/app/lib/axios";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

export default function CategoriesPage() {
    // State
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState("all");

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [deletingCategory, setDeletingCategory] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset pagination on filter change
    useEffect(() => { setPage(1); }, [search, statusFilter, limit]);

    // Build Server-Side Query URL
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
    }).toString();

    // SWR Data Fetching (Now handling pagination server-side)
    const { data, isLoading, mutate } = useSWR(`/api/admin/categories?${query}`, authFetcher);
    
    // Extract Data
    const categories = data?.data?.categories || [];
    const pagination = data?.data?.pagination || { totalPages: 1, total: 0 };
    const metrics = data?.data?.metrics || { totalCategories: 0, activeCategories: 0, emptyCategories: 0 };

    // Handlers
    const handleDelete = async () => {
        if (!deletingCategory) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(`/api/admin/categories/${deletingCategory.id}`);
            if (res.data.success) {
                mutate(); 
                setDeletingCategory(null);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete category");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Categories</h1>
                        
                        <div className="relative w-full sm:max-w-md mt-2 sm:mt-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Search categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 rounded-full border-slate-200 bg-white focus:ring-[#4a439a]/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#4a439a] text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 flex-1 md:flex-none cursor-pointer hover:bg-[#3e3685] transition-colors shadow-sm"
                        >
                            <Plus size={20} />
                            <span className="font-medium">Add Category</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* SERVER-SIDE METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
                <ProductMetricCard 
                    title="Total Categories" 
                    value={metrics.totalCategories} 
                    percent={100} isUp={true} data={[2, 4, 6, 8, Math.max(2, metrics.totalCategories)]} 
                />
                <ProductMetricCard 
                    title="Active Categories" 
                    value={metrics.activeCategories} 
                    percent={metrics.totalCategories > 0 ? Math.round((metrics.activeCategories / metrics.totalCategories) * 100) : 0} 
                    isUp={true} data={[1, 3, 5, 7, Math.max(1, metrics.activeCategories)]} 
                />
                <ProductMetricCard 
                    title="Empty Categories" 
                    value={metrics.emptyCategories} 
                    percent={metrics.totalCategories > 0 ? Math.round((metrics.emptyCategories / metrics.totalCategories) * 100) : 0} 
                    isUp={false} data={[5, 4, 3, 2, Math.max(1, metrics.emptyCategories)]} 
                />
            </div>

            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {/* FILTERS & LIMIT */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-slate-100 gap-4 bg-slate-50/50">
                        <p className="text-xl font-semibold text-slate-800">Category List</p>
                        
                        <div className="flex gap-3 w-full sm:w-auto">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex-1 sm:flex-none border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium">
                                <option value="all">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="hidden">Hidden Only</option>
                            </select>

                            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none font-medium">
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
                                    <TableHead className="w-16">Image</TableHead>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Parent Category</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Sub-categories</TableHead>
                                    <TableHead>Sort Order</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-slate-500 font-medium"><Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-[#4a439a]"/> Loading categories...</TableCell></TableRow>
                                ) : categories.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-slate-500 font-medium">No categories found.</TableCell></TableRow>
                                ) : (
                                    categories.map((cat: any) => (
                                        <TableRow key={cat.id} className={`hover:bg-slate-50/50 transition-colors ${!cat.isActive ? "opacity-60 bg-slate-50" : ""}`}>
                                            <TableCell>
                                                {cat.image ? (
                                                    <img src={cat.image} alt={cat.name} className="w-11 h-11 rounded-lg object-cover border border-slate-200 shadow-sm" />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                                                        <FolderTree size={18} className="text-slate-400" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-slate-800 line-clamp-1">{cat.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5 font-mono">{cat.slug}</div>
                                            </TableCell>
                                            <TableCell>
                                                {cat.parent ? (
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200">{cat.parent.name}</Badge>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`font-semibold px-2 py-1 rounded-md text-xs ${cat._count.products === 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-700"}`}>
                                                    {cat._count.products} items
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-medium">{cat._count.children}</TableCell>
                                            <TableCell className="text-slate-600 font-mono text-sm">{cat.sortOrder}</TableCell>
                                            <TableCell>
                                                {cat.isActive ? (
                                                     <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-slate-200 text-slate-500 bg-slate-50">Hidden</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="icon" variant="ghost" className="text-slate-500 hover:text-[#4a439a] hover:bg-[#ebe9f1] rounded-lg" onClick={() => setEditingCategory(cat)}>
                                                        <Pencil size={18} />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setDeletingCategory(cat)}>
                                                        <Trash2 size={18} />
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
                            <span className="hidden sm:inline"> ({pagination.total} total categories)</span>
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

            {/* Modals */}
            <DeleteConfirmModal 
                isOpen={!!deletingCategory} 
                onClose={() => setDeletingCategory(null)}
                onConfirm={handleDelete}
                title={deletingCategory?.name || ""}
                itemName="Category"
                warningMessage="Categories containing products or sub-categories cannot be deleted."
                isDeleting={isDeleting}
            />

            <CategoryModal 
                isOpen={isAddModalOpen || !!editingCategory}
                onClose={() => { setIsAddModalOpen(false); setEditingCategory(null); }}
                category={editingCategory}
                onSuccess={() => mutate()}
            />
        </div>
    );
}