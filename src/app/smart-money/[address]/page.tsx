"use client";

import { Suspense, use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "viem";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { formatAddress } from "@/lib/utils";
import { RefreshCw, ExternalLink, ArrowUpRight, ArrowDownLeft, Copy, AlertCircle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { SmartMoneyWallet, SmartMoneyActivity, SmartMoneyFlow, SmartMoneyWindow } from "@/lib/smart-money/types";
import { getExplorerUrl } from "@/lib/smart-money/config";

interface WalletDetailProps {
  params: Promise<{ address: string }>;
}

export default function WalletDetailPage({ params }: WalletDetailProps) {
  return (
    <Suspense fallback={<AppLayout><PageContainer title="Wallet Detail"><div className="text-zinc-500 text-sm">Loading...</div></PageContainer></AppLayout>}>
      <WalletDetailContent params={params} />
    </Suspense>
  );
}

function WalletDetailContent({ params }: WalletDetailProps) {
  const resolvedParams = use(params);
  const address = resolvedParams.address;
  const searchParams = useSearchParams();
  const networkParam = searchParams.get("network") || "ethereum";
  const [timeWindow, setTimeWindow] = useState<SmartMoneyWindow>("7D");
  const [refreshing, setRefreshing] = useState(false);

  const network = networkParam === "sepolia" ? "sepolia" : "ethereum";

  const { data: walletData, isLoading: loadingWallet, refetch: refetchWallet } = useQuery<{ wallet: SmartMoneyWallet }>({
    queryKey: ["smart-money-wallet", address, network],
    queryFn: async () => {
      const res = await fetch(`/api/smart-money/${address}?network=${network}`);
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return res.json();
    },
    enabled: !!address && isAddress(address),
    staleTime: 30000,
  });

  const { data: activityData, isLoading: loadingActivity, refetch: refetchActivity } = useQuery<{ activities: SmartMoneyActivity[] }>({
    queryKey: ["smart-money-activity", address, network],
    queryFn: async () => {
      const res = await fetch(`/api/smart-money/${address}/activity?network=${network}`);
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
    enabled: !!address && isAddress(address),
    staleTime: 30000,
  });

  const { data: flowData, isLoading: loadingFlow, refetch: refetchFlow } = useQuery<{ flow: SmartMoneyFlow }>({
    queryKey: ["smart-money-flow", address, network, timeWindow],
    queryFn: async () => {
      const res = await fetch(`/api/smart-money/${address}/flow?network=${network}&window=${timeWindow}`);
      if (!res.ok) throw new Error("Failed to fetch flow");
      return res.json();
    },
    enabled: !!address && isAddress(address),
    staleTime: 60000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchWallet(), refetchActivity(), refetchFlow()]);
    setRefreshing(false);
  };

  if (!isAddress(address)) {
    return (
      <AppLayout>
        <PageContainer title="Wallet Detail">
          <div className="bg-rose-500/10 border border-rose-500/30 rounded p-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <p className="text-rose-400 text-sm">INVALID WALLET ADDRESS</p>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  const wallet = walletData?.wallet;
  const activities = activityData?.activities || [];
  const flow = flowData?.flow;
  const explorerUrl = getExplorerUrl(network);

  return (
    <AppLayout>
      <PageContainer title="Wallet Intelligence">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-white">{wallet?.label || "Wallet Detail"}</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {network}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-mono text-zinc-400">
                <span>{formatAddress(address)}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(address)}
                  className="text-zinc-500 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <a
                  href={`${explorerUrl}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-zinc-400 text-sm rounded hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {loadingWallet ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#121212] border border-[#1f1f1f] rounded p-4 h-24 animate-pulse" />
              ))}
            </div>
          ) : wallet ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Balance</span>
                <p className="text-xl font-bold font-mono text-white">
                  {wallet.balance !== null ? `${wallet.balance.toFixed(4)} ETH` : "—"}
                </p>
              </div>
              <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Transactions</span>
                <p className="text-xl font-bold font-mono text-white">{wallet.transactionCount ?? "—"}</p>
              </div>
              <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Total Inflow</span>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  {wallet.inflow !== null ? `${wallet.inflow.toFixed(4)} ETH` : "—"}
                </p>
              </div>
              <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Total Outflow</span>
                <p className="text-xl font-bold font-mono text-rose-400">
                  {wallet.outflow !== null ? `${wallet.outflow.toFixed(4)} ETH` : "—"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="bg-[#121212] border border-[#1f1f1f] rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono uppercase text-zinc-400">Flow Analysis</h3>
              <div className="flex gap-2">
                {(["24H", "7D", "30D", "90D"] as SmartMoneyWindow[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setTimeWindow(w)}
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                      timeWindow === w
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {loadingFlow ? (
              <div className="h-64 bg-zinc-900/50 rounded animate-pulse" />
            ) : flow && flow.points.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Net Flow ({timeWindow})</p>
                    <p className={`text-lg font-bold font-mono ${
                      (flow.netFlow || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {flow.netFlow !== null ? `${flow.netFlow >= 0 ? "+" : ""}${flow.netFlow.toFixed(4)} ETH` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Inflow ({timeWindow})</p>
                    <p className="text-lg font-bold font-mono text-emerald-400">
                      {flow.totalInflow !== null ? `${flow.totalInflow.toFixed(4)} ETH` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Outflow ({timeWindow})</p>
                    <p className="text-lg font-bold font-mono text-rose-400">
                      {flow.totalOutflow !== null ? `${flow.totalOutflow.toFixed(4)} ETH` : "—"}
                    </p>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flow.points}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                      <XAxis dataKey="time" stroke="#71717a" style={{ fontSize: 10 }} />
                      <YAxis stroke="#71717a" style={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value) => `${Number(value ?? 0).toFixed(4)} ETH`}
                      />
                      <Legend />
                      <Bar dataKey="inflow" fill="#10b981" name="Inflow" />
                      <Bar dataKey="outflow" fill="#ef4444" name="Outflow" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">
                No flow data available for selected period
              </div>
            )}
          </div>

          <div className="bg-[#121212] border border-[#1f1f1f] rounded overflow-hidden">
            <div className="p-4 border-b border-[#1f1f1f]">
              <h3 className="text-xs font-mono uppercase text-zinc-400">Activity</h3>
            </div>

            {loadingActivity ? (
              <div className="p-8 text-center">
                <p className="text-zinc-500 text-sm">Loading activity...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0c0c0c]/50 text-[10px] font-mono uppercase text-zinc-500">
                    <tr>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Direction</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">From/To</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Explorer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f]">
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500">
                          No activity found for this wallet
                        </td>
                      </tr>
                    ) : (
                      activities.slice(0, 50).map((activity, idx) => {
                        const directionConfig = {
                          in: { label: "IN", color: "text-emerald-400 bg-emerald-500/10", icon: ArrowDownLeft },
                          out: { label: "OUT", color: "text-rose-400 bg-rose-500/10", icon: ArrowUpRight },
                          self: { label: "SELF", color: "text-blue-400 bg-blue-500/10", icon: Activity },
                          contract: { label: "CONTRACT", color: "text-purple-400 bg-purple-500/10", icon: ArrowUpRight },
                          unknown: { label: "UNKNOWN", color: "text-zinc-400 bg-zinc-500/10", icon: Activity },
                        }[activity.direction];

                        const Icon = directionConfig.icon;

                        return (
                          <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="py-3 px-4 font-mono text-zinc-400 text-xs">
                              {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${directionConfig.color}`}>
                                <Icon className="w-3 h-3" />
                                {directionConfig.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-right text-white">
                              {activity.amount !== null ? `${activity.amount.toFixed(4)} ETH` : "—"}
                            </td>
                            <td className="py-3 px-4 font-mono text-zinc-400 text-xs">
                              {formatAddress(activity.direction === "in" ? activity.from : activity.to)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-mono uppercase ${
                                activity.status === "success" ? "text-emerald-400" :
                                activity.status === "failed" ? "text-rose-400" : "text-zinc-400"
                              }`}>
                                {activity.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <a
                                href={`${explorerUrl}/tx/${activity.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}