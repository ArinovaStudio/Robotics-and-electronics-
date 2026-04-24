"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xl min-w-[250px]">
        <div className="mb-3 pb-2 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
          <p className="text-sm font-mono font-semibold text-slate-800">{label}</p>
        </div>
        
        {/* The Pricing Data */}
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-medium text-slate-600">{entry.name}</span>
              </div>
              <span className="text-sm font-bold text-slate-800">
                ₹{Number(entry.value).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function DiscountChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Customer Spend vs Revenue</h3>
        <p className="text-sm text-slate-500">Comparing regular price against actual checkout price per order.</p>
      </div>
      
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
            <XAxis 
              dataKey="orderId" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              dy={10} 
              tickFormatter={(val) => `...${val.slice(-6).toUpperCase()}`}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              tickFormatter={(val) => `₹${val}`} 
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: '#f8fafc' }}
            />
            
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Bar dataKey="WithoutOffer" name="Regular Price" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={25} />
            <Bar dataKey="AfterOffer" name="Actual Paid" fill="#4a439a" radius={[4, 4, 0, 0]} barSize={25} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}