"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import api from "@/app/lib/axios";

const VALID_TRANSITIONS: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
    REFUNDED: [],
};

export function OrderStatusModal({ isOpen, onClose, order, onSuccess }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [status, setStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [trackingUrl, setTrackingUrl] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (order && isOpen) {
            setStatus(""); 
            setTrackingNumber(order.trackingNumber || "");
            setTrackingUrl(order.trackingUrl || "");
            setNotes("");
            setError("");
        }
    }, [order, isOpen]);

    const allowedStatuses = order ? VALID_TRANSITIONS[order.status] || [] : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!status) {
            setError("Please select a new status");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const payload: any = { status, notes };
            if (status === "SHIPPED") {
                payload.trackingNumber = trackingNumber;
                payload.trackingUrl = trackingUrl;
            }

            const res = await api.patch(`/api/admin/orders/${order.id}`, payload);
            
            if (res.data.success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                throw new Error(res.data.message || "Failed to update order");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        Update Order: {order.orderNumber}
                    </DialogTitle>
                </DialogHeader>
                
                <form id="orderStatusForm" onSubmit={handleSubmit} className="space-y-5 py-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">{error}</div>}

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                        <p className="text-sm text-slate-500 mb-1">Current Status</p>
                        <p className="font-semibold text-slate-800">{order.status}</p>
                    </div>

                    {allowedStatuses.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">This order cannot be transitioned any further.</p>
                    ) : (
                        <>
                            <div>
                                <label className="text-sm font-medium text-slate-700">New Status *</label>
                                <select 
                                    value={status} 
                                    onChange={e=>setStatus(e.target.value)} 
                                    className="w-full border border-slate-200 rounded-lg px-3 h-10 mt-1 outline-none focus:ring-2 focus:ring-[#4a439a]/20 font-medium text-slate-700 bg-white"
                                >
                                    <option value="" disabled>Select next step...</option>
                                    {allowedStatuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {status === "SHIPPED" && (
                                <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Tracking Number</label>
                                        <Input value={trackingNumber} onChange={e=>setTrackingNumber(e.target.value)} placeholder="e.g. AW123456789" className="mt-1 bg-white" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Tracking URL</label>
                                        <Input value={trackingUrl} onChange={e=>setTrackingUrl(e.target.value)} placeholder="https://tracker.com/..." className="mt-1 bg-white" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-slate-700">Admin Notes (Optional)</label>
                                <textarea 
                                    value={notes} 
                                    onChange={e=>setNotes(e.target.value)} 
                                    placeholder="Add a note to this order..." 
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-[#4a439a]/20 mt-1"
                                />
                            </div>
                        </>
                    )}
                </form>

                <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-4">
                    <Button type="button" variant="outline" className="mr-2" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    {allowedStatuses.length > 0 && (
                        <Button form="orderStatusForm" type="submit" disabled={isLoading || !status} className="bg-[#4a439a] hover:bg-[#3e3685] text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Status
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}