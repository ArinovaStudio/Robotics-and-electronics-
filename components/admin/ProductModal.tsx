"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Image as ImageIcon, X } from "lucide-react";
import { authFetcher } from "@/store/adminStore";
import api from "@/app/lib/axios"; 

export function ProductModal({ isOpen, onClose, product, onSuccess }: any) {
    const { data: categoriesData } = useSWR("/api/admin/categories", authFetcher);
    const categories = categoriesData?.data.categories || [];

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Basic & Classifications
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [sku, setSku] = useState("");
    const [brand, setBrand] = useState("");
    const [mpn, setMpn] = useState("");
    const [customLabel0, setCustomLabel0] = useState("");
    const [customLabel1, setCustomLabel1] = useState("");
    
    // Status
    const [availability, setAvailability] = useState("IN_STOCK");
    const [condition, setCondition] = useState("NEW");
    const [isActive, setIsActive] = useState(true);
    const [isBundle, setIsBundle] = useState(false);
    const [stockQuantity, setStockQuantity] = useState("0");
    
    // Pricing
    const [price, setPrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [saleStart, setSaleStart] = useState("");
    const [saleEnd, setSaleEnd] = useState("");
    
    // Arrays
    const [highlights, setHighlights] = useState<string[]>([]);
    const [details, setDetails] = useState<{sectionName:string, attributeName:string, attributeValue:string}[]>([]);
    
    // Media
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingPrimary, setExistingPrimary] = useState<string | null>(null);
    
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
    const [existingAdditional, setExistingAdditional] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    useEffect(() => {
        if (product && isOpen) {
            setTitle(product.title || "");
            setLink(product.link || "");
            setDescription(product.description || "");
            setCategoryId(product.category?.id || product.categoryId || "");
            setSku(product.sku || "");
            setBrand(product.brand || "");
            setMpn(product.mpn || "");
            setCustomLabel0(product.customLabel0 || "");
            setCustomLabel1(product.customLabel1 || "");
            setAvailability(product.availability || "IN_STOCK");
            setCondition(product.condition || "NEW");
            setIsActive(product.isActive ?? true);
            setIsBundle(product.isBundle ?? false);
            setStockQuantity(product.stockQuantity?.toString() || "0");
            setPrice(product.price?.value?.toString() || "");
            setSalePrice(product.salePrice?.value?.toString() || "");
            
            if (product.salePriceEffectiveDate) {
                setSaleStart(product.salePriceEffectiveDate.startDate ? new Date(product.salePriceEffectiveDate.startDate).toISOString().slice(0, 16) : "");
                setSaleEnd(product.salePriceEffectiveDate.endDate ? new Date(product.salePriceEffectiveDate.endDate).toISOString().slice(0, 16) : "");
            } else {
                setSaleStart(""); setSaleEnd("");
            }

            setHighlights(product.productHighlights || []);
            setDetails(product.productDetails || []);
            
            setExistingPrimary(product.imageLink || null);
            setExistingAdditional(product.additionalImageLinks || []);
            setImageFile(null);
            setAdditionalFiles([]);
            setImagesToDelete([]);
            setError("");
        } else if (isOpen) {
            setTitle(""); setLink(""); setDescription(""); setCategoryId(""); setSku("");
            setBrand(""); setMpn(""); setCustomLabel0(""); setCustomLabel1(""); 
            setAvailability("IN_STOCK"); setCondition("NEW"); setIsActive(true); setIsBundle(false); setStockQuantity("0");
            setPrice(""); setSalePrice(""); setSaleStart(""); setSaleEnd("");
            setHighlights([]); setDetails([]);
            setExistingPrimary(null); setExistingAdditional([]); setImageFile(null); setAdditionalFiles([]); setImagesToDelete([]); setError("");
        }
    }, [product, isOpen]);

    const handleRemoveExistingAdditional = (url: string) => {
        setImagesToDelete([...imagesToDelete, url]);
    };

    const handleRemoveNewAdditional = (index: number) => {
        setAdditionalFiles(additionalFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("title", title);
            if (link) formData.append("link", link);
            formData.append("description", description);
            formData.append("categoryId", categoryId);
            formData.append("sku", sku);
            if (brand) formData.append("brand", brand);
            if (mpn) formData.append("mpn", mpn);
            if (customLabel0) formData.append("customLabel0", customLabel0);
            if (customLabel1) formData.append("customLabel1", customLabel1);
            
            formData.append("availability", availability);
            formData.append("condition", condition);
            formData.append("isActive", isActive.toString());
            formData.append("isBundle", isBundle.toString());
            formData.append("stockQuantity", stockQuantity);
            
            // JSON Fields
            formData.append("price", JSON.stringify({ value: parseFloat(price), currency: "INR" }));
            if (salePrice) {
                formData.append("salePrice", JSON.stringify({ value: parseFloat(salePrice), currency: "INR" }));
                if (saleStart || saleEnd) {
                    formData.append("salePriceEffectiveDate", JSON.stringify({
                        startDate: saleStart ? new Date(saleStart).toISOString() : undefined,
                        endDate: saleEnd ? new Date(saleEnd).toISOString() : undefined
                    }));
                }
            }
            
            formData.append("productHighlights", JSON.stringify(highlights.filter(h => h.trim() !== "")));
            formData.append("productDetails", JSON.stringify(details.filter(d => d.attributeName.trim() !== "")));
            formData.append("imagesToDelete", JSON.stringify(imagesToDelete));

            // Files
            if (imageFile) formData.append("image", imageFile);
            additionalFiles.forEach(file => formData.append("additionalImages", file));

            const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
            
            let res;
            if (product) {
                res = await api.patch(url, formData);
            } else {
                res = await api.post(url, formData);
            }

            const data = res.data;

            if (!data.success) {
                throw new Error(data.message || "Failed to save product");
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
            <DialogContent className="sm:max-w-6xl w-full bg-slate-50 h-[95vh] sm:h-[90vh] flex flex-col p-0 overflow-hidden rounded-t-xl sm:rounded-xl">
                <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 bg-white border-b border-slate-200 flex-shrink-0">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-800">
                        {product ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                    <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* LEFT COLUMN: Main Info */}
                            <div className="lg:col-span-2 space-y-6">
                                
                                {/* Basic Information */}
                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                                    <h3 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Basic Information</h3>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
                                        <Input required value={title} onChange={e=>setTitle(e.target.value)} className="focus-visible:ring-[#4a439a]" placeholder="Enter product title" />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Product URL Slug <span className="text-slate-400 font-normal">(Auto-generated if empty)</span></label>
                                        <Input value={link} onChange={e=>setLink(e.target.value)} placeholder="e.g. wireless-mouse-100" className="focus-visible:ring-[#4a439a]" />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
                                        <textarea required value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded-md p-3 text-sm min-h-[120px] border-slate-200 focus:ring-2 focus:ring-[#4a439a]/20 focus:border-[#4a439a] outline-none transition-all resize-y" placeholder="Describe the product..." />
                                    </div>
                                </div>

                                {/* Media */}
                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                                    <h3 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Media</h3>
                                    
                                    {/* Primary Image */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Primary Image <span className="text-slate-400 font-normal">{product ? "(Upload to replace)" : "*"}</span></label>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            {(imageFile || existingPrimary) ? (
                                                <div className="relative w-24 h-24 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                                    <img src={imageFile ? URL.createObjectURL(imageFile) : existingPrimary!} className="w-full h-full object-cover" alt="Primary" />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                                                    <ImageIcon className="text-slate-300 w-8 h-8"/>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="flex-1 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4a439a]/10 file:text-[#4a439a] hover:file:bg-[#4a439a]/20 cursor-pointer" />
                                        </div>
                                    </div>

                                    <hr className="border-slate-100" />

                                    {/* Additional Images */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-slate-700">Additional Gallery Images</label>
                                        <input type="file" multiple accept="image/*" onChange={e => setAdditionalFiles([...additionalFiles, ...Array.from(e.target.files || [])])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                                        
                                        <div className="flex flex-wrap gap-3 mt-4">
                                            {existingAdditional.filter(img => !imagesToDelete.includes(img)).map((img, i) => (
                                                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                                                    <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                                                    <button type="button" onClick={() => handleRemoveExistingAdditional(img)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X size={12}/></button>
                                                </div>
                                            ))}
                                            {additionalFiles.map((file, i) => (
                                                <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-200 shadow-sm group">
                                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="New Gallery" />
                                                    <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-br-md font-semibold tracking-wider">NEW</div>
                                                    <button type="button" onClick={() => handleRemoveNewAdditional(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X size={12}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Details & Highlights */}
                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
                                        <h3 className="font-semibold text-slate-800 text-lg">Details & Highlights</h3>
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                            <Button className="flex-1 sm:flex-none" type="button" size="sm" variant="outline" onClick={() => setHighlights([...highlights, ""])}><Plus size={14} className="mr-1"/> Highlight</Button>
                                            <Button className="flex-1 sm:flex-none" type="button" size="sm" variant="outline" onClick={() => setDetails([...details, {sectionName:"", attributeName:"", attributeValue:""}])}><Plus size={14} className="mr-1"/> Detail</Button>
                                        </div>
                                    </div>
                                    
                                    {/* Highlights mapping */}
                                    {highlights.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Highlights</label>
                                            {highlights.map((h, i) => (
                                                <div key={`h-${i}`} className="flex items-center gap-2">
                                                    <Input placeholder="E.g. 10hr Battery Life" value={h} onChange={e => { const newH = [...highlights]; newH[i] = e.target.value; setHighlights(newH); }} className="focus-visible:ring-[#4a439a]" />
                                                    <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0" onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}><Trash2 size={16}/></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Details mapping */}
                                    {details.length > 0 && (
                                        <div className="space-y-3 mt-4">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Technical Details</label>
                                            {details.map((d, i) => (
                                                <div key={`d-${i}`} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 sm:p-2 rounded-xl border border-slate-100 relative">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                                        <Input placeholder="Section (e.g. Dimensions)" value={d.sectionName} onChange={e => { const newD = [...details]; newD[i].sectionName = e.target.value; setDetails(newD); }} className="bg-white focus-visible:ring-[#4a439a]" />
                                                        <Input placeholder="Attribute (e.g. Weight)" value={d.attributeName} onChange={e => { const newD = [...details]; newD[i].attributeName = e.target.value; setDetails(newD); }} className="bg-white focus-visible:ring-[#4a439a]" />
                                                        <Input placeholder="Value (e.g. 200g)" value={d.attributeValue} onChange={e => { const newD = [...details]; newD[i].attributeValue = e.target.value; setDetails(newD); }} className="bg-white focus-visible:ring-[#4a439a]" />
                                                    </div>
                                                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 sm:static text-red-500 hover:text-red-600 hover:bg-red-100 sm:hover:bg-transparent shrink-0" onClick={() => setDetails(details.filter((_, idx) => idx !== i))}><Trash2 size={16}/></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Pricing & Settings */}
                            <div className="space-y-6">
                                {/* Status */}
                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Status</h3>
                                    
                                    <div className="flex gap-6 mb-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer font-medium text-slate-700">
                                            <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} className="w-4 h-4 rounded text-[#4a439a] focus:ring-[#4a439a] border-slate-300"/> Active
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer font-medium text-slate-700">
                                            <input type="checkbox" checked={isBundle} onChange={e=>setIsBundle(e.target.checked)} className="w-4 h-4 rounded text-[#4a439a] focus:ring-[#4a439a] border-slate-300"/> Bundle
                                        </label>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
                                        <select required value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full border border-slate-200 bg-white rounded-md px-3 h-10 text-sm focus:ring-2 focus:ring-[#4a439a]/20 focus:border-[#4a439a] outline-none transition-all appearance-none">
                                            <option value="" disabled>Select Category</option>
                                            {categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Stock Qty <span className="text-red-500">*</span></label>
                                            <Input required type="number" value={stockQuantity} onChange={e=>setStockQuantity(e.target.value)} className="focus-visible:ring-[#4a439a]"/>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Availability</label>
                                            <select value={availability} onChange={e=>setAvailability(e.target.value)} className="w-full border border-slate-200 bg-white rounded-md px-3 h-10 text-sm focus:ring-2 focus:ring-[#4a439a]/20 focus:border-[#4a439a] outline-none transition-all appearance-none">
                                                <option value="IN_STOCK">In Stock</option>
                                                <option value="OUT_OF_STOCK">Out of Stock</option>
                                                <option value="PREORDER">Preorder</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Condition</label>
                                        <select value={condition} onChange={e=>setCondition(e.target.value)} className="w-full border border-slate-200 bg-white rounded-md px-3 h-10 text-sm focus:ring-2 focus:ring-[#4a439a]/20 focus:border-[#4a439a] outline-none transition-all appearance-none">
                                            <option value="NEW">New</option>
                                            <option value="REFURBISHED">Refurbished</option>
                                            <option value="USED">Used</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Pricing</h3>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Regular Price (₹) <span className="text-red-500">*</span></label>
                                        <Input required type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="focus-visible:ring-[#4a439a] text-lg font-medium"/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Sale Price (₹)</label>
                                        <Input type="number" step="0.01" value={salePrice} onChange={e=>setSalePrice(e.target.value)} className="focus-visible:ring-[#4a439a]"/>
                                    </div>
                                    
                                    {salePrice && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sale Start</label>
                                                <Input type="datetime-local" value={saleStart} onChange={e=>setSaleStart(e.target.value)} className="h-9 text-xs focus-visible:ring-[#4a439a] bg-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sale End</label>
                                                <Input type="datetime-local" value={saleEnd} onChange={e=>setSaleEnd(e.target.value)} className="h-9 text-xs focus-visible:ring-[#4a439a] bg-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Identifiers */}
                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Identifiers</h3>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">SKU <span className="text-red-500">*</span></label>
                                        <Input required value={sku} onChange={e=>setSku(e.target.value)} className="uppercase focus-visible:ring-[#4a439a] font-mono text-sm"/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Brand</label>
                                            <Input value={brand} onChange={e=>setBrand(e.target.value)} className="focus-visible:ring-[#4a439a]"/>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">MPN</label>
                                            <Input value={mpn} onChange={e=>setMpn(e.target.value)} className="focus-visible:ring-[#4a439a]" placeholder="Mfg Part No."/>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Custom Label 0</label>
                                            <Input value={customLabel0} onChange={e=>setCustomLabel0(e.target.value)} placeholder="e.g. Trending" className="focus-visible:ring-[#4a439a]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Custom Label 1</label>
                                            <Input value={customLabel1} onChange={e=>setCustomLabel1(e.target.value)} placeholder="e.g. Summer Sale" className="focus-visible:ring-[#4a439a]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="px-4 sm:px-6 py-4 bg-white border-t border-slate-200 flex-shrink-0 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                    <Button className="w-full mr-2 sm:w-auto" type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button form="productForm" type="submit" disabled={isLoading} className="w-full sm:w-auto bg-[#4a439a] hover:bg-[#3e3685] text-white transition-colors">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                        {isLoading ? "Saving..." : "Save Product"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}