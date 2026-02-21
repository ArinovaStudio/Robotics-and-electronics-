import { TrendingUp, TrendingDown } from "lucide-react";
import {
    ComposedChart,
    Line,
    Area,
    ResponsiveContainer,
    YAxis,
} from "recharts";

interface Props {
    title: string;
    value: string | number;
    percent: number;
    isUp: boolean;
    data: number[];
}

export function ProductMetricCard({
    title,
    value,
    percent,
    isUp,
    data,
}: Props) {
    const chartData = data.map((v, i) => ({
        index: i,
        value: v,
    }));

    const gradientId = `spark-${title.replace(/\s/g, "")}`;

    return (
        <div className="w-80 h-37.5 rounded-2xl border border-slate-200 bg-white px-5 py-5 flex justify-between">


            {/* LEFT */}
            <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-slate-500">{title}</p>

                <div>
                    <h2 className="text-3xl font-semibold text-slate-900 leading-tight">
                        {value}
                    </h2>

                    <div className="flex items-center gap-3 mt-2">
                        {isUp ? (
                            <TrendingUp size={14} className="text-emerald-500" />
                        ) : (
                            <TrendingDown size={14} className="text-rose-500" />
                        )}

                        <span
                            className={`text-xs font-semibold ${isUp ? "text-emerald-500" : "text-rose-500"
                                }`}
                        >
                            {percent}%
                        </span>

                        <span className="text-xs text-slate-400">
                            vs last week
                        </span>
                    </div>
                </div>
            </div>

            {/* RIGHT – SPARKLINE WITH YELLOW SHADOW */}
            <div className="w-30 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={80}>
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 6, right: 0, left: 0, bottom: 6 }}
                    >
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b7cf6" stopOpacity={0.6} />
                                <stop offset="60%" stopColor="#8b7cf6" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#8b7cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* force vertical space */}
                        <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />

                        {/* YELLOW SHADOW */}
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="none"
                            fill={`url(#${gradientId})`}
                        />

                        {/* PURPLE LINE */}
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8b7cf6"
                            strokeWidth={2}
                            dot={false}
                            strokeLinecap="round"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
