"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { authFetcher } from "@/store/adminStore";
import api from "@/app/lib/axios";

export function CategoryModal({ isOpen, onClose, category, onSuccess }: any) {
    const { data: categoriesData } = useSWR("/api/admin/categories", authFetcher);
    const allCategories = categoriesData?.data?.categories || [];

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentId, setParentId] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState("0");
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    useEffect(() => {
        if (category && isOpen) {
            setName(category.name || "");
            setDescription(category.description || "");
            setParentId(category.parentId || "");
            setIsActive(category.isActive ?? true);
            setSortOrder(category.sortOrder?.toString() || "0");
            setExistingImage(category.image || null);
            setImageFile(null);
            setError("");
        } else if (isOpen) {
            setName(""); setDescription(""); setParentId(""); 
            setIsActive(true); setSortOrder("0");
            setExistingImage(null); setImageFile(null); setError("");
        }
    }, [category, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            if (parentId) formData.append("parentId", parentId);
            formData.append("isActive", isActive.toString());
            formData.append("sortOrder", sortOrder);
            
            if (imageFile) formData.append("image", imageFile);

            const url = category ? `/api/admin/categories/${category.id}` : "/api/admin/categories";

            const method = category ? "put" : "post";

            const res = await api[method](url, formData);

            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to save category");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-slate-50 flex flex-col p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="px-6 py-5 bg-white border-b border-slate-200 flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold text-slate-800">
                        {category ? "Edit Category" : "Add New Category"}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 max-h-[300px] md:max-h-[500px] overflow-y-auto px-6 py-6">
                    <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">{error}</div>}

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <div><label className="text-sm font-medium text-slate-700">Category Name *</label><Input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Laptops" /></div>
                            
                            <div>
                                <label className="text-sm font-medium text-slate-700">Parent Category (Optional)</label>
                                <select value={parentId} onChange={e=>setParentId(e.target.value)} className="w-full border border-slate-200 bg-white rounded-md px-3 h-10 mt-1 focus:ring-2 focus:ring-[#4a439a]/20 outline-none">
                                    <option value="">None (Top Level Category)</option>
                                    {allCategories
                                        .filter((c: any) => c.id !== category?.id) 
                                        .map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)
                                    }
                                </select>
                            </div>

                            <div><label className="text-sm font-medium text-slate-700">Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded-md p-3 text-sm min-h-[100px] border-slate-200 focus:ring-2 focus:ring-[#4a439a]/20 outline-none"/></div>
                            
                            <div className="flex gap-6">
                                <div className="flex-1"><label className="text-sm font-medium text-slate-700">Sort Order</label><Input type="number" value={sortOrder} onChange={e=>setSortOrder(e.target.value)} placeholder="0" /></div>
                                <div className="flex flex-col justify-center pt-5">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer font-medium text-slate-700">
                                        <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} className="w-4 h-4 rounded text-[#4a439a]"/> Active
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="font-semibold text-slate-800 text-lg">Category Image</h3>
                            <div className="flex items-center gap-4">
                                {(imageFile || existingImage) ? (
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                        <img src={imageFile ? URL.createObjectURL(imageFile) : existingImage!} className="w-full h-full object-cover" alt="Category" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-xl md:bg-slate-100 md:border border-slate-200 flex items-center justify-center"><ImageIcon className="text-slate-400"/></div>
                                )}
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ebe9f1] file:text-[#5c4da5]" />
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="px-6 py-4 bg-white border-t border-slate-200 flex-shrink-0">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button form="categoryForm" type="submit" disabled={isLoading} className="bg-[#4a439a] hover:bg-[#3e3685] text-white transition-colors">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Category
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}