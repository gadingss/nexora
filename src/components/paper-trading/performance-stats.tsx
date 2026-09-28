import { formatCurrency } from "@/lib/utils";

interface Props {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number | null;
  totalRealizedPnl: number;
}

export function PerformanceStats({
  totalTrades,
  winningTrades,
  losingTrades,
  winRate,
  totalRealizedPnl,
}: Props) {
  return (
    <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded mb-6">
      <h3 className="text-sm font-semibold mb-4 text-white">TRADING STATISTICS</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat title="TOTAL TRADES" value={totalTrades.toString()} />
        <Stat title="WINNING TRADES" value={winningTrades.toString()} />
        <Stat title="LOSING TRADES" value={losingTrades.toString()} />
        <Stat title="WIN RATE" value={winRate !== null ? `${winRate.toFixed(1)}%` : "—"} />
        <Stat title="TOTAL REALIZED PNL" value={formatCurrency(totalRealizedPnl)} isPnl />
      </div>
    </div>
  );
}

function Stat({ title, value, isPnl }: { title: string; value: string; isPnl?: boolean }) {
  const color = isPnl ? (value.startsWith("-") ? "text-red-500" : "text-green-500") : "text-white";
  return (
    <div>
      <div className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">{title}</div>
      <div className={`text-sm font-mono ${color}`}>{value}</div>
    </div>
  );
}
