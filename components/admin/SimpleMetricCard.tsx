interface Props {
    title: string;
    value: string | number;
    color?: "slate" | "amber" | "sky" | "purple" | "indigo" | "emerald" | "rose";
}

export function SimpleMetricCard({ title, value, color = "slate" }: Props) {
    const colorClasses = {
        slate: "text-slate-900",
        amber: "text-amber-600",
        sky: "text-sky-600",
        purple: "text-purple-600",
        indigo: "text-indigo-600",
        emerald: "text-emerald-600",
        rose: "text-rose-600",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-center shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {title}
            </p>
            <h2 className={`text-3xl font-bold tracking-tight ${colorClasses[color]}`}>
                {value}
            </h2>
        </div>
    );
}