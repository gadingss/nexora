import { PaperPosition } from "@/lib/paper-trading/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface Props {
  positions: PaperPosition[];
}

export function PositionsTable({ positions }: Props) {
  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 mb-6">
      <h3 className="text-sm font-semibold mb-4 text-white">OPEN POSITIONS</h3>
      {positions.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-xs font-mono">
          NO OPEN POSITIONS
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f1f1f] text-[10px] text-zinc-500 uppercase tracking-wider">
                <th className="py-2">ASSET</th>
                <th className="py-2">QUANTITY</th>
                <th className="py-2">AVG ENTRY</th>
                <th className="py-2">CURRENT PRICE</th>
                <th className="py-2">MARKET VALUE</th>
                <th className="py-2">UNREALIZED PNL</th>
                <th className="py-2 text-right">PNL %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f] text-xs font-mono">
              {positions.map((pos) => {
                const isPositive = pos.unrealizedPnl >= 0;
                const pnlColor = isPositive ? "text-green-500" : "text-red-500";
                return (
                  <tr key={pos.id} className="hover:bg-[#181818]">
                    <td className="py-2.5 font-bold text-white">{pos.symbol}</td>
                    <td className="py-2.5 text-zinc-300">{pos.quantity}</td>
                    <td className="py-2.5 text-zinc-300">{formatCurrency(pos.averageEntryPrice)}</td>
                    <td className="py-2.5 text-zinc-300">{formatCurrency(pos.currentPrice)}</td>
                    <td className="py-2.5 text-zinc-300">{formatCurrency(pos.marketValue)}</td>
                    <td className={`py-2.5 ${pnlColor}`}>{formatCurrency(pos.unrealizedPnl)}</td>
                    <td className={`py-2.5 text-right ${pnlColor}`}>
                      {formatPercentage(pos.unrealizedPnlPercent)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
