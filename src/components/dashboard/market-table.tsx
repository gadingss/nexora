"use client";

import Link from "next/link";
import { MarketAsset } from "@/lib/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface MarketTableProps {
  assets: MarketAsset[];
  title?: string;
}

export function MarketTable({ assets, title = "MARKET ACTIVITY" }: MarketTableProps) {
  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded overflow-hidden">
      <div className="p-4 border-b border-[#1f1f1f]">
        <h2 className="text-xs font-mono tracking-wider text-zinc-400 uppercase">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f1f1f] text-[10px] font-mono tracking-wider text-zinc-500 uppercase bg-[#0c0c0c]/50">
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-right">1H</th>
              <th className="py-3 px-4 text-right">24H</th>
              <th className="py-3 px-4 text-right">24H Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f] text-xs">
            {assets.map((asset) => {
              const is1hPos = (asset.change1h ?? 0) >= 0;
              const is24hPos = asset.change24h >= 0;

              return (
                <tr
                  key={asset.symbol}
                  className="hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <Link href={`/markets/${asset.symbol}`} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-300">
                        {asset.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                          {asset.name}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">{asset.symbol}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-white mono">
                    ${(asset.price ?? 0).toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 text-right mono ${asset.change1h !== undefined ? (is1hPos ? "text-emerald-400" : "text-rose-500") : "text-zinc-500"}`}>
                    {asset.change1h !== undefined ? formatPercentage(asset.change1h) : "—"}
                  </td>
                  <td className={`py-3 px-4 text-right mono ${is24hPos ? "text-emerald-400" : "text-rose-500"}`}>
                    {formatPercentage(asset.change24h ?? 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-400 mono">
                    {formatCurrency(asset.volume ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
