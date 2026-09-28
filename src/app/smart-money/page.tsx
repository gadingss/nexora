"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "viem";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { formatAddress } from "@/lib/utils";
import { Search, RefreshCw, TrendingUp, TrendingDown, ExternalLink, Copy, AlertCircle } from "lucide-react";
import type { SmartMoneyWallet, SmartMoneySort } from "@/lib/smart-money/types";
import { getExplorerUrl } from "@/lib/smart-money/config";

interface SmartMoneyResponse {
  wallets: SmartMoneyWallet[];
  count: number;
  source: string;
  updatedAt: string;
}

export default function SmartMoneyPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [searchError, setSearchError] = useState("");
  const [sortBy, setSortBy] = useState<SmartMoneySort>("netFlow");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery<SmartMoneyResponse>({
    queryKey: ["smart-money"],
    queryFn: async () => {
      const res = await fetch("/api/smart-money");
      if (!res.ok) throw new Error("Failed to fetch smart money data");
      return res.json();
    },
    staleTime: 30000,
  });

  const handleSearch = () => {
    setSearchError("");
    const cleaned = searchInput.trim();
    if (!cleaned) {
      setSearchError("Enter an address");
      return;
    }
    if (!isAddress(cleaned)) {
      setSearchError("INVALID WALLET ADDRESS");
      return;
    }
    router.push(`/smart-money/${cleaned}?network=ethereum`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const sortedWallets = data?.wallets ? [...data.wallets].sort((a, b) => {
    if (sortBy === "netFlow") return (b.netFlow || 0) - (a.netFlow || 0);
    if (sortBy === "transactionCount") return (b.transactionCount || 0) - (a.transactionCount || 0);
    if (sortBy === "activity") {
      const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
      const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
      return bTime - aTime;
    }
    return 0;
  }) : [];

  return (
    <AppLayout>
      <PageContainer
        title="Smart Money Intelligence"
        subtitle="Track and analyze on-chain wallet activity"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter EVM wallet address (0x...)"
                className="w-full bg-[#121212] border border-[#1f1f1f] rounded px-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              {searchError && (
                <div className="absolute top-full mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {searchError}
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded hover:bg-emerald-600 transition-colors"
            >
              Search
            </button>
          </div>

          {data?.wallets.length === 0 ? (
            <div className="bg-[#121212] border border-[#1f1f1f] rounded p-12 text-center">
              <p className="text-zinc-500 text-sm">No tracked wallets configured</p>
              <p className="text-zinc-600 text-xs mt-2">Configure wallets via SMART_MONEY_WALLETS environment variable</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 font-mono uppercase">Sort by</span>
                  <div className="flex gap-2">
                    {[
                      { value: "netFlow" as SmartMoneySort, label: "Net Flow" },
                      { value: "transactionCount" as SmartMoneySort, label: "Activity" },
                      { value: "activity" as SmartMoneySort, label: "Recent" },
                    ].map((sort) => (
                      <button
                        key={sort.value}
                        onClick={() => setSortBy(sort.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          sortBy === sort.value
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-[#121212] text-zinc-400 border border-[#1f1f1f] hover:text-white"
                        }`}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#121212] border border-[#1f1f1f] rounded p-4 h-32 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedWallets.map((wallet) => (
                    <Link
                      key={`${wallet.address}-${wallet.network}`}
                      href={`/smart-money/${wallet.address}?network=${wallet.network}`}
                      className="block bg-[#121212] border border-[#1f1f1f] rounded p-4 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-medium text-white">{wallet.label}</h3>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {wallet.network}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                            <span>{formatAddress(wallet.address)}</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(wallet.address);
                              }}
                              className="text-zinc-500 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`${getExplorerUrl(wallet.network)}/address/${wallet.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 text-xs">
                          <div>
                            <p className="text-zinc-500 font-mono uppercase text-[10px] mb-1">Balance</p>
                            <p className="text-white font-mono">
                              {wallet.balance !== null ? `${wallet.balance.toFixed(4)} ETH` : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500 font-mono uppercase text-[10px] mb-1">Txns</p>
                            <p className="text-white font-mono">{wallet.transactionCount ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 font-mono uppercase text-[10px] mb-1">Inflow</p>
                            <p className="text-emerald-400 font-mono">
                              {wallet.inflow !== null ? `${wallet.inflow.toFixed(4)} ETH` : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500 font-mono uppercase text-[10px] mb-1">Outflow</p>
                            <p className="text-rose-400 font-mono">
                              {wallet.outflow !== null ? `${wallet.outflow.toFixed(4)} ETH` : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500 font-mono uppercase text-[10px] mb-1">Net Flow</p>
                            <p className={`font-mono flex items-center gap-1 ${
                              (wallet.netFlow || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}>
                              {wallet.netFlow !== null ? (
                                <>
                                  {wallet.netFlow >= 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {wallet.netFlow.toFixed(4)} ETH
                                </>
                              ) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span>
                          Last Activity: {wallet.lastActivity ? new Date(wallet.lastActivity).toLocaleString() : "—"}
                        </span>
                        <span className="text-zinc-600">{wallet.source}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
