import { formatCurrency } from "@/lib/utils";

interface Props {
  totalEquity: number;
  availableBalance: number;
  investedValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

export function PortfolioSummary({
  totalEquity,
  availableBalance,
  investedValue,
  unrealizedPnl,
  realizedPnl,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <StatCard title="TOTAL EQUITY" value={formatCurrency(totalEquity)} />
      <StatCard title="AVAILABLE BALANCE" value={formatCurrency(availableBalance)} />
      <StatCard title="INVESTED VALUE" value={formatCurrency(investedValue)} />
      <StatCard title="UNREALIZED PNL" value={formatCurrency(unrealizedPnl)} isPnl />
      <StatCard title="REALIZED PNL" value={formatCurrency(realizedPnl)} isPnl />
    </div>
  );
}

function StatCard({ title, value, isPnl }: { title: string; value: string; isPnl?: boolean }) {
  const color = isPnl ? (value.startsWith("-") ? "text-red-500" : "text-green-500") : "text-white";
  return (
    <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded">
      <div className="text-xs text-zinc-500 mb-1">{title}</div>
      <div className={`text-lg font-mono ${color}`}>{value}</div>
    </div>
  );
}
