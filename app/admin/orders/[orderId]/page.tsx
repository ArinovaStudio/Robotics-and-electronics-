"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { 
    ArrowLeft, Package, User, MapPin, CreditCard, 
    Calendar, Truck, FileText, Loader2, Image as ImageIcon, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authFetcher } from "@/store/adminStore";
import { OrderStatusModal } from "@/components/admin/OrderStatusModal";

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const { data, isLoading, mutate } = useSWR(`/api/admin/orders/${orderId}`, authFetcher);
    const order = data?.data;

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

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4a439a]" />
                    <p className="font-medium text-center">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
                <Package className="w-16 h-16 text-slate-300" />
                <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
                <Button onClick={() => router.push("/admin/orders")} variant="outline" className="w-full sm:w-auto">
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full pb-10 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
            {/* HEADER */}
            <header className="mb-6 sm:mb-8">
                <button 
                    onClick={() => router.push("/admin/orders")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} /> Back to Orders
                </button>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight break-all sm:break-normal">
                                Order {order.orderNumber}
                            </h1>
                            <Badge className={`${getStatusColor(order.status)} border shadow-sm text-xs px-2.5 py-0.5 whitespace-nowrap`}>
                                {order.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                            <Calendar size={14} className="shrink-0" />
                            Placed on {formatDate(order.orderedAt)}
                        </div>
                    </div>

                    <Button 
                        onClick={() => setIsUpdateModalOpen(true)}
                        disabled={["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)}
                        className="w-full sm:w-auto bg-[#4a439a] hover:bg-[#3e3685] text-white rounded-xl shadow-sm px-6"
                    >
                        <Truck className="mr-2" size={18} />
                        Update Status
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Items & Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items Card */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 sm:py-4 px-4 sm:px-6">
                            <CardTitle className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Package size={18} className="text-[#4a439a]" /> Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="min-w-[500px] w-full">
                                    <TableHeader className="bg-slate-50/80">
                                        <TableRow>
                                            <TableHead className="w-16">Item</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead className="text-center">Price</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right px-4 sm:px-6">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item: any) => {
                                            const title = item.product?.title || item.productSnapshot?.title || "Unknown Product";
                                            const image = item.product?.imageLink || item.productSnapshot?.image || null;
                                            const sku = item.product?.sku || "N/A";

                                            return (
                                                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="pl-4 sm:pl-6">
                                                        {image ? (
                                                            <img src={image} alt={title} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />
                                                        ) : (
                                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                                                <ImageIcon size={18} className="text-slate-400" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-semibold text-slate-800 text-sm sm:text-base line-clamp-2">{title}</div>
                                                        <div className="text-xs text-slate-500 font-mono mt-0.5">SKU: {sku}</div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium text-slate-700 text-sm sm:text-base">
                                                        {formatCurrency(item.priceAtPurchase)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold text-slate-800 text-sm sm:text-base">
                                                        x{item.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-slate-800 text-sm sm:text-base pr-4 sm:pr-6">
                                                        {formatCurrency(Number(item.priceAtPurchase) * item.quantity)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 sm:py-4 px-4 sm:px-6">
                            <CardTitle className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <FileText size={18} className="text-[#4a439a]" /> Payment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-3 text-sm sm:text-base">
                                <div className="flex justify-between text-slate-600 font-medium">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 font-medium">
                                    <span>Shipping Fee</span>
                                    <span>{formatCurrency(order.shippingCost)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 font-medium">
                                    <span>Tax</span>
                                    <span>{formatCurrency(order.taxAmount)}</span>
                                </div>
                                {Number(order.discount) > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(order.discount)}</span>
                                    </div>
                                )}
                                <hr className="border-slate-100 my-3 sm:my-2" />
                                <div className="flex flex-wrap gap-2 justify-between items-center">
                                    <span className="text-base sm:text-lg font-bold text-slate-800">Total</span>
                                    <span className="text-xl sm:text-2xl font-bold text-[#4a439a]">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Customer & Meta */}
                <div className="space-y-6">
                    
                    {/* Customer Info */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 sm:py-4 px-4 sm:px-6">
                            <CardTitle className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <User size={18} className="text-[#4a439a]" /> Customer Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</p>
                                    <p className="font-semibold text-sm sm:text-base text-slate-800 break-words">{order.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                    <p className="font-medium text-sm sm:text-base text-slate-600 break-words">{order.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                                    <p className="font-medium text-sm sm:text-base text-slate-600">{order.address.phone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 sm:py-4 px-4 sm:px-6">
                            <CardTitle className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <MapPin size={18} className="text-[#4a439a]" /> Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-1 text-sm sm:text-base text-slate-700 font-medium">
                                <p className="font-semibold text-slate-900">{order.address.name}</p>
                                <p className="break-words">{order.address.addressLine1}</p>
                                {order.address.addressLine2 && <p className="break-words">{order.address.addressLine2}</p>}
                                <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
                                <p>{order.address.country}</p>
                            </div>

                            {/* Tracking Info if available */}
                            {(order.trackingNumber || order.trackingUrl) && (
                                <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tracking Info</p>
                                    {order.trackingNumber && (
                                        <p className="font-mono text-xs sm:text-sm text-slate-800 font-medium mb-1 break-all">
                                            ID: {order.trackingNumber}
                                        </p>
                                    )}
                                    {order.trackingUrl && (
                                        <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-xs sm:text-sm font-medium text-[#4a439a] hover:underline flex items-center gap-1 w-fit mt-2">
                                            Track Package <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 sm:py-4 px-4 sm:px-6">
                            <CardTitle className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <CreditCard size={18} className="text-[#4a439a]" /> Payment Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            {order.payment ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                                        <Badge className={`${order.payment.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} border shadow-sm text-xs`}>
                                            {order.payment.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Method</p>
                                        <p className="font-medium text-sm sm:text-base text-slate-700 capitalize">{order.payment.paymentMethod || "N/A"}</p>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Transaction ID</p>
                                        <p className="font-mono text-xs sm:text-sm text-slate-600 truncate" title={order.payment.razorpayOrderId}>
                                            {order.payment.razorpayOrderId}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 font-medium italic">No payment details recorded.</p>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Status Update Modal */}
            <OrderStatusModal 
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                order={order}
                onSuccess={() => mutate()} 
            />
        </div>
    );
}