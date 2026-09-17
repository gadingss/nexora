import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { MarketStatCard } from "@/components/dashboard/market-stat-card";
import { MarketChart } from "@/components/dashboard/market-chart";
import { MarketTable } from "@/components/dashboard/market-table";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DataSourceIndicator } from "@/components/data-source-indicator";
import { marketService } from "@/lib/api/market";
import { MARKET_STATS } from "@/lib/mock-data/stats";
import { MARKET_ASSETS } from "@/lib/mock-data/markets";
import { WALLET_ACTIVITY } from "@/lib/mock-data/activity";
import { MARKET_CHART_DATA } from "@/lib/mock-data/charts";
import { formatCurrency, formatPercentage } from "@/lib/utils";

export default async function DashboardPage() {
  let assets = MARKET_ASSETS;
  let stats = MARKET_STATS;
  let chartData = MARKET_CHART_DATA;
  let isFallback = true;

  try {
    const symbols = ["BTC", "ETH", "SOL", "AAVE", "UNI"];
    const fetchedAssets = await marketService.fetchMarketData(symbols);
    
    if (fetchedAssets && fetchedAssets.length > 0) {
      assets = fetchedAssets;
      stats = await marketService.fetchMarketStats(fetchedAssets);
      const btcHistory = await marketService.fetchMarketHistory("BTC", 1);
      if (btcHistory && btcHistory.length > 0) {
        chartData = btcHistory;
      }
      isFallback = false;
    }
  } catch (error) {
    console.warn("Using fallback market data for dashboard:", error);
  }

  return (
    <AppLayout>
      <PageContainer title="Overview" subtitle="Market and on-chain activity at a glance.">
        <div className="flex justify-between items-center mb-4">
          <DataSourceIndicator isFallback={isFallback} source="CoinGecko" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MarketStatCard
            label="Total Market Cap"
            value={formatCurrency(stats.totalMarketCap)}
            change={formatPercentage(stats.totalMarketCapChange)}
            isPositive={stats.totalMarketCapChange >= 0}
          />
          <MarketStatCard
            label="24H Volume"
            value={formatCurrency(stats.volume24h)}
            change={formatPercentage(stats.volume24hChange)}
            isPositive={stats.volume24hChange >= 0}
          />
          <MarketStatCard
            label="BTC Dominance"
            value={`${stats.btcDominance.toFixed(1)}%`}
            change={formatPercentage(stats.btcDominanceChange)}
            isPositive={stats.btcDominanceChange >= 0}
          />
          <MarketStatCard
            label="Active Chains"
            value={`${stats.activeChains}`}
            change={`+${stats.activeChainsChange}`}
            isPositive={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketChart data={chartData} title="BTC / USD" />
          </div>
          <div>
            <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 mb-4">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                ON-CHAIN STATUS
              </span>
              <p className="text-xs text-zinc-400 mt-1">
                Real on-chain indexing coming in V0.4.
              </p>
            </div>
            <ActivityFeed activities={WALLET_ACTIVITY} />
          </div>
        </div>

        <MarketTable assets={assets} />
      </PageContainer>
    </AppLayout>
  );
}
