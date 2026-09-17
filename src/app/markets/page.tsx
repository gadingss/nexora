"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { MarketTable } from "@/components/dashboard/market-table";
import { DataSourceIndicator } from "@/components/data-source-indicator";
import { MarketAsset } from "@/lib/types";
import { MARKET_ASSETS } from "@/lib/mock-data/markets";

const chains = ["All", "Ethereum", "Base", "Arbitrum", "Polygon"];

export default function MarketsPage() {
  const [assets, setAssets] = useState<MarketAsset[]>(MARKET_ASSETS);
  const [selectedChain, setSelectedChain] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    async function loadMarketData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/market");
        
        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }

        const result = await response.json();
        setAssets(result.data || MARKET_ASSETS);
        setIsFallback(result.isFallback || false);
      } catch (err) {
        console.error("Error loading market data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setAssets(MARKET_ASSETS);
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    }

    loadMarketData();
  }, []);

  const filteredAssets =
    selectedChain === "All"
      ? assets
      : assets.filter((asset) => asset.chain === selectedChain);

  return (
    <AppLayout>
      <PageContainer title="Markets" subtitle="Explore digital asset market data.">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <DataSourceIndicator isFallback={isFallback} source="CoinGecko" />
        </div>

        <div className="flex flex-wrap gap-2">
          {chains.map((chain) => (
            <button
              key={chain}
              onClick={() => setSelectedChain(chain)}
              className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
                selectedChain === chain
                  ? "bg-white text-black"
                  : "bg-[#121212] text-zinc-400 border border-[#1f1f1f] hover:border-zinc-700 hover:text-white"
              }`}
            >
              {chain}
            </button>
          ))}
        </div>

        {loading && (
          <div className="bg-[#121212] border border-[#1f1f1f] rounded p-8 text-center">
            <p className="text-zinc-500 text-sm">Loading market data...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-[#121212] border border-rose-500/30 rounded p-6 text-center">
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && (
          <MarketTable assets={filteredAssets} title="ALL MARKETS" />
        )}
      </PageContainer>
    </AppLayout>
  );
}
