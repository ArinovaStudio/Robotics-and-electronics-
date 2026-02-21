import React from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Timeframe = "today" | "weekly" | "monthly" | "total";

interface Props {
  title: string;
  icon: React.ReactNode;
  val: string | number;
  timeframe?: Timeframe;
  onTimeframeChange?: (value: Timeframe) => void;
  iconBgClass?: string;
  iconColorClass?: string;
  showTimeframe?: boolean;
}

export function AnalyticCard({
  title,
  icon,
  val,
  timeframe,
  onTimeframeChange,
  iconBgClass,
  iconColorClass,
  showTimeframe = true,
}: Props) {
  return (
    <div className="w-full bg-[#ffffff] h-40 rounded-2xl p-5 flex flex-col justify-between shadow-sm border border-slate-100">
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <p className="text-[15px] font-medium text-gray-500">{title}</p>

        {showTimeframe && onTimeframeChange && timeframe && (
          <Select value={timeframe} onValueChange={(v) => onTimeframeChange(v as Timeframe)}>
            <SelectTrigger className="w-[100px] h-8 rounded-lg text-xs text-gray-500 font-medium bg-slate-50 border-none shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="total">All Time</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Bottom */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 flex items-center justify-center rounded-xl", iconBgClass, iconColorClass)}>
            {icon}
          </div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] truncate">{val}</h2>
        </div>
      </div>
    </div>
  );
}