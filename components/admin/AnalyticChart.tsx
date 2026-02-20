"use client";

import * as React from "react";
import { CartesianGrid, XAxis, YAxis, Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const chartConfig = {
    purchase: { label: "Purchase Cost", color: "#3b82f6" },
    sale: { label: "Sales Revenue", color: "#22c55e" },
} satisfies ChartConfig;

interface ChartProps {
    chartData: {
        weekly: any[];
        monthly: any[];
        yearly: any[];
    }
}

export function AnalyticChart({ chartData }: ChartProps) {
    const [timeframe, setTimeframe] = React.useState<"weekly" | "monthly" | "yearly">("weekly");

    const data = chartData[timeframe] || [];

    return (
        <Card className="w-full border-slate-200 shadow-sm bg-white rounded-2xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-semibold text-slate-800">
                    Revenue & Costs
                </CardTitle>

                <Select value={timeframe} onValueChange={(value) => setTimeframe(value as "weekly" | "monthly" | "yearly")}>
                    <SelectTrigger className="w-32 h-9 rounded-lg font-medium bg-white border-slate-200 text-slate-700">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="weekly">This Week</SelectItem>
                        <SelectItem value="monthly">This Month</SelectItem>
                        <SelectItem value="yearly">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="flex-1 p-6 pb-2 min-h-[300px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`} 
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            
                            {/* Blue Line - Purchase/Cost */}
                            <Area
                                type="monotone"
                                dataKey="purchase"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#colorPurchase)"
                                fillOpacity={0.1}
                            />
                            
                            {/* Green Line - Sales/Revenue */}
                            <Area
                                type="monotone"
                                dataKey="sale"
                                stroke="#22c55e"
                                strokeWidth={3}
                                fill="url(#colorSale)"
                                fillOpacity={0.1}
                            />
                            
                            {/* Gradients */}
                            <defs>
                                <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSale" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}