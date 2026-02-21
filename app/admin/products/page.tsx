"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Download, Plus, Search, Pencil, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductMetricCard } from "@/components/admin/ProductMetricCard";
import { ProductModal } from "@/components/admin/ProductModal";
import { authFetcher } from "@/store/adminStore";
import api from "@/app/lib/axios";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ExportModal } from "@/components/admin/ExportModal";

export default function ProductPage() {
    // State
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [availabilityFilter, setAvailabilityFilter] = useState("all");
    const debouncedSearch = useDebounce(search, 500);

    // Modals State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [deletingProduct, setDeletingProduct] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, availabilityFilter, limit]);

    // Fetch API Data
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(availabilityFilter !== "all" && { availability: availabilityFilter }),
    }).toString();

    const { data, error, isLoading, mutate } = useSWR(`/api/admin/products?${query}`, authFetcher);
    
    // Extract data
    const products = data?.data?.products || [];
    const pagination = data?.data?.pagination || { totalPages: 1, total: 0 };
    const metrics = data?.data?.metrics || { totalProducts: 0, lowStockItems: 0, inventoryValue: 0 };

    // Handlers
    const handleDelete = async () => {
        if (!deletingProduct) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(`/api/admin/products/${deletingProduct.id}`);
            
            if (res.data.success) {
                mutate(); 
                setDeletingProduct(null);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to delete product";
            alert(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "IN_STOCK": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "OUT_OF_STOCK": return "bg-rose-100 text-rose-700 border-rose-200";
            case "PREORDER": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Products</h1>
                        
                        {/* SEARCH */}
                        <div className="relative w-full sm:max-w-md mt-2 sm:mt-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Search products, SKUs..."
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
                            <span className="font-medium">Add Product</span>
                        </button>
                        <button onClick={() => setIsExportModalOpen(true)} className="bg-[#ebe9f1] text-[#5c4da5] px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#e2dcf0] transition-colors font-medium flex-1 md:flex-none shadow-sm">
                            <Download size={20} /> 
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* REAL DYNAMIC METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
                <ProductMetricCard 
                    title="Total Products" 
                    value={metrics.totalProducts} 
                    percent={100} isUp={true} data={[10, 25, 22, 40, 28, Math.max(10, metrics.totalProducts)]} 
                />
                <ProductMetricCard 
                    title="Low Stock Items" 
                    value={metrics.lowStockItems} 
                    percent={metrics.totalProducts > 0 ? Math.round((metrics.lowStockItems / metrics.totalProducts) * 100) : 0} 
                    isUp={false} data={[2, 3, 5, 8, 10, Math.max(2, metrics.lowStockItems)]} 
                />
                <ProductMetricCard 
                    title="Inventory Value" 
                    value={formatCurrency(metrics.inventoryValue)} 
                    percent={15} isUp={true} data={[100, 140, 135, 180, 210, 250]} 
                />
            </div>

            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {/* FILTERS & LIMIT */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-slate-100 gap-4 bg-slate-50/50">
                        <p className="text-xl font-semibold text-slate-800">Inventory List</p>
                        
                        <div className="flex gap-3 w-full sm:w-auto">
                            <select
                                value={availabilityFilter}
                                onChange={(e) => setAvailabilityFilter(e.target.value)}
                                className="flex-1 sm:flex-none border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#4a439a]/20 font-medium"
                            >
                                <option value="all">All Statuses</option>
                                <option value="IN_STOCK">In Stock</option>
                                <option value="OUT_OF_STOCK">Out of Stock</option>
                                <option value="PREORDER">Pre-order</option>
                            </select>

                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="border border-slate-200 bg-white text-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#4a439a]/20 font-medium"
                            >
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
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Visibility</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-slate-500 font-medium"><Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-[#4a439a]"/> Loading inventory...</TableCell></TableRow>
                                ) : products.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-slate-500 font-medium">No products match your search.</TableCell></TableRow>
                                ) : (
                                    products.map((product: any) => (
                                        <TableRow key={product.id} className={`hover:bg-slate-50/50 transition-colors ${!product.isActive ? "opacity-60 bg-slate-50" : ""}`}>
                                            <TableCell>
                                                {product.imageLink ? (
                                                    <img src={product.imageLink} alt={product.title} className="w-11 h-11 rounded-lg object-cover border border-slate-200 shadow-sm" />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                                                        <ImageIcon size={18} className="text-slate-400" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-slate-800 line-clamp-1">{product.title}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{product.category?.name || "Uncategorized"}</div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-mono text-xs">{product.sku}</TableCell>
                                            <TableCell className="font-semibold text-slate-800">
                                                {product.price?.currency === "INR" ? "₹" : "$"}{product.price?.value.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`font-semibold px-2 py-1 rounded-md text-xs ${product.stockQuantity < 5 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"}`}>
                                                    {product.stockQuantity} in stock
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {product.isActive ? (
                                                     <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-slate-200 text-slate-500 bg-slate-50">Hidden</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(product.availability)} border shadow-sm`}>
                                                    {product.availability.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="icon" variant="ghost" className="text-slate-500 hover:text-[#4a439a] hover:bg-[#ebe9f1] rounded-lg"
                                                        onClick={() => setEditingProduct(product)}>
                                                        <Pencil size={18} />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                        onClick={() => setDeletingProduct(product)}>
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
                            Showing page <span className="text-slate-800 font-bold">{page}</span> of <span className="text-slate-800 font-bold">{pagination.totalPages || 1}</span> 
                            <span className="hidden sm:inline"> ({pagination.total} total products)</span>
                        </p>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" className="flex-1 sm:flex-none bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                                disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                Previous
                            </Button>
                            <Button variant="outline" className="flex-1 sm:flex-none bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                                disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <DeleteConfirmModal 
                isOpen={!!deletingProduct} 
                onClose={() => setDeletingProduct(null)}
                onConfirm={handleDelete}
                title={deletingProduct?.title || ""}
                itemName="Product"
                warningMessage="If this product has existing orders, it will be marked as inactive instead."
                isDeleting={isDeleting}
            />

            <ProductModal 
                isOpen={isAddModalOpen || !!editingProduct}
                onClose={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                product={editingProduct}
                onSuccess={() => mutate()}
            />

            <ExportModal 
                isOpen={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)} 
                type="products"
            />
        </div>
    );
}