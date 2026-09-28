"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { DataSourceIndicator } from "@/components/data-source-indicator";
import { PortfolioSummary } from "@/components/paper-trading/portfolio-summary";
import { PerformanceStats } from "@/components/paper-trading/performance-stats";
import { TradingPanel } from "@/components/paper-trading/trading-panel";
import { PositionsTable } from "@/components/paper-trading/positions-table";
import { TradeHistory } from "@/components/paper-trading/trade-history";
import { ResetAccountButton } from "@/components/paper-trading/reset-account-button";
import { MarketAsset } from "@/lib/types";
import { PaperAccount, PaperPosition, PaperTrade } from "@/lib/paper-trading/types";
import { getStoredAccount, saveStoredAccount } from "@/lib/paper-trading/storage";
import {
  calculateAverageEntry,
  calculateRealizedPnl,
  calculateUnrealizedPnl,
  calculateWinRate,
} from "@/lib/paper-trading/calculations";

export default function PaperTradingPage() {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [account, setAccount] = useState<PaperAccount>({
    balance: 10000,
    positions: [],
    trades: [],
    realizedPnl: 0,
  });

  // Load state on mount
  useEffect(() => {
    queueMicrotask(() => setAccount(getStoredAccount()));
  }, []);

  // Fetch real market data
  const fetchMarket = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/market");
      if (!res.ok) {
        throw new Error("Failed to load real market prices");
      }
      const json = await res.json();
      if (json.isFallback) {
        setError("Real market API unavailable. Trading suspended.");
        setAssets([]);
        setIsFallback(true);
        return;
      }
      if (json.data && json.data.length > 0) {
        setAssets(json.data);
      }
      setIsFallback(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Market API Error");
      setAssets([]);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMarket();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Map prices map
  const priceMap: Record<string, number> = {};
  assets.forEach((a) => {
    priceMap[a.symbol] = a.price;
  });

  // Execute trade logic
  const handleExecuteTrade = (
    symbol: string,
    side: "BUY" | "SELL",
    quantity: number,
    price: number
  ): { success: boolean; message: string } => {
    if (price <= 0) return { success: false, message: "INVALID MARKET PRICE" };
    if (quantity <= 0) return { success: false, message: "INVALID QUANTITY" };

    const totalValue = quantity * price;

    if (side === "BUY") {
      if (account.balance < totalValue) {
        return { success: false, message: "INSUFFICIENT BALANCE" };
      }

      const existingStored = account.positions.find((p) => p.symbol === symbol);
      const existingPos: PaperPosition | undefined = existingStored
        ? {
            ...existingStored,
            currentPrice: price,
            marketValue: existingStored.quantity * price,
            unrealizedPnl: (price - existingStored.averageEntryPrice) * existingStored.quantity,
            unrealizedPnlPercent: ((price - existingStored.averageEntryPrice) / existingStored.averageEntryPrice) * 100,
          }
        : undefined;

      const newAvgEntry = calculateAverageEntry(existingPos, quantity, price);
      const newQuantity = (existingStored ? existingStored.quantity : 0) + quantity;

      const newPositions = existingStored
        ? account.positions.map((p) =>
            p.symbol === symbol
              ? { ...p, quantity: newQuantity, averageEntryPrice: newAvgEntry }
              : p
          )
        : [
            ...account.positions,
            {
              id: `${symbol}-${Date.now()}`,
              symbol,
              quantity: newQuantity,
              averageEntryPrice: newAvgEntry,
            },
          ];

      const newTrade: PaperTrade = {
        id: `trade-${Date.now()}`,
        timestamp: new Date().toISOString(),
        symbol,
        side: "BUY",
        quantity,
        price,
        totalValue,
      };

      const updatedAccount: PaperAccount = {
        ...account,
        balance: account.balance - totalValue,
        positions: newPositions,
        trades: [...account.trades, newTrade],
      };

      setAccount(updatedAccount);
      saveStoredAccount(updatedAccount);
      return { success: true, message: `BUY ${quantity} ${symbol} EXECUTED` };
    } else {
      // SELL logic
      const existingStored = account.positions.find((p) => p.symbol === symbol);
      if (!existingStored || existingStored.quantity < quantity) {
        return { success: false, message: "INSUFFICIENT POSITION" };
      }

      const realizedPnlDelta = calculateRealizedPnl(price, existingStored.averageEntryPrice, quantity);
      const remainingQuantity = existingStored.quantity - quantity;

      const newPositions = remainingQuantity > 0
        ? account.positions.map((p) =>
            p.symbol === symbol ? { ...p, quantity: remainingQuantity } : p
          )
        : account.positions.filter((p) => p.symbol !== symbol);

      const newTrade: PaperTrade = {
        id: `trade-${Date.now()}`,
        timestamp: new Date().toISOString(),
        symbol,
        side: "SELL",
        quantity,
        price,
        totalValue,
        realizedPnl: realizedPnlDelta,
      };

      const updatedAccount: PaperAccount = {
        balance: account.balance + totalValue,
        positions: newPositions,
        trades: [...account.trades, newTrade],
        realizedPnl: account.realizedPnl + realizedPnlDelta,
      };

      setAccount(updatedAccount);
      saveStoredAccount(updatedAccount);
      return { success: true, message: `SELL ${quantity} ${symbol} EXECUTED` };
    }
  };

  const handleReset = () => {
    const initialAccount: PaperAccount = {
      balance: 10000,
      positions: [],
      trades: [],
      realizedPnl: 0,
    };
    setAccount(initialAccount);
    saveStoredAccount(initialAccount);
  };

  // Compute calculated UI fields
  const populatedPositions: PaperPosition[] = account.positions.map((p) => {
    const curPrice = priceMap[p.symbol] || p.averageEntryPrice;
    const mktVal = p.quantity * curPrice;
    const unPnl = calculateUnrealizedPnl(p, curPrice);
    const unPnlPct = p.averageEntryPrice > 0 ? ((curPrice - p.averageEntryPrice) / p.averageEntryPrice) * 100 : 0;
    return {
      ...p,
      currentPrice: curPrice,
      marketValue: mktVal,
      unrealizedPnl: unPnl,
      unrealizedPnlPercent: unPnlPct,
    };
  });

  const investedValue = populatedPositions.reduce((acc, pos) => acc + pos.marketValue, 0);
  const totalUnrealizedPnl = populatedPositions.reduce((acc, pos) => acc + pos.unrealizedPnl, 0);
  const totalEquity = account.balance + investedValue;
  const stats = calculateWinRate(account.trades);

  return (
    <AppLayout>
      <PageContainer
        title="Paper Trading"
        subtitle="Simulate trades with live market prices and a $10,000 virtual balance."
      >
        <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
          <DataSourceIndicator isFallback={isFallback} source="CoinGecko" />
          <ResetAccountButton onConfirm={handleReset} />
        </div>

        {error && (
          <div className="bg-[#121212] border border-rose-500/30 rounded p-4 text-rose-400 text-xs font-mono mb-4 flex justify-between items-center">
            <span>Market price error: {error}. Using fallback market data.</span>
            <button
              onClick={fetchMarket}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px]"
            >
              RETRY
            </button>
          </div>
        )}

        <PortfolioSummary
          totalEquity={totalEquity}
          availableBalance={account.balance}
          investedValue={investedValue}
          unrealizedPnl={totalUnrealizedPnl}
          realizedPnl={account.realizedPnl}
        />

        <PerformanceStats
          totalTrades={stats.totalTrades}
          winningTrades={stats.winningTrades}
          losingTrades={stats.losingTrades}
          winRate={stats.winRate}
          totalRealizedPnl={account.realizedPnl}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TradingPanel
              assets={assets}
              balance={account.balance}
              positions={account.positions}
              loading={loading}
              onExecuteTrade={handleExecuteTrade}
            />
          </div>
          <div className="lg:col-span-2">
            <PositionsTable positions={populatedPositions} />
            <TradeHistory trades={account.trades} />
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
