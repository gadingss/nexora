import { cn } from "@/lib/utils";

interface MarketStatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export function MarketStatCard({ label, value, change, isPositive }: MarketStatCardProps) {
  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
      <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">{label}</span>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-xl md:text-2xl font-semibold tracking-tight text-white mono">{value}</span>
        <span
          className={cn(
            "text-xs font-mono font-medium",
            isPositive ? "text-emerald-400" : "text-rose-500"
          )}
        >
          {change}
        </span>
      </div>
    </div>
  );
}
