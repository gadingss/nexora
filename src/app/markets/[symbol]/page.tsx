"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { MarketChart } from "@/components/dashboard/market-chart";
import { DataSourceIndicator } from "@/components/data-source-indicator";
import { MarketAsset, ChartDataPoint } from "@/lib/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MARKET_ASSETS } from "@/lib/mock-data/markets";

interface TokenDetailPageProps {
  params: Promise<{ symbol: string }>;
}

export default function TokenDetailPage({ params }: TokenDetailPageProps) {
  const [symbol, setSymbol] = useState<string>("");
  const [asset, setAsset] = useState<MarketAsset | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    params.then(({ symbol: rawSymbol }) => {
      setSymbol(rawSymbol.toUpperCase());
    });
  }, [params]);

  useEffect(() => {
    if (!symbol) return;

    async function loadTokenData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/market/${symbol}`);

        if (response.status === 404) {
          setError("Token not found");
          setAsset(null);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch token data");
        }

        const result = await response.json();
        setAsset(result.data || null);
        setIsFallback(result.isFallback || false);

        if (result.data) {
          await loadChartData(symbol, 1);
        }
      } catch (err) {
        console.error("Error loading token data:", err);
        const fallback = MARKET_ASSETS.find((a) => a.symbol === symbol);
        if (fallback) {
          setAsset(fallback);
          setIsFallback(true);
        } else {
          setError(err instanceof Error ? err.message : "Unknown error");
          setAsset(null);
        }
      } finally {
        setLoading(false);
      }
    }

    loadTokenData();
  }, [symbol]);

  async function loadChartData(sym: string, days: number) {
    try {
      const response = await fetch(`/api/market/${sym}/history?days=${days}`);

      if (!response.ok) {
        console.warn(`Failed to fetch chart data for ${sym}, using fallback`);
        setChartData([]);
        return;
      }

      const result = await response.json();
      setChartData(result.data || []);
    } catch (err) {
      console.error("Error loading chart data:", err);
      setChartData([]);
    }
  }

  const handleDaysChange = (days: number) => {
    if (symbol) {
      loadChartData(symbol, days);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <PageContainer title={symbol || "Loading..."}>
          <div className="bg-[#121212] border border-[#1f1f1f] rounded p-8 text-center">
            <p className="text-zinc-500 text-sm">Loading token data...</p>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  if (error || !asset) {
    return (
      <AppLayout>
        <PageContainer title="Token Not Found">
          <div className="text-center py-12 space-y-4">
            <p className="text-zinc-500">{error || "Token not found in our database."}</p>
            <Link href="/markets" className="text-emerald-400 hover:text-emerald-300 inline-block">
              <div className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Markets
              </div>
            </Link>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  const isPositive = asset.change24h >= 0;

  return (
    <AppLayout>
      <PageContainer title={asset.name} subtitle={asset.symbol}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/markets"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Markets
            </Link>
          </div>
          <DataSourceIndicator isFallback={isFallback} source="CoinGecko" />
        </div>

        <div className="bg-[#121212] border border-[#1f1f1f] rounded p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mono">${(asset.price ?? 0).toFixed(2)}</h1>
              <p className={`text-lg font-mono mt-1 ${isPositive ? "text-emerald-400" : "text-rose-500"}`}>
                {formatPercentage(asset.change24h)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Market Cap</p>
              <p className="text-lg font-semibold text-white mono mt-1">{formatCurrency(asset.marketCap ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Volume</p>
              <p className="text-lg font-semibold text-white mono mt-1">{formatCurrency(asset.volume ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Market Rank</p>
              <p className="text-lg font-semibold text-white mono mt-1">#{asset.rank || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Chain</p>
              <p className="text-lg font-semibold text-white mt-1">{asset.chain}</p>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <MarketChart 
            data={chartData} 
            title={`${asset.symbol} / USD`}
            symbol={symbol}
            onTimeframeChange={handleDaysChange}
          />
        ) : (
          <div className="bg-[#121212] border border-[#1f1f1f] rounded p-6 text-center">
            <p className="text-zinc-500 text-sm">Chart data unavailable</p>
          </div>
        )}

        <div className="bg-[#121212] border border-[#1f1f1f] rounded p-6">
          <h2 className="text-xs font-mono tracking-wider text-zinc-400 uppercase mb-4">On-Chain Analytics</h2>
          <div className="space-y-3 text-sm text-zinc-400">
            <p>Real-time on-chain wallet analytics available in the Wallet Explorer.</p>
            <p className="text-[10px]">
              Explore wallet balances, transaction history, portfolio allocation, and more.
            </p>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
