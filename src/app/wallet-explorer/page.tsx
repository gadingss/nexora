"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { getChainName, isChainSupported } from "@/lib/web3/chains";
import { RefreshCw, ExternalLink, ArrowUpRight, ArrowDownLeft, AlertCircle, Copy } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { MarketAsset } from "@/lib/types";

interface WalletBalanceResponse {
  balance: {
    native?: {
      balance: bigint;
      formattedBalance: string;
    };
  };
  transactionCount?: number;
  source: string;
  updatedAt: string;
}

interface TxResponse {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  gasUsed?: string;
  gasPrice?: string;
  type: string;
}

interface TransactionPage {
  transactions: TxResponse[];
  totalPages: number;
  source: string;
  updatedAt: string;
}

export default function WalletExplorerPage() {
  const { address, isConnected, chainId } = useAccount();
  const [selectedTx, setSelectedTx] = useState<TxResponse | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // defer state update to next frame to avoid synchronous effect execution warning
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const { data: walletData, isLoading: loadingBalance } = useQuery<WalletBalanceResponse>({
    queryKey: ["wallet-data", address, chainId],
    queryFn: async () => {
      if (!address || !chainId) return null as unknown as WalletBalanceResponse;
      const res = await fetch(`/api/onchain?address=${address}&chainId=${chainId}`);
      if (!res.ok) throw new Error("Failed to fetch wallet data");
      return res.json();
    },
    enabled: isConnected && !!address && !!chainId,
  });

  const { data: txData, isLoading: loadingTx } = useQuery<TransactionPage>({
    queryKey: ["tx-history", address, chainId, page],
    queryFn: async () => {
      if (!address || !chainId) return null as unknown as TransactionPage;
      const res = await fetch(`/api/onchain/transactions?address=${address}&chainId=${chainId}&page=${page}&offset=20`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
    enabled: isConnected && !!address && !!chainId,
  });

  const nativeBalance = walletData?.balance?.native;
  const transactionCount = walletData?.transactionCount || 0;
  const transactions = txData?.transactions || [];

  useEffect(() => {
    fetch("/api/market")
      .then(r => r.json())
      .then(data => {
        const eth = data.data.find((a: MarketAsset) => a.symbol === "ETH");
        if (eth) setEthPrice(eth.price);
      })
      .catch(() => setEthPrice(null));
  }, []);

  const usdValue = ethPrice && nativeBalance ? (Number(nativeBalance.formattedBalance) * ethPrice) : null;

  const portfolioData = [
    { name: "Native ETH", value: usdValue || 0 },
    { name: "Tokens", value: 0 },
  ];

  const activitySummary = {
    total: transactions.length,
    incoming: transactions.filter((t) => t.from?.toLowerCase() !== address?.toLowerCase() && t.to?.toLowerCase() === address?.toLowerCase()).length,
    outgoing: transactions.filter((t) => t.from?.toLowerCase() === address?.toLowerCase()).length,
  };

  const explorerUrl = chainId === 1 ? "https://etherscan.io" : "https://sepolia.etherscan.io";

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      fetch(`/api/onchain?address=${address}&chainId=${chainId}`),
      fetch(`/api/onchain/transactions?address=${address}&chainId=${chainId}&page=${page}&offset=20`),
    ]).finally(() => setRefreshing(false));
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (!mounted || !isConnected) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Wallet Explorer</h1>
          <p className="text-zinc-400 text-sm">Connect a wallet to view on-chain analytics.</p>
        </div>
      </div>
    );
  }

  const unsupported = !isChainSupported(chainId);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Wallet Explorer</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <span className="font-mono text-white">{formatAddress(address)}</span>
          <button onClick={copyAddress} className="text-zinc-500 hover:text-white">
            <Copy className="w-4 h-4" />
          </button>
          <span className="flex items-center gap-1.5">
            {unsupported && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
            {getChainName(chainId)}
          </span>
          <a href={`${explorerUrl}/address/${address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
            <ExternalLink className="w-4 h-4" />
            Explorer
          </a>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-1 text-zinc-400 hover:text-white disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {unsupported && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded p-4">
          <p className="text-rose-400 text-sm">
            Unsupported network. Only Ethereum Mainnet and Sepolia are supported.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-zinc-500">Native Balance</span>
          {loadingBalance ? (
            <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
          ) : nativeBalance ? (
            <>
              <p className="text-2xl font-bold font-mono text-white">{nativeBalance.formattedBalance} ETH</p>
              {usdValue !== null && (
                <p className="text-sm text-zinc-400">{formatCurrency(usdValue)} USD</p>
              )}
            </>
          ) : (
            <p className="text-zinc-500 text-sm">—</p>
          )}
        </div>

        <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-zinc-500">Transactions</span>
          <p className="text-2xl font-bold font-mono text-white">{transactionCount}</p>
          <p className="text-xs text-zinc-500">Total on-chain activity</p>
        </div>

        <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-zinc-500">Incoming</span>
          <p className="text-2xl font-bold font-mono text-emerald-400">{activitySummary.incoming}</p>
          <p className="text-xs text-zinc-500">Assets received</p>
        </div>

        <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-zinc-500">Outgoing</span>
          <p className="text-2xl font-bold font-mono text-rose-400">{activitySummary.outgoing}</p>
          <p className="text-xs text-zinc-500">Assets sent</p>
        </div>
      </div>

      <div className="bg-[#121212] border border-[#1f1f1f] rounded p-6">
        <h2 className="text-sm font-mono uppercase text-zinc-400 mb-4">Portfolio Allocation</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
              >
                {portfolioData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#10b981" : "#3b82f6"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
                itemStyle={{ color: "#fff" }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Value"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#121212] border border-[#1f1f1f] rounded overflow-hidden">
        <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase text-zinc-400">Transaction History</h2>
          <span className="text-xs text-zinc-500">
            Page {page} • {transactions.length} transactions
          </span>
        </div>

        {loadingTx ? (
          <div className="p-8 text-center">
            <p className="text-zinc-500">Loading transaction history...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0c0c0c]/50 text-[10px] font-mono uppercase text-zinc-500">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">From/To</th>
                  <th className="py-3 px-4 text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No transactions found for this wallet
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => {
                    const isIncoming = tx.to?.toLowerCase() === address?.toLowerCase();
                    const amountEth = Number(tx.value || 0) / 1e18;
                    const formattedAmount = amountEth.toFixed(4);

                    return (
                      <tr
                        key={idx}
                        onClick={() => setSelectedTx(tx)}
                        className="hover:bg-zinc-900/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-zinc-400">
                          {new Date(tx.timestamp * 1000).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                              isIncoming
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {isIncoming ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {isIncoming ? "INCOMING" : "OUTGOING"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-white">ETH</td>
                        <td className="py-3 px-4 font-mono text-right text-white">
                          {amountEth > 0 ? `${formattedAmount} ETH` : "-"}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400">
                          {formatAddress(isIncoming ? tx.from : tx.to)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`${explorerUrl}/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
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

        {transactions.length > 0 && (
          <div className="p-4 border-t border-[#1f1f1f] flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded bg-zinc-900 text-zinc-400 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded bg-zinc-900 text-zinc-400 text-xs hover:bg-zinc-800"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedTx(null)}>
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white">Transaction Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-zinc-500 text-xs uppercase">Hash</span>
                <p className="font-mono text-white break-all">{selectedTx.hash}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-xs uppercase">Block</span>
                <span className="font-mono text-white ml-2">{selectedTx.blockNumber}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-xs uppercase">From</span>
                <p className="font-mono text-white mt-0.5">{selectedTx.from}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-xs uppercase">To</span>
                <p className="font-mono text-white mt-0.5">{selectedTx.to}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-xs uppercase">Value</span>
                <span className="font-mono text-white ml-2">
                  {(Number(selectedTx.value) / 1e18).toFixed(6)} ETH
                </span>
              </div>
              {selectedTx.gasUsed && (
                <div>
                  <span className="text-zinc-500 text-xs uppercase">Gas Used</span>
                  <span className="font-mono text-white ml-2">{selectedTx.gasUsed}</span>
                </div>
              )}
              {selectedTx.gasPrice && (
                <div>
                  <span className="text-zinc-500 text-xs uppercase">Gas Price</span>
                  <span className="font-mono text-white ml-2">{(Number(selectedTx.gasPrice) / 1e9).toFixed(2)} Gwei</span>
                </div>
              )}
            </div>
            <a
              href={`${explorerUrl}/tx/${selectedTx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-emerald-500 text-white text-center rounded hover:bg-emerald-600 transition-colors"
            >
              View on Explorer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
