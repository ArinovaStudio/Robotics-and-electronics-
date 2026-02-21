"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, DownloadCloud } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "orders" | "products" | "customers";
}

export function ExportModal({ isOpen, onClose, type }: ExportModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    // Type-specific filter states
    const [status, setStatus] = useState("all"); // Orders
    const [availability, setAvailability] = useState("all"); // Products
    const [isVerified, setIsVerified] = useState("all"); // Customers

    useEffect(() => {
        if (isOpen) {
            setStartDate("");
            setEndDate("");
            setStatus("all");
            setAvailability("all");
            setIsVerified("all");
            setError("");
        }
    }, [isOpen]);

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Build query parameters
            const params = new URLSearchParams({ type });
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            
            if (type === "orders" && status !== "all") params.append("status", status);
            if (type === "products" && availability !== "all") params.append("availability", availability);
            if (type === "customers" && isVerified !== "all") params.append("isVerified", isVerified);

            // Fetch the CSV file securely using your token
            const token = useAdminStore.getState().token;
            const response = await fetch(`/api/admin/export?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to generate export");
            }

            const blob = await response.blob();
            
            const disposition = response.headers.get('Content-Disposition');
            let filename = `${type}-export.csv`;
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const matches = /filename="([^"]*)"/.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1];
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            onClose(); 
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl">
                <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
                    <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <DownloadCloud className="text-[#5c4da5]" /> 
                        Export {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DialogTitle>
                </DialogHeader>
                
                <form id="exportForm" onSubmit={handleExport} className="space-y-5">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">{error}</div>}

                    <p className="text-sm text-slate-500">
                        Leave dates empty to export all records, or select a range to filter.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Start Date</label>
                            <Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">End Date</label>
                            <Input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="mt-1" />
                        </div>
                    </div>

                    {type === "orders" && (
                        <div>
                            <label className="text-sm font-medium text-slate-700">Order Status</label>
                            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 h-10 mt-1 outline-none text-sm">
                                <option value="all">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    )}

                    {type === "products" && (
                        <div>
                            <label className="text-sm font-medium text-slate-700">Stock Availability</label>
                            <select value={availability} onChange={e=>setAvailability(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 h-10 mt-1 outline-none text-sm">
                                <option value="all">All Inventory</option>
                                <option value="IN_STOCK">In Stock</option>
                                <option value="OUT_OF_STOCK">Out of Stock</option>
                                <option value="PREORDER">Pre-order</option>
                            </select>
                        </div>
                    )}

                    {type === "customers" && (
                        <div>
                            <label className="text-sm font-medium text-slate-700">Verification Status</label>
                            <select value={isVerified} onChange={e=>setIsVerified(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 h-10 mt-1 outline-none text-sm">
                                <option value="all">All Customers</option>
                                <option value="verified">Verified Only</option>
                                <option value="unverified">Unverified Only</option>
                            </select>
                        </div>
                    )}
                </form>

                <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-5 mt-2">
                    <Button type="button" className="mr-2" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button form="exportForm" type="submit" disabled={isLoading} className="bg-[#5c4da5] hover:bg-[#4a3e85] text-white">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Download CSV
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}