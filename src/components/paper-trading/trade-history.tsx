import { PaperTrade } from "@/lib/paper-trading/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  trades: PaperTrade[];
}

export function TradeHistory({ trades }: Props) {
  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 mb-6">
      <h3 className="text-sm font-semibold mb-4 text-white">TRADE HISTORY</h3>
      {trades.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-xs font-mono">
          NO TRADING ACTIVITY
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f1f1f] text-[10px] text-zinc-500 uppercase tracking-wider">
                <th className="py-2">TIME</th>
                <th className="py-2">ASSET</th>
                <th className="py-2">SIDE</th>
                <th className="py-2">QUANTITY</th>
                <th className="py-2">PRICE</th>
                <th className="py-2">VALUE</th>
                <th className="py-2 text-right">PNL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f] text-xs font-mono">
              {trades
                .slice()
                .reverse()
                .map((trade) => {
                  const hasPnl = trade.realizedPnl !== undefined;
                  const pnlColor = hasPnl
                    ? (trade.realizedPnl! >= 0 ? "text-green-500" : "text-red-500")
                    : "text-zinc-400";
                  return (
                    <tr key={trade.id} className="hover:bg-[#181818]">
                      <td className="py-2.5 text-zinc-300">{new Date(trade.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="py-2.5 font-bold text-white">{trade.symbol}</td>
                      <td className={`py-2.5 ${trade.side === "BUY" ? "text-green-400" : "text-red-400"}`}>
                        {trade.side}
                      </td>
                      <td className="py-2.5 text-zinc-300">{trade.quantity}</td>
                      <td className="py-2.5 text-zinc-300">{formatCurrency(trade.price)}</td>
                      <td className="py-2.5 text-zinc-300">{formatCurrency(trade.totalValue)}</td>
                      <td className={`py-2.5 text-right ${pnlColor}`}>
                        {hasPnl ? formatCurrency(trade.realizedPnl!) : "—"}
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