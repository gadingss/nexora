"use client";

import { useState, useCallback } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { ChartDataPoint } from "@/lib/types";

interface MarketChartProps {
  data: ChartDataPoint[];
  title?: string;
  onTimeframeChange?: (days: number) => void;
  symbol?: string;
}

export function MarketChart({ data, title = "MARKET PERFORMANCE", onTimeframeChange }: MarketChartProps) {
  const [timeframe, setTimeframe] = useState("1D");
  const timeframes = ["1D", "7D", "30D", "1Y"];
  
  const handleTimeframeChange = useCallback((tf: string) => {
    setTimeframe(tf);
    if (onTimeframeChange) {
      const timeframeMap: Record<string, number> = {
        "1D": 1,
        "7D": 7,
        "30D": 30,
        "1Y": 365,
      };
      onTimeframeChange(timeframeMap[tf]);
    }
  }, [onTimeframeChange]);

  const firstVal = data[0]?.value || 0;
  const lastVal = data[data.length - 1]?.value || 0;
  const isPositive = lastVal >= firstVal;
  const percentChange = firstVal ? (((lastVal - firstVal) / firstVal) * 100).toFixed(2) : "0.00";

  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded p-5 flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-mono tracking-wider text-zinc-400 uppercase">{title}</h2>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold text-white mono">${lastVal.toFixed(2)}</span>
              <span className={`text-xs font-mono ${isPositive ? "text-emerald-400" : "text-rose-500"}`}>
                {isPositive ? "+" : ""}{percentChange}%
              </span>
            </div>
          </div>

        <div className="flex items-center gap-1 bg-[#0a0a0a] p-1 rounded border border-[#1f1f1f] self-start sm:self-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                timeframe === tf
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#404040" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#404040"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "4px" }}
              labelStyle={{ color: "#a1a1aa", fontSize: "11px" }}
              itemStyle={{ color: "#fff", fontSize: "12px", fontFamily: "monospace" }}
              formatter={(val: unknown) => `$${Number(val).toFixed(2)}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
