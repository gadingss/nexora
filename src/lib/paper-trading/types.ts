export interface PaperPosition {
  id: string;
  symbol: string;
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}

export interface StoredPosition {
  id: string;
  symbol: string;
  quantity: number;
  averageEntryPrice: number;
}

export interface PaperTrade {
  id: string;
  timestamp: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  totalValue: number;
  realizedPnl?: number;
}

export interface PaperAccount {
  balance: number;
  positions: StoredPosition[];
  trades: PaperTrade[];
  realizedPnl: number;
}

export interface TradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number | null;
  totalRealizedPnl: number;
}

