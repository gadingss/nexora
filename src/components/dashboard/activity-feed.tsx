import { WalletActivity } from "@/lib/types";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface ActivityFeedProps {
  activities: WalletActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded overflow-hidden">
      <div className="p-4 border-b border-[#1f1f1f]">
        <h2 className="text-xs font-mono tracking-wider text-zinc-400 uppercase">Recent Activity</h2>
      </div>
      <div className="divide-y divide-[#1f1f1f]">
        {activities.map((activity, idx) => {
          const isBuy = activity.type === "BUY";
          return (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-zinc-900/30 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-9 h-9 rounded flex items-center justify-center ${
                    isBuy ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {isBuy ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-mono text-zinc-300 group-hover:text-white transition-colors">
                    {formatAddress(activity.address)}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{activity.token}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-semibold text-white">{formatCurrency(activity.value)}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{activity.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
